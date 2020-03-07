// 用户和房间的关系
class User {
    constructor() {
        this.user = {};
    }

    bindUserAndSocket(userId,socket){
        this.user[userId] = socket;
    }

    getSocketByUser(userId){
        return this.user[userId];
    }
}

module.exports = new User();