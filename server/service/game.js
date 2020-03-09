
var User = require('./user')

class Game {
    constructor() {
    }

    //开始一局新的
    begin(roomInfo){
        this.initMjList(roomInfo.mjLists);
        this.shuffle(roomInfo.mjLists)
        this.initEveryOnePai(roomInfo)
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
            seats[j].holds = (seats[j].holds).concat(this.getNextPai(mjLists))
        }

        seats[zhuangIndex].holds = (seats[zhuangIndex].holds).concat(this.getNextPai(mjLists)); //庄家再拿一张牌
    
        for (var i = 0;i < seats.length;i++){
            //将花色拿出来
            for (var k = 0; k < seats[i].holds.length;k++){
                while(seats[i].holds[k] >= 41 &&  seats[i].holds[k]<= 48){
                    seats[i].huas.push(seats[i].holds[k])
                    var nextPai = (this.getNextPai(mjLists))[0];
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
        return mjLists.splice(0,len)
    }

    getNextPaiIgnoreHua(mjLists){
        var huas = [];
        var pai = this.getNextPai(mjLists)

        while(this.checkIsHua(pai)){
            huas.push(pai);
            pai = this.getNextPai(mjLists);
        }

        return {
            huas,
            pai
        }
    
    }

    checkIsHua(pai){
        if (pai >= 41 && pai<= 48) return true;
        return false;
    }

    // 检查是否可以杠
    
    checkCanGang(seatData,pai){
        var count = seatData.countMap[pai];
        if(count && count >= 3){
            seatData.canGang = true;
            seatData.canPeng = true
        }
    }

    checkCanPeng(seatData,pai){
        var count = seatData.countMap[pai];
        if(count && count >= 2){
            seatData.canPeng = true
        }
    }

    checkCanHu(seatData,pai){
        if (seatData.tingMap[pai]){
            seatData.canHu = true;
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
            op.chiList.push([superPrev,prev,pai]);
        }

        //A-1 A A+1
        if (this.checkPaiInRange(prev,range) && this.checkPaiInRange(next,range) && countMap[prev] && countMap[next]){
            op.canChi = true;
            op.chiList.push([prev,pai,next]);
        }

        //A A+1 A+2
        if (this.checkPaiInRange(superNext,range) && this.checkPaiInRange(next,range) && countMap[superNext] && countMap[next]){
            op.canChi = true;
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

        if (pai >= 31 && pai <= 38){
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

    sendOperation(seats,pai){
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
                op.pai = pai; //操作的牌
                socket.emit('op_notify',{op})
            }
        }
        return ret;

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

    fapai(roomInfo){
        if (!roomInfo){
            Log.error('fapai roominfo is null')
            return;
        }
        var turn = roomInfo.turn;
        var nextIndex = this.getNextChuPaiIndex(roomInfo.seats,turn);

        var nextUserId = seats[nextIndex].userId;
        var nextSocket = User.getSocketByUser(nextUserId);
        var list = Game.getNextPaiIgnoreHua(roomInfo.mjLists);

        if (list.huas.length){
            nextSocket.emit('get_huas',{turn:nextIndex,huas:list.huas})
        }

        Room.broacastInRoom('zhuapai',roomId,{pai:list.pai,turn:nextIndex});

        roomInfo.turn = nextIndex;
    }
}


module.exports = new Game();