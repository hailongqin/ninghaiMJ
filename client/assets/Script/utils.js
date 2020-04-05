

function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};
  
    var later = function () {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null; //显示地释放内存，防止内存泄漏
    };
  
    var throttled = function () {
      var now = new Date();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  
    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };
  
    return throttled;
  };

  function setFitSreenMode(){
    var node = cc.find('Canvas');
    var size = cc.view.getFrameSize();
    var w = size.width;
    var h = size.height;

    var cvs = node.getComponent(cc.Canvas);
    var dw = cvs.designResolution.width;
    var dh = cvs.designResolution.height;
    //如果更宽 则让高显示满
    if((w / h)  > (dw / dh)){
        cvs.fitHeight = true;
        cvs.fitWidth = false;
    }
    else{
        //如果更高，则让宽显示满
        cvs.fitHeight = false;
        cvs.fitWidth = true;
    }
}

function urlParse(){
  var params = {};
  if(window.location == null){
      return params;
  }
  var name,value; 
  var str=window.location.href; //取得整个地址栏
  var num=str.indexOf("?") 
  str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]

  var arr=str.split("&"); //各个参数放到数组里
  for(var i=0;i < arr.length;i++){ 
      num=arr[i].indexOf("="); 
      if(num>0){ 
          name=arr[i].substring(0,num);
          value=arr[i].substr(num+1);
          params[name]=value;
      } 
  }
  return params;
},

  exports.throttle = throttle;

  exports.setFitSreenMode = setFitSreenMode;

  exports.urlParse = urlParse