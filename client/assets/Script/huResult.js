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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    reset(){
        console.log('reset result')
        var keys = ['list0','list1','list2','list3'];
        keys.forEach((k)=>{
            var node = this.node.getChildByName(k);
            var chiNode = node.getChildByName('chiresultNode');
            var huasNode = node.getChildByName('huas');
            var holdsNode = node.getChildByName('holds');
            for (var i = 0; i < chiNode.length;i++){
                chiNode.children[i].active = false;
            }
            for (var i = 0; i < huasNode.length;i++){
                huasNode.children[i].active = false;
            }
            for (var i = 0; i < holdsNode.length;i++){
                holdsNode.children[i].active = false;
            }
        })

        this.node.active = false;
    }

    // update (dt) {},
});
