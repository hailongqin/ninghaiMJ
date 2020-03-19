
var conf = require('../config').config;

var express = require('express');

var app = express();

var Util = require('../utils/util');

var Room  = require('./room')

var Game = require('./game')

var User = require('./user')

var Log = require('../utils/log');

var CONST = require('../utils/const')

exports.start = function(){
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    io.on('connection',function(socket) {
        socket.on('login',function(data){
            var roomId = data.roomId;
            var userId = data.userId;
            socket.roomId = roomId;
            socket.userId = userId;
            console.log('receive login')
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

                User.bindUserAndSocket(userId,socket);

                if (roomInfo.roomStatus === CONST.ROOM_STATUS_DISMISS){
                    socket.emit('room_has_dismiss','房间已解散');
                    return
                }

                // if (!roomInfo.dismissTimer && roomInfo.gameStatus === CONST.GAME_STATUS_NO_START){
                //     roomInfo.dismissTimer = setTimeout(() => {
                //         roomInfo.roomStatus = CONST.ROOM_STATUS_DISMISS;
                //         Room.setRoomInfoToDB(roomInfo);
                //         roomInfo.dismissTimer = null;
                //         Game.notifyRoomHasDismiss(roomInfo);
                //         Room.deleteRoom(roomInfo.roomId);
                //     },CONST.ROOM_DISMISS_EXPIERED_TIME);
                // }


                var seats = roomInfo.seats;//坐下的人
                var seatUserIds = seats.map((s)=>{return s.userId});
                var seatIndex = seatUserIds.indexOf(userId) 

                if (seatIndex !== -1){ //已经是坐下的人
                    var mySeat = seats[seatIndex];
                    mySeat.onLine = true;
                    Game.sendPepoleStatus(roomInfo,userId);
                    socket.emit('game_start',roomInfo);
                    if (roomInfo.gameStatus === CONST.GAME_STATUS_START){ //游戏已经开始了
                       if (Game.checkMyselfHasOp(mySeat)){
                           Game.notifyOneSeatOperation(mySeat);
                       }else if (roomInfo.turn === seatIndex){
                           Game.notifyChupai(roomInfo);
                       }
                    }
                    return;
                }
                console.log(234)
                var players = roomInfo.players;//观看的人
                var playersUserIds = players.map((s)=>{return s.userId});
                if (playersUserIds.indexOf(userId) !== -1){ //已经是看客
                    Game.sendPepoleStatus(roomInfo,userId);
                    if (roomInfo.gameStatus !== CONST.GAME_STATUS_NO_START && seats.length !== roomInfo.conf.userCount)
                             Game.notifyCanSetReady(userId);
                    return;
                }

                players.push({
                    userId,
                    userInfo:data.userInfo || {}
                })

                Room.addAndUpdateRoom(roomId,roomInfo);
                Game.sendPepoleStatus(roomInfo,userId);
                Game.notifyNewUserLogin(roomInfo,userId);
                if (roomInfo.gameStatus === CONST.GAME_STATUS_NO_START && seats.length !== roomInfo.conf.userCount)
                    Game.notifyCanSetReady(userId);
            })
     
        })
        socket.on('set_ready', function (data) {
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    return;
                }
                Log.info('receive set_ready data is ',roomInfo)
                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;
                var conf = roomInfo.conf;
                var players = roomInfo.players;
                var seatUserIds = seats.map((s)=>{return s.userId});

                if (seatUserIds.indexOf(userId) !== -1){ //已经坐着了
                    Game.updatePepoleStatus(roomInfo); 
                    return;
                }

                if (seats.length >= conf.userCount){
                    Game.updatePepoleStatus(roomInfo);
                    return;
                }

                var seatOne = {
                    userId:userId,
                    userInfo:data && data.userInfo?data.userInfo:{},
                    onLine:true,
                    ready:true
                }
                seats.push(seatOne);
                seatUserIds.push(userId);
                //同步观看者的人员，防止并发，这里不直接从players里删除
                roomInfo.players = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })

                Room.broacastInRoom('new_user_set_ready',roomInfo.roomId,{index:seats.length - 1,roomInfo});
                Game.updatePepoleStatus(roomInfo);
                if (conf.userCount === seats.length){
                    roomInfo.gameStatus = CONST.GAME_STATUS_START;
                    Room.setRoomInfoToDB(roomInfo);
                    Game.begin(roomInfo);
                }
            });


        });

        socket.on('game_ready', function (data) {
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    return;
                }
                Log.info('receive game_ready data is ',roomInfo)

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
          

                seats[index].ready = true;

                var allReady = true;
                for (var item of seats){
                    if (!item.ready){
                        allReady = false;
                        break;
                    }
                }
                Room.broacastInRoom('user_game_ready',roomInfo.roomId,{index:index,roomInfo})
                // if (allReady){
                //     if (roomInfo.timer){
                //         clearTimeout(roomInfo.timer);
                //         roomInfo.timer = null
                //     }

                //     Game.beigin(roomInfo);
                // }
            })
        })
        socket.on('cancel_ready', function () {
            var roomId = socket.roomId;
            var userId = socket.userId;

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

                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;

                var seats = roomInfo.seats;//坐下的人
                var players = roomInfo.players;
                var index = Game.getIndexByUserId(seats,userId);
                if (index !== null && index !== undefined){
                    var seat = seats[index];
                    roomInfo.seats = seats.filter((item) => {
                        return item.userId !== userId
                    })
    
                    players.push(seat);
                    Game.updatePepoleStatus(roomInfo);
                }
            })
        })

        socket.on('chupai',function(data){
            console.log('receive chupai',data)
            var roomId = socket.roomId;
            var userId = socket.userId;
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
                Log.info('receive chupai data is ',roomInfo)
                //将牌从自己手中扣除
                var seats = roomInfo.seats;
                var seatsUserId = seats.map((s)=>{return s.userId});
                var seatIndex = seatsUserId.indexOf(userId);

                if (roomInfo.turn !== seatIndex){ //断线重连的时候，一方万一
                    return; //不是该人出
                }
                var holds = seats[seatIndex].holds;
                var folds = seats[seatIndex].folds;
                var index = holds.indexOf(pai);
                holds.splice(index,1);
                folds.push(pai);
                seats[seatIndex].lastChuPai = pai;

                seats[seatIndex].countMap[pai]--;
                Game.sortPai(holds);
                Game.checkCanTingPai(seats[seatIndex]);//检查自己是否可以停牌了


                var nextIndex = Game.getNextChuPaiIndex(seats,seatIndex);

                for (var i = 0;i < seats.length;i++){       
                    if (userId === seats[i].userId) continue;
                    if (seats[i].lastChuPai === pai) continue;
                    Game.checkCanHu(seats[i],pai,seatIndex)     // 检查是否有人胡
                    Game.checkCanGang(seats[i],pai,seatIndex)   // 检查是否有人杠
                    Game.checkCanPeng(seats[i],pai,seatIndex);
                    if (i === nextIndex){
                        Game.checkCanChi(seats[i],pai,seatIndex)   // 检查是否有人吃
                    }
                }

               var ret =  Game.notifyOperation(seats);
             
                if (ret){ //如果有操作的，则等待他们操作 
                    Game.updateTable(roomInfo); // 更新桌面
                    return 
                }else{ // 如果没有操作
                    Game.moveToNextTurn(roomInfo)
                    Game.fapai(roomInfo);
                }
              
            })
        })

         
        socket.on('hu',(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;      
            if (!userId || !roomId){
                Log.error('socket gang param is error',roomId,userId)
                socket.emit('chi_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket hu get roominfo is error',err)
                    socket.emit('chi_result',err)
                    return;
                }
                Log.info('receive hu data is ',roomInfo)

                //还要判断截胡 todo

                //

                

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                var seat = seats[index];
                var pai = seat.op.pai;

                if (!seat.op.canHu) return;
                
                var fromTurn = seat.op.fromTurn; //0
              
                console.log('hu fromTurn ',fromTurn,index)
                if (index !== fromTurn){
                    console.log('zimo from Turn is ',fromTurn,seats);
                    seat.holds.unshift(pai);
                    seats[fromTurn].folds.splice(-1,1);
                }
         
                Game.clearOperation(roomInfo);

                Game.calcFanShu(roomInfo);//计算hushu
             
                Game.notifyOperationAction(roomInfo,{type:'hu',roomInfo,index:index});

                roomInfo.gameStatus = CONST.GAME_STATUS_ONE_OVER;

                setTimeout(() => {
                        Game.begin(roomInfo);
                    }, 10*1000);
                })
         })

        
        socket.on('gang',(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;
            if (!userId || !roomId){
                Log.error('socket gang param is error',roomId,userId)
                socket.emit('chi_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket gang get roominfo is error',err)
                    socket.emit('chi_result',err)
                    return;
                }
                Log.info('gang hu data is ',roomInfo)
                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket penf getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];
                if (!mySeat.op.canGang) { //有人胡了可能，没得碰
                    return;
                }
                Game.waitOtherOperation(seats,index,'canGang',()=>{
                if (!mySeat.op.canGang) { //有人胡了可能，没得碰
                    return;
                }
                var myOp = mySeat.op;
                var gangPai = myOp.pai;
                var fromTurn = myOp.fromTurn;
                var where = myOp.where;
                var whereIndex = myOp.index;
                var chis = mySeat.chis;

                Game.clearOperation(roomInfo);
                Game.moveToNextTurn(roomInfo,index);
                //每人可以胡，就开始杠

                //来自碰的牌的杠
                if (where && where === 'folds'){
                    chis[whereIndex].type = 'gang';
                    chis[whereIndex].fromTurn = roomInfo.turn;
                    mySeat.countMap[gangPai] -= 1;
                }else{
                    var myHolds = mySeat.holds;

                    var count = 0;
                    var maxCount = fromTurn === index?4:3;
                    for (var i = 0; i < myHolds.length;i++){
                        if (myHolds[i] === gangPai){
                            myHolds.splice(i,1);
                            i--;
                            count++
                            if (count === maxCount){
                                break;
                            }
                        }
                    }
                    // 更新countMap
                    mySeat.chis.push({
                        type:'gang',
                        pai:gangPai,
                        fromTurn
                    });
                    mySeat.countMap[gangPai] -=maxCount;
                }
                
     

                if (fromTurn !== index){ //如果不是自摸的杠
                    seats[fromTurn].folds.splice(-1,1)
                }

                Game.notifyOperationAction(seats,{type:'gang'})
                
                Game.fapai(roomInfo);
                })

             
            })
        })
            

        socket.on('peng',(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;

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
                Log.info('receive peng data is ',roomInfo);

                
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

                Game.waitOtherOperation(seats,index,'canPeng',()=>{

                    if (!mySeat.op.canPeng) { //有人胡了可能，没得碰
                        return;
                    }
                   
                    Game.moveToNextTurn(roomInfo,index);
                    //每人可以胡，就开始碰
                    var myOp = mySeat.op;
    
                    var pengPai = myOp.pai;
                    var fromTurn = myOp.fromTurn;
                    var myHolds = mySeat.holds;

                    Game.clearOperation(roomInfo);
    
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
                    mySeat.chis.push({
                        type:'peng',
                        pai:pengPai
                    });
                    mySeat.countMap[pengPai] -=2;
                    seats[fromTurn].folds.splice(-1,1);
    
                    Game.updateTable(roomInfo);
                    Game.notifyChupai(roomInfo)
                })
        

            })
        })

        socket.on('chi',(data)=>{

            console.log('receive chi data ',data)
            var roomId = socket.roomId;
            var userId = socket.userId;

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
                Log.info('receive chi data is ',roomInfo)
                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket chi getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];

               Game.waitOtherOperation(seats,index,'canChi',()=>{
                
                if (!mySeat.op.canChi) { //有人胡碰杠了可能，没得碰
                    return;
                }

                //没人操作，则我来吃
                
                var op = mySeat.op;
                console.log(op)
                var chipai = op.pai;
                var chiIndex = data.chiIndex;
                var chiList = op.chiList[chiIndex];
                var fromTurn = op.fromTurn;
             

                Game.clearOperation(roomInfo);
                Game.moveToNextTurn(roomInfo); //轮到下一个人
                Game.notifyOperationAction(roomInfo,{type:'chi',index:roomInfo.turn}) //通知有人吃了
              
                var myHolds = mySeat.holds;
                var myChis = mySeat.chis;


                var opChiList = chiList.filter((c)=>{
                    return c !== chipai
                })

                //更新holds
                for (var i = 0; i< myHolds.length;i++){
                    var _cIndex = opChiList.indexOf(myHolds[i])
                    if (_cIndex !== -1){
                        mySeat.countMap[myHolds[i]]--;
                        myHolds.splice(i,1);
                        i--;
                        opChiList.splice(_cIndex,1)

                        if (opChiList.length === 0) break;
                    }
                }

                //更新chis
                myChis.push({
                    type:'chi',
                    list:chiList,
                    pai:chipai
                })

                var fromFolds = roomInfo.seats[fromTurn].folds
                fromFolds.splice(-1,1)

                Game.updateTable(roomInfo); //通知更新桌面上的牌
                Game.notifyChupai(roomInfo);   
               })
            })    
        })

        socket.on('guo',(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;


            if (!userId || !roomId){
                Log.error('socket guo param is error',roomId,userId,fromTurn)
                socket.emit('guo_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    socket.emit('guo_result',err)
                    return;
                }
                Log.info('roomInfo',roomInfo);

                

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId)
                if (index === undefined || index === null){
                    Log.error('socket guo getIndexByUserId is error',index)
                    return;
                }

                var op = seats[index].op;
                if (!op.canPeng && !op.canGang && !op.canHu && !op.canChi){ 
                    return;
                }
                var fromTurn = op.fromTurn
                seats[index].op = {};

                var ret = Game.checkOtherSeatHasOp(seats,index)
                // 所有人都没有操作
                if (!ret){
                     Game.clearOperation(roomInfo);
                     if (fromTurn === index){ //如果这个通知是来自自己的(胡，杠)
                        Game.notifyChupai(roomInfo) //通知出牌
                        return
                     }
                    else{ //这个通知不是自己的，来自其他人
                        Game.moveToNextTurn(roomInfo)
                        Game.fapai(roomInfo);
                     }
                  
                }

            }) 
        })

        socket.on('ping',(data) => {
			var userId = socket.userId;
			if(!userId){
                Log.error('socket ping param is error',roomId,userId)
				return;
			}
			socket.emit('ping_result');
        });

        socket.on('dismiss_room',(data)=>{

            var userId = socket.userId;
            var roomId = socket.roomId;
            
            if (!userId || !roomId){
                Log.error('socket dismiss_room param is error',roomId,userId)
                socket.emit('guo_result',{code:-1,message:"参数错误"});
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    socket.emit('guo_result',err)
                    return;
                }
                
                roomInfo.status = CONST.ROOM_STATUS_DISMISS;

                Game.notifyRoomHasDismiss(roomInfo);
            })

        });
        
        socket.on('disconnect',()=>{
            var userId = socket.userId;
            var roomId = socket.roomId
            console.log('scocket disconnect',userId,roomId)

			if(!userId || !roomId){
                Log.error('socket disconnect param is error',roomId,userId)
				return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    socket.emit('guo_result',err)
                    return;
                }

                if (!roomInfo){
                    return;
                }

                 console.log(roomInfo.seats)
                
                var index = Game.getIndexByUserId(roomInfo.seats,userId);
                if (index !== null && index !== undefined){
                    var seats = roomInfo.seats;
                    seats[index].onLine = false;
                    Game.updatePepoleStatus(roomInfo)
                }

                index = Game.getIndexByUserId(roomInfo.players,userId);

                if (index !== null && index !== undefined){
                    roomInfo.players.splice(index,1);
                }
              

            })
            
  


        })
    })

    server.listen(conf.SOCKET_PORT);
    console.log("game server is listening on " + conf.SOCKET_PORT);
};