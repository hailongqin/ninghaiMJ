
var io = require('socket-io')
var CONST = require('const');
console.log(CONST)
cc.Class({
    extends: cc.Component,
    statics: {
        ip:CONST.BASE_REQUEST_URL,
        sio:null,
        pingTimer:null,
        handlerNode:null,
        setHandlerNode(node){
            this.handlerNode = node;
        },

        dispatchEvent(event,data){
            if (this.handlerNode){
                this.handlerNode.emit(event,data);
            }
        },
        connect:function(fnConnect,node) {

            var self = this;
            var opts = {
                'reconnection':true,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
  
            this.sio = io.connect(this.ip,opts);
            this.sio.on('reconnect',function(){
                console.log('reconnection');
            });
            this.sio.on('connect',(data)=>{
                console.log('connect')
                self.sio.connected = true;
                this.setHandlerNode(node);
                fnConnect(data);
            });
            this.sio.on('disconnect',function(data){
                console.log("disconnect");
                self.sio.connected = false;
                //self.close();
            });
            
            this.sio.on('connect_failed',function (){
                console.log('connect_failed');
            });

            var CONST = cc.vv.CONST;
            var events = [
                CONST.SERVER_GAME_START_NOTIFY , //游戏开始通知
                CONST.SERVER_PING_RESULT_REPLY, //ping回复
                CONST.SERVER_GAME_UPDATE_TABLE , //更新桌面
                CONST.SERVER_GAME_UPDATE_PEOPLE_STATUS , //更新人员状态
                CONST.SERVER_GAME_CAN_SET_READY , //刚进来是否可以进行准备
                CONST.SERVER_GAME_SEND_TIP , //tip提示
                CONST.SERVER_GAME_OP_NOTIFY , //操作通知
                CONST.SERVER_GAME_CHUPAI_NOTIFY , //出牌通知
                CONST.SERVER_GAME_TINGPAI_NOTIFY ,//听牌通知
                CONST.SERVER_GAME_OP_ACTION_NOTIFY , //操作结果通知
                CONST.SERVER_GAME_CLEAR_OP_NOTIFY , //清除通知
                CONST.SERVER_ROOM_STATUS_NOTIFY , //房间状态通知
                CONST.SERVER_ROOM_SEND_USER_INFO , //用户信息通知
                CONST.SERVER_ROOM_NEW_USER_SET_READY , //新用户准备
                CONST.SERVER_GAME_USER_NEXT_JU_HAS_READY , //下一句准备
                CONST.SERVER_ROOM_SEND_BASE_INFO,
                CONST.SERVER_GAME_OVER, //游戏结束
                CONST.SERVER_AUDIO_CHAT,
            ]

            events.map((e)=>{
                this.sio.on(e,(data) => {
                    console.log(e,data);
                    this.dispatchEvent(e,data)
                }); 
            })

            this.startHearbeat();
        },

        startHearbeat:function(){
            var lastSendTime = '';
            var lastReceiveTime = '';
            var delayMs = 0;
            this.sio.on(cc.vv.CONST.SERVER_PING_RESULT_REPLY,()=>{
                console.log('receive ping result')
                lastReceiveTime = Date.now();
                delayMs = lastReceiveTime - lastSendTime;
                this.dispatchEvent('delay_ms',delayMs)
            })
            this.pingTimer = setInterval(()=>{
                lastSendTime = Date.now();
                this.send(cc.vv.CONST.CLIENT_PING);
            },5000)
        },
        send:function(event,data){
            if(this.sio.connected){
                this.sio.emit(event,data);
            }
        },

        close:function(){
            console.log('close')
            this.delayMS = null;
            if(this.sio){
                this.sio.disconnect();
                this.sio = null;
            }

            if (this.pingTimer){
                clearInterval(this.pingTimer);
                this.pingTimer = null;
            }
          
        },
    },
});