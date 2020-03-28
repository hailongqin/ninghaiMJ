// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        
        hallScen:{
            default:null,
            type:cc.SceneAsset
        },
        loginScen:{
            default:null,
            type:cc.SceneAsset
        },
        roomSecen:{
            default:null,
            type:cc.SceneAsset 
        }
    },

     urlParse(){
        var params = {};
        if(window.location == null){
            return params;
        }
        var name,value; 
        var str=window.location.href; //取得整个地址栏
        var num=str.indexOf("?") 
        str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
    
        var arr=str.split("&"); //各个参数放到数组里
        for(var i=0;i < arr.length;i++){ 
            num=arr[i].indexOf("="); 
            if(num>0){ 
                name=arr[i].substring(0,num);
                value=arr[i].substr(num+1);
                params[name]=value;
            } 
        }
        return params;
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        cc.vv = {};
        cc.vv.alertScript =  cc.find("alert").getComponent("alert");
        cc.vv.audio =  cc.find("audio").getComponent("audioPlay");

        cc.vv.Util = require('utils');
        cc.vv.Crypto = require('md5')

        var Storage = require('storage');
        cc.vv.storage = new Storage();
 
        cc.vv.http = require('http');

        cc.vv.net = require('net');

        var Common = require('common');
        cc.vv.Common = new Common();
        cc.vv.User = require('user');

        cc.vv.CONST = require('const');
        console.log(cc.vv.CONST)

        var param = this.urlParse();
        console.log('url param is ',param,cc.vv.storage.getStorage('aaa'))

        var userId = cc.vv.storage.getStorage('userId')
        if (userId && userId !== 'null'){
            cc.vv.userId = parseInt(cc.vv.storage.getStorage('userId'));
            cc.vv.http.sendRequest('/user/user_login_by_userId',{userId:cc.vv.userId},(data)=>{
                console.log('login data is ',data)
                if (data.code === -3){
                    this.jumpToLogin();
                }else{
                    cc.vv.userInfo = {userId,userName:data.userName};

                    if (param && param.roomId){
                        cc.vv.http.sendRequest('/room/check_room_exit',{roomId:param.roomId},()=>{  
                            cc.vv.roomId =  param.roomId;
                            cc.director.loadScene(this.roomSecen.name);
            
                        },(err)=>{
                            var message = err.message || '加入房间失败'
                            cc.vv.alertScript.alert(message);
                            cc.director.loadScene(this.hallScen.name);
                        });
                    }else{
                        cc.director.loadScene(this.hallScen.name);
                    }
                }
 
            },(err)=>{
                this.jumpToLogin();

            })
            // if (param.roomId){
            //     cc.vv.roomId = ret.roomId
            //     cc.director.loadScene(this.roomSecen.name); 
            // }else{
               
            // }
       
        }else{
             this.jumpToLogin();
        }

        
     },

     jumpToLogin(){
        cc.vv.storage.setStorage('userId',null)
        cc.director.loadScene(this.loginScen.name);
     },

    start () {
       

    },

    // update (dt) {},
});
