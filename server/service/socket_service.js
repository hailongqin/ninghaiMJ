
var conf = require('../config').config;

var express = require('express');

var app = express();

var Util = require('../utils/util');

var Room  = require('./room')

var Game = require('./game')

var User = require('./user')

var Log = require('../utils/log');

var CONST = require('../utils/const');

var Timer = require('./timer')

exports.start = function(){
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    io.on('connection',function(socket) {
        socket.on(CONST.CLIENT_LOGIN,function(data){
            var roomId = data.roomId;
            var userId = data.userId;
            socket.roomId = roomId;
            socket.userId = userId;
            console.log('receive login')
            if (!userId || !roomId){
                Log.error('socket login param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=> {
                if (err) {
                    return;
                }

                User.bindUserAndSocket(userId,socket);
                
                if (roomInfo.roomStatus === CONST.ROOM_STATUS_DISMISS){
                    socket.emit(CONST.SERVER_ROOM_STATUS_NOTIFY, CONST.ROOM_STATUS_DISMISS)
                    return
                }

                if (roomInfo.gameStatus === CONST.GAME_STATUS_END || roomInfo.gameStatus === CONST.GAME_STATUS_LIU_JU){
                    socket.emit(CONST.SERVER_GAME_OVER,roomInfo)
                    return;
                }

                var timer = Timer.getTimerById(roomId);

                if (!timer && roomInfo.gameStatus === CONST.GAME_STATUS_NO_START){
                    timer = setTimeout(() => {
                        roomInfo.roomStatus = CONST.ROOM_STATUS_DISMISS;
                        Room.setRoomInfoToDB(roomInfo);
                        Timer.deleteTimer(roomId)
                        Game.sendRoomStatus(roomId, CONST.ROOM_STATUS_DISMISS)
                        Room.deleteRoom(roomInfo.roomId);
                    },CONST.ROOM_DISMISS_EXPIERED_TIME); 

                    Timer.saveTimer(roomId,timer);
                }


                var seats = roomInfo.seats;//坐下的人
                var seatUserIds = seats.map((s)=>{return s.userId});
                var seatIndex = seatUserIds.indexOf(userId) 

                if (seatIndex !== -1){ //已经是坐下的人,断线重连
                    var mySeat = seats[seatIndex];
                    mySeat.onLine = true;
                    Game.updatePepoleStatus(roomInfo)
                    Game.sendRoomBaseInfo(roomInfo,userId);
                    if (roomInfo.gameStatus === CONST.GAME_STATUS_START){ //游戏已经开始了
                        socket.emit(CONST.SERVER_GAME_START_NOTIFY,roomInfo);
                       if (Game.checkMyselfHasOp(mySeat)){
                           Game.notifyOneSeatOperation(mySeat);
                       }else if (roomInfo.turn === seatIndex){
                           Game.notifyChupai(roomInfo);
                       }
                    }
                    return;
                }
                var players = roomInfo.players;
                var userName = data.userInfo && data.userInfo.userName?data.userInfo.userName:''

                players.push({
                    userId,
                    userInfo:data.userInfo || {},
                    
                })
                Game.notifyTip(roomInfo,'玩家'+userName+'进入房间');
                Room.addAndUpdateRoom(roomId,roomInfo);
                Game.sendRoomBaseInfo(roomInfo,userId);
                socket.emit(CONST.SERVER_GAME_UPDATE_PEOPLE_STATUS,{seats:roomInfo.seats,players:roomInfo.players})
                if (roomInfo.gameStatus === CONST.GAME_STATUS_NO_START && seats.length !== roomInfo.conf.userCount)
                    Game.notifyCanSetReady(userId);
                else{
                    socket.emit(CONST.SERVER_GAME_START_NOTIFY,roomInfo);
                }
            })
     
        })
        socket.on(CONST.CLIENT_SET_READY, function (data) {
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    return;
                }
                Log.info('receive set_ready data is ',roomInfo)
                if (roomInfo.gameStart) return;

                var seats = roomInfo.seats;
                var conf = roomInfo.conf;
                var players = roomInfo.players;
                var seatUserIds = seats.map((s)=>{return s.userId});

                if (seatUserIds.indexOf(userId) !== -1){ //已经坐着了
                    Game.updatePepoleStatus(roomInfo); 
                    return;
                }

                if (seats.length >= conf.userCount){
                    Game.updatePepoleStatus(roomInfo);
                    return;
                }

                var seatOne = {
                    userId:userId,
                    userInfo:data && data.userInfo?data.userInfo:{},
                    onLine:true,
                    ready:true,
            
                    totalScore:0,
                    zimocishu:0,
                    fangpaocishu:0,
                    lazipaishu:0,
                    shuangtaicishu:0,
                    pinghucishu:0,
                    totalhucishu:0,
                    xie:{}
                }
                seats.push(seatOne);
                seatUserIds.push(userId);
                //同步观看者的人员，防止并发，这里不直接从players里删除
                roomInfo.players = players.filter((item) => {
                    return seatUserIds.indexOf(item.userId) === -1;
                })

              //  Room.broacastInRoom(CONST.SERVER_ROOM_NEW_USER_SET_READY,roomInfo.roomId,{index:seats.length - 1,roomInfo});
                Game.updatePepoleStatus(roomInfo);
                if (conf.userCount === seats.length){
                    roomInfo.gameStatus = CONST.GAME_STATUS_START;
                    Room.setRoomInfoToDB(roomInfo);
                    Timer.deleteTimer(roomId);
                    Game.syncStatus(roomInfo);
                    Game.begin(roomInfo);
                }
            });


        });

        socket.on(CONST.CLIENT_NEXT_JU_READY, function (data) {
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket set_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket set_ready get roominfo is error',err)
                    return;
                }
                //Log.info('receive game_ready data is ',roomInfo)

                console.log('net ju ready data is ',data)
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;
                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                seats[index].ready = true;

                if (roomInfo.gameStatus === CONST.GAME_STATUS_END){
                    Game.sendGameEnd(roomInfo);
                    return;
                } 

                if (!roomInfo.gameStatusOneOver) return; //已经开始了

                var currentXie = seats[index].xie;
                console.log('cuurenxie is ',currentXie)
                if (roomInfo.zhuangIndex === roomInfo.currentHuIndex && index !== roomInfo.zhuangIndex){ // 庄家胡了才可以卸
                    if (data.xie){
                        if (currentXie.action){
                            currentXie.score += Math.abs(seats[index].fromHuSeatScore)
                        }else{
                            currentXie.score =  Math.abs(seats[index].fromHuSeatScore)
                        }
                        currentXie.action = true
                    }else{
                        currentXie = {};
                    }
                }
               

                var allReady = true;
                for (var item of seats){
                    if (!item.ready){
                        allReady = false;
                        break;
                    }
                }
                Room.broacastInRoom(CONST.SERVER_GAME_USER_NEXT_JU_HAS_READY,roomInfo.roomId,{index:index,seats:roomInfo.seats})
                Log.info(Timer.timeList);
                if (allReady){
                    Timer.deleteTimer(roomId);
                    Game.begin(roomInfo);
                }
            })
        })
        socket.on(CONST.CLIENT_CANCEL_READY, function () {
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket cancel_ready param is error',roomId,userId)
                return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{

                if (err){
                    Log.error('socket cancel_ready get roominfo is error',err)
                    return;
                }
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                if (roomInfo.gameStatus === CONST.GAME_STATUS_START) return;

                var seats = roomInfo.seats;//坐下的人
                var players = roomInfo.players;
                var index = Game.getIndexByUserId(seats,userId);
                if (index !== null && index !== undefined){
                    var seat = seats[index];
                    roomInfo.seats = seats.filter((item) => {
                        return item.userId !== userId
                    })
    
                    players.push(seat);
                    Game.updatePepoleStatus(roomInfo);
                    Game.notifyCanSetReady(userId);
                }
            })
        })

        socket.on(CONST.CLIENT_CHUPAI_NOTIFY,function(data){
            console.log('receive chupai',data)
            var roomId = socket.roomId;
            var userId = socket.userId;
            var pai = data.pai;

            if (!userId || !roomId || !pai){
                Log.error('socket chupai param is error',roomId,userId,pai)
                return;
            }
            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('getRoomInfo chupai  is error',err)
                    return;
                }
                Log.info('receive chupai data is ',roomInfo)
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                //将牌从自己手中扣除
                var seats = roomInfo.seats;
                var seatsUserId = seats.map((s)=>{return s.userId});
                var seatIndex = seatsUserId.indexOf(userId);

                if (roomInfo.turn !== seatIndex){ //断线重连的时候，一方万一
                    return; //不是该人出
                }
                Game.notifyOperationAction(roomInfo,{type:'chupai',pai:pai})

                var holds = seats[seatIndex].holds;
                var folds = seats[seatIndex].folds;
                var index = holds.indexOf(pai);
                holds.splice(index,1);
                folds.push(pai);
                seats[seatIndex].lastChuPai = pai;

                seats[seatIndex].countMap[pai]--;
                Game.sortPai(holds);
                Game.checkCanTingPai(seats[seatIndex]);//检查自己是否可以停牌了


                var nextIndex = Game.getNextChuPaiIndex(seats,seatIndex);

                for (var i = 0;i < seats.length;i++){       
                    if (userId === seats[i].userId) continue;
                    if (seats[i].lastChuPai === pai) continue;
                    Game.checkCanHu(seats[i],pai,seatIndex)     // 检查是否有人胡
                    Game.checkCanGang(seats[i],pai,seatIndex)   // 检查是否有人杠
                    Game.checkCanPeng(seats[i],pai,seatIndex);
                    if (i === nextIndex){
                        Game.checkCanChi(seats[i],pai,seatIndex)   // 检查是否有人吃
                    }
                }

               var ret =  Game.notifyOperation(seats);
             
                if (ret){ //如果有操作的，则等待他们操作 
                    Game.updateTable(roomInfo); // 更新桌面
                    return 
                }else{ // 如果没有操作
                    Game.moveToNextTurn(roomInfo)
                    Game.fapai(roomInfo);
                }
              
            })
        })

         
        socket.on(CONST.CLIENT_HU_NOTIFY,(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;      
            if (!userId || !roomId){
                Log.error('socket gang param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket hu get roominfo is error',err)
                    return;
                }
              //  Log.info('receive hu data is ',roomInfo)
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
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
                                    clearInterval(waitTimer)
                                    if (!seat.op.canHu) return;
                                    seat.holds.unshift(pai);
                                    seats[fromTurn].folds.splice(-1,1);
                                    seats[fromTurn].fangpaocishu++;
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
         
            })  
        })

        
        socket.on(CONST.CLIENT_GANG_NOTIFY,(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;
            if (!userId || !roomId){
                Log.error('socket gang param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket gang get roominfo is error',err)
                    return;
                }
                Log.info('gang gang data is ',roomInfo)
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket penf getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];
                if (!mySeat.op.canGang) { //有人胡了可能，没得碰
                    return;
                }
                Game.waitOtherOperation(seats,index,'canGang',()=>{
                if (!mySeat.op.canGang) { //有人胡了可能，没得碰
                    return;
                }

                Game.notifyOperationAction(roomInfo,{type:'gang'})
                var myOp = mySeat.op;
                var gangPai = myOp.pai;
                var fromTurn = myOp.fromTurn;
                var where = myOp.where;
                var whereIndex = myOp.index;
                var chis = mySeat.chis;

                Game.clearOperation(roomInfo);
                Game.moveToNextTurn(roomInfo,index);
                //每人可以胡，就开始杠

                //来自碰的牌的杠
                if (where && where === 'folds'){
                    chis[whereIndex].type = 'gang';
                    chis[whereIndex].fromTurn = roomInfo.turn;
                    mySeat.countMap[gangPai] -= 1;
                }else{
                    var myHolds = mySeat.holds;

                    var count = 0;
                    var maxCount = fromTurn === index?4:3;
                    for (var i = 0; i < myHolds.length;i++){
                        if (myHolds[i] === gangPai){
                            myHolds.splice(i,1);
                            i--;
                            count++
                            if (count === maxCount){
                                break;
                            }
                        }
                    }
                    // 更新countMap
                    mySeat.chis.push({
                        type:'gang',
                        pai:gangPai,
                        fromTurn,
                        list:[gangPai,gangPai,gangPai,gangPai]
                    });
                    mySeat.countMap[gangPai] -=maxCount;
                }
                
     

                if (fromTurn !== index){ //如果不是自摸的杠
                    seats[fromTurn].folds.splice(-1,1)
                }

                Game.notifyOperationAction(seats,{type:'gang'});

                Game.checkIs3Tan(roomInfo,index)
                
                Game.fapai(roomInfo);
                })

             
            })
        })
            

        socket.on(CONST.CLIENT_PENG_NOTIFY,(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket peng param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket peng get roominfo is error',err)
                    return;
                }
                Log.info('receive peng data is ',roomInfo);
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket penf getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];
                if (!mySeat.op.canPeng) { //有人胡了可能，没得碰
                    return;
                }

                Game.waitOtherOperation(seats,index,'canPeng',()=>{

                    if (!mySeat.op.canPeng) { //有人胡了可能，没得碰
                        return;
                    }
                    Game.notifyOperationAction(roomInfo,{type:'peng'})
                    Game.moveToNextTurn(roomInfo,index);
                    //每人可以胡，就开始碰
                    var myOp = mySeat.op;
    
                    var pengPai = myOp.pai;
                    var fromTurn = myOp.fromTurn;
                    var myHolds = mySeat.holds;

                    Game.clearOperation(roomInfo);
    
                    var count = 0;
                    for (var i = 0; i < myHolds.length;i++){
                        if (myHolds[i] === pengPai){
                            myHolds.splice(i,1);
                            i--;
                            count++
                            if (count === 2){
                                break;
                            }
                        }
                    }
                    // 更新countMap
                    mySeat.chis.push({
                        type:'peng',
                        pai:pengPai,
                        list:[pengPai,pengPai,pengPai]
                    });
                    mySeat.countMap[pengPai] -=2;
                    seats[fromTurn].folds.splice(-1,1);
    
                    Game.updateTable(roomInfo);
                    Game.checkIs3Tan(roomInfo,index)
                    Game.notifyChupai(roomInfo)
                })
        

            })
        })

        socket.on(CONST.CLIENT_CHI_NOTIFY,(data)=>{

            console.log('receive chi data ',data)
            var roomId = socket.roomId;
            var userId = socket.userId;

            if (!userId || !roomId){
                Log.error('socket chi param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket chi get roominfo is error',err)
                    return;
                }
                Log.info('receive chi data is ',roomInfo)
                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId);
                if (index === undefined || index === null){
                    Log.error('socket chi getIndexByUserId is error',index)
                    return;
                }

                var mySeat = seats[index];

               Game.waitOtherOperation(seats,index,'canChi',()=>{
                
                if (!mySeat.op.canChi) { //有人胡碰杠了可能，没得碰
                    return;
                }

                //没人操作，则我来吃
                
                var op = mySeat.op;
                console.log(op)
                var chipai = op.pai;
                var chiIndex = data.chiIndex;
                var chiList = op.chiList[chiIndex];
                var fromTurn = op.fromTurn;
             

                Game.clearOperation(roomInfo);
                Game.moveToNextTurn(roomInfo); //轮到下一个人
                Game.notifyOperationAction(roomInfo,{type:'chi',index:roomInfo.turn}) //通知有人吃了
              
                var myHolds = mySeat.holds;
                var myChis = mySeat.chis;


                var opChiList = chiList.filter((c)=>{
                    return c !== chipai
                })

                //更新holds
                for (var i = 0; i< myHolds.length;i++){
                    var _cIndex = opChiList.indexOf(myHolds[i])
                    if (_cIndex !== -1){
                        mySeat.countMap[myHolds[i]]--;
                        myHolds.splice(i,1);
                        i--;
                        opChiList.splice(_cIndex,1)

                        if (opChiList.length === 0) break;
                    }
                }

                //更新chis
                myChis.push({
                    type:'chi',
                    list:chiList,
                    pai:chipai
                })

                var fromFolds = roomInfo.seats[fromTurn].folds
                fromFolds.splice(-1,1)

                Game.updateTable(roomInfo); //通知更新桌面上的牌
                Game.checkIs3Tan(roomInfo,index)
                Game.notifyChupai(roomInfo);   
               })
            })    
        })

        socket.on(CONST.CLIENT_GUO_NOTIFY,(data)=>{
            var roomId = socket.roomId;
            var userId = socket.userId;


            if (!userId || !roomId){
                Log.error('socket guo param is error',roomId,userId,fromTurn)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    return;
                }
                Log.info('roomInfo',roomInfo);

                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;
                if (!Util.checkUserIsValid(roomInfo.seats,userId)) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId)
                if (index === undefined || index === null){
                    Log.error('socket guo getIndexByUserId is error',index)
                    return;
                }

                var op = seats[index].op;
                if (!op.canPeng && !op.canGang && !op.canHu && !op.canChi){ 
                    return;
                }
                var fromTurn = op.fromTurn
                seats[index].op = {};

                var ret = Game.checkOtherSeatHasOp(seats,index)
                // 所有人都没有操作
                if (!ret){
                     Game.clearOperation(roomInfo);
                     if (fromTurn === index){ //如果这个通知是来自自己的(胡，杠)
                        Game.notifyChupai(roomInfo) //通知出牌
                        return
                     }
                    else{ //这个通知不是自己的，来自其他人
                        Game.moveToNextTurn(roomInfo)
                        Game.fapai(roomInfo);
                     }
                  
                }

            }) 
        })

        socket.on(CONST.CLIENT_PING,(data) => {
			var userId = socket.userId;
			if(!userId){
                Log.error('socket ping param is error',roomId,userId)
				return;
			}
			socket.emit(CONST.SERVER_PING_RESULT_REPLY);
        });

        socket.on(CONST.CLIENT_REPLY_DISMISS_GAME,(data)=>{
            var userId = socket.userId;
            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    return;
                }

                var index = Game.getIndexByUserId(seats,userId);
                var seats = roomInfo.seats;
                if (!data.result){ //有yige 不同意
                    Game.clearDimissGameNotify(roomInfo);
                    var userName = roomInfo.seats[index].userInfo.userName
                    Room.broacastInRoom(CONST.SERVER_GAME_SEND_TIP,roomInfo.roomId,`玩家${userName}不同意解散`)
                    return;
                }else{
                    
                    seats[index].agree_dismiss_game = true;
                    Room.broacastInRoom(CONST.SERVER_SEND_DISMISS_STATUS,roomInfo.roomId,{seats:seats})
                    var allAgree = true;
                    for (var item of roomInfo.seats){
                        if (!item.onLine) continue;
                        if (item.agree_dismiss_game !== true){
                            allAgree = false;
                            break;
                        }

                    }

                    if (allAgree){
                        roomInfo.gameStatus = CONST.GAME_STATUS_LIU_JU;
                        Room.broacastInRoom(CONST.SERVER_GAME_OVER,roomInfo.roomId,roomInfo);
                        Game.deleteStatus(roomInfo);
                    }
                }
            })   
        });

        socket.on(CONST.CLIENT_APPLY_DISMISS_GAME,(data)=>{
            var userId = socket.userId;
            //申请jiesanfangjian
            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    return;
                }

                if (roomInfo.gameStatus !== CONST.GAME_STATUS_START) return;

                var seats = roomInfo.seats;
                var index = Game.getIndexByUserId(seats,userId)

                seats[index].agree_dismiss_game = true;

               Room.broacastInRoom(CONST.SERVER_APPLY_DISMISS_ROOM,roomInfo.roomId,{userName:seats[index].userInfo.userName,index},[userId])
            }) 
        });

        //jiesan fangjian youxiweikaishi caikeyi jiesan 
        socket.on(CONST.CLIENT_DISMISS_ROOM_NOTIFY,(data)=>{

            var userId = socket.userId;
            var roomId = socket.roomId;
            
            if (!userId || !roomId){
                Log.error('socket dismiss_room param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    return;
                }

                if(roomInfo.gameStatus === CONST.GAME_STATUS_START){
                    return;
                }
                
                roomInfo.roomStatus = CONST.ROOM_STATUS_DISMISS;

                // Game.notifyRoomHasDismiss(roomInfo);
            })

        });

        socket.on(CONST.CLIENT_AUDIO_CAHT,(data)=>{
            var userId = socket.userId;
            var roomId = socket.roomId;
            
            if (!userId || !roomId){
                Log.error('socket dismiss_CLIENT_AUDIO_CAHTroom param is error',roomId,userId)
                return;
            }   

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket CLIENT_AUDIO_CAHT get roominfo is error',err)
                    return;
                }

                var players = roomInfo.players;
                var seats = roomInfo.seats;
                var playerIndex = '';
                var seatIndex = '';
                for (var key in players){
                    if (players[key].userId === userId){
                        playerIndex = parseInt(key);
                        break;
                    }
                }

                if (playerIndex === ''){
                    for (var key in seats){
                        if (seats[key].userId === userId){
                            seatIndex = parseInt(key);
                            break;
                        }
                    }  
                }
                
                Room.broacastInRoom(CONST.SERVER_AUDIO_CHAT,roomInfo.roomId,
                    {serverId:data.serverId,playerIndex,seatIndex,seats})
            }) 
        })
        
        socket.on('disconnect',()=>{
            var userId = socket.userId;
            var roomId = socket.roomId
            console.log('scocket disconnect',userId,roomId)

			if(!userId || !roomId){
                Log.error('socket disconnect param is error',roomId,userId)
				return;
            }

            Room.getRoomInfo(roomId,(err,roomInfo)=>{
                if (err){
                    Log.error('socket guo get roominfo is error',err)
                    return;
                }

                if (!roomInfo){
                    return;
                }
                
                var userName = ''
                var index = Game.getIndexByUserId(roomInfo.seats,userId);
                if (index !== null && index !== undefined){
                    console.log('在做的里面')
                    userName = roomInfo.seats[index].userInfo.userName
                    if (roomInfo.gameStatus === CONST.GAME_STATUS_START){
                        var seats = roomInfo.seats;
                        seats[index].onLine = false;
                        
                    }else if(roomInfo.gameStatus === CONST.GAME_STATUS_NO_START){
                        roomInfo.seats.splice(index,1);
                    }
                       
                    if (roomInfo.gameStatus === CONST.GAME_STATUS_END){
                    }
                    
                    Game.updatePepoleStatus(roomInfo);
                }

                index = Game.getIndexByUserId(roomInfo.players,userId);

                if (index !== null && index !== undefined){
                    userName = roomInfo.players[index].userInfo.userName
                    console.log('在看的里面')
                    roomInfo.players.splice(index,1);
                }

                Game.notifyTip(roomInfo,'玩家'+userName+'离开房间')

                console.log('disconneted')
              

            })
            
  


        })

        socket.on('reconnect',()=>{
            var userId = socket.userId;
            console.log('reconnection',userId)
        })

        socket.on(CONST.CLIENT_LIFE_CYCLE,(data)=>{
            var userId = data.userId;

            console.log('生命周期',userId,data)
        })
    })

    server.listen(conf.SOCKET_PORT);
    console.log("game server is listening on " + conf.SOCKET_PORT);
};