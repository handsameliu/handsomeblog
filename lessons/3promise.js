var fs = require('fs');
function readFile(fileName){
    /*
    * promise 最初的状态是初始状态
    * 调用resolve表示成功了，就会把状态改为成功
    * 调用reject表示失败了，就会把状态改为失败
    * */
    return new Promise(function(resolve,reject){
        //当创建promise实例的时候，此函数就开始执行了
        fs.readFile(fileName,'utf8',function(err,data){
            if(err){
                reject(err)
            }else{
                resolve(data);
            }
        });
    });
}
//promise的链式调用  在于回调里返回一个新的promise
readFile('./1.txt').then(function(data){
    return readFile(data,'utf8');
}).then(function(data){
    return readFile(data,'utf8');
}).then(function(data){
    console.log(data);
}).catch(function(err){//统一捕捉错误信息，不用每个参数中都传入error方法捕获错误
    console.log(err);
});

