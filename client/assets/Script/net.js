
var io = require('socket-io')
cc.Class({
    extends: cc.Component,
    statics: {
        ip:"192.168.0.100:1000",
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


            var events = [
                'update_table','update_pepole_status','new_user_login_notify','new_user_ready_notify','op_notify','op_action_notify',
                'chupai_action_notify','tingpai_notigy','game_start','chupai_notify','clear_op_notify'
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
            this.sig.on('ping_result',()=>{
                lastReceiveTime = Date.now();
                delayMs = lastReceiveTime - lastSendTime;
                this.dispatchEvent('delay_ms',delayMs)
            })
            this.pingTimer = setInterval(()=>{
                lastSendTime = Date.now();
                this.send('ping',{userId:cc.vv.userId});
            },5000)
        },
        send:function(event,data){
            if(this.sio.connected){
                this.sio.emit(event,data);
            }
        },

        ping:function(){
            if(this.sio){
                this.lastSendTime = Date.now();
                this.send('game_ping');
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