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
            console.log(node,this.gameInfo);
            if ((this.gameInfo.turn !== this.gameInfo.myIndex) || this.gameInfo.hasChupai) return;
            this.gameInfo.hasChupai = true;
            var chupai = node.pai;
            cc.vv.net.send('chupai',{userId:cc.vv.userId,pai:chupai,roomId:this.gameInfo.roomId});

            this.calcHoldsAndFolds(this.gameInfo.myHolds,this.gameInfo.myFolds,chupai);

            this.gameInfo.myHolds.sort((a,b)=>{
                return a - b;
            })
            this.setMyUiHolds(this.gameInfo.myHolds);
            this.setMyFolds(chupai);

        })
    },

    calcHoldsAndFolds(holds,folds,pai){
        var index = holds.indexOf(pai);
        holds.splice(index,1);
        folds.push(pai);
    },

    initUiData(){

        var timeNode = this.node.getChildByName('time');
        this.timeBackNode = timeNode.getChildByName('timeBack');
        this.hideCircle();
        console.log( this.timeBackNode)

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
        this.myChiNode = myOpNode.getChildByName('chi');
        this.myChiListParentNode = myOpNode.getChildByName('chilist');
        this.myChiList1Node = this.myChiListParentNode.getChildByName('list1');
        this.myChiList2Node = this.myChiListParentNode.getChildByName('list2');

        this.myChiList3Node = this.myChiListParentNode.getChildByName('list3');

        this.hideOpNode();
        this.hideChiList();

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

        for (var i = 0; i < node.children.length;i++){
            for (var j = 0;j < list.length;j++){
                node.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame('my-bottom-'+list[j]);
                if (list[j] === pai){
                    node.children[i].y +=10;
                }
            }
        }

        node.active = true;

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

        /**
         *  var events = [
                'login_result','set_ready_result','game_start'
            ]*/
            
        this.node.on('game_start',(data) => {
            this.readyBtn.active = false;
            this.unReadyBtn.active = false;

            var userId = cc.vv.userId;
            var seats = data.seats;
         

            var userIds = seats.map((s)=>{return s.userId});
            var myIndex = userIds.indexOf(userId) ; //我的位置

           this.gameInfo = {
               myFolds:[],
               roomId:data.roomId
           };
            this.gameInfo.zhuangIndex = 0;
            this.gameInfo.turn = data.turn;

            for (var i = 0; i < seats.length;i++){
                var holds = seats[i].holds;
                var huas = seats[i].huas;
                var folds = seats[i].folds;
                if (i  === myIndex){
                    this.gameInfo.myIndex = i;
                    this.gameInfo.myHolds = holds;
                    this.gameInfo.myFolds = folds;
                    this.gameInfo.myHuas = huas;
                    this.setMyUiHolds(holds);
                    this.setMyUiHua(huas)
                }else if ( i < myIndex && Math.abs(i-myIndex) === 1){ //左边的牌
                    this.gameInfo.leftIndex = i;
                    this.gameInfo.leftHolds = holds;
                    this.gameInfo.leftFolds = folds;
                    this.gameInfo.leftHuas = huas;
                    this.setLeftHolds(holds.length);
                    this.setLeftHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 1){ //右边的牌
                    this.gameInfo.rightIndex = i;
                    this.gameInfo.rightHolds = holds;
                    this.gameInfo.rightFolds = folds;
                    this.gameInfo.rightHuas = huas;
                    this.setRightHolds(holds.length);
                    this.setRightHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 2){ //对面的牌
                    this.gameInfo.upIndex = i;
                    this.gameInfo.upHolds = holds;
                    this.gameInfo.ipFolds = folds;
                    this.gameInfo.rightHuas = huas;
                    console.log('对面的牌')
                    // this.setLeftHolds(holds);
                    // this.setLeftHua(huas)
                } 
            }

            this.setTimeCircle();

            if (data.zhuangIndex === this.gameInfo.myIndex){
                this.gameInfo.hasChupai = false;
            }
           
        })

        /*chupaiIndex:seatIndex,pai*/ 
        this.node.on('one_chupai',(data)=>{
            var pai = data.pai;
            var chupaiIndex = data.chupaiIndex;

            if (chupaiIndex == this.gameInfo.leftIndex){
                this.leftChupaiUi(pai);
                this.calcHoldsAndFolds(this.gameInfo.leftHolds,this.gameInfo.leftFolds,pai);
            }else if (chupaiIndex === this.gameInfo.rightIndex){
                this.rightChupaiUi(pai);
                this.calcHoldsAndFolds(this.gameInfo.rightHolds,this.gameInfo.rightFolds,pai);

            }else if (chupaiIndex === this.gameInfo.upIndex){
                this.upChupaiUi(pai);
                this.calcHoldsAndFolds(this.gameInfo.upHolds,this.gameInfo.upFolds,pai);
            }
        })

        /**
         * {pai:nextPai,turn:nextIndex}
         */

        this.node.on('zhuapai',(data)=>{
            var pai = data.pai;
            var turn = data.turn;
            this.gameInfo.turn = turn;
            console.log('zhuapai data is ',data,this.gameInfo)

            if (turn === this.gameInfo.leftIndex){
                this.leftHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian4');      
                this.gameInfo.leftHolds.push(pai);
            }else if (turn === this.gameInfo.rightIndex){
                this.rightHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('cemian2')
                this.gameInfo.rightHolds.push(pai)
            }else if (turn === this.gameInfo.upIndex){
                this.upHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian3');
                this.gameInfo.upHolds.push(pai)
            }else if (turn === this.gameInfo.myIndex){
                this.gameInfo.hasChupai = false;
                this.myHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = this.myHoldsAltas.getSpriteFrame('my-'+pai);
                this.myHoldsNode.children[maxHoldLength - 1].pai = pai;
                console.log(this.myHoldsNode.children[maxHoldLength - 1])
                this.gameInfo.myHolds.push(pai);
            }

        })

        /**
         * {
         *  huas,turn
         * }
         */
        this.node.on('get_huas',(data)=>{
            var turn = data.turn;
            var huas = data.huas;
            if (turn === this.gameInfo.leftIndex){
                var len = this.gameInfo.leftHuas.length;
                for (var hua of huas)
                this.leftHuasNode.children[len].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('left-'+hua);
                this.gameInfo.leftHuas = this.gameInfo.leftHuas.concat(huas)
            }else if (turn === this.gameInfo.rightIndex){
                var len = this.gameInfo.rightHuas.length;
                for (var hua of huas)
                this.rightHuasNode.children[len].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('right-'+hua);
                this.gameInfo.rightHuas = this.gameInfo.rightHuas.concat(huas)
            }else if (turn === this.gameInfo.upIndex){
                var len = this.gameInfo.upHuas.length;
                for (var hua of huas)
                this.upHuasNode.children[len].getComponent(cc.Sprite).spriteFrame = this.upAltas.getSpriteFrame('up-'+hua);
                this.gameInfo.upHuas = this.gameInfo.upHuas.concat(huas)
            }else if (turn === this.gameInfo.myIndex){
                var len = this.gameInfo.myHuas.length;
                for (var hua of huas)
                this.myHuasNode.children[len].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame('my-bottom-'+hua);
                this.gameInfo.myHuas = this.gameInfo.myHuas.concat(huas)
            }
        })

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

        console.log(this.gameInfo);

        this.hideChiList();

        for (var key in list){
            this.setOneChiList(key,list[key],pai);
        }
    },

    leftChupaiUi(pai){
        var len = this.gameInfo.leftFolds.length;
        this.leftFoldsNode.children[len].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('left-bottom-'+pai);
        this.leftHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = null;
    },

  
    
    rightChupaiUi(pai){
        var len = this.gameInfo.rightFolds.length;
        this.rightFoldsNode.children[len].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('right-bottom-'+pai);
        this.rightHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = null;
    },
    
    upChupaiUi(pai){
        var len = this.gameInfo.upFolds.length;
        this.upFoldsNode.children[len].getComponent(cc.Sprite).spriteFrame = this.upAltas.getSpriteFrame('left-bottom-'+pai);
        this.upHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame = null;
    },

    setTimeCircle(){
        var turnIndex = this.gameInfo.turn;
        this.hideCircle();
        this.showOneCircle(turnIndex)

    },

    setMyUiHolds(holds){
        var len = holds.length; //13
        for (var i = 0; i < maxHoldLength;i++){ //14
            if (i < len){
                var pai = holds[i];
                var spriteFrame = 'my-'+pai;
                this.myHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myHoldsAltas.getSpriteFrame(spriteFrame)
                this.myHoldsNode.children[i].pai = pai;
            }else{
                this.myHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = null;
                this.myHoldsNode.children[i].pai = null;
            }
         
        }
    },

    setMyFolds(pai){
        var len = this.gameInfo.myFolds.length;
        var spriteFrame = 'my-bottom-'+pai;
        this.myFoldsNode.children[len].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame(spriteFrame)
        
    },

    setMyUiHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'my-bottom-'+pai;
            this.myHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame(spriteFrame)
        }
    },

    setLeftHolds(len){
        var isChupai = false;
        let base = 0;
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            isChupai = true;
            base = 1;
        }
        for (var i = maxHoldLength - 2; i > base ;i--){
            this.leftHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian4')
        }

        if (isChupai){
            this.leftHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame =  this.LeftAltas.getSpriteFrame('cemian4')
        }

    },

    setLeftHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'left-bottom-'+pai;
            this.leftHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame(spriteFrame)
        }   
    },

    setRightHolds(len){
        var isChupai = false;
        let base = 0;
        if (len === 14 || len === 11 || len === 8 || len === 5 || len === 2){
            isChupai = true;
            base = 1;
        }
        for (var i = maxHoldLength - 2; i > base ;i--){
            this.rightHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('cemian2')
        }

        if (isChupai){
            this.rightHoldsNode.children[maxHoldLength - 1].getComponent(cc.Sprite).spriteFrame =  this.rightAltas.getSpriteFrame('cemian2')
        }

    },

    setRightHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'right-bottom-'+pai;
            var index = 7-i;
            this.rightHuasNode.children[index].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame(spriteFrame)
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

    start () {

    },

    // update (dt) {},
});
