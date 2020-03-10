
var conf = require('../config').config;

var express = require('express');



var app = express();

var Util = require('../utils/util');

var Room  = require('./room')

var Game = require('./game')

var User = require('./user')

var Log = require('../utils/log');

Log.error('测试log',123);

exports.start = function(){


    const server = require('http').createServer(app);
    const io = require('socket.io')(server);


    io.on('connection',function(socket) {
        socket.on('login',function(data){
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;
            if (!userId || !roomId){
                Log.error('socket login param is error',roomId,userId)
                socket.emit('login_result',{code:-1,message:"参数错误"});
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=> {
                if (err) {
                    socket.emit('login_result',err);
                    return;
                }
                var seats = roomInfo.seats;//坐下的人
                var seatUserIds = seats.map((s)=>{return s.userId});

                if (seatUserIds.indexOf(userId) !== -1){ //已经是坐下的人
                    User.bindUserAndSocket(userId,socket);
                    if (roomInfo.gameStart){ //游戏已经开始了
                       Game.updateTable(roomId)
                    }
                    return;
                }

                var players = roomInfo.players;//观看的人
                var playersUserIds = players.map((s)=>{return s.userId});
                if (playersUserIds.indexOf(userId) !== -1){ //已经是看客
                    User.bindUserAndSocket(userId,socket);
                    return;
                }

                players.push({
                    userId,
                })

                User.bindUserAndSocket(userId,socket);
                Room.addAndUpdateRoom(roomId,roomInfo);

                Game.updatePepoleStatus(roomInfo)
                Game.notifyNewUserLogin(roomId,userId)
            })
            return;
        })
        socket.on('set_ready', function (data) {
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    return;
                }

                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;
                var conf = roomInfo.conf;
                var players = roomInfo.players;
                var seatUserIds = seats.map((s)=>{return s.userId});
                if (seatUserIds.indexOf(userId) !== -1){ //已经坐着了
                    Game.updatePepoleStatus();
                    return;
                }

                if (seats.length >= conf.userCount){
                    Game.updatePepoleStatus();
                    return;
                }

                var seatOne = {
                    userId:userId,
                    holds:[],//手上持有的牌
                    folds:[],//打出的牌
                    anGangs:[],//暗杠的牌
                    diangangs:[],//别人打出来的杠
                    chis:[],//吃的牌
                    huas:[],//花色
                    op:{}, //操作的牌
                    tingMap:{}
                }
                seats.push(seatOne);
                seatUserIds.push(userId);
                //同步观看者的人员，防止并发，这里不直接从players里删除
                roomInfo.players = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })

                Game.updatePepoleStatus(roomId);
                if (conf.userCount === seats.length){
                    roomInfo.gameStart = true;
                    Game.begin(roomInfo);
                }
            });


        });

        socket.on('cancel_ready', function (data) {
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket cancel_ready param is error',roomId,userId)
                socket.emit('cancel_ready_result',{code:-1,message:"参数错误"});
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{

                if (err){
                    Log.error('socket cancel_ready get roominfo is error',err)
                    socket.emit('cancel_ready_result',err)
                    return;
                }

                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;//坐下的人
                var players = roomInfo.players;

                roomInfo.seats = seats.filter((item) => {
                    return item.userId !== userId
                })

                players.push({userId})

                socket.emit('cancel_ready_result',{code:0});
                Room.broacastInRoom('one_cancel_ready',roomId,roomInfo);
            })
        })

        socket.on('chupai',function(data){
            console.log('receive chupai',data)
            var roomId = data.roomId;
            var userId = data.userId;
            var pai = data.pai;

            if (!userId || !roomId || !pai){
                Log.error('socket chupai param is error',roomId,userId,pai)
                return;
            }
            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('getRoomInfo chupai  is error',err)
                    return;
                }

                //将牌从自己手中扣除
                var seats = roomInfo.seats;
                var seatsUserId = seats.map((s)=>{return s.userId});
                var seatIndex = seatsUserId.indexOf(userId);
                var holds = seats[seatIndex].holds;
                var folds = seats[seatIndex].folds;
                var index = holds.indexOf(pai);
                holds.splice(index,0);
                folds.push(pai);

                var nextIndex = Game.getNextChuPaiIndex(seats,seatIndex);

                for (var i = 0;i < seats.length;i++){       
                    if (userId === seats[i].userId) continue;
                    Game.checkCanHu(seats[i],pai)     // 检查是否有人胡
                    Game.checkCanGang(seats[i],pai)   // 检查是否有人杠
                    Game.checkCanPeng(seats[i],pai);
                    if (i === nextIndex){
                        Game.checkCanChi(seats[i],pai)   // 检查是否有人吃
                    }
                }

               var ret =  Game.notifyOperation(seats);
             
                if (ret){ //如果有操作的，则等待他们操作
                    Game.updateTable(roomId); // 更新桌面
                    return 
                }else{ // 如果没有操作

                }
                Game.fapai(roomInfo);
            })
        })

        socket.on('peng',(data)=>{
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket peng param is error',roomId,userId)
                socket.emit('peng_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket peng get roominfo is error',err)
                    socket.emit('peng_result',err)
                    return;
                }

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket penf getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];

                if (!mySeat.op.canPeng) { //有人胡了可能，没得碰
                    return;
                }

                var opTag = true;
                while(opTag){
                    for (var index in seats){
                        let op = seats[index].op;
                        if (index === turn) 
                        if (op.canHu){
                            opTag = true;
                            break;
                        }
                        else opTag = false
                    }
                }
                //每人可以胡，就开始碰
                var myOp = mySeat.op;

                var pengPai = myOp.pai;
                var myHolds = mySeat.holds;

                var count = 0;
                for (var i = 0; i < myHolds.length;i++){
                    if (myHolds[i] === pengPai){
                        myHolds.splice(i,1);
                        i--;
                        count++
                        if (count === 2){
                            break;
                        }
                    }
                }
                // 更新countMap
                mySeat.peng.push(pengPai);
                mySeat.countMap[pengPai] -=2;
                Game.clearOperation(seats);
                roomInfo.turn = index; //转换到当前出牌方
                Room.broacastInRoom('one_peng',roomId,{targetIndex:index,pai});
                Room.broacastInRoom('one_chupai',roomId,roomInfo,userId,true)
            })
        })

        socket.on('chi',(data)=>{
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket chi param is error',roomId,userId)
                socket.emit('chi_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket chi get roominfo is error',err)
                    socket.emit('chi_result',err)
                    return;
                }
                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket chi getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];

                if (!mySeat.op.canChi) { //有人胡碰杠了可能，没得碰
                    return;
                }

                var op = mySeat.op;
                var myHolds = mySeat.holds;
                var myChis = my.chis;

                var chipai = op.pai;
                var chiIndex = data.chiIndex;
                var chiList = op.chiList[chiIndex];

                var opChiList = chiList.filter((c)=>{
                    return c !== chipai
                })

                //更新holds
                for (var i = 0; i< myHolds.length;i++){
                    var _cIndex = opChiList.indexOf(holds[i])
                    if (_cIndex !== -1){
                        holds.splice(i,1);
                        mySeat.countMap[holds[i]]--;
                        i--;
                        opChiList.splice(_cIndex,1)

                        if (opChiList.length === 0) break;
                    }
                }

                //更新chis
                myChis.push({
                    list:chiList,
                    pai:chipai
                })

 
                roomInfo.turn = index; //轮到这里了
                Room.broacastInRoom('one_chi',roomId,{targetIndex:index,pai});
                Room.broacastInRoom('one_chupai',roomId,roomInfo,userId,true)


            })    
        })

        socket.on('guo',(data)=>{
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket guo param is error',roomId,userId)
                socket.emit('guo_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    socket.emit('guo_result',err)
                    return;
                }

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId)
                if (index === undefined || index === null){
                    Log.error('socket guo getIndexByUserId is error',index)
                    return;
                }

                seats[index].op = {};

                var ret = Game.checkOtherSeatHasOp(seats,index)

                if (!ret){
                    Game.fapai(roomInfo)
                }

            }) 
        })
    })

    server.listen(conf.SOCKET_PORT);
    console.log("game server is listening on " + conf.SOCKET_PORT);
};