var {
    roomModel
} = require('../db/db');

var User = require('./user');

var Log = require('../utils/log')
function setRoomInfofromDB(roomId, callback) {
    if (!roomId){
        Log.error('setRoomInfofromDB roomid is empty')
        return;
    }

    roomModel.findOne({
        roomId,
    }).select("-_id")
        .exec((err, ret) => {
            if (err) {
                Log.error('setRoomInfofromDB find db err',err)
                callback({code: -1, message: "读取数据库错误"});
                return;
            } else {
                if (!ret){
                    Log.error('setRoomInfofromDB find find no room',roomId)
                    callback({code: -1, message: "未找到房间"});
                    return;
                }
                callback(0,ret);
                return;
            }
        })
}

class roomList {
    constructor() {
        this.roomList = {}
    }


    addAndUpdateRoom(roomId,info){
        if (!roomId){
            Log.error('addAndUpdateRoom roomid is empty')
            return;
        }
        this.roomList[roomId] = info;
    }
    getRoomInfo(roomId,callback){
        if (!roomId){
            Log.error('getRoomInfo roomId is empty')
            callback({code:-1,message:"无效roomId"})
            return
        }
        if (this.roomList[roomId]){
            callback(0,this.roomList[roomId]);
            return;
        }
        setRoomInfofromDB(roomId,(err,doc)=>{
            if (err){
                Log.error('setRoomInfofromDB callback is error',err)
                callback(err);
                return;
            }
            this.roomList[roomId] = doc;

            callback(0,doc);
        })
    }
    broacastInRoom(event,roomId,data,excludeUsers = []){

        if (!roomId){
            return;
        }

        var roomInfo = this.roomList[roomId];

        if (!roomInfo){
            return;
        }
           
        var players = roomInfo.players;
        for(var i = 0; i < roomInfo.seats.length; i++){
            var rs = roomInfo.seats[i];
            var userId =rs.userId
            var socket = User.getSocketByUser(userId)
            if (!socket){
                Log.error('broacastInRoom get seat socket is null')
                return;
            }

            if(socket && (excludeUsers.indexOf(userId) === -1)){
                socket.emit(event,data);
            }
        }

        for(var i = 0; i < players.length; i++){
            var rs = players[i];
            var userId =rs.userId;
            var socket = User.getSocketByUser(userId);
            if (!socket){
                Log.error('broacastInRoom get players socket is null')
                return;
            }
            if(socket&& (excludeUsers.indexOf(userId) === -1)){
                socket.emit(event,data);
            }
        }

    };

}

module.exports = new roomList();
