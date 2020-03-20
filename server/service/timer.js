

var Log  = require('../utils/log')
class Timer {
    constructor(){
        this.timeList = {};
    }
    saveTimer(timeId,timer){
        if (!timeId || !timer){
            Log.error('saveTimer',timeId,timer)
            return;
        }

        if (this.timeList[timeId]){
            Log.error('time list has exit id ?',timeId)
            return
        }

        this.timeList[timeId] = timer
    }

    deleteTimer(timeId){
        if (this.timeList[timeId]){
            var timer = this.timeList[timeId];
            if (timer){
                clearTimeout(timer);
            }
            delete this.timeList[timeId]
        }
    }

    getTimerById(timeId){
        if (!timeId){
            return;
        }
        return this.timeList[timeId] || null
    }
}

module.exports = new Timer();