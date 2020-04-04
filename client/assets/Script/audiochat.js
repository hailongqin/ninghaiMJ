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

        voiceNode:{
            default:null,
            type:cc.Node
        }

        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.holdTimeEclipse = 0;
        this.holdClick = false;
        this.intervalHandle = null;
        this.lock = false;
     },

    start () {

    },

    startRecord(){
        if (this.lock){
            this.stopRecord();
            return; //锁住
        } 
        this.lock = true;
        wx.startRecord({
            success:()=>{
                var timer = 10;
                var vNode = this.voiceNode.getChildByName('v');
                var timeLabel = this.voiceNode.getChildByName('time').getComponent(cc.Label);
                timeLabel.string = timer+'s';
                for (var i = 0; i < vNode.children.length;i++){
                    vNode.children[i].active = false;
                }
                vNode.children[0].active = true;
        
                var index = 0;
        
                this.intervalHandle = setInterval(()=>{
                    vNode.children[index].active = false;
                    index++;
                    if (index === vNode.children.length) index = 0;
                    vNode.children[index].active = true;
                    if (index % 2 === 0){
                        timer--;
                        if (timer <= 0){
                            this.stopRecord();
                        }else{
                            timeLabel.string = timer+'s';
                        }
                    }
                },500)
                this.voiceNode.active = true;
                navigator.vibrate = navigator.vibrate ||
                            navigator.webkitVibrate ||
                            navigator.mozVibrate ||
                            navigator.msVibrate;
         
                        if(navigator.vibrate) {
                            navigator.vibrate(30);
                        }
            },
            fail:()=>{
                this.lock = false;
            }
        });
       

      
    },

    update(dt){
      
    },

    stopRecord(){
        if (this.intervalHandle){
            this.stopChat();
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        //开始记录时间
        this.voiceNode.active = false;
        this.lock = false;
    },

    initHandle(){
        
    },
  

    stopChat(){
        wx.stopRecord({
            success:function(res){
                if (res.localId){
                    wx.uploadVoice({
                        localId: res.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                        isShowProgressTips: 0, // 默认为1，显示进度提示
                        success: function (res) {
                            if (res.serverId){
                                var serverId = res.serverId; // 返回音频的服务器端ID
                                cc.vv.net.send(cc.vv.CONST.CLIENT_AUDIO_CAHT,{serverId})
                            }   
                        }
                        });
                  
                }
            }
        })
    },

    // update (dt) {},
});
