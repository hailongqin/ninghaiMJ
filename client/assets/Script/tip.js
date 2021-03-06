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

 
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
         this.x = this.node.x;
         this.y = this.node.y;
     },

    showTip(content){
        this.node.getComponent(cc.Label).string = content;
        var jumpUp = cc.moveBy(2, cc.v2(0, 20)).easing(cc.easeCubicActionOut());
        this.node.active = true;
        this.node.runAction(jumpUp);

        setTimeout(() => {
            this.node.active = false;
            this.node.x = this.x;
            this.node.y = this.y;
        }, 500);

    },

    start () {

    },

    // update (dt) {},
});
