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
        var seat = ''
        var seats = roomInfo.seats;
        var node = '';
        var selected = [];
        for (var i = 0; i < seats.length;i++){
            seat = seats[i];
            node = '';
            if (cc.vv.Common.checkIsMySelfIndex(myIndex,i,seats)) selected.push(0);     
            if (cc.vv.Common.checkIsLeftIndex(myIndex,i,seats))   selected.push(3)      
            if (cc.vv.Common.checkIsRightIndex(myIndex,i,seats)) selected.push(1)  
            if (cc.vv.Common.checkIsUpIndex(myIndex,i,seats))   selected.push(2)  
        }

        for (var i = 0; i < this.node.children.length;i++){
            if (selected.indexOf(i) !== -1){
                node = this.node.children[i];
                node.active = true;
                this.setUserInfo(node,seat.userInfo);
                this.setReadySign(node,roomInfo,seat);
            }else{
                this.node.children[i].active = false;
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

    setReadySign(node,roomInfo,seat){
        if ((!roomInfo.gameStart || (roomInfo.gameStart && roomInfo.process === 'end')) && seat.ready) {
            //游戏未开始或者这轮已经结束
            node.getChildByName('ready_sign').active = true;
        }else{
            node.getChildByName('ready_sign').active = false;
        }

        return;
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
