
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
                    socket.emit('login_result',{code:0,roomInfo});

                    if (roomInfo.gameStart){ //游戏已经开始了
                        socket.emit('game_start',roomInfo);
                    }

                    return;
                }

                var players = roomInfo.players;//坐下的人
                var playersUserIds = players.map((s)=>{return s.userId});
                if (playersUserIds.indexOf(userId) !== -1){ //已经
                    User.bindUserAndSocket(userId,socket);
                    socket.emit('login_result',{code:0,roomInfo}); //已经是看客了
                    return;
                }

                players.push({
                    userId,
                })

                User.bindUserAndSocket(userId,socket);
                Room.addAndUpdateRoom(roomId,roomInfo);


                socket.emit('login_result',{code:0,roomInfo});

                Room.broacastInRoom('new_user_login',roomId,roomInfo,userId); //新进来的人
            })
            return;
        })
        socket.on('set_ready', function (data) {
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                socket.emit('set_ready',{code:-1,message:"参数错误"});
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    socket.emit('set_ready_result',err)
                    return;
                }

                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;
                var conf = roomInfo.conf;
                var players = roomInfo.players;
                var seatUserIds = seats.map((s)=>{return s.userId});
                if (seatUserIds.indexOf(userId) !== -1){ //已经坐着了
                    socket.emit('set_ready_result',{code:0})
                    return;
                }

                if (seats.length >= conf.userCount){
                    socket.emit('set_ready_result',{code:-1,message:"人员已经满了"})
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
                }
                seats.push(seatOne);
                seatUserIds.push(userId);
                //同步观看者的人员，防止并发，这里不直接从players里删除
                roomInfo.players = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })


                // Room.addAndUpdateRoom(roomId,roomInfo);
                socket.emit('set_ready_result',{code:0})
                Room.broacastInRoom('new_user_set_ready',roomId,roomInfo,userId);

                if (conf.userCount === seats.length){
                    roomInfo.gameStart = true;
                    Game.begin(roomInfo);
                    Room.broacastInRoom('game_start',roomId,roomInfo,userId,true);
                }
            });


        });

        socket.on('cancel_ready', function (data) {
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;

            if (!userId || !roomId){
                Log.error('socket cancel_ready param is error',roomId,userId)
                socket.emit('set_ready',{code:-1,message:"参数错误"});
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
            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    socket.emit('chupai',err)
                    return;
                }

                // 检查是否有人胡

                // 检查是否有人杠

                // 检查是否有人吃


                var seats = roomInfo.seats;
                var seatsUserId = seats.map((s)=>{return s.userId});
                var seatIndex = seatsUserId.indexOf(userId);
                var holds = seats[seatIndex].holds;
                var folds = seats[seatIndex].folds;
                var index = holds.indexOf(pai);
                holds.splice(index,0);
                folds.push(pai);

                Room.broacastInRoom('one_chupai',roomId,{chupaiIndex:seatIndex,pai});

                var nextIndex = Game.getNextChuPaiIndex(seats,seatIndex);
                roomInfo.turn = nextIndex;

                var nextUserId = seats[nextIndex].userId;
                var nextSocket = User.getSocketByUser(nextUserId);
                var list = Game.getNextPaiIgnoreHua(roomInfo.mjLists);

                if (list.huas.length){
                    nextSocket.emit('get_huas',{turn:nextIndex,huas:list.huas})
                }

                nextSocket.emit('zhuapai',{pai:list.pai,turn:nextIndex});
            })
        })
    })

    server.listen(conf.SOCKET_PORT);
    console.log("game server is listening on " + conf.SOCKET_PORT);
};