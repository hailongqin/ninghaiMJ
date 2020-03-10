var express = require('express');
var router = express.Router();

var Room  = require('./room')


var {
    userModel
} = require('../db/db');

var Util = require('../utils/util');

var creatingUser = {}

router.post('/create_user', function(req, res, next){

    var body = req.body;
    var userName = body.userName;
    var password = body.password;

    createUser();
    function createUser(){
        var userId = Util.generateUserId();
        if (creatingUser[userName] || creatingUser[userId]){
            res.json({code:-1,message:"名称已经使用了"})
            return;
        }

        creatingUser[userName] = true;
        creatingUser[userId] = true;

        userModel.find({$or:[{ userName:userName},{userId:userId}]})
        .select("-_id")
        .exec((err,ret)=> {
            if (err){
                res.json({code:-2,message:'读取数据库错误'})
                delete  creatingUser[userName];
                delete creatingUser[userId]
                return
            }

            if (ret && ret.length){
                res.json({code:-1,message:"名称已经使用了"})
                delete  creatingUser[userName];
                delete creatingUser[userId]
                return
            }

            var condition = {
               userId,
               userName,
               password,
            }
            userModel.create(condition,  (err, doc) => {
                if (err) {
                    delete  creatingUser[userName];
                    delete creatingUser[userId]
                    res.json({code:-2,message:"插入数据错误"});
                } else {
                    delete  creatingUser[userName];
                    delete creatingUser[userId]
                    res.json({code:0,userId})
                }
            })

        })


    }
})