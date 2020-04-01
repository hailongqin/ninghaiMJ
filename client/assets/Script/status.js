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

    setStatusData(seats){
   
        var diff = cc.vv.Common.getMySeatIndex(seats)  
        this.setUserInfo(diff,seats);
    },

    setScoreData(seats){
        var diff = cc.vv.Common.getMySeatIndex(seats)
        for (var i = 0; i < seats.length;i++){
            var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(i,diff);
            var node = this.node.children[nodeIndex];
            node.getChildByName('score').getComponent(cc.Label).string = seats[i].totalScore;
            node.active = true; 
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

    playAuioAnimation(seatIndex,seats){
        var diff = cc.vv.Common.getMySeatIndex(seats);

        var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(seatIndex,diff); 

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
        
    },

    setUserInfo(diff,seats){
        var nodeIndex = 0;
        var i = 0;
        for ( i = 0; i < seats.length;i++){
            var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(i,diff);
            var node = this.node.children[nodeIndex];
            var userInfo = seats[i].userInfo;
            if (userInfo.userName){
                node.getChildByName('userName').getComponent(cc.Label).string = userInfo.userName
            }
            if (userInfo.header){
                cc.loader.load({url: userInfo.header+'?file=a.png', type: 'png'}, function (err, tex) {        
                    node.getChildByName('header').getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(tex)
                });
            }
            node.getChildByName('off_line_sign').active = seats[i].onLine?false:true
            node.active = true; 
        }

        for (;i < 4;i++){
            var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(i,diff);
            this.node.children[nodeIndex].active = false;
        }
    },


    setXieIcon(seatIndex,seats){
     
        var diff = cc.vv.Common.getMySeatIndex(seats);
     
        var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(seatIndex,diff);
     
        var node = this.node.children[nodeIndex];
        node.getChildByName('xie').active = seats[seatIndex].xie && seats[seatIndex].xie.action?true:false  
        
    },
    setUserReadyStatus(seatIndex,seats){
      
        var diff = cc.vv.Common.getMySeatIndex(seats);

        var nodeIndex = cc.vv.Common.getNodeIndexBySeatIndex(seatIndex,diff);
        var node = this.node.children[nodeIndex];
        node.getChildByName('ready_sign').active = true;
        node.active = true;
        
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
