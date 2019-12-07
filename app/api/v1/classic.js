const Router = require('koa-router')
const router = new Router({
    prefix: '/v1/classic'
})

const { Flow } = require('../../models/flow')

const { Favor } = require('../../models/favor')

const { Art } = require('../../models/art')

const { HttpException, ParameterException } = require('../../../core/http-exception')

const { PositiveIntergerValdator, ClassicValidator } = require('../../validators/validator')

const { Auth } = require('../../../middlewares/auth')

// 使用这个鉴别token的中间键
router.get('/latest', new Auth().m(), async (ctx, next) => {
    // 权限除了登录权限还有角色权限
    // 角色分为管理员和角色
    // 我们可以在生成令牌的时候给这个角色设置上一个属性，这里我们设置的其实就是scope
    // 我这里设置普通用户的scope是8，
    

    // 这个接口要查询最新一期的数据，最新一期是index最大的一期在flow里面
    // 用到排序，把数据库的记录进行排序，倒序排序，找到最新的那个

    const flow = await Flow.findOne({  // findOne来找就会找第一个，因为里面要求是倒序排列，所以就找到最大的那个
        // 排序用order
        order: [
            ['index', 'DESC'] // 对index属性进行排序， DESC代表倒序
        ]
    })
    // 这里不光要给他返回flow表里面的信息，还要给他返回实体表的信息，所以要通过flow表的数据查询，实体表的数据
    // 相关逻辑写到model里面的art.js文件

    const art = await Art.getData(flow.artId, flow.dataValues.type)

    // 调用判断这个用户喜不喜欢该实体的方法,并且在下面把这个结果绑定到返回结果里面
    const likeLatest = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)

    // 要将两个表的信息合并
    // const newData = {
    //     index: flow.index,
    //     image: art.image
    // }

    // 找个简单的方式
    // art.index = flow.index   // 但是这样加不上
    // 因为只有在art对象里面的dataValues里面的东西才会被返回出来
    // 所以要把index挂在到art里面的dataValues里面去

    // art.dataValues.index = flow.index 但是这样也不是很好，这样是直接修改类里面的数据
    // 最好是用sequelize提供的内置的方法，更为合理
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', likeLatest)
    // 为什么koa这个框架知道去找一个类下面dataValue里面的数据去返回
    // 是sequelize定义的modul模型，比如这个art告诉koa框架去读取他里面的dataValues数据并返回

    // 问题：类如何序列化成对象
    ctx.body = art
})

// 获取下一期期刊
router.get('/:index/next', new Auth().m(), async (ctx) => {
    const v = await new PositiveIntergerValdator().validate(ctx, { // 这个校验器是在对id做校验，这里给他个别名index，让他对index对应id的规则做校验
        id: 'index'
    })
    // 获取参数是在path里面获取，获取方式不同
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where: {
            index: index + 1  // 当前期刊的下一期
        }
    })
    if (!flow) {
        throw new global.errs.NotFound()
    }
    const art = await Art.getData(flow.artId, flow.type)
    const likeNext = await Favor.userLikeIt(
        flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', likeNext)
    // art.exclude = ['index','like_status']
    ctx.body = art
})

router.get('/:index/previous', new Auth().m(), async (ctx) => {
    const v = await new PositiveIntergerValdator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where: {
            index: index - 1
        }
    })
    if (!flow) {
        throw new global.errs.NotFound()
    }
    const art = await Art.getData(flow.artId, flow.type)
    const likePrevious = await Favor.userLikeIt(
        flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', likePrevious)
    ctx.body = art
})

// 获取期刊详情
router.get('/:type/:id', new Auth().m(), async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = parseInt(v.get('path.type'))

    // 需要得到详细信息
    const artDetail = await new Art(id, type).getDetail(ctx.auth.uid)
    // 把点赞状态查出来之后插入进来一起返回

    // 这么写别人看不懂
    artDetail.art.setDataValue('like_status', artDetail.like_status)
    // 可以这么写
    // ctx.body = {
    //     art: artDetail.art,
    //     like_status: artDetail.like_status
    // }

    // 为了和前端对应导出一个属性出去
    ctx.body = artDetail.art
})

// 获取一个期刊的点赞情况，因为有些静态的东西可以在前端缓存
// 这种经常变的点赞信息就要提供一个借口单独知道
router.get('/:type/:id/favor', new Auth().m(), async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')

    // 因为这里取值不是从body里面取值了，body的取值是json，json可以自己判断是字符串还是数字
    // url里面直接取值或者从?后面取值取出来的都是字符串
    // 这里要把他转成数字
    const type = parseInt(v.get('path.type'))

    // 我们要获取所有的用户对这个期刊的点赞情况，和当前用户的点赞状态

    const artDetail = await new Art(id, type).getDetail(ctx.auth.uid)

    ctx.body = {
        fav_nums: artDetail.art.fav_nums,
        like_status: artDetail.like_status
    }
})

// 查询某一个用户点赞过的所有期刊
router.get('/favor', new Auth().m(), async ctx => {
    const uid = ctx.auth.uid
    ctx.body = await Favor.getMyClassicFavors(uid)
})

module.exports = router