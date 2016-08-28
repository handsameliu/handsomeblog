var express = require('express');
var path = require('path');//处理文件路径的join resolve
var favicon = require('serve-favicon');//处理收藏夹图标
var logger = require('morgan');//请求日志打印工具
var cookieParser = require('cookie-parser');//处理cookie的，可以通过req.cookies获取到cookie
//引入session中间件
var session = require('express-session');
//把session放入数据库中
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');//处理请求体


var routes = require('./routes/index');
var user = require('./routes/user');
var article = require('./routes/article');
require('./db');
var app = express();

// view engine setup 设置模版引擎
app.set('views', path.join(__dirname, 'views'));//设置模版存放目录
app.set('view engine', 'html');//设置模版引擎
app.engine('html',require('ejs').__express);//设置渲染函数

// uncomment after placing your favicon in /public
//在你将收藏夹图标防止在/public目录下之后就可以取消掉此注释了
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var fs = require('fs');
//创建一个可写流
var accessStream = fs.createWriteStream('../access.log');


app.use(logger('dev',{stream:accessStream}));//使用请求日志中间件
//通过判断请求头中的content-type来得到请求体的内容类型
//如果是content-type=application/json  req.body = JSON.parse(请求体)
//如果content-type=application/x-www-form-urlencoded  req.body = querystring.parse(请求体)
app.use(bodyParser.json());//处理json格式的请求体{name:'liu'}
app.use(bodyParser.urlencoded({ extended: false }));//处理urlencoded请求体name=liu$age=6
app.use(cookieParser());//处理cookie得到req.cookie
var settings = require('./settings');
//当使用session中间件之后，会在req.session,在不同的请求之间可以共享
var flash = require('connect-flash');
app.use(session({
  secret:'liuwei',//指定要加密cookie的密钥
  resave:true,//每次请求都要重新保存session
  saveUninitialized:true,//保存为初始化的session
  store:new MongoStore({//指定session存储位置
    url:settings.dbUrl  //数据库地址
  })
}));

app.use(flash());
//用来将flash消息赋给模版数据对象
app.use(function(req,res,next){
  //取出成功的消息赋给success
  res.locals.success = req.flash('success').toString();
  //取出错误的消息赋给error
  res.locals.error = req.flash('error').toString();
  //把session中的user属性赋给模版数据对象的user属性
  //如果已登录 则req.session.user有值，如果没有登录则没值
  res.locals.user = req.session.user;
  res.locals.keyword = '';//给搜索关键字赋默认值
  next();
});

//静态文件中间件,根目录是public目录，所以页面中引用静态文件的时候必须以public目录作为根目录
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);//当路径是/开头的话交由routes处理
app.use('/user', user);//当路径是/user开头的话交由user处理
app.use('/article',article);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  /*var err = new Error('Not Found');
  err.status = 404;
  next(err);*/
    res.render('404');
});

// error handlers
var errorStream = fs.createWriteStream('./error.log');
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.error(err);//把错误输出到控制台
      errorStream.write(err.toString());
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
