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

        content:{
            default:null,
            type:cc.Node
        },
        confirmCallback:null,
        cancelCallback:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node); //作为常住节点
        this.node.active = false;
    },

    alert(content,confirmCallback = null,cancelCallback){
        this.node.active = true;
        this.content.getComponent(cc.Label).string = content;
        this.confirmCallback = confirmCallback;
        this.cancelCallback = cancelCallback;
    },

    onConfirmClick(){
        this.node.active = false;
        if (this.confirmCallback){
            this.confirmCallback();
        }
    },

    onClose(){
        this.node.active = false;

    },

    start () {

    },

    // update (dt) {},
});
