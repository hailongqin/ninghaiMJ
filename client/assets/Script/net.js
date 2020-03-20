
var io = require('socket-io')
cc.Class({
    extends: cc.Component,
    statics: {
        ip:"192.168.0.101:1000",
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
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            console.log('this ip is ',this.ip,io)
  
            this.sio = io.connect(this.ip,opts);
            this.sio.on('reconnect',function(){
                console.log('reconnection');
            });
            this.sio.on('connect',(data)=>{
                self.sio.connected = true;
                this.setHandlerNode(node);
                fnConnect(data);
            });
            this.sio.on('disconnect',function(data){
                console.log("disconnect");
                self.sio.connected = false;
                self.close();
            });
            
            this.sio.on('connect_failed',function (){
                console.log('connect_failed');
            });

            var CONST = cc.vv.CONST;
            var events = [
                CONST.SERVER_GAME_STATUS_NO_START,
                CONST.SERVER_GAME_STATUS_START,
                CONST.SERVER_GAME_STATUS_ONE_OVER,
                CONST.SERVER_GAME_STATUS_END,
                CONST.SERVER_GAME_START_NOTIFY , //游戏开始通知
                CONST.SERVER_PING_RESULT_REPLY, //ping回复
                CONST.SERVER_GAME_UPDATE_TABLE , //更新桌面
                CONST.SERVER_GAME_UPDATE_PEOPLE_STATUS , //更新人员状态
                CONST.SERVER_GAME_CAN_SET_READY , //刚进来是否可以进行准备
                CONST.SERVER_GAME_NEW_USER_LOGIN_NOTIFY , //新用户登录
                CONST.SERVER_GAME_OP_NOTIFY , //操作通知
                CONST.SERVER_GAME_CHUPAI_NOTIFY , //出牌通知
                CONST.SERVER_GAME_TINGPAI_NOTIFY ,//听牌通知
                CONST.SERVER_GAME_OP_ACTION_NOTIFY , //操作结果通知
                CONST.SERVER_GAME_CLEAR_OP_NOTIFY , //清除通知
                CONST.SERVER_ROOM_STATUS_NOTIFY , //房间状态通知
                CONST.SERVER_ROOM_SEND_USER_INFO , //用户信息通知
                CONST.SERVER_ROOM_NEW_USER_SET_READY , //新用户准备
                CONST.SERVER_GAME_USER_NEXT_JU_HAS_READY , //下一句准备
            ]

            events.map((e)=>{
                this.sio.on(e,(data) => {
                    console.log(e,data);
                    this.dispatchEvent(e,data)
                }); 
            })
        },

        startHearbeat:function(){
            var lastSendTime = '';
            var lastReceiveTime = '';
            var delayMs = 0;
            this.sig.on(cc.vv.CONST.SERVER_PING_RESULT_REPLY,()=>{
                lastReceiveTime = Date.now();
                delayMs = lastReceiveTime - lastSendTime;
                this.dispatchEvent('delay_ms',delayMs)
            })
            this.pingTimer = setInterval(()=>{
                lastSendTime = Date.now();
                this.send(cc.vv.CLIENT_PING);
            },5000)
        },
        send:function(event,data){
            if(this.sio.connected){
                this.sio.emit(event,data);
            }
        },

        close:function(){
            console.log('close');
            this.delayMS = null;
            if(this.sio && this.sio.connected){
                this.sio.connected = false;
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