var express = require('express');
var router = express.Router();

var Room  = require('./room')


var {
    roomModel
} = require('../db/db');

var Util = require('../utils/util');

var creatingRoom = {};




router.post('/create_room', function(req, res, next){

    var body = req.body;
    var userId = body.userId;
    var conf = body.conf;
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

                    }
                    roomModel.create(condition,  (err, doc) => {
                    
                        if (err) {
                            delete creatingRoom[roomId];
                            res.json({code:-2,message:"插入数据错误"});
                        } else {
                            delete creatingRoom[roomId];
                            Room.addAndUpdateRoom(roomId,condition)
                         
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
    roomModel.findOne({
        roomId,
    })
    .select("-_id players")
    .exec((err,ret)=>{
        if (err){
            res.json({code:-1,message:"读取数据错误"});
            return;
        }

        if (ret){
            res.json({code:0})
        }else{
            res.json({code:-1,message:"房间不存在"})
        }

    })
})



module.exports = router;

