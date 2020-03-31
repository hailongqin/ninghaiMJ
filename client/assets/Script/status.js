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
        for (var i = 0 ; i < roomInfo.seats.length;i++){
            this.setUserInfo(i,myIndex,roomInfo.seats);
        }
    },

    setScoreData(roomInfo,myIndex){
        var seats = roomInfo.seats;
        var nodeIndex = -1;
        for (var i = 0; i < seats.length;i++){
            if (cc.vv.Common.checkIsMySelfIndex(myIndex,i,seats)) nodeIndex = 0;   
            if (cc.vv.Common.checkIsLeftIndex(myIndex,i,seats))   nodeIndex = 3;       
            if (cc.vv.Common.checkIsRightIndex(myIndex,i,seats)) nodeIndex = 1;   
            if (cc.vv.Common.checkIsUpIndex(myIndex,i,seats))   nodeIndex = 2;   

            if (nodeIndex !== -1){
                var node = this.node.children[nodeIndex];
                node.getChildByName('score').getComponent(cc.Label).string = seats[i].totalScore;
                node.active = true;
            }
        }
       
    },

    clearAudioTimer(){
        if (this.intervalTimer){
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }

        for (var i = 0; i < this.node.children.length;i++){
            var node = this.node.children[i];
            node.getChildByName('voice').active = false;
        }
    },

    playAuioAnimation(seatIndex,myIndex,seats){
        var nodeIndex = -1;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;      
        if (nodeIndex !== -1){
            var node = this.node.children[nodeIndex];
            var voiceNode = node.getChildByName('voice');
            for (var i = 0; i < 3;i++){
                 voiceNode.getChildByName(`v_anim${i}`).active = false;
            }
            voiceNode.getChildByName(`v_anim0`).active = true;
            var index = 0;
            this.intervalTimer = setInterval(() => {
                voiceNode.getChildByName(`v_anim${index}`).active = false;
                index++;
                if (index === 3) index = 0;
                voiceNode.getChildByName(`v_anim${index}`).active = true;
            }, 100);

            voiceNode.active = true;
        }
    },

    setUserInfo(seatIndex,myIndex,seats){

        var nodeIndex = -1;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;   

        console.log(nodeIndex,seatIndex,myIndex)
        if (nodeIndex !== -1){
            var node = this.node.children[nodeIndex];
            var userInfo = seats[seatIndex].userInfo;
            if (userInfo.userName){
                node.getChildByName('userName').getComponent(cc.Label).string = userInfo.userName
            }
            if (userInfo.header){
                cc.loader.load({url: userInfo.header+'?file=a.png', type: 'png'}, function (err, tex) {        
                    node.getChildByName('header').getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(tex)
                });
            }

            node.getChildByName('off_line_sign').active = seats[seatIndex].onLine?false:true
            
            node.active = true;
        }
    },


    setXieIcon(seatIndex,myIndex,seats){

        var nodeIndex = -1;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;   

        if (node !== -1){
            var node = this.node.children[nodeIndex];
            node.getChildByName('xie').active = seats[seatIndex].xie && seats[seatIndex].xie.action?true:false  
        }
    },
    setUserReadyStatus(seatIndex,myIndex,roomInfo){
        var nodeIndex = -1;
        var seats = roomInfo.seats;
        if (cc.vv.Common.checkIsMySelfIndex(myIndex,seatIndex,seats)) nodeIndex = 0;   
        if (cc.vv.Common.checkIsLeftIndex(myIndex,seatIndex,seats))   nodeIndex = 3;       
        if (cc.vv.Common.checkIsRightIndex(myIndex,seatIndex,seats)) nodeIndex = 1;   
        if (cc.vv.Common.checkIsUpIndex(myIndex,seatIndex,seats))   nodeIndex = 2;   

        if (nodeIndex !== -1){
            var node = this.node.children[nodeIndex];
            node.getChildByName('ready_sign').active = true;
            node.active = true;
        }
    },

    clearAllReadySign(){
        for (var i = 0; i < this.node.children.length;i++){
            this.node.children[i].getChildByName('ready_sign').active = false;
        }
    },

    // onClose(){
    //     this.node.active = false;
    // },

    start () {

    },

    // update (dt) {},
});
