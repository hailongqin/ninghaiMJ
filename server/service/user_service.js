var express = require('express');
var router = express.Router();

var Log = require('../utils/log');
var Util = require('../utils/util');
var Redis = require('../utils/redis');


var {
    userModel
} = require('../db/db');

var Util = require('../utils/util');

var SMS = require('../utils/sms')

var creatingUser = {}



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

router.post('/check_user_exit',function(req,res,next){
    var body = req.body;
    var phone = body.phone;
    if (!phone){
        res.json({code:-1,message:'参数错误'})
        return;
    }

    userModel.findOne({phone:body.phone},(err,ret)=>{
        if (err){
            res.json({code:-2,message:'读取数据库错误'})
            return
        }

        res.json({code:0,result:ret?true:false})

    })

})

router.post('/send_login_sms',function(req,res,next){

    var body = req.body;
    if (!body.phone){
        res.json({code:-1,message:"手机号为空"})
        return;
    }

    var code = Util.generateSmsCode();
    console.log('sms code is ',code)
    Redis.setRedis(`login_${body.phone}`,code,5*60);

    SMS.sendLoginSms(body.phone,code);
    res.json({code:0});
    return;

})

router.post('/send_register_sms',function(req,res,next){

    var body = req.body;
    if (!body.phone){
        res.json({code:-1,message:"手机号为空"})
        return;
    }

    var code = Util.generateSmsCode();
    console.log('sms code is ',body.phone,code)
    Redis.setRedis(`register_${body.phone}`,code,5*60);

    SMS.sendRegisterSms(body.phone,code);
    res.json({code:0});
    return;

})

//已经登录过的按userId登录
router.post('/user_login_by_userId',function(req,res,next){
    var body = req.body;
    console.log(body)
    if (!body.userId){
        res.json({code:-1,message:"参数有误"})
        return;
    } 

    userModel.findOne({userId:body.userId},(err,ret)=>{
        if (err){
            res.json({code:-2,message:'读取数据库错误'})
            return
        }

        if (!ret){
            res.json({code:-3,message:'未找到该用户'});
            return;
        }

        res.json({code:0,userName:ret.userName})

    })
})

router.post('/register_by_phone',function(req,res,next){
    var body = req.body;
    var phone = body.phone;
    var code = body.code;
    var userName = body.userName;
    if (!phone || !code || !userName){
        res.json({code:-1,message:'参数错误'})
        return;
    }

    userModel.findOne({phone:body.phone},(err,ret)=>{
        if (err){
            res.json({code:-2,message:'读取数据库错误'})
            return
        }

       if (ret){
        res.json({code:-3,message:'账号已存在'})
        return;
       }
       Redis.getRedis(`register_${phone}`,(_code)=>{
            if (_code !== code){
                res.json({code:-4,message:'验证码错误'})
                return;
            }

                
            createUser(phone);
            function createUser(phone){
                var userId = Util.generateUserId();
                if (creatingUser[userId]){
                    createUser(phone)
                    return;
                }
                creatingUser[userId] = true;
        
                userModel.findOne({userId:userId})
                .select("-_id")
                .exec((err,ret)=> {
                    if (err){
                        res.json({code:-2,message:'读取数据库错误'})
                        delete creatingUser[userId]
                        return
                    }
        
                    if (ret && ret.length){
                        delete creatingUser[userId];
                        createUser(phone)
                        return
                    }
        
                    var condition = {
                        userId,
                        phone,
                        userName
                    }
                    userModel.create(condition,  (err, doc) => {
                        if (err) {
                            delete creatingUser[userId]
                            res.json({code:-2,message:"插入数据错误"});
                        } else {
                            delete creatingUser[userId]
                            res.json({code:0,userId,userName})
                        }
                    })
        
                })
        
        
            }

        })
    })
})


//登录
router.post('/user_login_by_sms',function(req,res,next){
    var body = req.body;
    if (!body.phone || !body.code){
        res.json({code:-1,message:"参数有误"})
        return;
    }

    var phone = body.phone;

    console.log('phone is ',phone)

    if (!Util.checkPhoneIsValid(phone)){
        res.json({code:-1,message:'手机号格式错误'})
        return;
    }

    console.log('get before')

     Redis.getRedis(`login_${phone}`,(code)=>{
        console.log('code is ',code)

        if (!code){
            res.json({code:-1,message:'验证码过期'});
            return;
        }
    
        if (code !== body.code){
            res.json({code:-1,message:'验证码错误'});
            return; 
        }
    
        userModel.findOne({phone:body.phone},(err,ret)=>{
            if (err){
                res.json({code:-1,message:'读取数据库错误'})
                return;
            }

            if (ret){
                res.json({code:0,userId:ret.userId})
                return
            }else{
                res.json({code:-4,message:'账号不存在'});
                return;
            }

            
        })
    });

    return;


})
module.exports = router;
