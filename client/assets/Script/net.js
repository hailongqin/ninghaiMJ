
var io = require('socket-io')
cc.Class({
    extends: cc.Component,
    statics: {
        ip:"192.168.0.100:1000",
        sio:null,
        isPinging:false,
        fnDisconnect:null,
        handlers:{},
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

            // this.sio.on('login_result',function(data){
            //     console.log('login result event ',data)
            // });

            // this.sio.on('set_ready_result',function(data){
            //     console.log('set_ready_result event ',data)
            // });

            // this.sio.on('game_start',function(data){
            //     console.log('game_start event ',data)
            // })

            // for(var key in this.handlers){
            //     var value = this.handlers[key];
            //     if(typeof(value) == "function"){
            //         if(key == 'disconnect'){
            //             this.fnDisconnect = value;
            //         }
            //         else{
            //             console.log("register:function " + key);
            //             this.sio.on(key,value);
            //         }
            //     }
            // }

            //this.startHearbeat();
        },

        startHearbeat:function(){
            this.sio.on('game_pong',function(){
                console.log('game_pong');
                self.lastRecieveTime = Date.now();
                self.delayMS = self.lastRecieveTime - self.lastSendTime;
                console.log(self.delayMS);
            });
            this.lastRecieveTime = Date.now();
            var self = this;
            console.log(1);
            if(!self.isPinging){
                self.isPinging = true;
                cc.game.on(cc.game.EVENT_HIDE,function(){
                    self.ping();
                });
                setInterval(function(){
                    if(self.sio){
                        self.ping();
                    }
                }.bind(this),5000);
                setInterval(function(){
                    if(self.sio){
                        if(Date.now() - self.lastRecieveTime > 10000){
                            self.close();
                        }
                    }
                }.bind(this),500);
            }
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
            }
            this.sio = null;
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
        },

        test:function(fnResult){
            var fn = function(ret){
                fnResult(ret.errcode == 0);
            }
            cc.vv.http.sendRequest("/hi",null,fn,'http://' + this.ip);
        }
    },
});