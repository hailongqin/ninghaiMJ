var api_service = require("./service/api_service");

var socket_service = require('./service/socket_service');

// var socket_test = require('./service/socket_test');


 api_service.start();
 socket_service.start();

// socket_test.start();