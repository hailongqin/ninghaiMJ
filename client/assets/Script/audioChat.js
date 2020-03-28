// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        context:null,
        size: 0 ,         //录音文件长度
        buffer: [],    //录音缓存

        inputSampleBits: 16,      //输入采样数位 8, 16
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
     },

    start () {

    },

    playAudio(data){
        var audioContext = new AudioContext();
        audioContext.decodeAudioData(data, function(buffer) {//解码成pcm流
                var audioBufferSouceNode = audioContext.createBufferSource();
                audioBufferSouceNode.buffer = buffer;
                audioBufferSouceNode.connect(audioContext.destination);
                audioBufferSouceNode.start(0);
            }, function(e) {
                console.log("failed to decode the file");
            });
    },
    startChat() {
        this.audioInput.connect(this.recorder);
        this.recorder.connect(context.destination);
    },
 
    stopChat() {
        recorder.disconnect();
    },
 
    getBlob(){
        return audioData.encodeWAV();
    },

    clear() {
        this.buffer = [];
        this.size = 0;
    },
    input(data) {
        this.buffer.push(new Float32Array(data));
        this.size += data.length;
    },
    compress() { //合并压缩
        //合并
        var data = new Float32Array(this.size);
        var offset = 0;
        for (var i = 0; i < this.buffer.length; i++) {
            data.set(this.buffer[i], offset);
            offset += this.buffer[i].length;
        }
        //压缩
        var compression = parseInt(this.context.sampleRate / this.config.sampleRate);
        var length = data.length / compression;
        var result = new Float32Array(length);
        var index = 0, j = 0;
        while (index < length) {
            result[index] = data[j];
            j += compression;
            index++;
        }
        return result;
    }, 
    encodeWAV() {
        var sampleRate = Math.min(this.context.sampleRate, this.config.sampleRate);
        var sampleBits = Math.min(this.inputSampleBits, this.config.sampleBits );
        var bytes = this.compress();
        var dataLength = bytes.length * (sampleBits / 8);
        var buffer = new ArrayBuffer(44 + dataLength);
        var data = new DataView(buffer);

        var channelCount = 1;//单声道
        var offset = 0;

        var writeString = function (str) {
            for (var i = 0; i < str.length; i++) {
                data.setUint8(offset + i, str.charCodeAt(i));
            }
        };
        
        // 资源交换文件标识符
        writeString('RIFF'); offset += 4;
        // 下个地址开始到文件尾总字节数,即文件大小-8
        data.setUint32(offset, 36 + dataLength, true); offset += 4;
        // WAV文件标志
        writeString('WAVE'); offset += 4;
        // 波形格式标志
        writeString('fmt '); offset += 4;
        // 过滤字节,一般为 0x10 = 16
        data.setUint32(offset, 16, true); offset += 4;
        // 格式类别 (PCM形式采样数据)
        data.setUint16(offset, 1, true); offset += 2;
        // 通道数
        data.setUint16(offset, channelCount, true); offset += 2;
        // 采样率,每秒样本数,表示每个通道的播放速度
        data.setUint32(offset, sampleRate, true); offset += 4;
        // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
        data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
        // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
        data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
        // 每样本数据位数
        data.setUint16(offset, sampleBits, true); offset += 2;
        // 数据标识符
        writeString('data'); offset += 4;
        // 采样数据总数,即数据总大小-44
        data.setUint32(offset, dataLength, true); offset += 4;
        // 写入采样数据
        if (sampleBits === 8) {
            for (var i = 0; i < bytes.length; i++, offset++) {
                var s = Math.max(-1, Math.min(1, bytes[i]));
                var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                val = parseInt(255 / (65535 / (val + 32768)));
                data.setInt8(offset, val, true);
            }
        } else {
            for (var i = 0; i < bytes.length; i++, offset += 2) {
                var s = Math.max(-1, Math.min(1, bytes[i]));
                data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
        }

        return new Blob([data], { type: 'audio/wav' });
    },

    initStream(stream){
        var config = this.config = {};
        config.sampleBits = config.smapleBits || 8;             //输出采样位数
        config.sampleRate = config.sampleRate || (44100 / 6);   //输出采样频率
     
        var context = this.context =  new AudioContext();
        this.audioInput = context.createMediaStreamSource(stream);
        this.recorder = context.createScriptProcessor(4096, 1, 1); //录音缓冲区大小，输入通道数，输出通道数
    },

    onClickChat(){
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        if(!navigator.getUserMedia) {
            alert('您的设备不支持语音');
            return false;
        }

        if (!this.context){
            
            navigator.getUserMedia(
                { audio: true },
                 (stream) => {
                    this.initStream(stream)
                },
                (err) => {
                    console.log(err)
                }
            )
        }
       

    }

    // update (dt) {},
});
