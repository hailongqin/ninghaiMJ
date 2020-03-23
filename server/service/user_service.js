var express = require('express');
var router = express.Router();

var Log = require('../utils/log')


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

router.post('/get_user_info',function(req,res,next){
    var body = req.body;
    var userId = body.userId;
    if (!userId){
        Log.error('get_user_info userid is null');
        res.json({code:-1,message:'参数错误'})
        return
    }

   
    userModel.findOne({userId})
    .select("-_id header userName userId")
    .exec((err,ret)=> {
        if (err){
            Log.error('post get_user_info read db is err',err)
            res.json({code:-1,message:"读取数据错误"});
            return;
        }

        console.log('ret',ret)
        if (ret && ret.userId){
            res.json({
                code:0,data:ret
            })
        }else{
            res.json({
                code:-2,message:"账号不存在，请重新登录"
            })
        }

    })
})

var appInfo = {
    appid:"wx37ae340f5b1d8bdd",
    secret:"7434652a1dd949a1804a4ff2f16c816f",
	
};

router.get('/token_check',function(req,res,next){
    res.send(req.query.echostr)
    return;
})

router.get('/wechat_login',function(req,res,next){
    console.log(req.query);

    res.send('123');
    return;
})

module.exports = router;
