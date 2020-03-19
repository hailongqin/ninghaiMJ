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

        paiAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.eventObj = new cc.Event.EventCustom("chupai",true)
     },

    start () {

    },

    setPaiSpriteFrame(pai){
        if (pai === null || pai === undefined){
            this.node.active = false;
            return
        }


        if (this.node.children.length){
            this.node.children[0].getComponent(cc.Sprite).spriteFrame = this.paiAltas.getSpriteFrame(pai);
        }
        this.node.active = true;
        this.node.pai = pai
    },

    clickChuPai(){
        console.log(this.node.pai);
        this.eventObj.detail = this.node.pai;
        this.node.dispatchEvent(this.eventObj);
    },

    hide(){
        this.node.active = false;
    }

    // update (dt) {},
});
