// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var mexHoldLength = 14;

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
            cc.vv.net.send('chupai',{userId:cc.vv.userId,pai:chupai});

            var index = this.gameInfo.myHolds.indexOf(chupai);


            this.gameInfo.myHolds.splice(index,1);
            this.gameInfo.myFolds.push(chupai);

            this.setMyUiHolds(this.gameInfo.myHolds);
            this.setMyFolds(chupai);

        })
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
            var mySeats = '';

            var userIds = seats.map((s)=>{return s.userId});
            var myIndex = userIds.indexOf(userId) ; //我的位置

           this.gameInfo = {
               myFolds:[]
           };
            this.gameInfo.zhuangIndex = 0;
            this.gameInfo.turn = data.turn;

            for (var i = 0; i < seats.length;i++){
                var holds = seats[i].holds;
                var huas = seats[i].huas;
                if (i  === myIndex){
                    this.gameInfo.myIndex = i;
                    this.gameInfo.myHolds = holds;
                    this.gameInfo.myFolds = seats[i].folds;
                    this.setMyUiHolds(holds);
                    this.setMyUiHua(huas)
                }else if ( i < myIndex && Math.abs(i-myIndex) === 1){ //左边的牌
                    this.gameInfo.leftIndex = i;
                    this.setLeftHolds(holds);
                    this.setLeftHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 1){ //右边的牌
                    this.gameInfo.rightIndex = i;
                    this.setRightHolds(holds);
                    this.setRightHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 2){ //对面的牌
                    this.gameInfo.upIndex = i;
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

    },

    setTimeCircle(){
        var turnIndex = this.gameInfo.turn;
        this.hideCircle();
        this.showOneCircle(turnIndex)

    },

    setMyUiHolds(holds){
        var len = holds.length;
        for (var i = 0; i < mexHoldLength;i++){
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

    setLeftHolds(holds){
        console.log('setLeftHolds',this.leftHoldsNode)
        for (var i = 0; i < holds.length;i++){
            var index = i <= 12?12-i:i
            this.leftHoldsNode.children[index].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame('cemian4')
        }   
    },

    setLeftHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'left-bottom-'+pai;
            this.leftHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.LeftAltas.getSpriteFrame(spriteFrame)
        }   
    },

    setRightHolds(holds){
        for (var i = 0; i < holds.length;i++){
            this.rightHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.rightAltas.getSpriteFrame('cemian2')
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
