// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
       
        zhuangIndex:null,
        turn:null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
      
    },

    start () {

    },

    setFengDirection(myIndex,zhuangIndex){
        if (this.zhuangIndex === zhuangIndex) return;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,zhuangIndex)){
            this.node.angle = -90;
        }
        if (cc.vv.Common.checkIsLeftIndex(myIndex,zhuangIndex)){
            this.node.angle = 180;
        }
        if (cc.vv.Common.checkIsRightIndex(myIndex,zhuangIndex)){
            this.node.angle = 0;
        }
        if (cc.vv.Common.checkIsUpIndex(myIndex,zhuangIndex)){
            this.node.angle = 90;
        }
        this.zhuangIndex = zhuangIndex;
        this.show();
    },

    setTurn(turn){
        if (turn === this.turn) return;
        var zhuangIndex = this.zhuangIndex;
        this.hideAllChildren();
        if (cc.vv.Common.checkIsMySelfIndex(zhuangIndex,turn)){
            this.node.children[0].active = true;
        }
        if (cc.vv.Common.checkIsLeftIndex(zhuangIndex,turn)){
            this.node.children[2].active = true;
        }
        if (cc.vv.Common.checkIsRightIndex(zhuangIndex,turn)){
            this.node.children[1].active = true;
        }
        if (cc.vv.Common.checkIsUpIndex(zhuangIndex,turn)){
            this.node.children[2].active = true;
        }
        this.turn = turn;
    },

    hideAllChildren(){
        for (var i = 0; i < this.node.children.length;i++){
            this.node.children[i].active = false;
        }
    },

    show(){
        this.node.active = true;
    },

    hide(){
        this.node.active = false;
        this.zhuangIndex = null;
        this.turn = null;
    }

    // update (dt) {},
});
