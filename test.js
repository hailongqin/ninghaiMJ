
var Util = require('./server/utils/util')
// var CONST = require('./server/utils/const')

// var roomInfo = {
//     conf:{
//         type:0
//     },
//     zhuangIndex:1,
//     seats:[{
//         holds:[1,1,1,2,2,2,4,4,5,5,6],
//         chis:[{
//             type:'gang',
//             pai:36
//         },
//         {
//             type:'peng',
//             pai:31
//         }],
//         huas:[41,45],
//         currentScore:0,
//         totalScore:0,
//         fengIndex:0,
//         huShu:0,
//         fanShu:1
//     },{
//         holds:[33,33,33,34,34,34,34,21,21],
   
//         chis:[{type:'peng',pai:35},{type:'gang',fromTurn:1,pai:32}],
//         huas:[42],
//         currentScore:0,
//         totalScore:0,
//         fengIndex:1,
//         huShu:0,
//         fanShu:1
//     },
//     {
//         holds:[21,21,22,22,23,24,25],
   
//         chis:[],
//         huas:[43],
//         currentScore:0,
//         totalScore:0,
//         fengIndex:2,
//         huShu:0,
//         fanShu:1
//     }]
// }

var seat = {
    holds:[2,2,2,21,21,21,7,7],
    chis:[{
        type:'gang',
        pai:36,
        list:[36,36,36]
    },
    {
        type:'peng',
        pai:31,
        list:[31,31,31]
    }],
    huas:[],
    currentScore:0,
    totalScore:0,
    fengIndex:0,
    huShu:0,
    fanShu:1,
}

seat.countMap = Util.getCountMap(seat.holds);
Util.calcuHuSeatFanshu(seat)
console.log(seat.fanShu)