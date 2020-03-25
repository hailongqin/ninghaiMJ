
var URL = 'https://www.ccnet.site';
var MD5_KEY = '#$%%#####FFGGG$!~'

function sendRequest(path, data = {}, successCallback, failCallback) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.timeout = 30000;
    var requestURL = URL + path;
    xhr.open("POST", requestURL, true);
    xhr.setRequestHeader("Content-Type", "application/json");

     data.userId = cc.vv.userId;
    
    var str = ''
    for (var key in data){
        str +=data[key];
    }

    data.sign = cc.vv.Crypto.hex_md5(str+MD5_KEY)
  

    xhr.onreadystatechange = function () {
        console.log("onreadystatechange");
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
            var respText = xhr.responseText;
            console.log('respText is ',respText);
            xhr.hasRetried = true;
            var ret = null;
            try {
                ret = JSON.parse(respText);
            } catch (e) {
                console.log("err:" + e);
                ret = {
                    code: -10001,
                    message: e
                };
            }
            console.log('ret is ',ret);
            if (ret.code === 0 && successCallback){
                console.log('successcallback')
                successCallback(ret)
            }

            if (ret.code !== 0 && failCallback){
                console.log('failCallback')

                failCallback(ret);
            }
        }
        else if (xhr.readyState === 4) {
            console.log('other readystate:' + xhr.readyState + ', status:' + xhr.status);

        }
        else {
            console.log('other readystate:' + xhr.readyState + ', status:' + xhr.status);
        }
    };

    console.log('data is ',data)
    try {
        xhr.send(JSON.stringify({...data}));
    }
    catch (e) {
        //setTimeout(retryFunc, 200);
        retryFunc();
    }

    return xhr;
}

exports.sendRequest = sendRequest;
