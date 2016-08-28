module.exports = function(name){
    /**
     * 读取环境变量中的debug值，如果和子集的名字一样，则输出msg
     * 如果不一样，什么都不做
     */
    return function(msg){
        //先获取环境变量中的debug值
        var debug = process.env.DEBUG;
        //进行字符串转换
        debug = '^'+debug.replace('*','.*');
        var regex = new RegExp(debug);
        if(regex.test(name)){
            console.log(name,msg);
        }
    }
};

