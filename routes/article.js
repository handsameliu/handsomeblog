var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var markdown = require('markdown').markdown;

//文章路由列表
router.get('/list',auth.mustLogin, function(req, res, next){
    var user = req.query.user;//取得查询字符串中的用户id
    var keyword = req.query.keyword;//取得查询关键字
    //读取所有的列表并显示在页面中
    var query = {};
    //要实现分页需要让客户端直到，当前是第几页，每页是多少条，一共多少页
    var pageNum = parseInt(req.query.pageNum||1);
    var pageSize = parseInt(req.query.pageSize||3);
    var order = req.query.order;
    //如果有用户id的话查询此用户的所有文章
    if(user){
        query['user'] = user;
    }
    //如果用户输入的关键字的话，那么查询标题和正文中包含此关键字的文章
    if(keyword){
        var filter = new RegExp(keyword); //先写正则
        //写一个或条件，如果title符合，或者content符合正则
        query["$or"] = [{title:filter},{content:filter}];
    }
    //默认情况下按文章的发表顺序倒序排列
    var defaultOrder = {createAt:-1};
    if(order){
        var orderValue = 1;
        var orderBy = 'createAt';
        if(order.startsWith('-')){
            orderValue = -1;//表示要倒序
            orderBy = order.slice(1);//去掉-之后才是真正的路径
        }
        defaultOrder[orderBy] = orderValue;
    }
    var count ;
    Model('Article')
        .count(query)
        .then(function(result){
        count = result;
        return Model('Article')
            .find(query)//按指定的条件过滤
            .sort(defaultOrder)
            .skip((pageNum-1)*pageSize)//跳过指定的条数
            .limit(pageSize)//限定返回的条数
            .populate('user')//把user属性从id转成对象
            .exec();//开始真正的执行查询，返回一个新promise
    }).then(function(docs){
        /*if(err){
            req.flash('error','显示列表失败'+err);
            res.redirect('back');
        }else{*/
            //把markdown源文件转成html页面
            docs.forEach(function(doc){
                doc.content = markdown.toHTML(doc.content);
            });
            //docs是所有的文章数组
            res.render('article/list',{
                title:'文章列表',
                articles:docs,//所有文章
                keyword:keyword,//关键字
                pageNum:pageNum,//页数
                pageSize:pageSize,//一个页面显示多少
                order:order,
                totalPages:Math.ceil(count/pageSize)});//
        //}
    });
});
//发表文章
router.get('/add',auth.mustLogin, function(req, res, next) {
    res.setHeader('content-type','text/html;charset=utf-8');
    //新增文章的时候article是空对象
    res.render('article/add',{title:'新增文章',article:{}});
});
router.post('/add',auth.mustLogin,function(req,res,next){
    //从请求体中得到文档
    var article = req.body;
    var articleId = article._id;
    if(articleId){//有值表示修改
        Model('Article').update({_id:articleId},{$set:{title:article.title,content:article.content}}).then(function(result){
            req.flash('success','文章更新成功');
            res.redirect('/article/detail/'+articleId);
        }).catch(function(err){
            req.flash('error','文章更新失败_'+err);
            res.redirect('back');
        });
    }else{//反之是新增
        article.user = req.session.user._id;
        delete article._id;
        //新增的时候，_id传过来的是空字符串，因为_id主键不能为空，所以要删除此字段
        //如果_id有值的话，mongodb会直接尝试保存，如果为空，mongodb会自动生成一个合法的_id值
        //把此文件存放到数据库里
        Model('Article').create(article,function(err,doc){
            if(err){
                req.flash('error','文章发表失败!');
                res.redirect('back');
            }else{
                req.flash('success','文章发表成功!');
                res.redirect('/');
            }
        })
    }
});
//查看详情
router.get('/detail/:_id',function(req,res,next){
    var articleId = req.params._id;
    //find，findById，findOne 等等都返回一个i额promise对象
    Model('Article')
        .update({_id:articleId},{$inc:{pv:1}})
        .then(function(data){
            return Model('Article').findById(articleId).populate('comments.user');
        }).then(function(doc){
            res.render('./article/detail',{title:'文章详情',article:doc});
        }).catch(function(err){
            req.flash('error','查询文章详情失败'+err);
            res.redirect('back');
        });
});
//删除
router.get('/delete/:id',function(req,res,next){
    var deleteId = req.params.id;
    console.log(deleteId);
        //直接删除的话是Model('Article').remove({_id:deleteId}).then(function(doc){
    Model('Article').remove({_id:deleteId}).then(function(doc){
        req.flash('success','删除发表成功!');
        res.redirect('/');
    }).catch(function(err){
        req.flash('error','删除文章失败'+err);
        res.redirect('/');
    });
});
//修改文章
/*
* 1 点击编辑链接跳到增加文章的页面，并且回显文章原来的内容
* 2 进行修改编辑，修改完成后保存文章
* */
router.get('/update/:_id',function(req,res,next){
    //获取文章id
    var articleId = req.params._id;
    //根据文章的id查询文章的文档对象
    Model('Article').findById(articleId).populate('comments.user').then(function(doc){
        //渲染模版并传递当前的文章对象
        res.render('article/add',{title:'编辑文章',article:doc});
    }).catch(function(err){
        req.flash('error','找不到文章'+err);
        res.redirect('/');
    });
});
//发表评论
router.post('/comment',function(req,res,next){
    var comment = req.body;
    Model('Article').update({_id:comment.articleId},{
        $push:{comments:{/*向数组中增加元素*/
            content:comment.content,
            user:req.session.user._id
        }}
    }).then(function(result){
        req.flash('success','发表评价成功');
        res.redirect('/article/detail/'+comment.articleId);
    }).catch(function(err){
        req.flash('error','失败'+err);
        res.redirect('back');
    });

});

module.exports = router;
