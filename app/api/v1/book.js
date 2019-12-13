const Router = require('koa-router')


const { HotBook } = require('@models/hot-book')
const { Book } = require('@models/book') // 这个引入的别名在package.json里面定义了
const { Favor } = require('@models/favor')
const { Comment } = require('@models/book-comment')
const { PositiveIntergerValdator, SearchValidator, AddShortCommentValidator } = require('@validator')

const { success } = require('../../lib/helper')

const { Auth } = require('../../../middlewares/auth')

const router = new Router({
    prefix: '/v1/book'
})

// 我们不能把图书的所有的详细信息都放到数据库里面
// 要把它做成服务的形式，在旧岛里面去调用这些基础数据
// 在旧岛里面只需要创建一个book的业务数据库
// 提高了图书数据的公用性

router.get('/hot_list', async (ctx, next) => {
    const books = await HotBook.getAll()
    ctx.body = books
})

// 获取某一个id的图书详情
router.get('/:id/detail', async ctx => {
    const v = await new PositiveIntergerValdator().validate(ctx)
    const book = new Book()
    ctx.body = await book.detail(v.get('path.id'))
})

// 查询接口
router.get('/search', async ctx => {
    const v = await new SearchValidator().validate(ctx)
    const result = await Book.searchFromYuShu(
        v.get('query.q'), v.get('query.start'), v.get('query.count'))
    ctx.body = result
})

// 获取某一个用户点了多少赞
router.get('/favor/count', new Auth().m(), async ctx => {
    const count = await Book.getMyFavorBookCount(ctx.auth.uid)
    ctx.body = {
        count
    }
})

// 获取一本书籍的点赞数量，和这个id是否点赞情况
router.get('/:book_id/favor', new Auth().m(), async ctx => {
    const v = await new PositiveIntergerValdator().validate(ctx, {
        id: 'book_id'
    })
    const favor = await Favor.getBookFavor(
        ctx.auth.uid, v.get('path.book_id'))
    ctx.body = favor
})

// 添加一个短评
router.post('/add/short_comment', new Auth().m(), async ctx => {
    const v = await new AddShortCommentValidator().validate(ctx, {
        id: 'book_id'
    })
    Comment.addComment(v.get('body.book_id'), v.get('body.content'))
    success()
})

// 获取短评
router.get('/:book_id/short_comment', new Auth().m(), async ctx => {
    const v = await new PositiveIntergerValdator().validate(ctx, {
        id: 'book_id'
    })
    const book_id = v.get('path.book_id')
    const comments = await Comment.getComments(book_id)
    ctx.body = {
        comments,
        book_id
    }
})


router.get('/hot_keyword', async ctx => {
    ctx.body = {
        'hot': ['Python',
            '哈利·波特',
            '村上春树',
            '东野圭吾',
            '白夜行',
            '韩寒',
            '金庸',
            '王小波'
        ]
    }
    // 搜索次数最多
    // 一部分参考算法，人工编辑
    // Lin-CMS，编辑热门关键字的功能
})

// 爬虫 必备工具 数据处理和分析
// KOA
// Python 爬虫工具 requests，BF4，Scrapy
// node.js 正则表达式

module.exports = router