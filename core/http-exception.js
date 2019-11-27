// 这个class是继承自原来的Error的
// 这里constructor表示创建的时候需要传的参数，并设置了默认值
class HttpException extends Error{
    constructor(msg='服务器异常', errorCode = 10000, code = 400) {
        super()
        this.errorCode = errorCode,
        this.code = code,
        this.msg = msg
    }
}

// 定义一些具体的异常类，让他继承自上面的HttpException

class ParameterException extends HttpException{
    constructor(msg, errorCode) {
        super()
        // 通常来说参数错误code是固定的
        this.code = 400
        this.msg = msg || '参数错误'
        this.errorCode = errorCode || 10000
    }
}

module.exports = {
    HttpException,
    ParameterException
}