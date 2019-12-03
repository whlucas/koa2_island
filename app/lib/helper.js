// 这个里面来定义成功的返回,只不过是吧new一个对象的方式变为一个函数的方式

function success(msg, errorCord){
    throw new global.errs.Success(msg, errorCord)
}

module.exports = { success }