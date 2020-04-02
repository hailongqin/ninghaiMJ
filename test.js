
var Util = require('./server/utils/util')
var CONST = require('./server/utils/const')

//var Game = require('./server/service/game')

var roomInfo = {
    prevHuIndex:0,
    conf:{
        type:0
    },
    zhuangIndex:1,
    seats:[{
        userId:1,
        holds:[37,37,37,14,14],
        folds:[],
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
        xie:{},
        op:{
            canHu:true,
            fromTurn:3,
            pai:3,
        }
    },{
        userId:2,
        holds:[33,33,33,34,34,34,34,21,21],
   
        chis:[{type:'peng',pai:35},{type:'gang',fromTurn:1,pai:32}],
        huas:[42],
        folds:[],
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
        },
        op:{
            canHu:true,
            fromTurn:3,
            pai:3,
        }
    },

    {
        userId:3,
        holds:[33,33,33,34,34,34,34,21,21],
   
        chis:[{type:'peng',pai:35},{type:'gang',fromTurn:1,pai:32}],
        huas:[42],
        folds:[],
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
        },
        op:{
            canHu:true,
            fromTurn:3,
            pai:3,
        }
    },
    {
        userId:4,
        holds:[21,21,22,22,23,24,25],
        folds:[3],
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
        },
        op:{}
    }]
}

testhu(roomInfo,3,2)

setTimeout(() => {
    testhu(roomInfo,2,1)
}, 2*1000);

setTimeout(() => {
    testhu(roomInfo,1,0)
}, 4*1000);

function testhu(roomInfo,userId,index){


    if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

    var seats = roomInfo.seats;
    // var index = Game.getIndexByUserId(seats,userId);
    var seat = seats[index];
    var pai = seat.op.pai;

    if (!seat.op.canHu) return;
    var fromTurn = seat.op.fromTurn; //0

    console.log(index,fromTurn);
    if (index !== fromTurn){ //判断jiehu
        var indexLists = seats.map((s,id)=>{return id});
        indexLists = indexLists.concat(indexLists);
        console.log('indelists',indexLists)
        var start = indexLists.indexOf(fromTurn);
        var end = indexLists.lastIndexOf(index);
        var betweenList = [];
        for (var k = start + 1;k < end;k++){
            betweenList.push(indexLists[k]);
        }
        
        console.log('betweenlist',betweenList);

        if (betweenList.length){
            waitInterval(betweenList);
            function waitInterval(betweenList){
                
                var waitTimer = setInterval(()=>{
                    var hasJiehU = false
                    for (var j = 0; j < betweenList.length;j++){
                        let seatIndex = betweenList[j];
                        if (seats[seatIndex].op.canHu){
                            hasJiehU = true;
                            break;
                        }
                    }
                    if (!hasJiehU){
                        console.log('waitTimer',waitTimer,betweenList)
                        clearInterval(waitTimer)
                        if (!seat.op.canHu) return;
                        seat.holds.unshift(pai);
                        seats[fromTurn].folds.splice(-1,1);
                        seats[fromTurn].fangpaocishu++;
                        console.log('go hu index ',index)
                        huHandle();
                    }

                },20)
            }
           
        }else{
            seat.holds.unshift(pai);
            seats[fromTurn].folds.splice(-1,1);
            seats[fromTurn].fangpaocishu++;
            huHandle();
        }
    }else{
        seat.zomocishu++;
        huHandle();
    }


    function huHandle(){
        for (var i = 0; i < roomInfo.seats.length;i++){
            roomInfo.seats[i].op = {};
        }
        return;
        Game.clearOperation(roomInfo);

        Game.calcHuShu(roomInfo,index,fromTurn);//计算hushu

        for (var item of seats){
            item.ready = false
        }

        roomInfo.currentHuIndex = index;
     
        Game.notifyOperationAction(roomInfo,{type:'hu',seats,index:index,zhuangIndex:roomInfo.zhuangIndex});
        if (roomInfo.count >= roomInfo.conf.jushu){
            roomInfo.gameStatus = CONST.GAME_STATUS_END;
            Room.setRoomInfoToDB(roomInfo);
            Game.deleteStatus(roomInfo);
            return;
        }

        roomInfo.gameStatusOneOver = true;
        var timer = setTimeout(() => {
                Timer.deleteTimer(roomId);
                 //自动开局的，把卸的人加上钱
                 for (var i = 0; i < seats.length;i++){
                     if (roomInfo.zhuangIndex === roomInfo.currentHuIndex && i !== roomInfo.zhuangIndex){
                         if (seats[i].xie.action){
                             seats[i].xie.score += Math.abs(seats[i].fromHuSeatScore)
                         }
                     }
                 }

                Game.begin(roomInfo);
            }, 10*1000);

        Timer.saveTimer(roomId,timer)
    }

}