const { sequelize } = require('../../core/db')
const axios = require('axios')
const util = require('util')
const { Sequelize, Model } = require('sequelize')

const {Favor} = require('@models/favor')

class Book extends Model {

    // 自定义的模型里面不可以写constructor！！！

    // constructor(id) {
    //     super()
    //     this.id = id
    // }

    async detail(id) {
        // 利用node提供的方法把这个id嵌入到url里面
        const url = util.format(global.config.yushu.detailUrl, id)
        // 利用这个url去调接口
        const detail = await axios.get(url)
        return detail.data
    }
    
    static async getMyFavorBookCount(uid) {
        // 我只求数量可以直接用.count来查询
        const count = await Favor.count({
            where: {
                type: 400,
                uid
            }
        })
        return count
    }

    static async searchFromYuShu(q, start, count, summary = 1) {
        const url = util.format(
            // 这里搜索关键字q可能是中文，需要进行编码
            global.config.yushu.keywordUrl, encodeURI(q), count, start, summary)
        const result = await axios.get(url)
        return result.data
    }
}

// 这个book表用来存储book的相关业务
Book.init({
    // 这个id不能让sequlize来进行赋值，要我们自己来定义这个主键，并且自己给这个主键赋值
    id: {
        type: Sequelize.INTEGER,
        // 设置成主键
        primaryKey: true
    },
    // 业务字段只需要这一个点赞信息
    fav_nums: {
        type: Sequelize.INTEGER,
        // 给他一个默认值，如果插入一个空的book它会给他一个值为0的这个属性
        defaultValue: 0
    }
}, {
    sequelize,
    tableName: 'book'
})

module.exports = {
    Book
}