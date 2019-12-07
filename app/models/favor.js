const { sequelize } = require('../../core/db')
const { Sequelize, Model, Op } = require('sequelize')
const { Art } = require('./art')

class Favor extends Model {
    // 业务表

    // 用户的喜欢操作

    // 如果没有喜欢
    // 1.就在favor上加一条数据
    // 2.并且在对应的实体表上修改fav_nums

    // 数据库事物
    // 我们要保证要么就执行1，2一起执行，要么就一起不执行，如果只执行一个则无法保证数据的一致性
    // 需要保证数据一致性需要用到数据库的事物

    // 关系型数据库的 ACID A代表原子性 C一致性 I隔离性 D持久性
    static async like(art_id, type, uid) {
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        if (favor) {
            throw new global.errs.LikeError()
        }
        // 这里一定要加return
        return sequelize.transaction(async t => {
            await Favor.create({
                art_id,
                type,
                uid
            }, {     // 在每一个操作后面都加上一个t，这个t就是从sequelize.transation里面传过来的t
                transaction: t
            })
            // 确定用户点赞的是哪个期刊

            // 这里有一个bug，我上面那个Art.getData调用了sequelize的scope
            // 之后再利用这个模型进行数据库的操作的时候就会出bug
            // 解决办法就是如果要进行后续操作就不要用scope了，这里给他一个参数来决定要不要用scope

            const art = await Art.getData(art_id, type, false)
            // 他返回的是sequelize模型
            // 这个是给他的fav_nums加操作
            await art.increment('fav_nums', {
                by: 1,  // 加一就是1
                transaction: t  // 这是个坑，他和上面的加事物的方式不同，是直接在后面加参数
            })
        })
    }

    static async disLike(art_id, type, uid) {
        // 这里删除我们需要利用我们查询出来的favor来删除，所以这里存一下
        // 简单来说Favor表示这个表，favor表示查询出来的一条记录
        const favor = await Favor.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        if (!favor) {
            throw new global.errs.DislikeError()
        }
        return sequelize.transaction(async t => {
            // 这里利用查询出来的favor来删除，删除自身这一条
            await favor.destroy({
                force: true,  // force 控制是真实的物理删除，还是软删除，软删除只会在deleted_at的地方进行标记来说明他是被删除的，物理删除就是把这一条数据删了
                transaction: t  // 这个transaction传的位置也个坑
            })
            const art = await Art.getData(art_id, type, false)
            // 减操作
            await art.decrement('fav_nums', {
                by: 1,
                transaction: t
            })
        })
    }

    // 这方法用来判断该用户喜不喜欢，找到了就喜欢，找不到就不喜欢
    static async userLikeIt(art_id, type, uid) {
        const favor = await Favor.findOne({
            where: {
                uid,
                art_id,
                type,
            }
        })
        return favor ? true : false
    }

    static async getMyClassicFavors(uid) {
        // 这里我们不是只查一条了，是要查多条
        const arts = await Favor.findAll({
            // 我们要对一个用户点赞的所有期刊查询，期刊不包括书籍
            where: {
                uid,
                // 排除一个type
                type:{
                    // sequlise提供了一些操作符，这个操作符就是排除
                    [Op.not]:400,
                }
            }
        })
        if(!arts){
            throw new global.errs.NotFound()
        }
        // 我们查询到的所有的art的列表都要在实体表中一一对应出来
        // 这里传进去的是一个数组
        // 这里一定不能去写一个循环，去遍历这个数组去查询数据库，这样查询次数不可控
        // 一定要把不可控的查询次数，变成固定的，要把所有的id变成集合传给数据库让数据库一下子查出来
        // 方法写到art model里面
        return await Art.getList(arts)
    }

    static async getBookFavor(uid, bookID){
        const favorNums = await Favor.count({
            where: {
                art_id:bookID,
                type:400
            }
        })
        const myFavor = await Favor.findOne({
            where:{
                art_id:bookID,
                uid,
                type:400
            }
        })
        return {
            fav_nums:favorNums,
            like_status:myFavor?1:0
        }
    }
}

// 这个模型是用来记录，每一个用户是否对一个期刊进行过点赞
// 点赞就加上记录，没有点赞就删除记录
Favor.init({
    uid: Sequelize.INTEGER,    // 标记用户
    art_id: Sequelize.INTEGER, // 和type一起标记期刊
    type: Sequelize.INTEGER
}, {
    sequelize,
    tableName: 'favor'
})

module.exports = {
    Favor
}

