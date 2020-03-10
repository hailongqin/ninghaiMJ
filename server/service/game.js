
var User = require('./user')
var Room = require('./room')

class Game {
    constructor() {
    }

    //开始一局新的
    begin(roomInfo){
        this.initMjList(roomInfo.mjLists);
        this.shuffle(roomInfo.mjLists)
        this.initEveryOnePai(roomInfo);
        Room.broacastInRoom('game_start',roomId,roomInfo)
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
            seats[i].holds.sort((a,b)=>{
                    return a - b;
            })

            seats[i].countMap = this.getCountMap(seats[i].holds);
        }

        // 将花色排序
        for (var i = 0;i < seats.length;i++){
            seats[i].huas.sort((a,b)=>{
                   return a - b;
               })
        }

    
    }

    getCountMap(holds){
        var countMap = {};
        if (!holds || !holds.length){
            Log.error('getCountMap holds is null',holds)
            return;
        }

        holds.reduce((prev,next)=>{
            countMap[next] = countMap[next]?countMap[next]+1:1
        })

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

        var turn = roomInfo.turn;

        var huas = seats[turn].huas;
        var holds = seats[turn].holds;
        var pai = this.getNextPai(mjLists)

        while(this.checkIsHua(pai)){
            huas.push(pai);
            pai = this.getNextPai(mjLists);
        }

        holds.push(pai)
    
    }

    checkIsHua(pai){
        if (pai >= 41 && pai<= 48) return true;
        return false;
    }

    // 检查是否可以杠
    
    checkCanGang(seatData,pai){
        var count = seatData.countMap[pai];
        var op = seatData.op;
        if(count && count >= 3){
            op.canGang = true;
            op.canPeng = true;
            op.pai = pai;
        }
    }

    checkCanPeng(seatData,pai){
        var count = seatData.countMap[pai];
        var op = seatData.op;
        if(count && count >= 2){
            op.canPeng = true;
            op.pai = pai;
        }
    }

    checkCanHu(seatData,pai){
        var op = seatData.op;
        if (seatData.tingMap[pai]){
            op.canHu = true;
            op.pai = pai;
        }
    }

    checkCanChi(seatData,pai){

        if (pai >= 31) return  //东南西北中无法吃
        var countMap = seatData.countMap
        var superPrev = pai - 2;
        var prev = pai - 1;
        var next = pai + 1;

        var superNext = pai + 2;

        var range = this.getMjRange(pai)

        var op = seatData.op;
        op.chiList = [];

        //A-2 A-1 A
        if (this.checkPaiInRange(superPrev,range) && this.checkPaiInRange(prev,range) && countMap[superPrev] && countMap[prev]){
            op.canChi = true;
            op.pai = pai;
            op.chiList.push([superPrev,prev,pai]);
        }

        //A-1 A A+1
        if (this.checkPaiInRange(prev,range) && this.checkPaiInRange(next,range) && countMap[prev] && countMap[next]){
            op.canChi = true;
            op.pai = pai;
            op.chiList.push([prev,pai,next]);
        }

        //A A+1 A+2
        if (this.checkPaiInRange(superNext,range) && this.checkPaiInRange(next,range) && countMap[superNext] && countMap[next]){
            op.canChi = true;
            op.pai = pai;
            op.chiList.push([pai,next,superNext]);
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

        if (pai >= 41 && pai<= 48){
            return [41,48]
        }
    }

    clearOperation(seats){
        for (var i = 0;i< seats.length;i++){
            seats.op = {};
        }
    }

    
    checkOtherSeatHasOp(seats,excludeIndex){
       for (var i = 0; i< seats.length;i++){
           if (i === excludeIndex) continue
           var op = seats[i].op;
           if (op.canHu || op.canGang || op.canPeng || op.canChi) return true
       }
       return false
    }

    getIndexByUserId(seats,userId){
        var ids = seats.map((s)=>{return s.userId});

        var index = ids.indexOf(userId);
        if (index === -1){
            Log.error('getIndexByUserId index is invalid')
            return 
        }

        return index;
    }

    fapai(roomId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('fapai roominfo is null')
            return;
        }
        var turn = roomInfo.turn;
        var nextIndex = this.getNextChuPaiIndex(roomInfo.seats,turn);
        roomInfo.turn = nextIndex;
        this.getNextPaiIncludeHua(roomInfo);
  
       this.updateTable(roomId);
    }

    //开始的时候 更新桌面的信息
    updateTable(roomId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('no find roominfo in updateTable')
            return 
        }
        Room.broacastInRoom('update_table',roomId,roomInfo)
    }

    updateOneTable(roomId,userId){
        if (!userId || !roomId){
            Log.error('param is error',userId,roomId)
            return;
        }

        var roomInfo = Room.getRoomInfo(roomId)
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

     //未开始的时候，更新人员状态
    updatePepoleStatus(roomId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('update_pepole_status',roomId,roomInfo)
    }


    
    //通知新的人进来了，只是要求出个提示语
    notifyNewUserLogin(roomId,userId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('new_user_login_notify',roomId,userId,userId)
    }


    //通知是否有操作
    notifyOperation(seats){
        var ret = false;
        for (var item of seats){
            var userId = item.userId;
            var hasOp = false;
            var op = item.op
            if (op.canHu || op.canChi || op.canGang || op.canPeng){
                hasOp = true;
            }
            if (hasOp){
                var socket = User.getSocketByUser(userId)
                if (!socket){
                    Log.error('sendOperation get socket is null',userId);
                    return;
                }
                ret = true;
                socket.emit('op_notify',{op})
            }
        }
        return ret;
    }

    //通知前端操作的结果，仅供特效自体和声音播放，不设计pai的排序
    notifyOperationAction(roomId,operationResult,userId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('op_action_notify',roomId,operationResult,[userId])
    }

    notifyChupaiAction(roomId,operationResult,userId){
        var roomInfo = Room.getRoomInfo(roomId)
        if (!roomInfo){
            Log.error('no find roominfo in updateSeatStatus')
            return 
        }   

        Room.broacastInRoom('chupai_action_notify',roomId,operationResult,[userId])
    }

    checkCanTingPai(roomInfo,seat){
        if (!roomInfo || seat){
            Log.error('roomInfo is null in checkCanTingPai')
            return
        }
   

        for (var i = 1; i< 10;i++){
            if (countMap[i]){
                countMap[i]++;
            }else{
                countMap[i] = 1;
            }
            this.checkIsHu(seat)
        }
    }

    checkIsHu(seat){
        var countMap = seat.countMap;
        //先拿出将牌
        for (var key in countMap){
            var count = countMap[key];
            if (count && count >= 2){
                var old = count;
                countMap[key] -=2;
                var ret = this.checkSingleTingPai(countMap,11,19);
                if (ret){
                    seat.tingMap.push({
                        value:key
                    })
                }

                countMap[key] = old;
            }
        }
    }

    //除去将牌后,每种类型的牌是否可以胡了
    checkSingleTingPai(countMap,start,end){
        var selected = -1;
        var cc = 0;
       for (var key in countMap){
           cc = countMap[key]
            if (cc && start<=key && end>=key){
                selected = key;
                break;
            }
       } 

       if (selected !== -1){
           return true;
       }

        //否则，进行匹配
        if(cc === 3){
            //直接作为一坎
            countMap[selected] = 0;
            var ret = this.checkSingleTingPai(seatData,start,end);
            //立即恢复对数据的修改
            countMap[selected] = c;
            if(ret){
                return true;
            }
        }
        else if(cc === 4){
            //直接作为一坎
            countMap[selected] = 1;
  
            var ret = this.checkSingleTingPai(seatData,start,end);
            //立即恢复对数据的修改
            countMap[selected] = cc;
            //如果作为一坎能够把牌匹配完，直接返回TRUE。
            if(ret){
                return true;
            }
        }

        //接下来去除顺子

        var matched = true;
        var v = selected % 9;
        if(v < 2){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected - 2 + i;
                var cc = seatData.countMap[t];
                if(cc == null){
                    matched = false;
                    break;
                }
                if(cc == 0){
                    matched = false;
                    break;
                }
            }		
        }
    
    
        //匹配成功，扣除相应数值
        if(matched){
            seatData.countMap[selected - 2] --;
            seatData.countMap[selected - 1] --;
            seatData.countMap[selected] --;
            var ret = checkSingle(seatData);
            seatData.countMap[selected - 2] ++;
            seatData.countMap[selected - 1] ++;
            seatData.countMap[selected] ++;
            if(ret == true){
                debugRecord(selected - 2);
                debugRecord(selected - 1);
                debugRecord(selected);
                return true;
            }		
        }
    
        //分开匹配 A-1,A,A + 1
        matched = true;
        if(v < 1 || v > 7){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected - 1 + i;
                var cc = seatData.countMap[t];
                if(cc == null){
                    matched = false;
                    break;
                }
                if(cc == 0){
                    matched = false;
                    break;
                }
            }		
        }
    
        //匹配成功，扣除相应数值
        if(matched){
            seatData.countMap[selected - 1] --;
            seatData.countMap[selected] --;
            seatData.countMap[selected + 1] --;
            var ret = checkSingle(seatData);
            seatData.countMap[selected - 1] ++;
            seatData.countMap[selected] ++;
            seatData.countMap[selected + 1] ++;
            if(ret == true){
                debugRecord(selected - 1);
                debugRecord(selected);
                debugRecord(selected + 1);
                return true;
            }		
        }
        
        
        //分开匹配 A,A+1,A + 2
        matched = true;
        if(v > 6){
            matched = false;
        }
        else{
            for(var i = 0; i < 3; ++i){
                var t = selected + i;
                var cc = seatData.countMap[t];
                if(cc == null){
                    matched = false;
                    break;
                }
                if(cc == 0){
                    matched = false;
                    break;
                }
            }		
        }
    
        //匹配成功，扣除相应数值
        if(matched){
            seatData.countMap[selected] --;
            seatData.countMap[selected + 1] --;
            seatData.countMap[selected + 2] --;
            var ret = checkSingle(seatData);
            seatData.countMap[selected] ++;
            seatData.countMap[selected + 1] ++;
            seatData.countMap[selected + 2] ++;
            if(ret == true){
                debugRecord(selected);
                debugRecord(selected + 1);
                debugRecord(selected + 2);
                return true;
            }		
        }



        return false;


    }

}


module.exports = new Game();