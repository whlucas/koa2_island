const { HttpException } = require('../core/http-exception')
// 我们需要在这个中间键函数里面监听到这个异常
// 然后输出一段有意义的提示信息

// 中间键函数可以接收两个参数
const catchError = async (ctx, next) => {
    // 参考异常处理的原理部分，我们需要监听下一个函数，所以只需要监听next就行了
    try {
        await next() 
    } catch (error) {
        // 处理异常，将有效地信息返回到客户端去

        // 我们需要把error 简化 返给给前端清晰明了的信息
        // 1. http状态码
        // 2. message自己写的提示信息
        // 3. 开发者自己定义的error_code,前端用来进行逻辑判断
        // 当前请求的url
        // ctx.body = '有点问题'   
        
        // 错误分类
        // 已知型错误，可以判断出来的错误
        // 未知型错误，链接数据库时密码输错了

        // 如果是已知异常则一般带有error_code
        if(error instanceof HttpException){
            ctx.body = {
                msg: error.msg,
                error_code: error.errorCode,
                request: `${ctx.method} ${ctx.path}`
            }
            // 设置一下httpStatusCode
            ctx.status = error.code
        } else{ // 处理未知异常
            ctx.body = {
                msg: 'we made a mistake',
                error_code: 999,
                request: `${ctx.method} ${ctx.path}`
            }
            // 一般未知异常返回500
            ctx.status = 500 
        }
    }
}

module.exports = catchError