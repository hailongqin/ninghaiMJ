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
        yinyueHandleNode:{
            default:null,
            type:cc.Node
        },
        yinxiaoHandleNode:{
            default:null,
            type:cc.Node
        },
        yinyueProgress:{
            default:null,
            type:cc.Node
        },
        yinxiaoProgress:{
            default:null,
            type:cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         this.initYinyueHandle(this.yinyueHandleNode);
         this.initYinxiaoHandle(this.yinxiaoHandleNode);
     },

     initYinyueHandle(node){
        node.on(cc.Node.EventType.TOUCH_MOVE,(event)=>{
            var delta = event.touch.getDelta(); 
            node.x = Math.abs(node.x + delta.x) > node.parent.width/2?node.x + delta.x < 0?-node.parent.width/2:node.parent.width/2:node.x + delta.x; 
            node.y = 0;
            this.setYinyueProgressValue(Math.abs(node.x + node.parent.width/2))
        });
     },

     initYinxiaoHandle(node){
        node.on(cc.Node.EventType.TOUCH_MOVE,(event)=>{
            var delta = event.touch.getDelta(); 
            node.x = Math.abs(node.x + delta.x) > node.parent.width/2?node.x + delta.x < 0?-node.parent.width/2:node.parent.width/2:node.x + delta.x; 
            node.y = 0;
            this.setYinxiaoProgressValue(Math.abs(node.x + node.parent.width/2))
        });
     },


     setYinyueProgressValue(value){
        var node = this.yinyueProgress;
        var percent = Math.abs(value)/node.width;
        node.getComponent(cc.ProgressBar).progress = percent;
        cc.vv.audio.setBGMVolume(percent)

     },

     setYinxiaoProgressValue(value){
        var node = this.yinxiaoProgress;
        var percent = Math.abs(value)/node.width;
        node.getComponent(cc.ProgressBar).progress =percent;
        cc.vv.audio.setSFXVolume(percent)
     },

    start () {

    },

    // update (dt) {},
});
