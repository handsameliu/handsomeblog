var express = require('express');
var utils = require('../utils');
var auth = require('../middleware/auth');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.send('respond with a resource');
});
//这里的路径并不是完整的路径，设置的路径前面都有隐藏的users
//注册
router.get('/reg',auth.mustNotLogin,function (req, res, next) {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.render('user/reg');
});
//提交用户注册表单
router.post('/reg', auth.mustNotLogin,function (req, res, next) {
    var user = req.body;// username password repassword email
    //如果密码和重复密码不一致 则返回重定向到上一个注册表单
    if (user.password != user.repassword) {
        return res.redirect('back');
    }
    Model('User').findOne({username: user.username}, function (err, result) {
        if (result) {
            req.flash('error', '很抱歉,你的用户名已经被人占用，注册失败');
            //如果失败则滚回到上个页面重新填写
            return res.redirect('back');
        } else {
//1 对密码进行md5加密
            user.password = utils.md5(user.password);
            //2 要通过邮箱生成头像
            user.avatar = "https://secure.gravatar.com/avatar/"+utils.md5(user.email)+"?s=28";
            //通过user可以得到模型对象
            Model('User').create(user, function (err, doc) {
                if (err) {
                    //err 保存出错 则滚回到上一页
                    req.flash('error', '注册失败' + err);
                    return res.redirect('back');
                } else {
                    req.flash('error', '注册成功');
                    //doc 保存成功后的对象  则把保存后的文档对象写入当前的session中
                    req.session.user = doc;
                    return res.redirect('/');
                }
            });
        }
    });
});
//登录
//不是完整的路径，而是/users后面的路径
//用户登陆
router.get('/login', auth.mustNotLogin,function (req, res, next) {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.render('user/login');
});
//用户登陆
router.post('/login', auth.mustNotLogin,function (req, res, next) {
    var user = req.body;
    Model('User').findOne({username: user.username}, function (err, doc) {
        if (err) {
            req.flash('error', '登录失败');
            res.redirect('back');
        } else {
            if (doc) {
                //判断数据库中的用户密码和本次输入的密码是否一致
                if (doc.password == utils.md5(user.password)) {
                    req.session.user = doc;
                    //重定向到首页
                    return res.redirect('/');
                } else {
                    req.flash('error', '密码输入错误,请重新输入');
                    res.redirect('back');
                }
            } else {
                req.flash('error', '此用户不存在');
                res.redirect('back');
            }
        }
    });
});
//退出
router.get('/logout', auth.mustLogin,function (req, res, next) {
    req.session.user = null;
    res.redirect('/');
});
//用户退出
router.get('/logout', function (req, res, next) {
    res.send('退出');
});


module.exports = router;

