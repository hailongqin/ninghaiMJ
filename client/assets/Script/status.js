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

    setStatusData(myIndex,roomInfo,includingMySelf = false){
        var seat = ''
        var seats = roomInfo.seats;
        var node = ''
        for (var i = 0; i < seats.length;i++){
            seat = seats[i];
            node = '';
            if (cc.vv.Common.checkIsMySelfIndex(myIndex,i) && includingMySelf) node = this.node.children[0]     
            if (cc.vv.Common.checkIsLeftIndex(myIndex,i))  node = this.node.children[3]          
            if (cc.vv.Common.checkIsRightIndex(myIndex,i)) node = this.node.children[1]
            if (cc.vv.Common.checkIsUpIndex(myIndex,i))  node = this.node.children[2]

            if (node){
                this.setUserInfo(node,seat.userInfo);
                this.setReadySign(node,roomInfo,seat.userInfo);
            }
        }
    },

    setUserInfo(node,userInfo){
        if (userInfo.userName){
            node.getChildByName('userName').getComponent(cc.Label).string = userInfo.userName
        }
        if (userInfo.header){
            cc.loader.load({url: userInfo.header, type: 'png'}, function (err, tex) {        
                node.getChildByName('header').getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(tex)
            });
        }
    },

    setReadySign(node,roomInfo,userInfo){
        if (!roomInfo.gameStart || roomInfo.gameStart && roomInfo.process === 'end') {
            //游戏未开始或者这轮已经结束
            node.getChildByName('ready_sign').active = true;
        }

        return;
    },




    onClose(){
        this.node.active = false;
    },

    start () {

    },

    // update (dt) {},
});
