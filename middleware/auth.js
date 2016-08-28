//要求必须未登录才能继续向下执行，如果已经登录则不能继续，跳到首页
//这时一个权限判断的中间件
exports.mustNotLogin = function(req,res,next){
    //如果req.session.user有值，则人为此用户已经登录
    if(req.session.user){
        req.flash('error','此页面需未登录才能操作哦');
        res.redirect('/');
    }else{
        next();
    }
};
//此中间件要求登录之后才能访问
exports.mustLogin = function(req,res,next){
    //如果req.session.user有值，则人为此用户已经登录
    if(req.session.user){
        next();
    }else{
        req.flash('error','请登录后操作，请登录');
        res.redirect('/user/login');
    }
};

