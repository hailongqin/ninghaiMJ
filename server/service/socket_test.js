
var conf = require('../config').config;

var express = require('express');

var app = express();

var Util = require('../utils/util');

var Room  = require('./room')

var Game = require('./game')

var User = require('./user')

var Log = require('../utils/log');

var count = 1;
exports.start = function(){
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    io.on('connection',function(socket) {
        count++;
        console.log('socket connetction',socket.count);
        socket.count = count
        socket.on('message',(data)=>{
            console.log(data);
        })
        socket.on('disconnect',()=>{
           console.log('socket disconnect',socket.count)
        })
    })

    server.listen(2000);
    console.log("game server is listening on " + 2000);
};