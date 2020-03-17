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

        actionAltas:{
            default:null,
            type:cc.SpriteAtlas
        },

        op:null

      
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    
    },

    showOperation(op){
        var index = 2;
        var keys = [
            {
                action:'canChi',
                type:'chi'
            },{action:'canPeng',type:'peng'},{action:'canGang',type:'gang'},{action:"canHu",type:'hu'}];

        keys.forEach((k)=>{
            if (op[k.action]){
                var childNode = this.node.getChildByName('op'+index);
                childNode.active = true;   
                childNode.opType = k.type
                childNode.getComponent(cc.Sprite).spriteFrame = this.actionAltas.getSpriteFrame(k.action);
                index++;
            }
        })
        this.op = op;
    },

    onClickOp(node){
        console.log(node.type);
        var op = this.op;
        if (!node.opType){
            console.log('error')
            return;
        }

        if (node.opType === 'guo'){
            cc.vv.net.send('guo',{fromTurn:op.fromTurn})
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
    },

    start () {

    },
    show(){
        this.node.active = true;
    },

    hide(){
        this.node.active = false;
    },

    init(){
        
    },

    clickChiItem(btn,param){
        console.log('clickchiitem',param);
        if (!this.op || !this.op.canChi) return
        var index = parseInt(param);
        cc.vv.net.send('chi',{chiIndex:index})
    },

    clearOp(){
        this.op = null;
    },

    clickOpAction(node){
      
            var op = this.gameInfo.op;
            if (!node.opType){
                console.log('error')
                return;
            }

            if (node.opType === 'guo'){
                cc.vv.net.send('guo',{fromTurn:op.fromTurn})
            }

            if (node.opType === 'chi'){
                if (!op.canChi) return;
                var pai = op.pai;
                if (op.chiList.length > 1){
                    for (var key in op.chiList){
                        this.setOneChiList(key,op.chiList[key],pai);
                    }
                }else{
                    cc.vv.net.send('chi',{chiIndex:0})
                }

                return;
            }

            if (!op.canHu && !op.canChi && !op.canPeng && !op.canGang) return;
            cc.vv.net.send(node.opType,{fromTurn:op.fromTurn})
    },

    setOneChiList(index,list,pai){
        var key = '';
        if (index == 0) key = 'list0';
        if (index == 1) key = 'list1';
        if (index == 2) key = 'list2';


        var node = this.node.getChildByName(key);
        console.log(node,key)

        for (var i = 0; i < node.children.length;i++){
            node.children[i].getComponent('pai').setPaiSpriteFrame(list[i]);
            if (list[i] === pai){
                node.children[i].scaleX = 1.2
                node.children[i].scaleY = 1.2
            }
            else{
                node.children[i].scaleX = 1
                node.children[i].scaleY = 1
            }
            
        }

    },



    // update (dt) {},
});
