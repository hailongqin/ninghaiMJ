
var seats = [
    {
        op:{
            canPeng:true
        }
    },
    {
        op:{
            canChi:true
        }
    }
]

waitOtherOperation(seats,1,'canChi',()=>{
    console.log(123)
})


function waitOtherOperation(seats,index,level,callback){
    var levels = ['canHu','canGang','canPeng','canChi'];
    let lIndex = levels.indexOf(level);
    var waitLevel = levels.splice(0,lIndex);
    var opTag = false;

    function check(op){
        for (var key of waitLevel){
            if (op[key]) return true;
        }
        return false
    }

    var otherSeats = seats.filter((s,_id)=>{
        return _id !== index
    })

    var interval = setInterval(()=>{
            for (var i = 0; i <otherSeats;i++){
                let op = otherSeats[i].op;
                if (check(op)){
                    opTag = true;
                    break;
                }
                else opTag = false
            }

            if (!opTag){
                clearInterval(interval);
                callback()
            }
        },50)
}
