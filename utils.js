/**
 * 1 如果一个方法需要在很多地方使用
 * @param str
 * @returns {*}
 */
exports.md5 = function(str){
    return require('crypto')
        .createHash('md5')//创建md5
        .update(str)//更新
        .digest('hex');//输出
};


