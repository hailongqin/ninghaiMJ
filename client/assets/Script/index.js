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

        cc.vv.Util = require('utils');

        var Storage = require('storage');
        cc.vv.storage = new Storage();
 
        cc.vv.http = require('http');

        cc.vv.net = require('net');

        var param = ths.urlParse();

        if (cc.vv.storage.getStorage('userId')){
            cc.vv.userId = parseInt(cc.vv.storage.getStorage('userId'));
            if (param.roomId){
                cc.vv.roomId = ret.roomId
                cc.director.loadScene(this.roomSecen.name); 
            }else{
                cc.director.loadScene(this.hallScen.name);
            }
       
        }else{
            cc.director.loadScene(this.loginScen.name);
        }

        
     },

    start () {
       

    },

    // update (dt) {},
});
