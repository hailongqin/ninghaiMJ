var {
    roomModel
} = require('../db/db');

var User = require('./user')
function setRoomInfofromDB(roomId, callback) {
    roomModel.findOne({
        roomId,
    }).select("-_id")
        .exec((err, ret) => {
            if (err) {
                callback({code: -1, message: "读取数据库错误"});
                return;
            } else {
                if (!ret){
                    callback({code: -1, message: "未找到房间"});
                    return;
                }
                callback(0,ret);
                return;
            }
        })
}

class RoomInfo {
    constructor() {
        this.roomInfo = {}
    }


    addAndUpdateRoom(roomId,info){
        this.roomInfo[roomId] = info;
    }
    getRoomInfo(roomId,callback){
        if (!roomId){
            callback({code:-1,message:"无效roomId"})
            return
        }
        if (this.roomInfo[roomId]){
            callback(0,this.roomInfo[roomId]);
            return;
        }
        setRoomInfofromDB(roomId,(err,doc)=>{
            if (err){
                callback(err);
                return;
            }
            this.roomInfo[roomId] = doc;

            callback(0,doc);
        })
    }
    broacastInRoom(event,roomId,socket,data,sender,includingSender = false){

        var roomInfo = this.roomInfo[roomId];

        if (!roomInfo)
            return;
        var players = roomInfo.players;

        console.log('broadcast roominfo is ',roomInfo)

        for(var i = 0; i < roomInfo.seats.length; i++){
            var rs = roomInfo.seats[i];
            var userId =rs.userId
            var socket = User.getSocketByUser(userId)

            if(socket != null && (userId !== sender || includingSender)){
                socket.emit(event,data);
            }
        }

        for(var i = 0; i < players.length; i++){
            var rs = players[i];
            var userId =rs.userId;
            var socket = User.getSocketByUser(userId)
            if(socket != null && (userId !== sender || includingSender)){
                socket.emit(event,data);
            }
        }

    };

}

module.exports = new RoomInfo();
