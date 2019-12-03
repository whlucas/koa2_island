// 这里定义一个中间键用来判断token是否合法

// 用类的方式来定义这个中间键，最后返回一个函数，因为中间键需要是一个async函数

const basicAuth = require('basic-auth') // 用这个来解析token

const jwt = require('jsonwebtoken')

class Auth {
    // 这个构造函数可以接收一个参数
    // 这个参数是当前接口的权限等级，将这个等级和用户的权限等级进行比较，来判断该用户能不能访问当前接口
    constructor(level) {
        // 在这里来定义一些变量来进行权限的管理
        this.level = level || 1
        Auth.USER = 8
        Auth.ADMAIN = 16
    }

    m() {
        return async (ctx, next) => {
            let errMsg = 'token不合法'
            // 对token进行检测
            // 如何获取token需要看前端是怎么传过来的
            // 可放到body或者header里面的
            // http里面规定了的一种省份验证的机制 HttpBasicAuth
            // 这里用postman来发请求，在Authorization里面选择basic Auth 里面把user 填成token, 他这里帮你发请求会帮你加密，自己用代码发请求就要自己用base64加密了
            const userToken = basicAuth(ctx.req)  // 用这个包可以自己去找出这个里面的token
            // ctx.req  获取的是node.js里面原生的request对象
            // ctx.request 获取的是koa封装的过后的request对象

            // 判断token的合法性
            // 是否存在
            if(!userToken || !userToken.name){
                throw new global.errs.Forbbiden(errmsg)
            }
            console.log(userToken.name, global.config.security.secretKey)
            try {
                // 用这个包来校验令牌 第一个传token，第二个传key
                // 它会返回出来一个对象里面记录这个令牌里面的信息
                var decode = jwt.verify(userToken.name, global.config.security.secretKey)
            } catch (error) {
                // 如果有异常就可以把这个抛出来
                // 需要判断token是不合法还是过期了
                if(error.name == 'TokenExpiredError'){
                    errMsg = 'token已过期'
                }
                throw new global.errs.Forbbiden(errMsg)
            }

            // 用户权限的校验
            console.log(decode.scope, this.level)
            if(decode.scope <= this.level){
                errMsg = '权限不足'
                throw new global.errs.Forbbiden(errMsg)
            }

            // 没有抛出错误就合法
            // 把生成令牌的时候保存在令牌里面的信息取出来放到ctx里面去，方便之后调用
            ctx.auth = {
                uid: decode.uid,
                scope: decode.scope
            }
            // 执行下一个中间键
            await next()
        }
    }

    // 还有一种写法是把这个m写成一个属性，用get方法，调用这个属性m的时候返回一个函数
    // get m() {
    //     return async (ctx, next) => {

    //     }
    // }

}

module.exports = {
    Auth
}