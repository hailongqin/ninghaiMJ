var express = require('express');
var router = express.Router();

var Room  = require('./room');

var Log = require('../utils/log')


var {
    roomModel
} = require('../db/db');

var Util = require('../utils/util');

var CONST = require('../utils/const');

var Crypto = require('../utils/crypto');

var creatingRoom = {};




router.post('/create_room', function(req, res, next){

    var body = req.body;
    var userId = body.userId;
    var conf = body.conf;

    if (!userId){
        Log.error('request create_room userid is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }

    if (!conf){
        Log.error('request create_room conf is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }

    if (!conf.jushu){
        Log.error('request create_room jushu is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }

    if (conf.type === undefined || conf.type === null){
        Log.error('request create_room type is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }

    if (!conf.userCount){
        Log.error('request create_room userCount is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }
    if (conf.xie === undefined || conf.xie === null){
        Log.error('request create_room xie is null');
        res.json({code:-1,message:"参数错误"});
        return;
    }

    // if (!Crypto.checkSign(body)) return;


    createRoom();
    function createRoom(){
        var roomId = Util.generateRoomId();
        if (creatingRoom[roomId]) {
            createRoom();
            return;
        }
        creatingRoom[roomId] = true;

        roomModel.findOne({roomId})
            .select("-_id")
            .exec((err,ret)=> {
                if (err){
                    Log.error('post create_room read db is err',err)
                    res.json({code:-1,message:"读取数据错误"});
                    delete creatingRoom[roomId];
                    return;
                }

                if (!ret){ //如果没找到
                    var condition = {
                        creator:userId,
                        roomId: roomId,
                        conf:conf,
                        seats:[], //位置，存放用户信息等
                        players:[],// 进入房间的人
                        mjLists:[], //麻将牌
                        zhuangIndex:0, //庄家
                        turn:0, //轮到第几个出牌
                        count:0,//第几局了
                        prevHuIndex:-1,
                        currentHuIndex:-1,
                        gameStatus:CONST.GAME_STATUS_NO_START,
                        roomStatus:CONST.ROOM_STATUS_NORMAL
                    }
                    roomModel.create(condition,  (err, doc) => {
                    
                        if (err) {
                            Log.error('post create_room save db is err',err)
                            delete creatingRoom[roomId];
                            res.json({code:-2,message:"插入数据错误"});
                        } else {
                            delete creatingRoom[roomId];
                            Room.addAndUpdateRoom(roomId,condition);
                            res.json({code:0,roomId})
                        }
                    })
                }else{
                    delete creatingRoom[roomId];
                    // 如果找到,则重新创建
                    createRoom();
                }

            })
    }

})

router.post('/check_room_exit', function(req, res, next){
    var body = req.body;
    var roomId = body.roomId;

    if (!roomId){
        Log.error('post check_room_exit roomid is null')
        res.json({code:-1,message:"参数错误"});
        return;
    }

    // if (!Crypto.checkSign(body)) return;

    console.log('check room exsit ',roomId)

    roomModel.findOne({
        roomId,
    })
    .select("-_id roomStatus conf")
    .exec((err,ret)=>{
        if (err){
            Log.error('post check_room_exit read db  is err',err)
            res.json({code:-1,message:"读取数据错误"});
            return;
        }

        if (ret){
            res.json({code:0,roomStatus:ret.roomStatus,conf:ret.conf})
        }else{
            res.json({code:-1,message:"房间不存在"})
        }

    })
})





module.exports = router;

