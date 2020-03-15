
let config = require('../config').config

let mongoose = require("mongoose");
mongoose.connect('mongodb://'+config.DBHOST+'/'+config.DBNAME);
var db = mongoose.connection;


db.on('error',()=>{
    console.log('数据库连接失败');
});

db.once('open',()=>{
    console.log('数据连接成功');
});

db.once('close',()=>{
    console.log('数据断开连接');
});

var Schema = mongoose.Schema;

var roomSchema = new Schema({
    creator:{type:Number},//房间创建者
    roomId:{type:String}, //房间id
    conf:{type:Object}, //房间配置
    players:{type:Array},//进入房间的人
    seats:{type:Array}, //坐下的人
    mjLists:{type:Array}, //麻将牌
    zhuangIndex:{type:Number}, //庄家
    turn:{type:Number}, //轮到第几个出牌
    count:{type:Number}, //第几局了
}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}});


var roomModel = mongoose.model('room',roomSchema,'room');


const userSchema = new Schema({
    userId:{type:String}, //名称
    userName:{type:String}, //用户名称
    password:{type:String} ,// 密码
    header:{type:String},// 头像路径
    isFrom:{
        type:String,
        default:"self" // 来自自己创建
    },

    zuanshiCount:{
        type:Number,
        default:0 // 钻石数量
    }

}, {timestamps: {createdAt: 'created', updatedAt: 'updated'}})

var userModel = mongoose.model('user',userSchema,'user');

module.exports = {
    roomModel,
    userModel
}
