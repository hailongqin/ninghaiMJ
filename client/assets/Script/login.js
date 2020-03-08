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
        }
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
     },

    start () {

    },

    onClickUser1Login(){
        cc.vv.userId = 1;
        cc.vv.storage.setStorage('userId',1)
        cc.director.loadScene(this.hallScen.name);
    },

    onClickUser2Login(){
        cc.vv.userId = 2
        cc.vv.storage.setStorage('userId',2)
        cc.director.loadScene(this.hallScen.name);
    },

    // update (dt) {},
});
