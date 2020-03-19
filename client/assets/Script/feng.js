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

    setFengDirection(myIndex,roomInfo){
        var zhuangIndex = roomInfo.zhuangIndex;
        var seats = roomInfo.seats;
        if (this.zhuangIndex === zhuangIndex) return;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,zhuangIndex,seats)){
            this.node.angle = -90;
        }
        if (cc.vv.Common.checkIsLeftIndex(myIndex,zhuangIndex,seats)){
            this.node.angle = 180;
        }
        if (cc.vv.Common.checkIsRightIndex(myIndex,zhuangIndex,seats)){
            this.node.angle = 0;
        }
        if (cc.vv.Common.checkIsUpIndex(myIndex,zhuangIndex,seats)){
            this.node.angle = 90;
        }
        this.zhuangIndex = zhuangIndex;
        this.turn = null;
        this.show();
    },

    setTurn(roomInfo){
        if (!roomInfo) return;
    
        if (roomInfo.turn === this.turn) return;
        var zhuangIndex = this.zhuangIndex;
        var seats = roomInfo.seats;
        var turn = roomInfo.turn;
        var fengIndex = seats[turn].fengIndex;
        this.hideAllChildren();
       
        this.node.children[fengIndex].active = true;
        
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
