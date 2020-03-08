
var conf = require('../config').config;

var express = require('express');



var app = express();

var Util = require('../utils/util');

var Room  = require('./room')

var Game = require('./game')

var User = require('./user')

exports.start = function(){


    const server = require('http').createServer(app);
    const io = require('socket.io')(server);


    io.on('connection',function(socket) {
        socket.on('login',function(data){
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;
            if (!userId || !roomId){
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

                Room.broacastInRoom('new_user_login',roomId,socket,roomInfo,userId); //新进来的人
            })
            return;
        })
        socket.on('set_ready', function (data) {
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;
            Room.getRoomInfo(roomId,(err,roomInfo)=>{

                if (err){
                    socket.emit('set_ready_result',err)
                    return;
                }

                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;
                var conf = roomInfo.conf;
                var players = roomInfo.players;
                var seatUserIds = seats.map((s)=>{return s.userId});
                if (seatUserIds.indexOf(userId) !== -1){ //已经坐着了
                    socket.emit('set_ready_result',{code:-1,message:"已经坐着了"})
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
                Room.broacastInRoom('new_user_set_ready',roomId,socket,roomInfo,userId);

                if (conf.userCount === seats.length){
                    roomInfo.gameStart = true;
                    Game.begin(roomInfo);
                    Room.broacastInRoom('game_start',roomId,socket,roomInfo,userId,true);
                }
            });


        });

        socket.on('cancel_ready', function (data) {
            console.log('data is ',data);
            var roomId = data.roomId;
            var userId = data.userId;
            Room.getRoomInfo(roomId,(err,roomInfo)=>{

                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;//坐下的人
                var players = roomInfo.players;

                roomInfo.seats = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })

                roomInfo.seats = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })


            })
        })
    })

    server.listen(conf.SOCKET_PORT);
    console.log("game server is listening on " + conf.SOCKET_PORT);
};