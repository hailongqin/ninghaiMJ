
var Util = require('./server/utils/util')
var CONST = require('./server/utils/const')

var roomInfo = {
    prevHuIndex:0,
    conf:{
        type:0
    },
    zhuangIndex:1,
    seats:[{
        holds:[37,37,37,14,14],
        chis:[{
            type:'chi',
            pai:3,
            list:[1,2,3]
        },
        {
            type:'chi',
            pai:27,
            list:[27,28,29]
        },
        {
            type:'peng',
            pai:25,
            list:[25,25,25]
        }],
        huas:[],
        fromHuSeatScore:0,
        fromOtherScore:0,
        xieScore:0,
        totalScore:0,
        fengIndex:0,
        huShu:0,
        fanShu:1,
        xie:{}
    },{
        holds:[33,33,33,34,34,34,34,21,21],
   
        chis:[{type:'peng',pai:35},{type:'gang',fromTurn:1,pai:32}],
        huas:[42],
        fromHuSeatScore:0,
        fromOtherScore:0,
        xieScore:0,
        totalScore:0,
        fengIndex:1,
        huShu:0,
        fanShu:1,
        xie:{
            action:true,
            score:100
        }
    },
    {
        holds:[21,21,22,22,23,24,25],
   
        chis:[],
        huas:[43],
        fromHuSeatScore:0,
        fromOtherScore:0,
        xieScore:0,
        totalScore:0,
        fengIndex:2,
        huShu:0,
        fanShu:1,
        xie:{
            action:true,
            score:200
        }
    }]
}

calcHuShu(roomInfo,0,0)

function calcHuShu(roomInfo,index,fromTurn){
    var conf = roomInfo.conf;
    var type = conf.type;
    var seats = roomInfo.seats;
    var zhuangIndex = roomInfo.zhuangIndex;
    var baseScore = CONST.MJ_TYPE[type].baseScore;
    var xieList = roomInfo.seats[index];

    if (conf.type === 0){
        var huSeat = seats[index];   
        Util.calcuHuSeatFanshu(huSeat)
        var huFanshu = huSeat.fanShu = huSeat.fanShu > 8?8:huSeat.fanShu
        huSeat.totalhucishu++;
        if (huFanshu === 8){
            huSeat.lazicishu++
        }
        if (huFanshu === 4){
            huSeat.shuangtaicishu++;
        }
        if (huFanshu === 1){
            huSeat.pinghucishu++;
        }

        if (index === fromTurn){
            huSeat.fromOtherScore = huSeat.fanShu*((seats.length - 1)*baseScore);
        }else{
            huSeat.fromOtherScore = huSeat.fanShu*(1*baseScore + (seats.length - 2)*(baseScore/2))
        }
        if (huSeat.xie && huSeat.xie.action){ //把别人卸了
            var prevHuIndex = roomInfo.prevHuIndex;
            huSeat.xieScore += huSeat.xie.score;
            seats[prevHuIndex].xieScore -= huSeat.xie.score
        }


        //计算其他人的胡数
       Util.caclOtherSeatFanshuAndHushu(seats,index);

        //和非胡的人进行比较
        for (var i = 0; i < seats.length;i++){
                if (i === index) continue;
               var xie = seats[i].xie;
                if (xie.action && index === roomInfo.prevHuIndex){ //卸着别人
                    seats[i].xieScore -= xie.score;
                    seats[index].xieScore += xie.score;
                }

                if (i === fromTurn || index === fromTurn){
                    seats[i].fromHuSeatScore -= seats[index].fanShu*baseScore
                }else{
                    seats[i].fromHuSeatScore -= seats[index].fanShu*(baseScore/2)
                }

            for (var j = i+1;j < seats.length;j++){
                if (j === index) continue;
                var diff = seats[i].huShu - seats[j].huShu
                if (i === zhuangIndex || j === zhuangIndex){
                    var diffZhengshu = Math.abs(diff);
                    var unit = diff < 0?-1:1;
                    while(diffZhengshu > 0){
                        seats[i].fromOtherScore+=((baseScore/2)*unit);
                        seats[j].fromOtherScore+=((baseScore/2)*(-unit));
                        diffZhengshu -= 30;
                    }
                }else {
                    var diffZhengshu = Math.abs(diff);
                    var unit = diff < 0?-1:1;
                    while(diffZhengshu > 0){
                        seats[i].fromOtherScore+=((baseScore/2)*unit);
                        seats[j].fromOtherScore+=((baseScore/2)*(-unit));
                        diffZhengshu -= 50;
                    }
                }
    
            }
        }

         //将分数加到总额里
        for (var i = 0; i < seats.length;i++){
            seats[i].totalScore += (seats[i].xieScore+seats[i].fromOtherScore+seats[i].fromHuSeatScore);
            console.log('total current'+i,seats[i].totalScore,seats[i].xieScore,seats[i].fromOtherScore,seats[i].fromHuSeatScore)
        }
   
}

    return;
}