
var Util = require('./server/utils/util')
var CONST = require('./server/utils/const')

var roomInfo = {
    conf:{
        type:0
    },
    zhuangIndex:1,
    seats:[{
        holds:[1,1,1,2,2,2,4,4,5,5,6],
        chis:[{
            type:'gang',
            pai:36
        },
        {
            type:'peng',
            pai:31
        }],
        huas:[41,45],
        currentScore:0,
        totalScore:0,
        fengIndex:0,
        huShu:0,
        fanShu:1
    },{
        holds:[33,33,33,34,34,34,34,21,21],
   
        chis:[{type:'peng',pai:35},{type:'gang',fromTurn:1,pai:32}],
        huas:[42],
        currentScore:0,
        totalScore:0,
        fengIndex:1,
        huShu:0,
        fanShu:1
    },
    {
        holds:[21,21,22,22,23,24,25],
   
        chis:[],
        huas:[43],
        currentScore:0,
        totalScore:0,
        fengIndex:2,
        huShu:0,
        fanShu:1
    }]
}

for (var item of roomInfo.seats){
    item.countMap = Util.getCountMap(item.holds)
}

calcHuShu(roomInfo,0,0);

function calcHuShu(roomInfo,index,fromTurn){
    var conf = roomInfo.conf;
    var type = conf.type;
    var seats = roomInfo.seats;
    var zhuangIndex = roomInfo.zhuangIndex;
    var baseScore = CONST.MJ_TYPE[type].baseScore;

    if (conf.type === 0){

        var huSeat = seats[index];

        //检查是不是特殊3摊牌
        Util.calcuHuSeatFanshu(huSeat)
        
        console.log('胡的人',huSeat.huShu,huSeat.fanShu)
        huSeat.fanShu = huSeat.fanShu > 8?8:huSeat.fanShu
      
        
        if (index === fromTurn){
            huSeat.currentScore = huSeat.fanShu*((seats.length - 1)*baseScore);
        }else{
            huSeat.currentScore = huSeat.fanShu*(1*baseScore + (seats.length - 2)*(baseScore/2))
        }
    
        console.log('胡的人',huSeat.totalScore,huSeat.currentScore)


        //计算其他人的胡数
       Util.caclOtherSeatFanshuAndHushu(seats,index);

        //和非胡的人进行比较
        for (var i = 0; i < seats.length;i++){
                if (i === index) continue;
               
                if (i === fromTurn || index === fromTurn){
                    seats[i].currentScore -= seats[index].fanShu*baseScore
                }else{
                    seats[i].currentScore -= seats[index].fanShu*(baseScore/2)
                }

             console.log('其他人'+i,seats[i].huShu,seats[i].fanShu,seats[i].currentScore)
            for (var j = i+1;j < seats.length;j++){
                console.log('其他人'+j,seats[j].huShu,seats[j].fanShu,seats[j].currentScore)
                var diff = seats[i].huShu - seats[j].huShu
                if (i === zhuangIndex || j === zhuangIndex){
                    var diffZhengshu = Math.abs(diff);
                    var unit = diff < 0?-1:1;
                    while(diffZhengshu > 0){
                        seats[i].currentScore+=((baseScore/2)*unit);
                        seats[j].currentScore+=((baseScore/2)*(-unit));
                        diffZhengshu -= 30;
                    }
                }else {
                    var diffZhengshu = Math.abs(diff);
                    var unit = diff < 0?-1:1;
                    while(diffZhengshu > 0){
                        seats[i].currentScore+=((baseScore/2)*unit);
                        seats[j].currentScore+=((baseScore/2)*(-unit));
                        diffZhengshu -= 50;
                    }
                }

                console.log('其他人'+j,seats[j].currentScore) 

            }
            console.log('其他人'+i,seats[i].currentScore)
        }

         //将分数加到总额里
        for (var i = 0; i < seats.length;i++){
            seats[i].totalScore += seats[i].currentScore;
            console.log(seats[i].totalScore)
        }
   
}



    return;
}
