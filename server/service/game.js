
var User = require('./user')
var Room = require('./room')

var Log = require('../utils/log');

var CONST = require('../utils/const');

var Util = require('../utils/util');


class Game {
    constructor() {
    }

    setFengIndex(roomInfo){
        var zhuangIndex = roomInfo.zhuangIndex;
        var seats = roomInfo.seats;
        for (var i = 0; i < seats.length;i++){
            if (i === zhuangIndex){
                seats[i].fengIndex = 0;
            }else if (Util.checkIsLeftIndex(zhuangIndex,i,seats)){
                seats[i].fengIndex = 3;
            }else if (Util.checkIsRightIndex(zhuangIndex,i,seats)){
                seats[i].fengIndex = 1;
            }else if (Util.checkIsUpIndex(zhuangIndex,i,seats)){
                seats[i].fengIndex = 2;
            }
            
        }
    }

    //开始一局新的
    begin(roomInfo){
        roomInfo.gameStatus = CONST.GAME_STATUS_START;
        if (roomInfo.count === 0){ //如果是第一局
            roomInfo.zhuangIndex = 0;
        }else{
            this.moveToNextZhuang(roomInfo);
        }
        roomInfo.turn = roomInfo.zhuangIndex;
        this.initSeats(roomInfo);
        this.setFengIndex(roomInfo);
        roomInfo.mjLists = [];
        this.initMjList(roomInfo.mjLists);
        this.shuffle(roomInfo.mjLists)
        this.initEveryOnePai(roomInfo);
 
        roomInfo.count++;
        Room.broacastInRoom('game_start',roomInfo.roomId,roomInfo);

        var isTianHu = false
        for (var i = 0; i < roomInfo.seats.length;i++){
            var seat = roomInfo.seats[i];
            if (i !== roomInfo.turn){
                this.checkCanTingPai(seat); // 检查是否听牌了
            }else{
                isTianHu = this.checkIsHu(seat.countMap); //检查是否天胡了
                if (isTianHu){
                    seat.op = {
                        canHu:true,
                        pai:seat.holds[0],
                        fromTurn:roomInfo.turn
                    }
                    this.notifyOneSeatOperation(seat)
                }
            }
        }

        if (!isTianHu){
            this.notifyChupai(roomInfo);
        }

        
    }

    calcFanShu(roomInfo){
        for (var i = 0; i < roomInfo.seats;i++){
            var seat = roomInfo.seats[i];
            Util.setHoldsHuShu(seat);
            Util.setChisHuShu(seat);
            Util.setHuasHuShu(seat);
        }

        return;
    }

    initSeats(roomInfo){
        for (var i = 0; i<roomInfo.seats.length;i++){
            var seat = roomInfo.seats[i]
            seat.holds = [];
            seat.folds = [];
            seat.chis = [];
            seat.huas = [];
            seat.op = {};
            seat.tingMap = [];
            seat.countMap = {};
            seat.huShu = 0;
            seat.fanShu = 1;
          }
    }

    //初始化麻将牌
    initMjList(data){
        for (var i = 0; i < 4;i++){
            for (var j = 1; j < 10;j++){ //1-9表示筒子
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 11; j < 20;j++){ //11-19表示万字
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 21; j < 30;j++){ //21-29代表条子
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 31; j < 38;j++){ //31-34代表东南西北中白发
                data.push(j)
            }
        }

        for (var j = 41; j < 49;j++){ //41-48代表春夏秋冬梅兰菊竹
            data.push(j)
        }

    }

    //洗牌
    shuffle(data){
        var len = data.length;
        var temp = ''
        for (var i = len - 1;i > 0;i-- ){
            var index = Math.ceil(Math.random()*i);
            
            temp = data[index];
            
            if (!temp){
                Log.error('shuffle is error,',temp,index)
            }
            
            data[index] = data[i];
            data[i] = temp;
        }
    }

    //初始化每个人的手牌
    initEveryOnePai(roomInfo){
        var seats = roomInfo.seats;
        
        var mjLists = roomInfo.mjLists;
        var len = seats.length;
        var zhuangIndex = roomInfo.zhuangIndex;

        for (var i = 0;i< 3;i++){ //每个人拿4张牌，轮训三次，共12张牌
            for (var j = 0;j<len;j++){
                seats[j].holds = (seats[j].holds).concat(this.getNextPai(mjLists,4))
            }
        }

            //每个人再拿一张牌
        for (var j = 0;j<len;j++){
            seats[j].holds = (seats[j].holds).concat([this.getNextPai(mjLists)])
        }

        seats[zhuangIndex].holds = (seats[zhuangIndex].holds).concat([this.getNextPai(mjLists)]); //庄家再拿一张牌
    
        for (var i = 0;i < seats.length;i++){
            //将花色拿出来
            for (var k = 0; k < seats[i].holds.length;k++){
                while(seats[i].holds[k] >= 41 &&  seats[i].holds[k]<= 48){
                    seats[i].huas.push(seats[i].holds[k])
                    var nextPai = this.getNextPai(mjLists);
                    seats[i].holds[k] = nextPai;
                }

            }
        }

        // 将手牌排序
        for (var i = 0;i < seats.length;i++){
            this.sortPai(seats[i].holds)
            seats[i].countMap = this.getCountMap(seats[i].holds);
        }

        // 将花色排序
        for (var i = 0;i < seats.length;i++){
            this.sortPai(seats[i].huas)
        }

    
    }

    sortPai(data){
        data.sort((a,b)=>{
            return b -a;
        })
    }

    getCountMap(holds){
        var countMap = {};
        if (!holds || !holds.length){
            Log.error('getCountMap holds is null',holds)
            return;
        }

        countMap =  holds.reduce(function(map, word) {
            map[word] = ++map[word] || 1 // increment or initialize to 1
            return map
          }, {}) 



        return countMap;
    }

    getNextChuPaiIndex(seats,index){
        if (index === seats.length -1) return 0;
        else return index + 1;
    }

    getNextPai(mjLists,len = 1){
        var list =  mjLists.splice(0,len);
        if (len === 1) return list[0]
        return list
    }

    getNextPaiIncludeHua(roomInfo){
        if (!roomInfo){
            Log.error('getNextPaiIncludeHua roominfo is null')
            return;
        }

        var huas = [];
        var pai = this.getNextPai(roomInfo.mjLists)

        while(this.checkIsHua(pai)){
            huas.push(pai);
            pai = this.getNextPai(roomInfo.mjLists);
        }

        return {
            huas:huas,
            pai
        }

    }

    addCountMap(countMap,pai){
        if (countMap[pai]){
            countMap[pai]++
        }else{
            countMap[pai] = 1
        }
    }

    checkIsHua(pai){
        if (pai >= 41 && pai<= 48) return true;
        return false;
    }

    // 检查是否可以杠
    
    checkCanGang(seatData,pai,fromTurn){
        var count = seatData.countMap[pai];
        var op = seatData.op;
        if(count && count >= 3){
            op.canGang = true;
            op.pai = pai;
            op.fromTurn = fromTurn;
        }
    }

    checkCanPeng(seatData,pai,fromTurn){
        var count = seatData.countMap[pai];
        var op = seatData.op;
        if(count && count >= 2){
            op.canPeng = true;
            op.pai = pai;
            op.fromTurn = fromTurn;
        }
    }

    checkCanHu(seatData,pai,fromTurn){
        var op = seatData.op;
        var map = seatData.tingMap.map((t)=>{
            return t.pai
        })
        if (map.indexOf(pai) !== -1){
            op.canHu = true;
            op.pai = pai;
            op.fromTurn = fromTurn;
        }
    }

    checkCanChi(seatData,pai,fromTurn){

        if (pai >= 31) return  //东南西北中无法吃
        var countMap = seatData.countMap
        var superPrev = pai - 2;
        var prev = pai - 1;
        var next = pai + 1;

        var superNext = pai + 2;

        var range = this.getMjRange(pai)

        var op = seatData.op;
        op.chiList = [];


           //A A+1 A+2
        if (this.checkPaiInRange(superNext,range) && this.checkPaiInRange(next,range) && countMap[superNext] && countMap[next]){
            op.canChi = true;
            op.chiList.push([pai,next,superNext]);
        }
    
        //A-1 A A+1
        if (this.checkPaiInRange(prev,range) && this.checkPaiInRange(next,range) && countMap[prev] && countMap[next]){
            op.canChi = true;
            op.chiList.push([prev,pai,next]);
        }

         //A-2 A-1 A
         if (this.checkPaiInRange(superPrev,range) && this.checkPaiInRange(prev,range) && countMap[superPrev] && countMap[prev]){
            op.canChi = true;
            op.chiList.push([superPrev,prev,pai]); 
        }

        if (op.canChi){
            op.fromTurn = fromTurn;
            op.pai = pai;
        }
        
        
        return;
    }

    checkPaiInRange(pai,range){
        if (range[0] <= pai && range[1] >= pai) return true;
        return false;
    }

    getMjRange(pai){
        if (pai >= 1 && pai <= 9){
            return [1,9]
        }

        if (pai >= 11 && pai <= 19){
            return [11,19]
        }

        if (pai >= 21 && pai <= 31){
            return [21,31]
        }

        if (pai >= 31 && pai <= 38){ //东南西北
            return [31,38]
        }

        if (pai >= 41 && pai<= 48){ //花色
            return [41,48]
        }
    }

    clearOperation(roomInfo){
        for (var i = 0;i< roomInfo.seats.length;i++){
            roomInfo.seats[i].op = {};
        }
        Room.broacastInRoom('clear_op_notify',roomInfo.roomId,{})
    }

    waitOtherOperation(seats,index,level,callback){
        var levels = ['canHu','canGang','canPeng','canChi'];
        let lIndex = levels.indexOf(level);
        var waitLevel = levels.splice(0,lIndex);
        var opTag = false;

        function check(op){
            for (var key of waitLevel){
                if (op[key]) return true;
            }
            return false
        }

        var otherSeats = seats.filter((s,_id)=>{
            return _id !== index
        })

        var interval = setInterval(()=>{
                for (var i = 0; i <otherSeats;i++){
                    let op = otherSeats[i].op;
                    if (check(op)){
                        opTag = true;
                        break;
                    }
                    else opTag = false
                }

                if (!opTag){
                    clearInterval(interval);
                    callback()
                }
            },50)
    }
    
    checkOtherSeatHasOp(seats,excludeIndex){
        
        var otherSeats = seats.filter((s,_id)=>{
            return _id !== excludeIndex
        })
       for (var i = 0; i< otherSeats.length;i++){
           var op = seats[i].op;
           if (op.canHu || op.canGang || op.canPeng || op.canChi) return true
       }
       return false
    }

    checkMyselfHasOp(seat){
        var op = seat.op;
        if (op.canHu || op.canGang || op.canPeng || op.canChi) return true
        return false;
    }

    getIndexByUserId(seats,userId){
        var ids = seats.map((s)=>{return s.userId});
        console.log(ids,userId)
        var index = ids.indexOf(userId);
        if (index === -1){
            Log.error('getIndexByUserId index is invalid')
            return 
        }

        return index;
    }

    moveToNextTurn(roomInfo,turnIndex){
        if (!roomInfo){
            Log.error('fapai roominfo is null')
            return;
        }
        
        if (turnIndex !== null && turnIndex !== undefined){
            roomInfo.turn = turnIndex
        }else{
            var turn = roomInfo.turn;
            var nextIndex = this.getNextChuPaiIndex(roomInfo.seats,turn);
            roomInfo.turn = nextIndex;
        }
        return;
    }

    moveToNextZhuang(roomInfo){
        if (!roomInfo){
            Log.error('fapai roominfo is null')
            return;
        }
        
        var zhuangIndex = roomInfo.zhuangIndex;
        var nextIndex = this.getNextChuPaiIndex(roomInfo.seats,zhuangIndex);
        roomInfo.zhuangIndex = nextIndex;
      
        return;
    }

    fapai(roomInfo){
        if (!roomInfo){
            Log.error('fapai roominfo is null')
            return;
        }
        var turn = roomInfo.turn;
        var seat = roomInfo.seats[turn]

        var list = this.getNextPaiIncludeHua(roomInfo);


        var pai = list.pai;
        var huas = list.huas;

        if (huas.length){
            seat.huas = seat.huas.concat(huas);
        }
        this.checkCanHu(seat,pai,turn);
        this.checkCanGang(seat,pai,turn);

        // 检查手牌是否有刚的
        seat.holds.unshift(pai);
        this.addCountMap(seat.countMap,pai);
        this.updateTable(roomInfo);

        //判断手牌能否杠
        for (var _key in seat.countMap){
            var key = parseInt(_key)
            if (seat.countMap[key] === 4){
                seat.op = {
                    canGang:true,
                    fromTurn:turn,
                    pai:key
                }
            }
        }

        //判断持牌中有没有杠的
        for (var i = 0 ; i < seat.chis.length;i++){
            var item = seat.chis[i];
            if (item.type === 'gang'){
                var pai = item.pai;
                if (seat.countMap[pai] === 1){
                    seat.op = {
                        canGang:true,
                        fromTurn:turn,
                        pai:key,
                        where:'folds',
                        index:i
                    } 
                    break;
                }
            }
        }

        var ret = this.notifyOneSeatOperation(seat);
        if (!ret){
            this.notifyChupai(roomInfo)
        }
        
    }

    //开始的时候 更新桌面的信息
    updateTable(roomInfo){
        if (!roomInfo){
            Log.error('no find roominfo in updateTable')
            return 
        }
        Room.broacastInRoom('update_table',roomInfo.roomId,roomInfo)
    }

    updateOneTable(roomInfo,userId){
        if (!roomInfo){
            Log.error('no find roominfo in updateOneTable')
            return 
        }    

        var socket = User.getSocketByUser(userId)
        if (!socket){
            Log.error('no find socket in updateOneTable')
            return 
        }

        socket.emit('update_table',roomInfo)
    }

    
    sendUserInfo(roomInfo){
        if (!roomInfo){
            Log.error('no find roominfo in sendUserInfo')
            return 
        }
        Room.broacastInRoom('send_user_info',roomInfo.seats);
    }

    

     //刚进来的时候，获取一次用户状态信息
    updatePepoleStatus(roomInfo){
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }
        
        var statusList = roomInfo.se

        Room.broacastInRoom('update_pepole_status',roomInfo.roomId,roomInfo)
    }

    //通知新的人进来了，只是要求出个提示语
    notifyNewUserLogin(roomInfo,userId){
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('new_user_login_notify',roomInfo.roomId,userId,[userId])
    }


    //通知是否有操作
    notifyOperation(seats){
        var hasOp = false;
        var ret = false;
        for (var item of seats){
            ret = this.notifyOneSeatOperation(item)
            if (ret){
                hasOp = true;
            }
        }
        return hasOp;
    }

    notifyOneSeatOperation(seat){
        var userId = seat.userId;
        var hasOp = false;
        var op = seat.op
        if (op.canHu || op.canChi || op.canGang || op.canPeng){
            hasOp = true;
        }
        if (hasOp){
            var socket = User.getSocketByUser(userId)
            if (!socket){
                Log.error('sendOperation get socket is null',userId);
                return;
            }

            socket.emit('op_notify',{op})
        }

        return hasOp;
    }

    //通知前端操作的结果，仅供特效自体和声音播放，不设计pai的排序 ,不包括发送给谁
    notifyOperationAction(roomInfo,data,excludeUsers = []){
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('op_action_notify',roomInfo.roomId,data,excludeUsers)
    }

    //通知前端出牌
    notifyChupai(roomInfo){
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        var seats = roomInfo.seats;
        var turn = roomInfo.turn;
        var socket = User.getSocketByUser(seats[turn].userId);
        socket.emit('chupai_notify');
    }

    //播放声音
    notifyChupaiAction(roomInfo,operationResult,userId){
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('chupai_action_notify',roomInfo.roomId,operationResult,[userId])
    }

    notifyTingPai(seat){
        var socket = User.getSocketByUser(seat.userId);
        if (!socket){
            Log.error('tingpai socket is null')
            return
        }

        socket.emit('tingpai_notigy',seat.tingMap)
    }

    checkCanTingPai(seat){
        if (!seat){
            Log.error('roomInfo is null in checkCanTingPai')
            return
        }
        var countMap = seat.countMap;
        var tingMap = [];

        var lists = [
            [1,10],[11,20],[21,30],[31,39]
        ]

        lists.forEach((l)=>{
            for (var i = l[0]; i< l[1];i++){ 
                if (countMap[i]){
                    countMap[i]++;
                }else{
                    countMap[i] = 1;
                }
                var ret = this.checkIsHu(countMap);
                if (ret){
                    tingMap.push({
                        pai:i
                    })
                }
                if (countMap[i] === 1){
                    delete countMap[i]
                }else{
                    countMap[i]--;
                }
     
            }
        })
        seat.tingMap = tingMap;
        this.notifyTingPai(seat)
    }



    checkIsHu(countMap){
      
        //先拿出将牌
        for (var _key in countMap){
            var key = parseInt(_key);
            var count = countMap[key];
            if (count && count >= 2){
                var old = count;
                countMap[key] -=2;
                var ret = this.checkSingleTingPai(countMap,1,9);
                ret &= this.checkSingleTingPai(countMap,11,19);
                ret &= this.checkSingleTingPai(countMap,21,29);
                ret &= this.checkSingleTingPai(countMap,31,38);
                countMap[key] = old;
                if (ret){
                  return true;
                }
            }
        }
    }

    checkPaiInRange(pai,range){
        if (range[0] <= pai && range[1] >= pai) return true;
        return false;
    }

  
    checkSingleTingPai(countMap,start,end){
        var selected = -1;
        var cc = 0;
       for (var _key in countMap){
           var key = parseInt(_key);
           cc = countMap[key];
           if (cc === -1){
               console.log('here ',cc,key)
           }
            if (cc && this.checkPaiInRange(key,[start,end])){
                selected = key;
                break;
            }
       } 

       if (selected === -1){
           return true;
       }

      

        //否则，进行匹配
        if(cc === 3){
            //直接作为一坎
            countMap[selected] = 0;
            var ret = this.checkSingleTingPai(countMap,start,end);
            //立即恢复对数据的修改
            countMap[selected] = cc;
            if(ret){
                return true;
            }
        }
        else if(cc === 4){
            //直接作为一坎
            countMap[selected] = 1;
  
            var ret = this.checkSingleTingPai(countMap,start,end);
            //立即恢复对数据的修改
            countMap[selected] = cc;
            //如果作为一坎能够把牌匹配完，直接返回TRUE。
            if(ret){
                return true;
            }
        }

        if (selected >= 31 && selected <= 38) { //如果是风牌，没法吃，直接返回匹配失败
            return false;
        }


        //接下来去除顺子

        //分开匹配 A-2,A-1,A
        var matched = true;
        var v = selected % 10;

        //   console.log(v,countMap);
        
        if(v < 3){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected - 2 + i;
                var cc = countMap[t]
                if(!cc){
                    matched = false;
                    break;
                }
                
            }		
        }


        //匹配成功，扣除相应数值
        if(matched){
            countMap[selected - 2] --;
            countMap[selected - 1] --;
            countMap[selected] --;
            var ret = this.checkSingleTingPai(countMap,start,end);
            countMap[selected - 2] ++;
            countMap[selected - 1] ++;
            countMap[selected] ++;
            if(ret){
                return true;
            }		
        }
    
        //分开匹配 A-1,A,A + 1
        matched = true;
        if(v < 2 || v > 8){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected - 1 + i;
                var cc =  countMap[t]
                if(!cc){
                    matched = false;
                    break;
                }
            }		
        }
    
        //匹配成功，扣除相应数值
        if(matched){
            countMap[selected - 1] --;
            countMap[selected] --;
            countMap[selected + 1] --;
            var ret = this.checkSingleTingPai(countMap,start,end);
            countMap[selected - 1] ++;
            countMap[selected] ++;
            countMap[selected + 1] ++;
            if(ret){
                return true;
            }		
        }
        
  
        //分开匹配 A,A+1,A + 2
        matched = true;
        if(v > 7){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected + i;
                var cc =  countMap[t]
                // console.log(t,cc)
                if(!cc){
                    matched = false;
                    break;
                }
            }		
        }
        //匹配成功，扣除相应数值
        if(matched){
            countMap[selected] --;
            countMap[selected + 1] --;
            countMap[selected + 2] --;
            var ret = this.checkSingleTingPai(countMap,start,end);
            countMap[selected] ++;
            countMap[selected + 1] ++;
            countMap[selected + 2] ++;
            if(ret){
                return true;
            }		
        }

        return false;
    }

}


module.exports = new Game();