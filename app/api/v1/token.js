const Router = require('koa-router')

const { success } = require('../../lib/helper')

const { LoginType } = require('../../lib/enum')

const { TokenValidator, NotEmptyValidator } = require('../../validators/validator')

const { User } = require('../../models/user')

const { generateToken } = require('../../../core/util')

const { Auth } = require('../../../middlewares/auth')

const { WXManager } = require('../../services/wx')

const router = new Router({
    prefix: '/v1/token' // 前缀
})



// 有些api是不需要权限访问的，叫做公开api，非公开api要携带令牌才能访问

router.post('/', async (ctx) => {
    const v = await new TokenValidator().validate(ctx)
    // 对不同的登录方式type进行不同的处理
    let token
    switch (v.get('body.type')) {
        case LoginType.USER_EMAIL:
            token = await emailLogin(v.get('body.account'), v.get('body.secret'))
            break;
        case LoginType.USER_MINI_PROGRAM:
            // 用小程序哦方式登录要拿到前端传的code并传入
            token = await WXManager.codeToToken(v.get('body.account'))
            break
        default:
            throw new global.errs.ParameterException('没有相应的处理函数')
    }
    ctx.body = {
        token
    }
})


// 验证令牌的接口
router.post('/verify', async (ctx) => {
    // 首先对参数进行校验
    const v = await new NotEmptyValidator().validate(ctx)
    const result = Auth.verifyToken(v.get('body.token'))
    ctx.body = {
        is_valid: result
    }
})


// 处理的业务逻辑在外面用函数写
// email登录的校验
async function emailLogin(account, secret) {
    // 这个逻辑可以写在user模型里面
    // 我在User模型里面定义了一个静态方法，可以用来判断密码是不是匹配
    const user = await User.verifyEmailPassword(account, secret) // 返回查询到的user，后面要用
    // 这个接口设置为普通用户登录的接口，所以就给他设置普通用户的scope
    return generateToken(user.id, Auth.USER) // scope代表这个用户的权限等级，把生成的这个token返回
}


module.exports = router