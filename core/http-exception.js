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

class Success extends HttpException{
    constructor(msg, errorCode) {
        super()
        this.code = 201  // 提交一个数据成功用201，查询成功是200
        this.msg = msg || 'ok'
        this.errorCode = errorCode || 0
    }
}

class NotFound extends HttpException {
    constructor(msg, errorCode) {
        super()
        this.code = 404 // 资源未找到
        this.msg = msg || '资源未找到'
        this.errorCode = errorCode || 10000
    }
}

class AuthFailed extends HttpException {
    constructor(msg, errorCode) {
        super()
        this.code = 401 
        this.msg = msg || '授权失败'
        this.errorCode = errorCode || 10004
    }
}

class Forbbiden extends HttpException {
    constructor(msg, errorCode) {
        super()
        this.code = 403
        this.msg = msg || '禁止访问'
        this.errorCode = errorCode || 10006
    }
}

class LikeError extends HttpException {
    constructor(msg, error_code) {
        super()
        this.code = 400
        this.msg = "你已经点赞过"
        this.error_code = 60001
    }
}

class DislikeError extends HttpException {
    constructor(msg, error_code) {
        super()
        this.code = 400
        this.msg = "你已取消点赞"
        this.error_code = 60002
    }
}

module.exports = {
    HttpException,
    ParameterException,
    Success,
    NotFound,
    AuthFailed,
    Forbbiden,
    LikeError,
    DislikeError
}