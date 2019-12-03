const Router = require('koa-router')
const router = new Router({
    prefix: '/v1/classic'
})

const { HttpException, ParameterException } = require('../../../core/http-exception')

const { PositiveIntergerValdator } = require('../../validators/validator')

const { Auth } = require('../../../middlewares/auth')

// 使用这个鉴别token的中间键
router.get('/latest', new Auth().m(), async (ctx, next) => {
    // 权限除了登录权限还有角色权限
    // 角色分为管理员和角色
    // 我们可以在生成令牌的时候给这个角色设置上一个属性，这里我们设置的其实就是scope
    // 我这里设置普通用户的scope是8，
    ctx.body = {
        key: ctx.auth
    }

})

module.exports = router