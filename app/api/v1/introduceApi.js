const Router = require('koa-router')
const router = new Router()

const { HttpException, ParameterException } = require('../../../core/http-exception')

const { PositiveIntergerValdator } = require('../../validators/validator')

router.post('/v1/:id/classic/latest', async (ctx, next) => {
    // 拿到参数
    // 这样的路由可以在：后面有一个id参数
    const path = ctx.params // 这个可以获取路由里面的:id这样的参数
    const query = ctx.request.query // 这个可以获得？后面拼接的参数
    const headers = ctx.request.header // 这个可以获得header里面的参数
    // body里面的参数用koa-bodyparser这个插件获取,这是个中间键，需要在app.js里面注册一下,这里就可以用了
    const body = ctx.request.body


    // 参数校验
    // 1.参数类型传错了
    // 2.必传参数没传
    // 3.格式不对

    // 这里的参数校验用了作者开发的一个库

    // 这里用一下我们的参数校验
    // const v = new PositiveIntergerValdator()
    // v.validate(ctx) // 调用这个validate方法并且把ctx传进去，他能帮你找到你这个校验器需要校验的参数名并且看一下规则对不对
    // 也可以直接在new后面链试调用
    const v = await new PositiveIntergerValdator().validate(ctx)
    // 利用lin-valdator来获取参数
    // 这里会自动把他转换为整形，如果不要这个功能，在后面加一个参数parsed=false
    const id = v.get('path.id', parsed = false) // 利用这个v里面的get方法可以获取参数，path代表获取路径里面的参数，id代表获取参数名

    // 这种方式可以获取嵌套对象里面的参数通过a.b.e这样的方式来获取，且不用判断不存在的情况，如果没有的话只会给你返回一个空值

    // 异常处理 原理写在更目录的exceotionHandling_introduce里面

    // 编写一个中间键来实现异常处理
    // 这个些个中间键放到middilewares文件夹里面

    // 假设我们的api里面出现了一个异常
    // 那我们需要在中间键函数里面监听到这个异常
    // 然后输出一段有意义的提示信息

    // 已知错误
    // 比如
    if(false){
        // 抛出的error里面需要携带message、error_code、httpStateCode、request_url
        const error = new Error('为什么错误')
        error.errorCode = 10001
        error.status = 400 // 一般400代表参数错误
        error.requestUrl = `${ctx.method} ${ctx.path}`
        throw error
    }
    // throw new Error('API Exception')

    // 但是上面那么写太麻烦惹，不能每次都这样复制粘贴，需要通过面向对象的方式来写
    // 写在core文件夹下面的 http-exception.js
    if (false) {
        // 利用面向对象的思想
        const error = new HttpException('为什么错误',10001,400)
        const ParamsError = new ParameterException()

        // 我在启动的时候将这些异常类都放在global全局变量下面，在这里面就不用导入直接用了,但是不推荐，不好排查错误
        const ParamsError2 = new global.errs.ParameterException()

        // error.requestUrl = `${ctx.method} ${ctx.path}` // 这个可以在中间键里面有，所以不用传入，直接在抛出错误的中间键函数中就可以得到
        // 因为他继承了原来的error所以可以被throw
        throw ParamsError2
    }

    ctx.body = {
        key: 'classic'
    }

})

module.exports = router