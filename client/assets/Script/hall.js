// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

var roomConf = {
    jushu:20,
    type:0,
    userCount:4,
    xie:true
}

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

        creatRoom:{
            default:null,
            type:cc.Node
        },
        roomSecen:{
            default:null,
            type:cc.SceneAsset
        }
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {

       // cc.vv.Util.setFitSreenMode();
      console.log(cc.vv.audio)
      //  cc.vv.audio.playBigMusic();

        this.onCickConfirmCreateRoom = cc.vv.Util.throttle(this._onCickConfirmCreateRoom, 2000, { 'leading': true, 'trailing': false })

        this.joinRoomNode = this.node.getChildByName('joinRoom');
        this.createRoomNode = this.node.getChildByName('createRoom');
     },

     onClickJoinRoom(){
        this.joinRoomNode.active = true;
     },

     onClickCreateRoom(){
        console.log(this.createRoomNode)
        this.createRoomNode.active = true;
     },

     onClickCloseCreateRoom(e){
         console.log('close ')
         this.createRoomNode.active = false;
     },

     onUiCickConfirmCreateRoom(){
        this.onCickConfirmCreateRoom();
     },

     _onCickConfirmCreateRoom(){
        cc.vv.http.sendRequest('/room/create_room',{conf:roomConf},(ret)=>{
            cc.vv.roomId = ret.roomId
            cc.director.loadScene(this.roomSecen.name);
        })
       
     },

     onJushuToggleClick(toggle,data){
        roomConf.jushu = parseInt(data);
  
     },
     onTypeToggleClick(toggle,data){
        roomConf.type = parseInt(data);

     },
     onUserToggleClick(toggle,data){
        roomConf.userCount = parseInt(data);

     },
     onXieToggleClick(toggle,data){
         if (data === 'true'){
            roomConf.xie =  true
         }else{
            roomConf.xie =  false
         }
     },

  
     

    start () {

    },

    // update (dt) {},
});
