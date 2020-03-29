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

    
    checkIsMySelfIndex(myIndex,compareIndex){
        return myIndex === compareIndex;
    },

    checkIsLeftIndex(myIndex,compareIndex,seats){
        var ret = false;
        console.log(seats);
        if (myIndex > compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
        if (compareIndex === 3 && myIndex === 0) ret = true;
        return ret;
    },

    checkIsRightIndex(myIndex,compareIndex,seats){
        var ret = false;
        if (myIndex < compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
        if (myIndex === 3 && compareIndex === 0) ret = true;
        return ret; 
    },

    checkIsUpIndex(myIndex,compareIndex,seats){
        if (Math.abs(myIndex - compareIndex) === 2) return true;
        return false;
    },

    start () {

    },

    // update (dt) {},
});
