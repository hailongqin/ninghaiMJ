
var CONST  = require('./const');


class Util{

     generateSmsCode(){
        var code = "";
        for(var i = 0; i < 4; ++i){
            code += Math.floor(Math.random()*10);
        }
        return code; 
    }
    
     generateRoomId(){
        var roomId = "";
        for(var i = 0; i < 6; ++i){
            roomId += Math.floor(Math.random()*10);
        }
        return roomId;
    }
    
     generateUserId(){
        var userId = "";
        for(var i = 0; i < 10; ++i){
            userId += Math.floor(Math.random()*10);
        }
        return userId;
    }
    
     getCountMap(lists){
        var countMap = {};
        if (!lists || !lists.length){
            Log.error('getCountMap lists is null',holds)
            return;
        }
    
        countMap =  lists.reduce(function(map, word) {
            map[word] = ++map[word] || 1 // increment or initialize to 1
            return map
          }, {}) 
    
    
    
        return countMap;
    }
    
     checkIsFengResult(pai){
        return CONST.FENGPAILISTS.indexOf(pai) !== -1
    }
    
     checkIsMySelfFengpai(pai,seat){
        return CONST.BIGFENGLISTS.indexOf(pai) !== -1 || (pai - 31) === seat.fengIndex || (pai - 41) === seat.fengIndex || (pai - 45) === seat.fengIndex
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
    
     composeAllPai(seat){
        var list = [];
        var countMap = getCountMap(seat.holds);
    
        for (var _key in countMap){
            var key = parseInt(_key);
            if (countMap[key] >= 3){
                list.push({
                    type:'peng',
                    pai:key
                })
            }
        }
        seat.chis.forEach((c)=>{
            if(c.type !== 'chi')
                list = list.concat(c)
        })
        return list
    }
    
     calcuHuSeatFanshu(seat){
        var hasHuaFanshu = false;
        for (var hua of seat.huas){
            if (checkIsMySelfFengpai(hua,seat)){
                seat.fanShu *= 2;
                hasHuaFanshu = true;
            }
        }
    
        var list = composeAllPai(seat);
    
        //检查是不是一色
        var match = true;
    
        //检查是不是对对胡
    
        for (var i = 0; i < list.length;i++){
            if (checkIsMySelfFengpai(list[i].pai,seat)){
                seat.fanShu *= 2;
            }
        }
    }
    
     caclOtherSeatFanshuAndHushu(seats,huIndex){
    
        for (var k = 0; k < seats.length;k++){
            if (k === huIndex) continue;
            var seat = seats[k];
            var list = composeAllPai(seat);
    
            for (var i = 0; i < list.length;i++){
                if (list[i].type === 'peng'){
                    if (checkIsFengResult(list[i].pai)){
                        seat.huShu+=4
                        if (checkIsMySelfFengpai(list[i].pai,seat)) seat.fanShu *= 2;
                    }else{
                        seat.huShu+=2
                    }
                }else if (list[i].type === 'gang'){
                    if (checkIsFengResult(list[i].pai)){
                        seat.huShu+= list[i].fromTurn === i?32:16
                        if (checkIsMySelfFengpai(list[i].pai,seat)) seat.fanShu *= 2;
                    }else{
                        seat.huShu+= list[i].fromTurn === i?16:8
                    } 
                }
            }
    
            for (var hua of seat.huas){
                seat.huShu += 4;
                if (checkIsMySelfFengpai(hua,seat)){
                    seat.fanShu *= 2;
                }
            }
            var totalHushu = seat.huShu * seat.fanShu;
            seat.huShu = Math.ceil(totalHushu/10)*10;
        }
    
    }
    
    
    
     checkIsMySelfIndex(myIndex,compareIndex){
        return myIndex === compareIndex;
    }
    
     checkIsLeftIndex(myIndex,compareIndex,seats){
        var ret = false;
        if (myIndex > compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
        if (compareIndex === seats.length - 1 && myIndex === 0 && seats.length === 4) ret = true;
        return ret;
    }
    
     checkIsRightIndex(myIndex,compareIndex,seats){
        var ret = false;
        if (myIndex < compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
        if (myIndex === seats.length - 1 && compareIndex === 0 && seats.length === 4) ret = true;
        return ret; 
    }
    
     checkIsUpIndex(myIndex,compareIndex,seats){
        if (Math.abs(myIndex - compareIndex) === 2) return true;
        return false;
    }
    
     checkUserIsValid(seats,userId){
    
        for (var item of seats){
            if (item.userId === userId) return true;
        }
    
        return false;
    
    }

    checkPhoneIsValid(phone) {
        let reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
        return reg.test(phone)
      }
}


function test(roomInfo){
    // var seats = roomInfo.seats;
    // var all = roomInfo.mjLists;
    // for (var i = 0; i < seats.length;i++){
    //     all = all.concat(seats[i].holds).concat(seats[i].folds).concat(seats[i].huas);
    // }

    // var countMap =  all.reduce(function(map, word) {
    //     map[word] = ++map[word] || 1 // increment or initialize to 1
    //     return map
    //   }, {}) 

    //   for (var key in countMap){
    //       if ((parseInt(key) <=48 && parseInt(key)>=41) && countMap[key] !== 1){
    //           console.log('mjLists total is error',all,key,countMap[key])
    //           LOG.error('mjLists total is error',all,key,countMap[key])
    //           return;
    //       }else if ( countMap[key] !== 4){
    //         console.log('mjLists total is error',all,key,countMap[key])
    //         LOG.error('mjLists total is error',all,key,countMap[key])
    //       }
    //   }

    //   console.log('mjlists total is OK')


}

module.exports = new Util();