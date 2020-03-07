var api_service = require("./service/api_service");

var socket_service = require('./service/socket_service');

api_service.start();
socket_service.start()