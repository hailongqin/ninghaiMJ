const Core = require('@alicloud/pop-core');

class SMS{
    constructor(){
        this.client = new Core({
            accessKeyId: 'LTAI4Fpqb7x41QcrcmquU8dH',
            accessKeySecret: 'hwEgEFv7ghK2YI6Yame1ilPEB02ew9',
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
          });
    }

    sendLoginSms(PhoneNumbers,code){
        var params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": PhoneNumbers,
            "SignName": "川川网络",
            "TemplateCode": "SMS_186680280",
            "TemplateParam": `{code:${code}}`
          }
          

        var requestOption = {
            method: 'POST'
        };
        
        this.client.request('SendSms', params, requestOption).then((result) => {
            console.log(JSON.stringify(result));
        }, (ex) => {
            console.log(ex);
        })
        
    }

    sendRegisterSms(PhoneNumbers,code){
        var params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": PhoneNumbers,
            "SignName": "川川网络",
            "TemplateCode": "SMS_186680278",
            "TemplateParam": `{code:${code}}`
          }
          

        var requestOption = {
            method: 'POST'
        };
        
        this.client.request('SendSms', params, requestOption).then((result) => {
            console.log(JSON.stringify(result));
        }, (ex) => {
            console.log(ex);
        })    
    }
}



module.exports = new SMS();
