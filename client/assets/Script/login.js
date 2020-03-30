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

       
        hallScen:{
            default:null,
            type:cc.SceneAsset
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onClickUserLogin(){
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx37ae340f5b1d8bdd&redirect_uri=https://www.ccnet.site/login.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect'
        window.open(url)
    },

    // onClickUserRegitser(){
    //     window.open('./login.html?register=true')
    // },

     onLoad () {
        
     },

    start () {

    },

 


    // update (dt) {},
});
