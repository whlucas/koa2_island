const { flatten } = require('lodash')

const { Op } = require('sequelize')

const { Movie, Sentence, Music } = require('./classic')



class Art {
    constructor(art_id, type) {
        this.art_id = art_id
        this.type = type
    }

    // 获取点赞数量和当前用户的点赞状态
    async getDetail(uid) {
        // 这里出现了循环导入，art.js里面导入了favor，favor里面导入了art
        // 在这里把Favor的导入写到函数里面
        const { Favor } = require('./favor')
        // 查到实体表的点赞数量
        const art = await Art.getData(this.art_id, this.type)
        if (!art) {
            throw new global.errs.NotFound()
        }
        // 查到当前用户的点赞状态
        const like = await Favor.userLikeIt(
            this.art_id, this.type, uid)
        // 合并成对象一起返回，外面想用什么自己拿
        return {
            art,
            like_status: like
        }
    }


    // 一个对象处理一组对象，比较奇怪，不太好，适合做成静态方法
    static async getList(artInfoList) {
        const artInfoObj = {
            100: [],
            200: [],
            300: [],
        }
        // 数组循环用for of
        for (let artInfo of artInfoList) {
            artInfoObj[artInfo.type].push(artInfo.art_id)
        }
        const arts = []
        for (let key in artInfoObj) {
            // 如果要往for循环里面放逻辑，最好要把逻辑写成函数放到外面
            const ids = artInfoObj[key]
            // 如果其中有一种没有，是空数组，就跳过
            if (ids.length === 0) {
                continue
            }
            // 需要判断的是数字，obj里面的key直接使用的话是字符串
            key = parseInt(key)
            arts.push(await Art._getListByType(ids, key))
        }
        // 用flatten来使数组扁平化，原来的数组是[[],[],[]]这样的
        return flatten(arts)
    }

    static async _getListByType(ids, type) {
        let arts = []
        // 现在要查多个了，用in查询
        const finder = {
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        }
        // 我不要那些时间，所以要scope
        const scope = 'bh'
        switch (type) {
            case 100:
                // 用in查询查多个，用findAll，findOne是返回查到的第一个
                arts = await Movie.scope(scope).findAll(finder)
                break
            case 200:
                arts = await Music.scope(scope).findAll(finder)
                break
            case 300:
                arts = await Sentence.scope(scope).findAll(finder)
            case 400:
                break
            default:
                break
        }
        return arts
    }

    // 这个适合写成实例的方法
    // 通过flow表里面的art_id和type来查询实体表的信息，这里要利用到实体表来查询，导入实体表
    static async getData(art_id, type, useScope = true) {  // 默认scope的值是true

        let art = null
        const finder = {
            where: {
                id: art_id
            }
        }
        // 依照传过来的值来决定要不要用scope
        const scope = useScope ? 'bh' : null
        switch (type) {
            case 100:
                // 这里查询的时候加上在db.js里面定义的scope，对三个时间字段进行过滤
                art = await Movie.scope(scope).findOne(finder)
                break
            case 200:
                art = await Music.scope(scope).findOne(finder)
                break
            case 300:
                art = await Sentence.scope(scope).findOne(finder)
                break
            case 400:
                const {
                    Book
                } = require('./book')
                art = await Book.findOne(finder)
                if (!art) {
                    art = await Book.create({
                        id: art_id
                        // 还有一个字段点赞数量，由于是新建的，默认是0可以不填
                    })
                }
                break
            default:
                break
        }

        // 数据库里面记录的是相对路径
        // 我请求图片的时候讲我请求到的静态资源的地址前面加上我的这个服务器的地址
        // 这里还不是最源头的地方，这样改的话要改很多个地方，最好还是在image字段一开始查询出来的时候就给他改了
        // if (art && art.image) {
        //     let imgUrl = art.dataValues.image
        //     art.dataValues.image = global.config.host + imgUrl
        // }
        return art
    }
}

module.exports = {
    Art
}