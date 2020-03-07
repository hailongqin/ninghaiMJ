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

        roomSecen:{
            default:null,
            type:cc.SceneAsset
        },

        roomId:''
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        
        console.log('onLoad')
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation()
        })

        this.roomIdNode = this.node.getChildByName('roomId');

     },

    checkRoomId(){
        console.log(this.roomId)
        if (this.roomId.length >= 6){
            cc.vv.http.sendRequest('/room/check_room_exit',{roomId:this.roomId},()=>{
                this.node.active = false;
                cc.vv.roomId =  this.roomId;
                cc.director.loadScene(this.roomSecen.name);

            },()=>{

            });
        }
    },

    onInput(num){
    
        const index = this.roomId.length;
        this.roomIdNode.children[index].getComponent(cc.Label).string = num;
        this.roomId+=num;
       this.checkRoomId()
        
    },

     
    onN0Clicked:function(){
        this.onInput(0);  
    },
    onN1Clicked:function(){
        this.onInput(1);  
    },
    onN2Clicked:function(){
        this.onInput(2);
    },
    onN3Clicked:function(){
        this.onInput(3);
    },
    onN4Clicked:function(){
        this.onInput(4);
    },
    onN5Clicked:function(){
        this.onInput(5);
    },
    onN6Clicked:function(){
        this.onInput(6);
    },
    onN7Clicked:function(){
        this.onInput(7);
    },
    onN8Clicked:function(){
        this.onInput(8);
    },
    onN9Clicked:function(){
        this.onInput(9);
    },
    onResetClicked:function(){
        this.roomId = '';
        for (var i = 0; i<  this.roomIdNode.children.length;i++){
            this.roomIdNode.children[i].getComponent(cc.Label).string = '';
        }
    },
    onDelClicked:function(){
        var len = this.roomId.length
       if (!len) return;
       this.roomId = this.roomId.substring(0,len - 1)
       
    },
    onCloseClicked:function(){
        this.node.active = false;
    },

    start () {
        console.log('start')

    },

    onEnable(){
        console.log('onEnable');
        this.onResetClicked();

    }

    // update (dt) {},
});
