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

    },

    setStatusData(myIndex,roomInfo){
        for (var i = 0 ; i < roomInfo.seats;i++){
            this.setUserInfo(i,myIndex,roomInfo.seats);
            this.setUserReadyStatus(i,myIndex,roomInfo);
        }
    },

    setUserInfo(seatIndex,myIndex,seats){

        var nodeIndex = -1;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;   

        if (nodeIndex !== -1){
            var node = this.node.children[nodeIndex];
            var userInfo = seats[seatIndex].userName;
            if (userInfo.userName){
                node.getChildByName('userName').getComponent(cc.Label).string = userInfo.userName
            }
            if (userInfo.header){
                cc.loader.load({url: userInfo.header, type: 'png'}, function (err, tex) {        
                    node.getChildByName('header').getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(tex)
                });
            }
        }
    },


    setUserReadyStatus(seatIndex,myIndex,roomInfo){
        var nodeIndex = -1;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;   

        if (nodeIndex !== -1){
            var node = this.node.children[nodeIndex];
            var seat = roomInfo.seats[seatIndex];
            const CONST = cc.vv.CONST;
            if ((roomInfo.gameStatus === CONST.GAME_STATUS_NO_START || roomInfo.gameStatus === CONST.GAME_STATUS_ONE_OVER) && seat.ready ) {
                //游戏未开始或者这轮已经结束
                node.getChildByName('ready_sign').active = true;
            }else{
                node.getChildByName('ready_sign').active = false;
            }
    
        }
    },

    clearAllReadySign(){
        for (var i = 0; i < this.node.children.length;i++){
            this.node.children[i].getChildByName('ready_sign').active = false;
        }
    },

    onClose(){
        this.node.active = false;
    },

    start () {

    },

    // update (dt) {},
});
