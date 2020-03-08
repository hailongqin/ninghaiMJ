// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
 
        leftBottomAltas:{ //左边打出的牌
            default:null,
            type:cc.SpriteAtlas
        },
        rightAltas:{ //右边的牌
            default:null,
            type:cc.SpriteAtlas
        },
        rightBottomAltas:{ //右边打出的牌
            default:null,
            type:cc.SpriteAtlas
        }
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
          net.send('login',{userId:cc.vv.userId,roomId:cc.vv.roomId})
      },this.node);
    },

    initUiData(){

        //初始化自己的牌
        var myNode = this.node.getChildByName('my');
        var myHoldsNode  = this.myHoldsNode = myNode.getChildByName('holds');
        var myHuasNode = this.myHuasNode = myNode.getChildByName('huas');
        for(var i = 0; i < myHoldsNode.children.length; ++i){
            var sprite = myHoldsNode.children[i].getComponent(cc.Sprite);
            sprite.spriteFrame = null;
        }

        for(var i = 0; i < myHuasNode.children.length; ++i){
            var sprite = myHuasNode.children[i].getComponent(cc.Sprite);
            sprite.spriteFrame = null;
        }

       

        //初始化左边的牌
        var LeftNode = this.node.getChildByName('left');
        var LeftHoldsNode  = this.LeftHoldsNode = LeftNode.getChildByName('holds');
        var LeftHuasNode = this.LeftHuasNode = LeftNode.getChildByName('huas');
        for(var i = 0; i < LeftHoldsNode.children.length; ++i){
            var sprite = LeftHoldsNode.children[i].getComponent(cc.Sprite);
            sprite.spriteFrame = null;
        }

        for(var i = 0; i < LeftHuasNode.children.length; ++i){
            var sprite = LeftHuasNode.children[i].getComponent(cc.Sprite);
            sprite.spriteFrame = null;
        }

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

            for (var i = 0; i < seats.length;i++){
                var holds = seats[i].holds;
                var huas = seats[i].huas;
                if (i  === myIndex){
                    this.setMyUiHolds(holds);
                    this.setMyUiHua(huas)
                }else if ( i < myIndex && Math.abs(i-myIndex) === 1){ //左边的牌
                    this.setLeftHolds(holds);
                    this.setLeftHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 1){ //右边的牌
                    this.setRightHolds(holds);
                    this.setRightHua(huas)
                }else if (i > myIndex && Math.abs(i-myIndex) === 2){ //对面的牌
                    this.setLeftHolds(holds);
                    this.setLeftHua(huas)
                } 
            }
           
            console.log('game start here data is ',data,userId,mySeats);
        })

    },

    setMyUiHolds(holds){
        for (var i = 0; i < holds.length;i++){
            var pai = holds[i];
            var spriteFrame = 'my-'+pai;
            this.myHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myHoldsAltas.getSpriteFrame(spriteFrame)
        }
    },

    setUiHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'my-bottom-'+pai;
            this.leftHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.myBottomAltas.getSpriteFrame(spriteFrame)
        }
    },

    setLeftHolds(holds){
        for (var i = 0; i < holds.length;i++){
            var pai = holds[i];
            var spriteFrame = 'left-'+pai;
            this.leftHoldsNode.children[i].getComponent(cc.Sprite).spriteFrame = this.leftHoldsAltas.getSpriteFrame(spriteFrame)
        }   
    },

    setLeftHua(huas){
        for (var i = 0; i < huas.length;i++){
            var pai = huas[i];
            var spriteFrame = 'left-'+pai;
            this.leftHuasNode.children[i].getComponent(cc.Sprite).spriteFrame = this.leftBottomAltas.getSpriteFrame(spriteFrame)
        }   
    },

    setRightHolds(holds){

    },

    setRightHua(huas){

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
