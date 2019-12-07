// 点赞方面的api

const Router = require('koa-router')
const { LikeValidator } = require('../../validators/validator')
const { Favor } = require('../../models/favor')

const { success } = require('../../lib/helper')

const { Auth } = require('../../../middlewares/auth')

const router = new Router({
    prefix: '/v1/like'
})

// 要权限，不写就是1，还有令牌的验证
router.post('/', new Auth().m(), async ctx => {
    // validate接收第二个参数别名，加了这个就会去检测art_id，而不是id了
    const v = await new LikeValidator().validate(ctx, {
        id: 'art_id'
    })
    // 调用Favor里面的like逻辑
    await Favor.like(
        // 这里的uid是通过令牌传过来的，所以不用做参数校验
        // 这个uid是登录的时候的放到令牌里面用户id，这里uid不用前端传，防止伪造
        // 我令牌对了，但是我修改了uid号则可以拿到别人的信息
        // 解决办法就是不让前端传，自己从令牌里面去获取
        v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})

router.post('/cancel', new Auth().m(), async ctx => {
    const v = await new LikeValidator().validate(ctx, {
        id: 'art_id'
    })
    await Favor.disLike(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})

module.exports = router
