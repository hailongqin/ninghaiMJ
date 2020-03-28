var crypto = require('crypto');
var config = require('../config')

exports.md5 = function (content) {
	var md5 = crypto.createHash('md5');
	md5.update(content);
	return md5.digest('hex');	
}

exports.checkSign = function (body){
	var str = '';
	var sign = body.sign;	
	for (var key in body){
		if (key === 'sign') continue;
		str += body[key]
	}

	return md5(str+config.PRIVATE_KEY) === sign;
}