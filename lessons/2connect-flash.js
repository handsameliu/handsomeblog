var express = require('express');
var app = express();
var session = require('express-session');
var flash = require('connect-flash');
app.use(session({
    secret:'come',
    resave:true,
    saveUninitialized:true
}));
//app.use(flash());
app.use(function(req,res,next){
    req.flash = function(type,msg){
        //如果有msg就表示赋值，也就是向session中保存数据
        if(msg){
            var messages = req.session[type];
            //如果已经保存过此session的数据，则往里添加新的元素
            if(messages){
                messages.push(msg);
            }else{//如果没有保存过，则向直接构建数组赋值
                req.session[type] = [msg];
            }
        }else{
            var messages = req.session[type];
            delete req.session[type];
            return messages;
        }
    };
    next();
});
/*
* flash是存储在session中的一段内容
* 可以多次写，但只能读一次
*
* */
app.get('/write',function(req,res){
    //传二个参数表示写入消息 1参数是消息的类型 2参数是消息的内容
    req.flash('success','成功1');//成功的是放到一个数组中
    req.flash('success','成功2');
    req.flash('error','失败3');//失败的会放到一个数组中
    req.flash('error','失败3');
    res.redirect('/read');
});
app.get('/read',function(req,res){
    //传一个参数表示读消息，一旦读取完毕之后，会马上清除消息
    var msg = req.flash('success');
    console.log(msg);
    res.send(msg);
});

app.listen(9090);

