var express = require('express');
//创建一个i额路由容器
var router = express.Router();

/* GET home page. 设置路由  这里的路径并不是完整的路径，设置的路径前面都有隐藏的/ */
router.get('/', function(req, res, next) {
  //res.setHeader('content-type','text/html;charset=utf-8');
  //res.render('index', { title: '首页' });
  res.redirect('/article/list');
});

module.exports = router;

