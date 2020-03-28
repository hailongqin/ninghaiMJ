cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        bgmVolume:0.5,
        sfxVolume:0.5,
        
        bgmAudioID:null,
    },

    onLoad(){
        cc.game.addPersistRootNode(this.node); //作为常住节点
        this.node.active = false;
        this.init();
    },

    // use this for initialization
    init: function () {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if(t != null){
            this.bgmVolume = parseFloat(t);    
        }
        
        var t = cc.sys.localStorage.getItem("sfxVolume");
        if(t != null){
            this.sfxVolume = parseFloat(t);    
        }
    },

    playBigMusic(){
        this.playBGM('bgFight')
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    
    getUrl:function(url){
        return "sound/" + url+'.mp3';
    },
    
    //背景音乐
    playBGM(url){
        var audioUrl = this.getUrl(url);
        this.bgmAudioID && cc.audioEngine.stop(this.bgmAudioID);
        var self= this;
        cc.loader.loadRes(audioUrl, cc.AudioClip, (err, audioClip)=> {
            self.bgmAudioID = cc.audioEngine.play(audioClip,true,this.bgmVolume);
        });
    },
    

    //音效
    playSFX(url){
        var audioUrl = this.getUrl(url);
        if(this.sfxVolume >= 0){
            this.sfxVolumeID && cc.audioEngine.stop(this.sfxVolumeID);
            var self = this;
            cc.loader.loadRes(audioUrl, cc.AudioClip,  (err, clip) => {
                self.sfxVolumeID =  cc.audioEngine.play(clip, false,this.sfxVolume);
            }); 
        }
    },
    
    setSFXVolume:function(v){
        if(this.sfxVolume != v){
            cc.sys.localStorage.setItem("sfxVolume",v);
            this.sfxVolume = v;
            if (this.sfxVolumeID)
                cc.audioEngine.setVolume(this.sfxVolumeID,v);
        }
    },
    
    setBGMVolume:function(v,force){
        console.log(v,force)
        if(this.bgmAudioID >= 0){
            if(v > 0){
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else{
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if(this.bgmVolume != v || force){
            cc.sys.localStorage.setItem("bgmVolume",v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID,v);
        }
    },
    
    pauseAll:function(){
        cc.audioEngine.pauseAll();
    },
    
    resumeAll:function(){
        cc.audioEngine.resumeAll();
    }
});
