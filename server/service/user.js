// 用户和房间的关系

var Log = require('../utils/log')

class User {
    constructor() {
        this.user = {};
    }

    bindUserAndSocket(userId,socket){
        if (!userId){
            Log.error('bindUserAndSocket userId is empty')
            return;
        }
        this.user[userId] = socket;
    }

    getSocketByUser(userId){
        if (!userId){
            Log.error('getSocketByUser userId is empty')
            return;
        }
        return this.user[userId];
    }
}

module.exports = new User();