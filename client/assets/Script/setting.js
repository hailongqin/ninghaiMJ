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
        },
        yinxiaoOpenNode:{
            default:null,
            type:cc.Node
        },
        yinxiaoCloseNode:{
            default:null,
            type:cc.Node
        },
        yinyueCloseNode:{
            default:null,
            type:cc.Node
        },
        yinyueOpenNode:{
            default:null,
            type:cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        cc.game.addPersistRootNode(this.node); //作为常住节点
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
        console.log(value,percent)
        cc.vv.audio.setBGMVolume(percent,true)

     },

     setYinxiaoProgressValue(value){
        var node = this.yinxiaoProgress;
        var percent = Math.abs(value)/node.width;
        node.getComponent(cc.ProgressBar).progress =percent;
        cc.vv.audio.setSFXVolume(percent)
     },

     setYinyueHandlePosition(pos){
        this.yinyueHandleNode.x = pos;
     },

     setYinxiaoHandlePosition(pos){
        this.yinxiaoHandleNode.x = pos;
     },

     setOrStopYinyueProgress(e,value){
        this.yinyueOpenNode.active = false;
        this.yinyueCloseNode.active = false;
        console.log(value)
        if (parseInt(value) === 0){
            this.setYinyueProgressValue(0);
            this.yinyueCloseNode.active = true;
            this.setYinyueHandlePosition(-this.yinyueProgress.width/2)
        }else{
            this.setYinyueProgressValue(this.yinyueProgress.width/2);
            this.yinyueOpenNode.active = true;
            this.setYinyueHandlePosition(0)
        }
     },

     setOrStopYinxiaoProgress(e,value){
        this.yinxiaoOpenNode.active = false;
        this.yinxiaoCloseNode.active = false;
        if (parseInt(value) === 0){
            this.setYinxiaoProgressValue(0);
            this.yinxiaoCloseNode.active = true;
            this.setYinxiaoHandlePosition(-this.yinxiaoProgress.width/2)
        }else{
            this.setYinxiaoProgressValue(this.yinxiaoProgress.width/2);
            this.yinxiaoOpenNode.active = true;
            this.setYinxiaoHandlePosition(0)
        }
    },

    close(){
        this.node.active = false;
    },

    show(){
        this.node.active = true;
    },

    start () {

    },

    // update (dt) {},
});
