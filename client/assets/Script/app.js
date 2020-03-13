// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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

        gameInfo:null
    },

    // LIFE-CYCLE CALLBACKS:
  

    init(){
        console.log(cc.vv);

        this.initUiData();
     

      if (cc.vv.roomId){
        this.roomIdLabel.string = cc.vv.roomId;
      }else{
          return;
      }
      cc.vv.net.connect(()=>{
          this.initHander();
          cc.vv.net.send('login',{userId:cc.vv.userId,roomId:cc.vv.roomId})
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
            cc.vv.net.send('chupai',{userId:cc.vv.userId,pai:chupai,roomId:this.gameInfo.roomId});

            // this.calcHoldsAndFolds(this.gameInfo.myHolds,this.gameInfo.myFolds,chupai);

            // this.gameInfo.myHolds.sort((a,b)=>{
            //     return a - b;
            // })
            // this.setMyUiHolds(this.gameInfo.myHolds);
            // this.setMyFolds(chupai);

        })
    },

    calcHoldsAndFolds(holds,folds,pai){
        var index = holds.indexOf(pai);
        holds.splice(index,1);
        folds.push(pai);
    },

    showTingPaiNode(){
        this.myTingPaiNode.active = true;
    },

    hideTingPaiNode(){
        this.myTingPaiNode.active = false;
    },

    clearTable(){
          //吃的选择
      
  
          this.hideOpNode();
          this.hideChiList();

          this.hideTingPaiNode();

          this.myHuResultShow.active = false;
          this.leftHuResultShow.active = false;
          this.rightHuResultShow.active = false;
          this.upHuResultShow.active = false;
  
          //吃的结果
          
          var myHoldsNode = this.myHoldsNode;
          var myHuasNode = this.myHuasNode;
          var myFoldsNode = this.myFoldsNode;
          var myChiResultNode = this.myChiResultNode;
          for(var i = 0; i < myHoldsNode.children.length; ++i){
              var sprite = myHoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
              this.addTouchEvent(myHoldsNode.children[i]);
          }
          for(var i = 0; i < myHuasNode.children.length; ++i){
              var sprite = myHuasNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < myFoldsNode.children.length; ++i){
              var sprite = myFoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
  
          for(var i = 0; i < myChiResultNode.children.length; ++i){
              var subChiItem = myChiResultNode.children[i];
              for (var k = 0; k < subChiItem.children.length;k++){
                  var sprite = subChiItem.children[k].getComponent(cc.Sprite);
                  sprite.spriteFrame = null;
              }
             
          }
  
         
  
         // 初始化左边的牌
          var leftHoldsNode = this.leftHoldsNode;
          var leftFoldsNode = this.leftFoldsNode;
          var leftHuasNode = this.leftHuasNode;
          var leftChiResultNode = this.leftChiResultNode;
          for(var i = 0; i < leftHoldsNode.children.length; ++i){
              var sprite = leftHoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < leftHuasNode.children.length; ++i){
              var sprite = leftHuasNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
  
          for(var i = 0; i < leftFoldsNode.children.length; ++i){
              var sprite = leftFoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
  
          for(var i = 0; i < leftChiResultNode.children.length; ++i){
              var subChiItem = leftChiResultNode.children[i];
              for (var k = 0; k < subChiItem.children.length;k++){
                  var sprite = subChiItem.children[k].getComponent(cc.Sprite);
                  sprite.spriteFrame = null;
              }
          }
  
          //初始化右边的牌
          var rightHoldsNode = this.rightHoldsNode;
          var rightFoldsNode = this.rightFoldsNode;
          var rightHuasNode = this.rightHuasNode;
          var rightChiResultNode = this.rightChiResultNode;
          for(var i = 0; i < rightHoldsNode.children.length; ++i){
              var sprite = rightHoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < rightHuasNode.children.length; ++i){
              var sprite = rightHuasNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < rightFoldsNode.children.length; ++i){
              var sprite = rightFoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < rightChiResultNode.children.length; ++i){
              var subChiItem = rightChiResultNode.children[i];
              for (var k = 0; k < subChiItem.children.length;k++){
                  var sprite = subChiItem.children[k].getComponent(cc.Sprite);
                  sprite.spriteFrame = null;
              }
          }
  
  
          //初始化上方的牌
          var upHoldsNode = this.upHoldsNode;
          var upFoldsNode = this.upFoldsNode;
          var upHuasNode = this.upHuasNode;
          var upChiResultNode = this.upChiResultNode;
          for(var i = 0; i < upHoldsNode.children.length; ++i){
              var sprite = upHoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < upHuasNode.children.length; ++i){
              var sprite = upHuasNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < upFoldsNode.children.length; ++i){
              var sprite = upFoldsNode.children[i].getComponent(cc.Sprite);
              sprite.spriteFrame = null;
          }
          for(var i = 0; i < upChiResultNode.children.length; ++i){
              var subChiItem = upChiResultNode.children[i];
              for (var k = 0; k < subChiItem.children.length;k++){
                  var sprite = subChiItem.children[k].getComponent(cc.Sprite);
                  sprite.spriteFrame = null;
              }
          }

    },

    initUiData(){

        //初始化时间周圆
        var timeNode = this.node.getChildByName('time');
        this.timeBackNode = timeNode.getChildByName('timeBack');
        this.hideCircle();

        //初始化tip提示
        this.roomTipNode = this.node.getChildByName('tip');

        //初始化操作节点
        var myOpNode = this.node.getChildByName('op');

        this.myOpNode1 = myOpNode.getChildByName('op1');
        this.myOpNode1.opType = 'guo'
        this.initOpNodeHandler(this.myOpNode1)
        this.myOpNode2 = myOpNode.getChildByName('op2');
        this.initOpNodeHandler(this.myOpNode2)
        this.myOpNode3 = myOpNode.getChildByName('op3');
        this.initOpNodeHandler(this.myOpNode3)
        this.myOpNode4 = myOpNode.getChildByName('op4');
        this.initOpNodeHandler(this.myOpNode4)
        this.myOpNode5 = myOpNode.getChildByName('op5');
        this.initOpNodeHandler(this.myOpNode5);

        //保存我的节点
          //初始化自己的牌
        var myNode = this.node.getChildByName('my');
        this.myHoldsNode = myNode.getChildByName('holds');
        this.myHuasNode = myNode.getChildByName('huas');
        this.myFoldsNode = myNode.getChildByName('folds');
        this.myChiNode = myOpNode.getChildByName('chi');
        this.myChiListParentNode = myOpNode.getChildByName('chilist');
        this.myChiList1Node = this.myChiListParentNode.getChildByName('list1');
        this.myChiList2Node = this.myChiListParentNode.getChildByName('list2');
        this.myChiList3Node = this.myChiListParentNode.getChildByName('list3');
        this.myChiResultNode = myNode.getChildByName('chiresult');


        //保存左边的
        var leftNode = this.node.getChildByName('left');
        this.leftChiResultNode = leftNode.getChildByName('chiresult');
        // console.log(LeftNode.children)
        this.leftHoldsNode = leftNode.getChildByName('holds');
        this.leftHuasNode = leftNode.getChildByName('huas');
        this.leftFoldsNode = leftNode.getChildByName('folds');


        //保存右边的
        var rightNode = this.node.getChildByName('right');
        this.rightChiResultNode = rightNode.getChildByName('chiresult');

        this.rightHoldsNode = rightNode.getChildByName('holds');
        this.rightHuasNode = rightNode.getChildByName('huas');
        this.rightFoldsNode = rightNode.getChildByName('folds');


        //保存上面的
        var upNode = this.node.getChildByName('up');
        this.upChiResultNode = upNode.getChildByName('chiresult');

        this.upHoldsNode = upNode.getChildByName('holds');
        this.upHuasNode = upNode.getChildByName('huas');
        this.upFoldsNode = upNode.getChildByName('folds');

        this.myHuResultShow = this.node.getChildByName('myHuResultShow');
        this.leftHuResultShow = this.node.getChildByName('leftHuResultShow');
        this.rightHuResultShow = this.node.getChildByName('rightHuResultShow');
        this.upHuResultShow = this.node.getChildByName('upHuResultShow');

        this.myTingPaiNode = this.node.getChildByName('tingpai');
        this.myTingPaiListNode = this.myTingPaiNode.getChildByName('tNode');

        this.clearTable();
      
    },

    setTipConetnt(content){
        this.roomTipNode.getComponent(cc.Label).string = content;
    },

    initOpNodeHandler(node){
        node.on(cc.Node.EventType.TOUCH_START,()=>{
            console.log(this.gameInfo.op,node)
            var op = this.gameInfo.op;
            if (!node.opType){
                console.log('error')
                return;
            }

            if (node.opType === 'guo'){
                cc.vv.net.send('guo',{roomId:this.gameInfo.roomId,userId:cc.vv.userId,fromTurn:op.fromTurn})
            }

            if (node.opType === 'chi'){
                if (!op.canChi) return;
                var pai = op.pai;
                if (op.chiList.length > 1){
                    for (var key in op.chiList){
                        this.setOneChiList(key,op.chiList[key],pai);
                    }
                }else{
                    cc.vv.net.send('chi',{roomId:this.gameInfo.roomId,userId:cc.vv.userId,chiIndex:0})
                }

                return;
            }

            if (!op.canHu && !op.canChi && !op.canPeng && !op.canGang) return;
            cc.vv.net.send(node.opType,{roomId:this.gameInfo.roomId,userId:cc.vv.userId,fromTurn:op.fromTurn})

            this.hideOpNode();

        })
    },

    hideOpNode(){
        this.myOpNode1.active = null;
        this.myOpNode2.active = null;
        this.myOpNode3.active = null;
        this.myOpNode4.active = null;
        this.myOpNode5.active = null;
    },

    hideChiList(){ // 操作的吃
        this.myChiListParentNode.active = null;
        this.myChiList1Node.active = null;
        this.myChiList2Node.active = null;
        this.myChiList3Node.active = null;
    },

    setOneChiList(index,list,pai){
        var key = '';
        if (index == 0) key = 'myChiList1Node';
        if (index == 1) key = 'myChiList2Node';
        if (index == 2) key = 'myChiList3Node';


        var node = this[key];
        console.log(node,key)

        for (var i = 0; i < node.children.length;i++){
            node.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame('my-bottom-'+list[i]);
            if (list[i] === pai){
                node.children[i].y +=10;
            }
            
        }

        node.active = true;
        this.myChiListParentNode.active = true;

    },

    hideCircle(){
        for (var i = 0;i < this.timeBackNode.children.length;i++){
            this.timeBackNode.children[i].active = false;
        }
    },

    showOneCircle(turnIndex){
        var index = 0;
        if (turnIndex === this.gameInfo.leftIndex){
            index = 3;
        }else if (turnIndex === this.gameInfo.rightIndex){
            index = 1;
        }else if (turnIndex === this.gameInfo.upIndex){
            index = 2;
        }else if (turnIndex === this.gameInfo.myIndex){
            index = 0;
        }

        this.timeBackNode.children[index].active = true;
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

            this.setCommonHuShowAction(data.index)
            }
       })

       // 只给个声音
       this.node.on('chupai_action_notify',(data)=>{

       })

       // 未开始的时候，更新各个用户的状态
       this.node.on('update_pepole_status',(data)=>{

       })

       // 只给个提示
       this.node.on('new_user_login_notify',(data)=>{
       // this.setTipConetnt(data)
       })

       //更新手牌，出牌，花牌，持牌等
       this.node.on('update_table',(data)=>{
         // 更新table
         var seats = data.seats;
         this.setTimeCircle(data.turn);
        this.setTables(seats);
       })

       this.node.on('clear_op_notify',(data)=>{
            this.gameInfo.op = {};
            this.hideOpNode();
            this.hideChiList();
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
                if (i  === myIndex){
                    this.gameInfo.myIndex = i;
                }else if ( i < myIndex && Math.abs(i-myIndex) === 1){ //左边的牌
                    this.gameInfo.leftIndex = i;
                }else if (i > myIndex && Math.abs(i-myIndex) === 1){ //右边的牌
                    this.gameInfo.rightIndex = i;
                }else if (i > myIndex && Math.abs(i-myIndex) === 2){ //对面的牌
                    this.gameInfo.upIndex = i;
                } 
            }

            this.setTables(seats);

            this.setTimeCircle(data.trun);
            this.setFengData(data.turn);
        })

       
    },

    setFengData(turn){
        //设置东南西北

    },

    setTables(seats){
        for (var i = 0; i < seats.length;i++){
            var seat = seats[i]
            var holds = seat.holds;
            var folds = seat.folds;
            var huas = seat.huas;
            var chis = seat.chis;
            this.setCommonHolds(holds,i);
            this.setCommonFolds(folds,i);
            this.setCommonHuas(huas,i);
            this.setCommonChiResults(chis,i);
        }
    },

    setCommonHuShowAction(index){
        if (index === this.gameInfo.myIndex) this.myHuResultShow.active = true;
        if (index === this.gameInfo.leftIndex) this.leftHuResultShow.active = true;
        if (index === this.gameInfo.rightIndex) this.rightHuResultShow.active = true;
        if (index === this.gameInfo.upIndex) this.upHuResultShow.active = true;

    },
   

    onHuClick(){

    },

    onPengClick(){

    },

    onGangClick(){

    },


    onClickChiItem(btn,param){
        console.log('clickchiitem',param);
        this.hideChiList();
        this.hideOpNode();
        if (!this.gameInfo.op.canChi) return
        var index = parseInt(param);
        cc.vv.net.send('chi',{userId:cc.vv.userId,roomId:this.gameInfo.roomId,chiIndex:index})
    },

    setTimeCircle(turn){
        var turnIndex = this.gameInfo.turn;
        if (turnIndex === turn) return;
        this.hideCircle();
        this.showOneCircle(turnIndex)
        this.gameInfo.turnIndex = turn;

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


    setCommonHolds(holds,index,isHu = false){
        var holdsNode = this.getHoldsNodeByIndex(index);
        var self = this;
        function setPositionPai(i,pai){
            holdsNode.children[i].getComponent(cc.Sprite).spriteFrame = isHu?self.getBottomSpriteFrameByIndex(index,pai) : self.getHoldSpriteFrameByIndex(index,pai)
            holdsNode.children[i].pai = pai;
        }
        var start = 1; //hold开始位置
        var len = holds.length; //13
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            start = 0;
            this.hideTingPaiNode();
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
        // console.log(this.gameInfo,gameInfoFolds,folds);
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
        this.setGameInfoFoldsByIndex(index)
    },
    setCommonHuas(huas,index){
        var gameInfoHuas = this.getGameInfoHuasByIndex(index);
        var huasNode = this.getHuasNodeByIndex(index);
        if (huas.length === gameInfoHuas.length) return;
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            huasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(index,pai)
        }
        this.setGameInfoHuasByIndex(index);
    },


    setCommonChiResults(chis,index){

        var gameInfoChiResult = this.getGameInfoChiResultsByIndex(index);
        if (gameInfoChiResult.length === chis.length) return;

        var chiRootResultNode = this.getChiResultNodeByIndex(index);
        var base = chis.length - gameInfoChiResult.length - 1;

        console.log('chis',gameInfoChiResult,chiRootResultNode)

        for (var i = base;i < chis.length;i++){

            var type = chis[i].type;
            var pai = chis[i].pai;
            var resultNode = chiRootResultNode.children[i];
            console.log(base,i,chis,resultNode)
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
            this.hideTingPaiNode();
            return;
        }else{
            var paiLists = tingMap.map((t)=>{return t.pai});
            var totalLen = this.myTingPaiListNode.children.length;
            var i = 0;
            console.log(paiLists);
            for (i = 0;i<paiLists.length;i++){
                console.log(this.getBottomSpriteFrameByIndex(this.gameInfo.myIndex,paiLists[i]),paiLists[i])
                this.myTingPaiListNode.children[i].children[0].getComponent(cc.Sprite).spriteFrame = this.getBottomSpriteFrameByIndex(this.gameInfo.myIndex,paiLists[i]);
            }

            for (;i < totalLen;i++){
                this.myTingPaiListNode.children[i].children[0].getComponent(cc.Sprite).spriteFrame = null;

            }
            this.showTingPaiNode();
        }
    },
   
    onClickReady(){
       cc.vv.net.send('set_ready',{userId:cc.vv.userId,roomId:cc.vv.roomId});
      this.readyBtn.active = false;
      this.unReadyBtn.active = true;
    },

    onClickCancelReady(){
         cc.vv.net.send('cancel_ready',{userId:cc.vv.userId,roomId:cc.vv.roomId});
        this.readyBtn.active = true;
        this.unReadyBtn.active = false;
    },

     onLoad () {
        this.init();
     },

     onDestroy(){
         this.unInit();
     },

    start () {

    },

    // update (dt) {},
});
