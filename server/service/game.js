
class Game {
    constructor() {
    }

    //开始一局新的
    begin(roomInfo){
        this.initMjList(roomInfo.mjLists);
        this.shuffle(roomInfo.mjLists)
        this.initEveryOnePai(roomInfo)
    }

    //初始化麻将牌
    initMjList(data){
        for (var i = 0; i < 4;i++){
            for (var j = 1; j < 10;j++){ //1-9表示筒子
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 11; j < 20;j++){ //11-19表示万字
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 21; j < 30;j++){ //21-29代表条子
                data.push(j)
            }
        }

        for (var i = 0; i < 4;i++){
            for (var j = 31; j < 38;j++){ //31-34代表东南西北中白发
                data.push(j)
            }
        }

        for (var j = 41; j < 49;j++){ //41-48代表春夏秋冬梅兰菊竹
            data.push(j)
        }

    }

    //洗牌
    shuffle(data){
        var len = data.length;
        var temp = ''
        for (var i = len - 1;i > 0;i-- ){
            var index = Math.ceil(Math.random()*i);
            
            temp = data[index];
            
            if (!temp){
                Log.error('shuffle is error,',temp,index)
            }
            
            data[index] = data[i];
            data[i] = temp;
        }
    }

    //初始化每个人的手牌
    initEveryOnePai(roomInfo){
        var seats = roomInfo.seats;
        
        var mjLists = roomInfo.mjLists;
        var len = seats.length;
        var zhuangIndex = roomInfo.zhuangIndex;

        for (var i = 0;i< 3;i++){ //每个人拿4张牌，轮训三次，共12张牌
            for (var j = 0;j<len;j++){
                seats[j].holds = (seats[j].holds).concat(this.getNextPai(mjLists,4))
            }
        }

            //每个人再拿一张牌
        for (var j = 0;j<len;j++){
            seats[j].holds = (seats[j].holds).concat(this.getNextPai(mjLists))
        }

        seats[zhuangIndex].holds = (seats[zhuangIndex].holds).concat(this.getNextPai(mjLists)); //庄家再拿一张牌
    
        for (var i = 0;i < seats.length;i++){
            //将花色拿出来
            for (var k = 0; k < seats[i].holds.length;k++){
                while(seats[i].holds[k] >= 41 &&  seats[i].holds[k]<= 48){
                    seats[i].huas.push(seats[i].holds[k])
                    var nextPai = (this.getNextPai(mjLists))[0];
                    seats[i].holds[k] = nextPai;
                }

            }
        }

        // 将手牌排序
        for (var i = 0;i < seats.length;i++){
         seats[i].holds.sort((a,b)=>{
                return a - b;
            })

         console.log(seats[i]);
        }

        // 将花色排序
        for (var i = 0;i < seats.length;i++){
            seats[i].huas.sort((a,b)=>{
                   return a - b;
               })
        }2

    
    }

    getNextChuPaiIndex(seats,index){
        if (index === seats.length -1) return 0;
        else return index + 1;
    }

    getNextPai(mjLists,len = 1){
        return mjLists.splice(0,len)
    }

    getNextPaiIgnoreHua(mjLists){
        var huas = [];
        var pai = this.getNextPai(mjLists)

        while(this.checkIsHua(pai)){
            huas.push(pai);
            pai = this.getNextPai(mjLists);
        }

        return {
            huas,
            pai
        }
    
    }

    checkIsHua(pai){
        if (pai >= 41 && pai<= 48) return true;
        return false;
    }

    // 检查是否可以碰
    checkCanPeng(roomInfo,exclude){

    }
}


module.exports = new Game();