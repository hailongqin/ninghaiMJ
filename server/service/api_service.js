var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var roomRouter = require('./room_service')
var userRouter = require('./user_service');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.all('*', function(req, res, next) {
    // if (os.type() !== 'Linux'){
    //     res.header("Access-Control-Allow-Origin", "http://localhost:7457")
    // }else{
    //     res.header("Access-Control-Allow-Origin", "http://www.kaijinpacking.com")
    // }


    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Origin,Content-Type,Accept"); 
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header('Access-Control-Allow-Credentials',true)
    if (req.method == 'OPTIONS') {
        console.log('method is options')
        res.sendStatus(200); /让options请求快速返回/
    }else{
        next();
    }
});


app.use('/room',roomRouter);
app.use('/user',userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

exports.start = function(){
    var port = 4000;
    app.listen(port);
    console.log("client service is listening on port " + port);
};

