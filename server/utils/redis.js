var redis = require('redis');
var Log = require('./log')
var rClient = redis.createClient(6379,'127.0.0.1');

rClient.on('ready',function(res){
    console.log('ready');
});

rClient.on('end',function(err){
    console.log('end');
});

rClient.on('error', function (err) {
    console.log(err);
});

rClient.on('connect',function(){
    console.log('redis connect success!');
});
class Redis{
    constructor(){

    }

    setRedis(key,value,expire = null){
        rClient.set(key,value,(err)=>{
            if (err){
                Log.error('set redis key error',key,value)
            }
            if (expire)
            rClient.expire(key,expire)
        });
        
    }

    getRedis(key,callback = null){
        console.log('redis get key is ',key),
        rClient.get(key,(err,value)=>{
            console.log(value)
            callback(value)
       }); 
    }
}

module.exports = new Redis();
