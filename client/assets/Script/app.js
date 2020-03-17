// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { threadId } from "worker_threads";

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

        myHoldsAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
        myBottomAltas:{
            default:null,
            type:cc.SpriteAtlas
        },
        LeftAltas:{ // 左边的手牌
            default:null,
            type:cc.SpriteAtlas
        },
 
        rightAltas:{ //右边的牌
            default:null,
            type:cc.SpriteAtlas
        },

        upAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        actionAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        delayMsLabel:{
            default:null,
            type:cc.Label
        },

        remainNumber:{
            default:null,
            type:cc.Label
        },

        gameInfo:null
    },

    // LIFE-CYCLE CALLBACKS:
  
   
    init(){

   
      if (cc.vv.roomId){
        this.roomIdLabel.string = cc.vv.roomId;
      }else{
          return;
      }
      this.initEveryNode();
      cc.vv.net.connect(()=>{
          this.initHander();
          var param = {userId:cc.vv.userId,roomId:cc.vv.roomId};
            param.userInfo =  cc.vv.userInfo
          cc.vv.net.send('login',param)
      },this.node);
    },

    unInit(){
        cc.vv.roomId = '';
        cc.vv.net.close();
    },

    addTouchEvent(node){
        node.on(cc.Node.EventType.TOUCH_START,()=>{
            console.log(this.gameInfo.canChupai); 
            if (!this.gameInfo.canChupai) return; //是否有出牌的权利
            this.gameInfo.canChupai = false;
            var chupai = node.pai;
            cc.vv.net.send('chupai',{pai:chupai})

        })
    },

   

    showTingPaiNode(){
        this.myTingPaiNode.active = true;
    },


    clearOperationNode(){
      this.node.getChildByName('op').getComponent('operation').init();  
    },

    clearTable(){
          this.clearOperationNode();
          this.hideTingPaiNode();
          this.hideRemainNumber();


          function hidePaiNode(node){
            for(var i = 0; i < node.children.length; ++i){
                 node.children[i].getComponent('pai').hide();
             }  
          }

          function hideChiResultNode(node){
            for(var i = 0; i < node.children.length; ++i){
                this.hideNode(node.children[i]);
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

    initUiData(){
 

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


        this.myTingPaiNode = this.node.getChildByName('tingpai');
        this.myTingPaiListNode = this.myTingPaiNode.getChildByName('tNode');

        
        this.remainNumberNode = this.node.getChildByName('remainNumber');

        this.clearTable();
      
    },

    setRemainNumber(data){
        this.remainNumber.string = data.mjLists.length;
    },

    showRemainNumberNode(){
        this.remainNumberNode.active = true;
    },

    hideRemainNumber(){
        this.remainNumberNode.active = false;
    },



    initHander(){

       /*
       *                 'update_table','update_pepole_status','new_user_login_notify','op_notify','op_action_notify',
                'chupai_action_notify','tingpai_notigy' delay_ms
       */ 

       this.node.on('delay_ms',(data)=>{
           this.delayMsLabel.string = data;
       })

       this.node.on('chupai_notify',()=>{
           this.gameInfo.canChupai = true
       })

       //显示tingpai 的节点
       this.node.on('tingpai_notigy',(data)=>{
            this.setTingPaiResult(data);
       })

       //值给个声音，或者显示文案
       this.node.on('op_action_notify',(data)=>{
            if (data.type === 'hu'){
            //    this.clearTable();
            console.log('type is hu',data.index);
            var seats = data.roomInfo.seats;
            this.setCommonHuShowAction(data.index);
            for (var i = 0; i < seats.length;i++){
                var holdsNode = this.getHoldsNodeByIndex(i);
                this.setCommonHolds(holdsNode,seats[i].holds,i,true);
                this.setCommonFolds(seats[i].folds,i);
            }

            setTimeout(() => {
                this.setResultModalShow(data.roomInfo);
            }, 3*1000);
            }
       })

       // 只给个声音
       this.node.on('chupai_action_notify',(data)=>{

       })

       // 未开始的时候，更新各个用户的状态
       this.node.on('update_pepole_status',(data)=>{
  
            if (data.gameStart && data.process !== 'end') return;
            var userId = cc.vv.userId;
            var seats = data.seats;
            var players = data.players;

            var seatUserIds = seats.map((s)=>{return s.userId});
            var playerUserIds = players.map((s)=>{return s.userId});
            var myIndex = -1;
            if (playerUserIds.indexOf(userId) !== -1){
                myIndex = seats.length;
                this.showNode(this.readyBtn);
                this.hideNode(this.unReadyBtn);
            }else if (seatUserIds.indexOf(userId) !== -1){
                myIndex = seatUserIds.indexOf(userId)
                this.showNode(this.unReadyBtn);
                this.hideNode(this.readyBtn);
            }

            

       })

       // 只给个提示
       this.node.on('new_user_login_notify',(data)=>{
       // this.setTipConetnt(data)
       })

       //更新手牌，出牌，花牌，持牌等
       this.node.on('update_table',(data)=>{
         // 更新table
         var seats = data.seats;
         this.setTimeShowAccordingTurn(data.turn);
        this.setTables(seats);
        this.setRemainNumber(data)
       })

       this.node.on('clear_op_notify',(data)=>{
            this.gameInfo.op = {};
       })
       // 操作通知
       this.node.on('op_notify',(data)=>{
        var op = data.op;
        this.myOpNode1.active = true;
        var index = 2;

        var keys = [
            {
                action:'canChi',
                type:'chi'
            },{action:'canPeng',type:'peng'},{action:'canGang',type:'gang'},{action:"canHu",type:'hu'}];

        keys.forEach((k)=>{
            if (op[k.action]){
                this['myOpNode'+ index].active = true;   
                this['myOpNode'+ index].opType = k.type
                this['myOpNode'+ index].getComponent(cc.Sprite).spriteFrame = this.actionAltas.getSpriteFrame(k.action);
                index++;
            }
        })
        this.gameInfo.op = op;

       })
            
       // 游戏开始
        this.node.on('game_start',(data) => {
            this.readyBtn.active = false;
            this.unReadyBtn.active = false;
            this.hideAllReadySign();

            var userId = cc.vv.userId;
            var seats = data.seats;
         
            if (data.count !== 1){
                this.clearTable();
            }
            var userIds = seats.map((s)=>{return s.userId});
            var myIndex = userIds.indexOf(userId) ; //我的位置

           this.gameInfo = {
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
               uphuas:[],
               upChiResult:[],

               zhuangIndex:data.zhuangIndex,
               turn:data.turn,
               op:{},

               roomId:data.roomId
           };
           cc.vv.roomId = data.roomId;
            for (var i = 0; i < seats.length;i++){
                if (this.checkIsMySelfIndex(myIndex,i)){
                    this.gameInfo.myIndex = i;
                }else if ( this.checkIsLeftIndex(myIndex,i,seats)){ //左边的牌
                    this.gameInfo.leftIndex = i;
                }else if (this.checkIsRightIndex(myIndex,i,seats)){ //右边的牌
                    this.gameInfo.rightIndex = i;
                }else if (this.checkIsUpIndex(myIndex,i,seats)){ //对面的牌
                    this.gameInfo.upIndex = i;
                } 
            }

            this.setTables(seats);
            this.showRemainNumberNode();
            this.setRemainNumber(data);
        })

       
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
            var chiRootResultNode = this.getChiResultNodeByIndex(i);

            this.setCommonHolds(holdsNode,holds,i);
            this.setCommonFolds(folds,i);
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


    setCommonHolds(holdsNode,holds,index,isHu = false){
        var self = this;
        function setPositionPai(i,pai){
            holdsNode.children[i].getComponent(cc.Sprite).spriteFrame = isHu?self.getBottomSpriteFrameByIndex(index,pai) : self.getHoldSpriteFrameByIndex(index,pai)
            holdsNode.children[i].pai = pai;
        }
        var start = 1; //hold开始位置
        var len = holds.length; //13
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            start = 0;
            if (index === this.gameInfo.myIndex) this.hideTingPaiNode();
        }else{
            holdsNode.children[0].getComponent(cc.Sprite).spriteFrame = null;
            holdsNode.children[0].pai = null;
        }
   
        for (var i = 0; i < holds.length ;i++){ //14
                var pai = holds[i];
                setPositionPai(start,pai);
                start++;
        }

        for (;start<maxHoldLength;start++){
            holdsNode.children[start].getComponent(cc.Sprite).spriteFrame = null;
            holdsNode.children[start].pai = null;
        }
        this.setGameInfoHoldsByIndex(holds,index)

    },

    setCommonFolds(folds,index){
        var gameInfoFolds = this.getGameInfoFoldsByIndex(index);
        var foldsNode = this.getFoldsNodeByIndex(index);
        var len = gameInfoFolds.length;
         console.log(this.gameInfo,gameInfoFolds,folds);
        if (folds.length === len) return;
        else if (folds.length < len){ //被吃了 
            console.log('被吃了',folds,len)
            foldsNode.children[len - 1].getComponent(cc.Sprite).spriteFrame = null;
        }
        else{
            for (var i = len;i < folds.length;i++){
                var pai = folds[i];
                foldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,pai)
            }
        }
        this.setGameInfoFoldsByIndex(folds,index)
    },
    setCommonHuas(huasNode,huas,index,forceAdd = false){
        if (!forceAdd){
            var gameInfoHuas = this.getGameInfoHuasByIndex(index);
            if (huas.length === gameInfoHuas.length) return;
        }
      
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            huasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,pai)
        }
        this.setGameInfoHuasByIndex(huas,index);
    },


    setCommonChiResults(chiRootResultNode,chis,index,forceAdd = false){

        var base = 0;
        if (!forceAdd){
            var gameInfoChiResult = this.getGameInfoChiResultsByIndex(index);
            if (gameInfoChiResult.length === chis.length) return;
             base = chis.length - gameInfoChiResult.length - 1;
        }

        for (var i = base;i < chis.length;i++){

            var type = chis[i].type;
            var pai = chis[i].pai;
            var resultNode = chiRootResultNode.children[i];

            if (type === 'chi'){
                var list = chis[i].list;
                for (var j = 0; j < list.length;j++){
                    resultNode.children[j].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,list[j])
                }
            }else if (type === 'peng'){
                for (var j = 0; j < 3;j++){
                    resultNode.children[j].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,pai)
                }
            }

            else if (type === 'gang'){
                for (var j = 0; j < 4;j++){
                    resultNode.children[j].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,pai)
                }
            }

        }

        this.setGameInfoChiResultsByIndex(chis,index);
    },

    setTingPaiResult(tingMap){
        if (tingMap.length === 0){
            console.log('tingmap hide',tingMap)
            this.hideTingPaiNode();
            return;
        }else{
            var paiLists = tingMap.map((t)=>{return t.pai});
            var totalLen = this.myTingPaiListNode.children.length;
            var i = 0;
            console.log(paiLists);
            for (i = 0;i<paiLists.length;i++){
                this.myTingPaiListNode.children[i].children[0].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(this.gameInfo.myIndex,paiLists[i]);
            }

            for (;i < totalLen;i++){
                this.myTingPaiListNode.children[i].children[0].getComponent(cc.Sprite).spriteFrame = null;

            }
            this.showTingPaiNode();
        }
    },
     onLoad () {
       
        this.init();
     },

     onDestroy(){
        // this.unInit();
     },

    start () {
      
    },

    // update (dt) {},
});
