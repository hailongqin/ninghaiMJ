
var CONST  = require('./const');

function generateRoomId(){
    var roomId = "";
    for(var i = 0; i < 6; ++i){
        roomId += Math.floor(Math.random()*10);
    }
    return roomId;
}

function generateUserId(){
    var userId = "";
    for(var i = 0; i < 10; ++i){
        userId += Math.floor(Math.random()*10);
    }
    return userId;
}


function checkIsFengResult(pai){
    return CONST.FENGPAILISTS.indexOf(pai) !== -1
}

function checkIsMySelfFengpai(pai,seat){
    CONST.BIGFENGLISTS.indexOf(key) !== -1 || (pai - 31) === seat.fengIndex
}

function calcPengResult(pai,seat,perCount){
    if (!checkIsFengResult(pai)){
        seat.huShu += perCount;
    }else{
        seat.huShu += 2*perCount;
        if (checkIsMySelfFengpai(pai,seat)){
            seat.fanShu*=2;
        }
    }
}

function calcGangResult(pai,seat){
    if (checkIsFengResult(pai)){
        seat+=32;
        if (checkIsMySelfFengpai(pai,seat)){
            seat.fanShu *=2;
        }
    }else{
        seat+=16
    }
}

//获取手牌的fanshu
function setHoldsHuShu(seat){
    for (var _key in seat.countMap){
        var key = parseInt(_key);
        if (seat.countMap(key) >= 3){
            calcPengResult(key,seat,4)
        }
    }
}

//获取持牌的fanshu
function setChisHuShu(seat){
    var chis = seat.chis;
    var lists = chis.filter((c)=>{
        return c.type !== 'chi'
    })

    for (var item of lists){
        if (item.type === 'peng'){
            calcPengResult(item.pai,seat,2)
        }
        if (item.type === 'gang'){
            calcGangResult(item.pai,seat);
        }
    }
}


function setHuasHuShu(seat){
    var huas = seat.huas;
    for (var item of huas){
        seat.huShu += 4;
        if ((item-41) === seat.fengIndex || (item-45) === seat.fengIndex){
            seat.fanShu *= 2
        }
    }
}



function checkIsMySelfIndex(myIndex,compareIndex){
    return myIndex === compareIndex;
}

function checkIsLeftIndex(myIndex,compareIndex,seats){
    var ret = false;
    console.log(seats);
    if (myIndex > compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
    if (compareIndex === seats.length - 1 && myIndex === 0 && seats.length === 4) ret = true;
    return ret;
}

function checkIsRightIndex(myIndex,compareIndex,seats){
    var ret = false;
    if (myIndex < compareIndex && Math.abs(myIndex -compareIndex) === 1)   ret = true;
    if (myIndex === seats.length - 1 && compareIndex === 0 && seats.length === 4) ret = true;
    return ret; 
}

function checkIsUpIndex(myIndex,compareIndex,seats){
    if (Math.abs(myIndex - compareIndex) === 2) return true;
    return false;
}

module.exports = {
    generateRoomId,
    generateUserId,
    checkIsMySelfIndex,
    checkIsLeftIndex,
    checkIsRightIndex,
    checkIsUpIndex
}