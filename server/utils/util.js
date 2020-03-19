

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