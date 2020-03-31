// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ERROR } from "./socket-io";

var maxHoldLength = 14;

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

        roomIdLabel:{
            default:null,
            type:cc.Label
        },

        readyBtn:{
            default:null,
            type:cc.Node
        },
        unReadyBtn:{
            default:null,
            type:cc.Node
        },

    
        actionAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        delayMsLabel:{
            default:null,
            type:cc.Node
        },

        remainNumberNode:{
            default:null,
            type:cc.Node
        },

        myTingPaiNode:{
            default:null,
            type:cc.Node
        },

        statusNode:{
            default:null,
            type:cc.Node
        },
        opNode:{
            default:null,
            type:cc.Node
        },

        fengNode:{
            default:null,
            type:cc.Node
        },

        huShowNode:{
            default:null,
            type:cc.Node
        },

        huResultModalNode:{
            default:null,
            type:cc.Node
        },

        zhuangIconNode:{
            default:null,
            type:cc.Node
        },

        headerNode:{
            default:null,
            type:cc.Node
        },

        gameOverNode:{
            default:null,
            type:cc.Node
        },

        hallSecen:{
            default:null,
            type:cc.SceneAsset
        },

        tipNode:{
            default:null,
            type:cc.Node,
        },

        gameInfo:null,
        isPlayingVoice:null
    },

    // LIFE-CYCLE CALLBACKS:
    
    showTip(content){
        this.tipNode.getComponent('tip').showTip(content);
    },
    showReadyBtnNode(){
        this.hideNode(this.unReadyBtn);
        this.showNode(this.readyBtn);
    },

    showUnReadyBtnNode(){
        this.hideNode(this.readyBtn);
        this.showNode(this.unReadyBtn);
    },

    hideAllReadyBtn(){
        this.hideNode(this.readyBtn);
        this.hideNode(this.unReadyBtn);
    },

    hideAllZhuangIcon(){
        for (var i = 0; i < this.zhuangIconNode.children.length;i++){
            this.zhuangIconNode.children[i].active = false;
        }
    },
   
    init(){

   
      if (cc.vv.roomInfo && cc.vv.roomInfo.roomId){
        this.roomIdLabel.string = cc.vv.roomInfo.roomId;
      }else{
          return;
      }
      this.gameInfo = {
          isKanke:true
      };
      this.localAudioList = [];
      this.initEveryNode();
      cc.vv.net.connect(()=>{
          this.initHander();
          var param = {userId:cc.vv.userId,roomId:cc.vv.roomInfo.roomId};
            param.userInfo =  cc.vv.userInfo
          cc.vv.net.send(cc.vv.CONST.CLIENT_LOGIN,param)
      },this.node);
    },

    unInit(){
   
        cc.vv.net.close();
    },

    openSetting(){
        cc.vv.setting.show();
    },

    // chupai(pai){
      
    backHall(){
        if (this.gameInfo && !this.gameInfo.isKanke && this.gameInfo.gameStatus === cc.vv.CONST.GAME_STATUS_START){
            cc.vv.alertScript.alert('游戏已经开始，无法返回大厅哦~')
            return;
        }
        cc.director.loadScene(this.hallSecen.name);
    },

    clickResultReadyBtn(event,xie){
        console.log('click result ready',xie,typeof xie)
        var param = {xie:false};
        if (xie === 'true'){
            param.xie = true
        }
        cc.vv.net.send(cc.vv.CONST.CLIENT_NEXT_JU_READY,param);
        console.log('clearTabel');
        this.clearTable();
    },
   

    clearOperationNode(){
      this.node.getChildByName('op').getComponent('operation').init();  
    },

    showTingPaiNode(){
        this.myTingPaiNode.active = true;
    },

    hideTingPaiNode(){
        this.myTingPaiNode.active = false;
    },
    setRemainNumber(data){
        this.remainNumberNode.children[0].getComponent(cc.Label).string = data.mjLists.length;
    },

    showRemainNumberNode(){
        this.remainNumberNode.active = true;
    },

    hideRemainNumber(){
        this.remainNumberNode.active = false;
    },

    showNode(node){
      node.active = true;  
    },

    hideNode(node){
        node.active = false
    },

    setHuNodePosition(index){
        var gameInfo = this.gameInfo;
        if(index === gameInfo.myIndex){
            this.huShowNode.x = 0;
            this.huShowNode.y =  -this.huShowNode.parent.height*(2/6);
        }else if(index === gameInfo.leftIndex){
            this.huShowNode.x = -this.huShowNode.parent.width*(2/6);
            this.huShowNode.y = 0
        }else if(index === gameInfo.rightIndex){
            this.huShowNode.x = this.huShowNode.parent.width*(2/6);
            this.huShowNode.y = 0
        }else if(index === gameInfo.upIndex){
            this.huShowNode.x = 0;
            this.huShowNode.y = this.huShowNode.parent.height*(2/6);
        }

        console.log('hushownode',index,this.huShowNode)

        this.showNode(this.huShowNode)
    },


    clearTable(){
          this.clearOperationNode();
          this.hideTingPaiNode();
          this.hideRemainNumber();
          this.hideNode(this.huShowNode);
          this.huResultModalNode.getComponent('huResult').reset();


          function hidePaiNode(node){
            for(var i = 0; i < node.children.length; ++i){
                 node.children[i].getComponent('pai').hide();
             }  
          }

          function hideChiResultNode(node){
            for(var i = 0; i < node.children.length; ++i){
                node.children[i].active = false;
            }
          }

          var nodeStrs = ['myHoldsNode','myFoldsNode','myHuasNode','leftHoldsNode','leftFoldsNode','leftHuasNode',
                            'rightHoldsNode','rightFoldsNode','rightHuasNode','upHoldsNode','upFoldsNode','upHuasNode'];

            nodeStrs.forEach((n)=>{
                hidePaiNode(this[n])
            })

            hideChiResultNode(this.myChiResultNode);
            hideChiResultNode(this.leftChiResultNode);
            hideChiResultNode(this.rightChiResultNode);  
            hideChiResultNode(this.upChiResultNode); 
    },

    initEveryNode(){
        //保存我的节
          //初始化自己的牌
        var myNode = this.myNode = this.node.getChildByName('my');
        this.myHoldsNode = myNode.getChildByName('holds');
        this.myHuasNode = myNode.getChildByName('huas');
        this.myFoldsNode = myNode.getChildByName('folds');
        this.myChiResultNode = myNode.getChildByName('chiresult');



        //保存左边的
        var leftNode = this.leftNode = this.node.getChildByName('left');
        this.leftChiResultNode = leftNode.getChildByName('chiresult');
        this.leftHoldsNode = leftNode.getChildByName('holds');
        this.leftHuasNode = leftNode.getChildByName('huas');
        this.leftFoldsNode = leftNode.getChildByName('folds');


        //保存右边的
        var rightNode = this.rightNode = this.node.getChildByName('right');
        this.rightChiResultNode = rightNode.getChildByName('chiresult');
        this.rightHoldsNode = rightNode.getChildByName('holds');
        this.rightHuasNode = rightNode.getChildByName('huas');
        this.rightFoldsNode = rightNode.getChildByName('folds');


        //保存上面的
        var upNode = this.upNode = this.node.getChildByName('up');
        this.upChiResultNode = upNode.getChildByName('chiresult');
        this.upHoldsNode = upNode.getChildByName('holds');
        this.upHuasNode = upNode.getChildByName('huas');
        this.upFoldsNode = upNode.getChildByName('folds');

        this.clearTable();
      
    },

    getMyIndexFromRoomInfo(roomInfo){
        var players = roomInfo.players;
        var seats = roomInfo.seats;
        var userId = cc.vv.userId;

        var seatUserIds = seats.map((s)=>{return s.userId});
        var playerUserIds = players.map((s)=>{return s.userId});
        var myIndex = -1;
        if (playerUserIds.indexOf(userId) !== -1){
            if (roomInfo.gameStatus !== cc.vv.CONST.GAME_STATUS_NO_START){ //游戏已经开始了，上帝视角
                myIndex = 0;
                this.gameInfo.isKanke = true;
            }else{
                myIndex = seats.length;
            }
           
        }else if (seatUserIds.indexOf(userId) !== -1){
            myIndex = seatUserIds.indexOf(userId);
            this.gameInfo.isKanke = false
        }

        return myIndex;
    },


    initHander(){

    


       var CONST = cc.vv.CONST;

       this.node.on('cocos_inner_chupai_dispatch',(event)=>{
            console.log(event.detail);
            console.log(this.gameInfo.canChupai); 
            if (!this.gameInfo.canChupai) return; //是否有出牌的权利
            this.gameInfo.canChupai = false;
            cc.vv.net.send(CONST.CLIENT_CHUPAI_NOTIFY,{pai:event.detail})
        })

        //单发
       this.node.on('delay_ms',(data)=>{
    
           if (data <= 100){
               console.log('green color')
            this.delayMsLabel.color = new cc.color(47,230,130,255);
           }
           else if (data > 100 && data < 200){
               this.delayMsLabel.color = new cc.color(215,230,47,255);
           }else{
            this.delayMsLabel.color = new cc.color(255,0,0,255);
           }
           this.delayMsLabel.getComponent(cc.Label).string = data+'ms';
        })

        //单发
       this.node.on(CONST.SERVER_GAME_CHUPAI_NOTIFY,()=>{
           this.gameInfo.canChupai = true
       })

       //显示tingpai 的节点 单发
       this.node.on(CONST.SERVER_GAME_TINGPAI_NOTIFY,(data)=>{
            this.setTingPaiResult(data);
       })

       //值给个声音，或者显示文案
       this.node.on(CONST.SERVER_GAME_OP_ACTION_NOTIFY,(data)=>{
            if (data.type === 'hu'){
                cc.vv.audio.playSFX('hu')
                this.setHuNodePosition(data.index);
                this.statusNode.getComponent('status').setScoreData(data.roomInfo,this.gameInfo.myIndex);
                setTimeout(() => {
                    this.showResultModal(data);
                }, 3000);
            }

            if (data.type === 'chupai'){
                cc.vv.audio.playSFX(data.pai)
            }
            if (data.type === 'chi'){
                cc.vv.audio.playSFX('chi')
            }
            if (data.type === 'peng'){
                cc.vv.audio.playSFX('peng')
            }
            if (data.type === 'gang'){
                cc.vv.audio.playSFX('gang')
            }
       })

       // 未开始的时候，更新各个用户的状态,就刚进来的时候初始化更新一次 //群发
       this.node.on(CONST.SERVER_GAME_UPDATE_PEOPLE_STATUS,(data)=>{
            var myIndex =  this.getMyIndexFromRoomInfo(data);
            this.statusNode.getComponent('status').setStatusData(myIndex,data);
       })

        //进来的时候，接受是否可以准备了 //单发
       this.node.on(CONST.SERVER_GAME_CAN_SET_READY,()=>{
           this.showReadyBtnNode();
       })

        //刚进来用户准备 //群发
       this.node.on(CONST.SERVER_ROOM_NEW_USER_SET_READY,(data)=>{
        var myIndex =  this.getMyIndexFromRoomInfo(data.roomInfo);
        this.statusNode.getComponent('status').setUserInfo(data.index,myIndex,data.roomInfo.seats);
        this.statusNode.getComponent('status').setUserReadyStatus(data.index,myIndex,data.roomInfo)
       })

        //游戏结束后准备 //群发
       this.node.on(CONST.SERVER_GAME_USER_NEXT_JU_HAS_READY,(data)=>{
        var myIndex =  this.getMyIndexFromRoomInfo(data.roomInfo);
        this.statusNode.getComponent('status').setUserReadyStatus(data.index,myIndex,data.roomInfo)
       })
       

       // 只给个提示 
       this.node.on(CONST.SERVER_GAME_SEND_TIP,(data)=>{
         this.showTip(data)
       })

       //更新手牌，出牌，花牌，持牌等 //群发
       this.node.on(CONST.SERVER_GAME_UPDATE_TABLE,(data)=>{
         // 更新table
         var seats = data.seats;
         this.fengNode.getComponent('feng').setTurn(data)
        this.setTables(seats);
        this.setRemainNumber(data)
       })

       this.node.on(CONST.SERVER_GAME_CLEAR_OP_NOTIFY,(data)=>{
            this.gameInfo.op = {};
            this.opNode.getComponent('operation').hide();
       })
       // 操作通知 //群发
       this.node.on(CONST.SERVER_GAME_OP_NOTIFY,(data)=>{
        this.opNode.getComponent('operation').showOperation(data.op)

       })

        //群发
       this.node.on(CONST.SERVER_ROOM_SEND_BASE_INFO,(data)=>{
           var conf = data.conf;
           var currentCount = data.count;
           var type = conf.type;
           this.gameInfo.conf = conf;
           this.headerNode.getChildByName('type').getComponent(cc.Label).string = cc.vv.CONST.MJ_TYPE[type].title;
           this.headerNode.getChildByName('jushu').getComponent(cc.Label).string = '总共'+conf.jushu+'局';
           this.headerNode.getChildByName('remainJushu').getComponent(cc.Label).string = '剩余'+(conf.jushu - currentCount)+'局';
       })

       this.node.on(CONST.SERVER_AUDIO_CHAT,(data)=>{
           if (data.serverId){
            wx.downloadVoice({
                serverId: data.serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                isShowProgressTips: 0, // 默认为1，显示进度提示
                success: function (res) {
                    var localId = res.localId; // 返回音频的本地ID
                    if (data.playerIndex){
                        console.log('say playerIndex ',data.playerIndex);
                    }
                    if (data.seatIndex){
                        console.log('say seatIndex ',data.seatIndex);
                    }

                    this.localAudioList.push({
                        localId,
                        playerIndex:data.playerIndex,
                        seatIndex:data.seatIndex,
                        roomInfo:data.roomInfo
                    })
                   
                    console.log('isPlayingVoice',this.isPlayingVoice)
                    if (!this.isPlayingVoice)
                        this.playAudioChat();
                }
            });
           }
       })

       //群发
       this.node.on(CONST.SERVER_GAME_OVER,(data)=>{
        var seats = data.seats;

        this.gameInfo.gameStatus = cc.vv.CONST.GAME_STATUS_END;
        var maxScoreIndex = 0;
        var maxFangpaoIndex = 0;

        for (var i = 0; i < seats.length;i++){
            var seat = seats[i];
            var node = this.gameOverNode.getChildByName('list'+i);
            node.getChildByName('zimocishu').getComponent(cc.Label).string = '自摸次数：'+seat.zimocishu;
            node.getChildByName('fangpaocishu').getComponent(cc.Label).string = '放炮次数：'+seat.fangpaocishu;
            node.getChildByName('lazipai').getComponent(cc.Label).string = '辣子次数：'+seat.lazipaishu;
            node.getChildByName('zonghupaishu').getComponent(cc.Label).string = '总胡牌数：'+seat.totalhucishu;
            node.getChildByName('shuangtaipaishu').getComponent(cc.Label).string = '双台牌数：'+seat.shuangtaicishu;
            node.getChildByName('pinghupaishu').getComponent(cc.Label).string = '平胡牌数：'+seat.pinghucishu;

            node.getChildByName('score').getComponent(cc.Label).string = seat.totalScore;
            node.getChildByName('userName').getComponent(cc.Label).string = seat.userInfo.userName;
            node.getChildByName('id').getComponent(cc.Label).string = i;

            node.getChildByName('GameEnd5').active = false; //大赢家
            node.getChildByName('GameEnd3').active = false; //放炮次数

            if (i !== 0){
                if (seat[i].totalScore > seat[maxScoreIndex]) maxScoreIndex = i;
                if (seat[i].fangpaocishu > seat[maxFangpaoIndex]) maxFangpaoIndex = i;
            }
            node.active = true;
        }

        for (;i < 4;i++){
            this.gameOverNode.getChildByName('list'+i).active = false;
        }
        this.gameOverNode.getChildByName('list'+maxScoreIndex).getChildByName('GameEnd5').active = true;
        this.gameOverNode.getChildByName('list'+maxFangpaoIndex).getChildByName('GameEnd3').active = true;
        this.gameOverNode.active = true;
        })
            
       // 游戏开始 //群发
        this.node.on(CONST.SERVER_GAME_START_NOTIFY,(data) => {
            this.hideAllReadyBtn();
            this.statusNode.getComponent('status').clearAllReadySign();
            var userId = cc.vv.userId;
            var seats = data.seats;
         
            if (data.count !== 1){
                this.clearTable();
            }
            var myIndex = this.getMyIndexFromRoomInfo(data);

           this.gameInfo = {
               ...this.gameInfo,
               myFolds:[],
               myHolds:[],
               myHuas:[],
               myChiResult:[],
               leftFolds:[],
               leftHolds:[],
               leftHuas:[],
               leftChiResult:[],
               rightFolds:[],
               rightHolds:[],
               rightHuas:[],
               rightChiResult:[],
               upFolds:[],
               upHolds:[],
               upHuas:[],
               upChiResult:[],

               zhuangIndex:data.zhuangIndex,
               turn:data.turn,
               op:{},

               roomId:data.roomId,
               myIndex:myIndex,
               gameStatus:data.gameStatus
           };
            for (var i = 0; i < seats.length;i++){
                this.statusNode.getComponent('status').setXieIcon(i,myIndex,seats);
                if (cc.vv.Common.checkIsMySelfIndex(myIndex,i)){
                    this.gameInfo.myIndex = i;
                }else if ( cc.vv.Common.checkIsLeftIndex(myIndex,i,seats)){ //左边的牌
                    this.gameInfo.leftIndex = i;
                }else if (cc.vv.Common.checkIsRightIndex(myIndex,i,seats)){ //右边的牌
                    this.gameInfo.rightIndex = i;
                }else if (cc.vv.Common.checkIsUpIndex(myIndex,i,seats)){ //对面的牌
                    this.gameInfo.upIndex = i;
                } 
            }

            this.statusNode.getComponent('status').setScoreData(data,myIndex);
            this.fengNode.getComponent('feng').setFengDirection(myIndex,data);
            this.fengNode.getComponent('feng').setTurn(data);
            this.setZhuangIconPosition(data.zhuangIndex)
            this.setTables(seats);
            this.showRemainNumberNode();
            this.setRemainNumber(data);

            this.headerNode.getChildByName('remainJushu').getComponent(cc.Label).string = '剩余'+(data.conf.jushu - data.count)+'局';
        })

       
    },

    setZhuangIconPosition(index){
        var gameInfo = this.gameInfo;
        this.hideAllZhuangIcon();
        if (index === gameInfo.myIndex){
            this.zhuangIconNode.children[0].active = true;
        }else if (index === gameInfo.leftIndex){
            this.zhuangIconNode.children[3].active = true;
        }else if (index === gameInfo.rightIndex){
            this.zhuangIconNode.children[1].active = true;
        }else if (index === gameInfo.upIndex){
            this.zhuangIconNode.children[2].active = true;
        }
    },

    onClickReady(){
        cc.vv.net.send(cc.vv.CONST.CLIENT_SET_READY,{userInfo:cc.vv.userInfo});
        this.showUnReadyBtnNode();
    },

    onClickCancleReady(){
        cc.vv.net.send(cc.vv.CONST.CLIENT_CANCEL_READY);
    },

    showResultModal(data){
        var roomInfo = data.roomInfo;
        var seats = roomInfo.seats;
        var i = 0;
        
        var xieBtn = this.huResultModalNode.getChildByName('xiebtn');
        var buxiebtn = this.huResultModalNode.getChildByName('buxiebtn');
        var readyBtn = this.huResultModalNode.getChildByName('readyBtn');

        this.hideNode(xieBtn);
        this.hideNode(buxiebtn);
        this.hideNode(readyBtn);
        for (; i < seats.length;i++){
            var node = this.huResultModalNode.getChildByName('list'+i);
            var seat = seats[i]
            var holds = seat.holds;
            var huas = seat.huas;
            var chis = seat.chis;
            var holdsNode = node.getChildByName('holds');
            var huasNode = node.getChildByName('huas');
            var chiRootResultNode = node.getChildByName('chiresultNode');
            var huShowNode = node.getChildByName('canHu');
            var nameNode = node.getChildByName('name');
            var scoreNode = node.getChildByName('score');
            var xieScore = node.getChildByName('xie');

            if (!this.gameInfo.isKanke && i === this.gameInfo.myIndex){
                if (data.index === i || data.index !== roomInfo.zhuangIndex){
                    this.showNode(readyBtn)
                }else{
                    if (data.index === roomInfo.zhuangIndex){
                        this.showNode(xieBtn);
                        this.showNode(buxiebtn)
                    }
                }
            }
          

            scoreNode.getComponent(cc.Label).string = seat.currentScore > 0?'+'+seat.currentScore:seat.currentScore;

            if (seat.userInfo && seat.userInfo.userName){
                nameNode.getComponent(cc.Label).string = seat.userInfo.userName
            }

            if (seat.xieScore){
                xieScore.getComponent(cc.Label).string = `(卸${seat.xieScore})`;
                xieScore.active = true;
            }else{
                xieScore.active = false;
            }

            this.setCommonHolds(holdsNode,holds,i);
            this.setCommonHuas(huasNode,huas,i,true);
            this.setCommonChiResults(chiRootResultNode,chis,i,true);
            if (i === data.index){
                this.showNode(huShowNode);
            }else{
                this.hideNode(huShowNode);
            }
        }
        for (; i < 4;i++){
            this.huResultModalNode.getChildByName('list'+i).active = false;
        }
        this.showNode(this.huResultModalNode);
    },


    setTables(seats){
        for (var i = 0; i < seats.length;i++){
            var seat = seats[i]
            var holds = seat.holds;
            var folds = seat.folds;
            var huas = seat.huas;
            var chis = seat.chis;
            var holdsNode = this.getHoldsNodeByIndex(i);
            var huasNode = this.getHuasNodeByIndex(i);
            var foldsNode = this.getFoldsNodeByIndex(i);
            var chiRootResultNode = this.getChiResultNodeByIndex(i);

            this.setCommonHolds(holdsNode,holds,i);
            this.setCommonFolds(foldsNode,folds,i);
            this.setCommonHuas(huasNode,huas,i);
            this.setCommonChiResults(chiRootResultNode,chis,i);
        }
    },

    setCommonHuShowAction(index){
        if (index === this.gameInfo.myIndex) this.myHuResultShowNode.active = true;
        if (index === this.gameInfo.leftIndex) this.leftHuResultShowNode.active = true;
        if (index === this.gameInfo.rightIndex) this.rightHuResultShowNode.active = true;
        if (index === this.gameInfo.upIndex) this.upHuResultShowNode.active = true;

    },
   
    getHoldsNodeByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myHoldsNode
        if (index === gameInfo.leftIndex) return this.leftHoldsNode
        if (index === gameInfo.rightIndex) return this.rightHoldsNode
        if (index === gameInfo.upIndex) return this.upHoldsNode
    },

    getFoldsNodeByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myFoldsNode
        if (index === gameInfo.leftIndex) return this.leftFoldsNode
        if (index === gameInfo.rightIndex) return this.rightFoldsNode
        if (index === gameInfo.upIndex) return this.upFoldsNode
    },

    getHuasNodeByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myHuasNode
        if (index === gameInfo.leftIndex) return this.leftHuasNode
        if (index === gameInfo.rightIndex) return this.rightHuasNode
        if (index === gameInfo.upIndex) return this.upHuasNode
    },

    getChiResultNodeByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myChiResultNode
        if (index === gameInfo.leftIndex) return this.leftChiResultNode
        if (index === gameInfo.rightIndex) return this.rightChiResultNode
        if (index === gameInfo.upIndex) return this.upChiResultNode
    },


    getHoldsAltasByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myHoldsAltas
        if (index === gameInfo.leftIndex) return this.LeftAltas
        if (index === gameInfo.rightIndex) return this.rightAltas
        if (index === gameInfo.upIndex) return this.upAltas
    },

    getHoldSpriteFrameByIndex(index,pai){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myHoldsAltas.getSpriteFrame('my-'+pai)
        if (index === gameInfo.leftIndex) return this.LeftAltas.getSpriteFrame('cemian4')
        if (index === gameInfo.rightIndex) return this.rightAltas.getSpriteFrame('cemian2');
        if (index === gameInfo.upIndex) return this.upAltas.getSpriteFrame('cemian1')
    },

    getBottomSpriteFrameByIndex(index,pai){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return this.myBottomAltas.getSpriteFrame('my-bottom-'+pai)
        if (index === gameInfo.leftIndex) return this.LeftAltas.getSpriteFrame('left-bottom-'+pai)
        if (index === gameInfo.rightIndex) return this.rightAltas.getSpriteFrame('right-bottom-'+pai);
        if (index === gameInfo.upIndex) return this.upAltas.getSpriteFrame('up-bottom-'+pai)
    },


    //
    setGameInfoHoldsByIndex(holds,index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) gameInfo.myHolds = holds;
        if (index === gameInfo.leftIndex) gameInfo.leftHolds = holds;
        if (index === gameInfo.rightIndex) gameInfo.rightHolds = holds;
        if (index === gameInfo.upIndex) gameInfo.upHolds = holds;
    },
    getGameInfoHoldsByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return gameInfo.myHolds
        if (index === gameInfo.leftIndex) return gameInfo.leftHolds 
        if (index === gameInfo.rightIndex) return gameInfo.rightHolds 
        if (index === gameInfo.upIndex) return gameInfo.upHolds
    },



    //
    setGameInfoFoldsByIndex(holds,index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) gameInfo.myFolds = holds;
        if (index === gameInfo.leftIndex) gameInfo.leftFolds = holds;
        if (index === gameInfo.rightIndex) gameInfo.rightFolds = holds;
        if (index === gameInfo.upIndex) gameInfo.upFolds = holds;
    },

    getGameInfoFoldsByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return gameInfo.myFolds 
        if (index === gameInfo.leftIndex) return gameInfo.leftFolds 
        if (index === gameInfo.rightIndex) return gameInfo.rightFolds 
        if (index === gameInfo.upIndex) return gameInfo.upFolds 
    },


    setGameInfoHuasByIndex(huas,index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) gameInfo.myHuas = huas;
        if (index === gameInfo.leftIndex) gameInfo.lefHuas = huas;
        if (index === gameInfo.rightIndex) gameInfo.rightHuas = huas;
        if (index === gameInfo.upIndex) gameInfo.upHuas = huas;
    },

    getGameInfoHuasByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return gameInfo.myHuas 
        if (index === gameInfo.leftIndex) return gameInfo.leftHuas 
        if (index === gameInfo.rightIndex) return gameInfo.rightHuas 
        if (index === gameInfo.upIndex) return gameInfo.upHuas 
    },

    setGameInfoChiResultsByIndex(result,index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) gameInfo.myChiResult = result;
        if (index === gameInfo.leftIndex) gameInfo.leftChiResult = result;
        if (index === gameInfo.rightIndex) gameInfo.rightChiResult = result;
        if (index === gameInfo.upIndex) gameInfo.upChiResult = result;
    },

    getGameInfoChiResultsByIndex(index){
        var gameInfo = this.gameInfo;
        if (index === gameInfo.myIndex) return gameInfo.myChiResult 
        if (index === gameInfo.leftIndex) return gameInfo.leftChiResult 
        if (index === gameInfo.rightIndex) return gameInfo.rightChiResult 
        if (index === gameInfo.upIndex) return gameInfo.upChiResult 
    },


    setCommonHolds(holdsNode,holds,index){
       var isKanke = this.gameInfo.isKanke;
        function setPositionPai(i,pai){
            holdsNode.children[i].getComponent('pai').setPaiSpriteFrame(isKanke?-1:pai);
            holdsNode.children[i].pai = pai;
        }
        var start = 1; //hold开始位置
        var len = holds.length; //13
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            start = 0;
            if (index === this.gameInfo.myIndex) this.hideTingPaiNode();
        }else{
            holdsNode.children[0].getComponent('pai').setPaiSpriteFrame(null)
            holdsNode.children[0].pai = null;
        }
   
        for (var i = 0; i < holds.length ;i++){ //14
                var pai = holds[i];
                setPositionPai(start,pai);
                start++;
        }

        for (;start<maxHoldLength;start++){
            holdsNode.children[start].getComponent('pai').setPaiSpriteFrame(null);
            holdsNode.children[start].pai = null;
        }
        this.setGameInfoHoldsByIndex(holds,index)

    },

    setCommonFolds(foldsNode,folds,index){
        var gameInfoFolds = this.getGameInfoFoldsByIndex(index);
        var len = gameInfoFolds.length;
        if (folds.length === len) return;
        else if (folds.length < len){ //被吃了 
            foldsNode.children[len - 1].getComponent('pai').setPaiSpriteFrame(null);
        }
        else{
            for (var i = len;i < folds.length;i++){
                var pai = folds[i];
                foldsNode.children[i].getComponent('pai').setPaiSpriteFrame(pai);
            }
        }
        this.setGameInfoFoldsByIndex(folds,index)
    },
    setCommonHuas(huasNode,huas,index,force = false){
        var gameInfoHuas = this.getGameInfoHuasByIndex(index);
        if (!force && huas.length === gameInfoHuas.length) return;

        var i = 0;
      
        for (; i < huas.length;i++){
            var pai = huas[i];
            huasNode.children[i].getComponent('pai').setPaiSpriteFrame(pai);
        }
        for (; i < 8;i++){
            huasNode.children[i].getComponent('pai').setPaiSpriteFrame(null);
        }
        this.setGameInfoHuasByIndex(huas,index);
    },


    setCommonChiResults(chiRootResultNode,chis,index,force = false){
        var gameInfoChiResult = this.getGameInfoChiResultsByIndex(index);
    
        for (var i = 0;i < chis.length;i++){
            if (!force && gameInfoChiResult[i] && gameInfoChiResult[i].type){ //这里主要为了由碰转杠
                if (chis[i].type === gameInfoChiResult[i].type) continue;
            }
            var type = chis[i].type;
            var pai = chis[i].pai;
            var resultNode = chiRootResultNode.children[i];
            var j = 0;
            if (type === 'chi'){
                var list = chis[i].list;
                for (; j < list.length;j++){
                    resultNode.children[j].getComponent('pai').setPaiSpriteFrame(list[j]);
                }
            }else if (type === 'peng'){
                for (; j < 3;j++){
                    resultNode.children[j].getComponent('pai').setPaiSpriteFrame(pai);
                }
            }

            else if (type === 'gang'){
                for (; j < 4;j++){
                    resultNode.children[j].getComponent('pai').setPaiSpriteFrame(pai);
                }
            }
            for (;j<4;j++){
                resultNode.children[j].getComponent('pai').setPaiSpriteFrame(null);
            }
            resultNode.active = true;

        }


        this.setGameInfoChiResultsByIndex(chis,index);
    },

    setTingPaiResult(tingMap){
        if (tingMap.length === 0){
            this.hideTingPaiNode();
            return;
        }else{
            var paiLists = tingMap.map((t)=>{return t.pai});
            var totalLen = 9;
            var i = 0;
            var tNode = this.myTingPaiNode.getChildByName('tNode');
    
            for (i = 0;i<paiLists.length;i++){
                tNode.children[i].getComponent('pai').setPaiSpriteFrame(paiLists[i]);
            }

            for (;i < totalLen;i++){
                tNode.children[i].getComponent('pai').setPaiSpriteFrame(null);

            }
            this.showTingPaiNode();
        }
    },
     onLoad () {
        this.init();
        setTimeout(() => {
            this.setWxConfig();
        }, 1000);
     },

     playAudioChat(){
         console.log('localAudioList',this.localAudioList)
        if (this.localAudioList.length){
            this.statusNode.getComponent('status').clearAudioTimer();
            var local = this.localAudioList.splice(0,1);
            var localId = local.localId;
            var playerIndex = local.playerIndex;
            var seatIndex = local.seatIndex;
            var roomInfo = local.roomInfo;
            var seats = roomInfo.seats;
            this.isPlayingVoice = true
            if (seatIndex !== ''){
                var myIndex = this.getMyIndexFromRoomInfo(roomInfo);
                this.statusNode.getComponent('status').playAuioAnimation(seatIndex,myIndex,seats)
            }

            wx.playVoice({
                localId, // 需要播放的音频的本地ID，由stopRecord接口获得
            });
        }else{
            this.statusNode.getComponent('status').clearAudioTimer();
            this.isPlayingVoice = false;
        }
     },

     setWxConfig(){
        cc.vv.http.sendRequest('/user/get_wx_config',{url:window.location.href},(data)=>{
            
            var param = data.data;

            var roomInfo = cc.vv.roomInfo;
            var conf = roomInfo.conf;
       
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: 'wx37ae340f5b1d8bdd', // 必填，公众号的唯一标识
                timestamp: param.timestamp, // 必填，生成签名的时间戳
                nonceStr: param.noncestr, // 必填，生成签名的随机串
                signature: param.signature,// 必填，签名
                jsApiList: [
                    'updateAppMessageShareData',
                    'startRecord',
                    'stopRecord',
                    'uploadVoice',
                    'playVoice',
                    'downloadVoice',
                    'onVoicePlayEnd'
                ] // 必填，需要使用的JS接口列表
            });

       
            var type = conf.type;
            var desc = `${cc.vv.CONST.MJ_TYPE[type].title} ${conf.userCount}人 ${conf.jushu}局 速来`;
            var url = `https://www.ccnet.site?roomId=${roomInfo.roomId}`

            wx.ready(() =>{
                wx.updateAppMessageShareData({ 
                    title: '宁海嘛嘛', // 分享标题
                    desc: desc, // 分享描述
                    link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: '', // 分享图标
                    success: function () {
                     
                    }
                  })

            wx.onVoicePlayEnd({
                success: (res) => {
                    this.playAudioChat();
                },
                fail:(err)=>{
                    this.playAudioChat();
                }
            });   

            });

            wx.error(function(error){
               // alert(JSON.stringify(error))
            })
        })
     },


     onDestroy(){
        console.log('ondestroy');
        cc.vv.net.close();
        cc.vv.roomInfo = null;
     },

    start () {
      
    },

    // update (dt) {},
});
