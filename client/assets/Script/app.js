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

    addTouchEvent(node){
        node.on(cc.Node.EventType.TOUCH_START,()=>{
            console.log(this.gameInfo.hasChupai); 
            if (!this.gameInfo.hasChupai) return; //是否有出牌的权利
            this.gameInfo.hasChupai = false;
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

    initUiData(){

        //初始化时间周圆
        var timeNode = this.node.getChildByName('time');
        this.timeBackNode = timeNode.getChildByName('timeBack');
        this.hideCircle();

        //初始化tip提示
        this.roomTipNode = this.node.getChildByName('tip');

        //初始化自己的牌
        var myNode = this.node.getChildByName('my');
        var myHoldsNode  = this.myHoldsNode = myNode.getChildByName('holds');
        var myHuasNode = this.myHuasNode = myNode.getChildByName('huas');
        var myFoldsNode = this.myFoldsNode = myNode.getChildByName('folds');
        var myOpNode = this.node.getChildByName('op');

        this.myHuNode = myOpNode.getChildByName('hu');
        this.myGangNode = myOpNode.getChildByName('gang');
        this.myPengNode = myOpNode.getChildByName('peng');
        this.myGuoNode = myOpNode.getChildByName('guo');

        //吃的选择
        this.myChiNode = myOpNode.getChildByName('chi');
        this.myChiListParentNode = myOpNode.getChildByName('chilist');
        this.myChiList1Node = this.myChiListParentNode.getChildByName('list1');
        this.myChiList2Node = this.myChiListParentNode.getChildByName('list2');

        this.myChiList3Node = this.myChiListParentNode.getChildByName('list3');

        this.hideOpNode();
        this.hideChiList();

        //吃的结果
        this.myChiResultNode = myNode.getChildByName('chiresult');

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

       

       // 初始化左边的牌
        var leftNode = this.node.getChildByName('left');

        // console.log(LeftNode.children)
        var leftHoldsNode  = this.leftHoldsNode = leftNode.getChildByName('holds');
        var leftHuasNode = this.leftHuasNode = leftNode.getChildByName('huas');
        var leftFoldsNode = this.leftFoldsNode = leftNode.getChildByName('folds');
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

        //初始化右边的牌
        var rightNode = this.node.getChildByName('right');
        var rightHoldsNode  = this.rightHoldsNode = rightNode.getChildByName('holds');
        var rightHuasNode = this.rightHuasNode = rightNode.getChildByName('huas');
        var rightFoldsNode = this.rightFoldsNode = rightNode.getChildByName('folds');
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

        //初始化上方的牌
        var upNode = this.node.getChildByName('up');
        var upHoldsNode  = this.upHoldsNode = upNode.getChildByName('holds');
        var upHuasNode = this.upHuasNode = upNode.getChildByName('huas');
        var upFoldsNode = this.upFoldsNode = upNode.getChildByName('folds');
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
    },

    setTipConetnt(content){
        this.roomTipNode.getComponent(cc.Label).string = content;
    },

    hideOpNode(){
        this.myChiNode.active = null;
        this.myGangNode.active = null;
        this.myGuoNode.active = null;
        this.myPengNode.active = null;
        this.myHuNode.active = null;
    },

    hideChiList(){
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
                'chupai_action_notify','tingpai_notigy
       */ 

       this.node.on('chupai_notify',()=>{
           this.gameInfo.hasChupai = true
       })

       this.node.on('tingpai_notigy',(data)=>{

       })

       this.node.on('op_action_notify',(data)=>{

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
         console.log(this.gameInfo)

         for (var i = 0; i < seats.length;i++){
             var seat = seats[i];
             if (i === this.gameInfo.leftIndex){
                 this.setLeftTable(seat);
             }else if (i === this.gameInfo.rightIndex){
                 this.setRightTable(seat);
             }else if (i === this.gameInfo.upIndex){
                 this.setMyTable(seat)
             }else if (i === this.gameInfo.myIndex){
                 this.setMyTable(seat);
             }
         }
       })

       // 操作通知
       this.node.on('op_notify',(data)=>{
        var op = data.op;
        if (op.canHu){
            this.myHuNode.active = true;
        }

        if (op.canGang){
            this.myGangNode.active = true;
        }
        if (op.canPeng){
            this.myPengNode.active = true;
        }

        if (op.canChi){
            this.myChiNode.active = true;
        }

        this.gameInfo.op = op;

       })
            
       // 游戏开始
        this.node.on('game_start',(data) => {
            this.readyBtn.active = false;
            this.unReadyBtn.active = false;

            var userId = cc.vv.userId;
            var seats = data.seats;
         

            var userIds = seats.map((s)=>{return s.userId});
            var myIndex = userIds.indexOf(userId) ; //我的位置

           this.gameInfo = {
               myFolds:[],
               myHolds:[],
               leftFolds:[],
               leftHolds:[],
               rightFolds:[],
               rightHolds:[],
               upFolds:[],
               upHolds:[],



               roomId:data.roomId
           };
           cc.vv.roomId = data.roomId;
            this.gameInfo.zhuangIndex = 0;
            this.gameInfo.turn = data.turn;

            for (var i = 0; i < seats.length;i++){
                if (i  === myIndex){
                    this.gameInfo.myIndex = i;
                    this.setMyTable(seats[i])
                }else if ( i < myIndex && Math.abs(i-myIndex) === 1){ //左边的牌
                    this.gameInfo.leftIndex = i;
                    this.setLeftTable(seats[i])
                }else if (i > myIndex && Math.abs(i-myIndex) === 1){ //右边的牌
                    this.gameInfo.rightIndex = i;
                    this.setRightTable(seats[i])
                }else if (i > myIndex && Math.abs(i-myIndex) === 2){ //对面的牌
                    this.gameInfo.upIndex = i;
                 
                    console.log('对面的牌')
                    // this.setLeftHolds(holds);
                    // this.setLeftHua(huas)
                } 
            }

            this.setTimeCircle();
        })

       
    },

    setLeftTable(seat){
        var holds = seat.holds;
        var folds = seat.folds;
        var huas = seat.huas;
        this.setLeftHolds(holds);
        this.setLeftFolds(folds)
        this.setLeftHuas(huas);
    },

    setRightTable(seat){
        var holds = seat.holds;
        var folds = seat.folds;
        var huas = seat.huas;
        this.setRightHolds(holds);
        this.setRightFolds(folds);
        this.setRightHuas(huas); 
    },

    setMyTable(seat){
        var holds = seat.holds;
        var folds = seat.folds;
        var huas = seat.huas;

        this.setMyHolds(holds);
        this.setMyFolds(folds);
        this.setMyHuas(huas);
    },

    onHuClick(){

    },

    onPengClick(){

    },

    onGangClick(){

    },


    onChiClick(){
        var list = this.gameInfo.op.chiList;
        var pai = this.gameInfo.op.pai;
        this.hideChiList();
        this.hideOpNode();
        if (list.length === 1){
            cc.vv.net.send('chi',{roomId:this.gameInfo.roomId,userId:cc.vv.userId,chiIndex:0})
        }else{
            for (var key in list){
                this.setOneChiList(key,list[key],pai);
            }
        }
     
    },

    onClickChiItem(btn,param){
        console.log('clickchiitem',param);
        this.hideChiList();
        var index = parseInt(param);
        cc.vv.net.send('chi',{userId:cc.vv.userId,roomId:this.gameInfo.roomId,chiIndex:index})
    },

    setTimeCircle(){
        var turnIndex = this.gameInfo.turn;
        this.hideCircle();
        this.showOneCircle(turnIndex)

    },


    
    setMyHolds(holds){
        var len = holds.length; //13
        var isChupai = false;
        var endLen = len;
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            isChupai = true;
            endLen -=1;
        }
        for (var i = 0; i < maxHoldLength;i++){ //14
            if (i < endLen){
                var pai = holds[i];
                var spriteFrame = 'my-'+pai;
                this.myHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myHoldsAltas.getSpriteFrame(spriteFrame)
                this.myHoldsNode.children[i].pai = pai;
            }else{
                this.myHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = null;
                this.myHoldsNode.children[i].pai = null;
            }
        }

        if (isChupai){
            this.myHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame =  this.myHoldsAltas.getSpriteFrame('my-' + holds[len -1])
            this.myHoldsNode.children[maxHoldLength - 1].pai = holds[len -1]
        }

        this.gameInfo.myHolds = holds;
    },

    // 只会增加，不会缩减，可以用追加的方式来布局
    setMyFolds(folds){
        var len = this.gameInfo.myFolds.length;
 
        if (folds.length === len) return;
        else{
            for (var i = len;i < folds.length;i++){
                var pai = folds[i];
                this.myFoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame('my-bottom-'+pai) 
            }
        }

        this.gameInfo.folds = folds;
    },

    setMyHuas(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'my-bottom-'+pai;
            this.myHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame(spriteFrame)
        }
    },

    //吃碰杠的牌全部放chis数组里
    setMyChis(chis){
        // if (chis.length === this.gameInfo.myChis.length) return;
        var chiList = chis.filter((c)=>{
            return c.type === 'chi'
        })

        var pengList = chis.filter((c)=>{
            return c.type === 'peng'
        })

        var gangList = chis.filter((c)=>{
            return c.type === 'gang'
        })

        /*
        [
            {
                pai,
                list
            },
             {
                pai,
                list
            }
        ]
        */ 
        let baseWidth = 0;
        const oneWidth = 40;

        for (var index in chiList){
            var item = chiList[index];
            var node = new cc.Node();
            node.x = (oneWidth * 4) *index;
            console.log(node.x)

            node.y = 0;
            var list = item.list
            for (var key in list){
                var pai = list[key];
                var subNode = this.createSpriteNode(this.myBottomAltas.getSpriteFrame('my-bottom-'+pai))
                subNode.x = oneWidth*key;
                subNode.y = 0
                node.addChild(subNode)
            }
    
            this.myChiResultNode.addChild(node);
        }

        baseWidth = oneWidth*3*chiList.length + oneWidth*chiList.length ;

        for (var index in pengList){
            var item = pengList[index];
            var node = new cc.Node();
            node.x = (oneWidth * 4) *index +baseWidth;
            var pai = item.pai
            console.log(node.x)

            node.y = 0;
            for (var key = 0;key < 3;key++){
                var subNode = this.createSpriteNode(this.myBottomAltas.getSpriteFrame('my-bottom-'+pai))
                subNode.x = oneWidth*key;
                subNode.y = 0
                node.addChild(subNode)
            }
    
            this.myChiResultNode.addChild(node);
        }
    },

    //创建一个精灵节点
    createSpriteNode(spriteName){
        var node = new cc.Node();
        const sprite=node.addComponent(cc.Sprite)
        //给sprite的spriteFrame属性 赋值
        sprite.spriteFrame=spriteName;
        return node;
    },

    setLeftHolds(holds){
        var len = holds.length;
        var endLen = len;
        var isChupai = false;
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            isChupai = true;
            endLen -=1;
        }
        for (var i = 0; i < maxHoldLength;i++){ //14
            if (i < endLen){
                this.leftHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian4')
            }else{
                this.leftHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = null;
            }
        }

        if (isChupai){
            this.leftHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian4')
        }

       
        this.gameInfo.leftHolds = holds;
    },

    setLeftFolds(folds){

        var len = this.gameInfo.leftFolds.length;
        console.log(len,folds)
        if (len === folds.length) return 
        for (var i = len; i < folds.length;i++){
            this.leftFoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('left-bottom-'+folds[i])
        }

        this.gameInfo.leftFolds = folds;
    },

    setLeftHuas(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'left-bottom-'+pai;
            this.leftHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame(spriteFrame)
        }   
        this.gameInfo.leftHuas = huas;
    },

    setRightHolds(holds){
        var len = holds.length;
        var endLen = len;
        var isChupai = false;
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            isChupai = true;
            endLen -=1;
        }
        for (var i = 0; i < maxHoldLength;i++){ //14
            if (i < endLen){
                this.rightHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('cemian2')
            }else{
                this.rightHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = null;
            }
        }

        if (isChupai){
            this.rightHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('cemian2')
        }

       
        this.gameInfo.leftHolds = holds;

    },

    setRightFolds(folds){
        var len = this.gameInfo.rightFolds.length;
        console.log(len,folds)
        if (len === folds.length) return 
        for (var i = len; i < folds.length;i++){
            console.log(this.rightAltas.getSpriteFrame('right-bottom-'+folds[i]))
            this.rightFoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('right-bottom-'+folds[i])
        }

        this.gameInfo.rightFolds = folds;
    },

    setRightHuas(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'right-bottom-'+pai;
            var index = 7-i;
            this.rightHuasNode.children[index].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame(spriteFrame)
        }   

        this.gameInfo.rightHuas = huas;
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
        this.setMyChis(
            [
                {
                    type:'chi',
                    pai:15,
                    list:[13,14,15]
                },
                {
                    type:'chi',
                    pai:15,
                    list:[13,14,15]
                },
                {
                    type:'chi',
                    pai:15,
                    list:[13,14,15]
                },{
                    type:'peng',
                    pai:14
                },
                {
                    type:'peng',
                    pai:14
                }
            ]
        )
     },

    start () {

    },

    // update (dt) {},
});
