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
        }
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        cc.vv = {};
        cc.vv.alertScript =  cc.find("alert").getComponent("alert");

        cc.vv.Util = require('utils');

        var Storage = require('storage');
        cc.vv.storage = new Storage();
 
        cc.vv.http = require('http');

        var Net = require('net');
        cc.vv.net = new Net();


        if (cc.vv.storage.getStorage('userId')){
            cc.vv.userId = cc.vv.storage.getStorage('userId');
            cc.director.loadScene(this.hallScen.name);
        }else{
            cc.director.loadScene(this.loginScen.name);
        }

        
     },

    start () {
       

    },

    // update (dt) {},
});
