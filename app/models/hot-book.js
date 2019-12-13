const {sequelize} = require('../../core/db')
const {Sequelize,Model,Op} = require('sequelize')
const {Favor} = require('./favor')

class HotBook extends Model{
    static async getAll(){
        // 查出所有数据库里面的热门数据，并以index为顺序查出
        const books =await HotBook.findAll({
            order:[
                'index'
            ]
        })
        // 不光要返回书籍，还要返回每一个书籍的点赞信息
        // 需要在favor表里查询20本书籍中每一本书籍的点赞数量

        // 把查到的所有的id号都存到一个数组里面
        const ids = []

        // forEach里面的回调不能用async await 来写异步，会出bug
        books.forEach((book)=>{
            ids.push(book.id)
        })
        // 需要得到这么一个数据结构
        // [{id: 777, count: 8},{id: 888, count: 10}]
        const favors =await Favor.findAll({
            // 光有where查询出来的是一条一条的记录
            where:{
                art_id:{  // 对id进行in查询，要用这种格式
                    [Op.in]:ids,
                },
                type:400
                // 国画
                // 漫画
            },
            // 如果有十个用户对同一个art_id进行点赞,则有十个点赞记录
            // 可以把这些记录全部查出来去遍历这个大对象，自行分组
            // 需要分组查询，把相同的art_id分组

            // 用art_id分组就是这么个情况
            // {
            //     art_id1: [记录1，记录2] 再来一个count关键字就统计记录的数量并且作为value
            //     art_id2: [记录1，记录2]
            // }
            group:['art_id'], 
            // arrributes决定到底查询出来的是那些字段
            // art_id代表书的编号，和count
            // count用secquelize的帮助函数来做COUNT，对所有的记录数量进行求和，第二个参数填*没有为什么，求出来的字段名字是count
            attributes:['art_id', [Sequelize.fn('COUNT','*'),'count']]
            // attributes:['art_id', [Sequelize.fn('SUM','score'),'sumScore']]  对分数字段求和
        })
        books.forEach(book=>{
            // 这里写一个重新组织返回信息的方法，把favor里面的信息赋给count
             HotBook._getEachBookStatus(book, favors)
        })
        return books
    }

    static _getEachBookStatus(book, favors){
        // 要给个默认值，要不然可能查不出来报错
        let count = 0
        favors.forEach(favor=>{
            if(book.id === favor.art_id){
                // 用get方法可以直接拿到值
                count = favor.get('count')
            }
        })
        // 给book添加属性
        book.setDataValue('fav_nums', count)
        return book
    }
}

HotBook.init({
    // 不需要存储详情信息，存一下概要信息，详情去调接口
    index: Sequelize.INTEGER, // 这是一个用来排序的字段，在查出来的时候利用这个排序字段来决定查出来的顺序
    image: Sequelize.STRING,  // 封面图
    author: Sequelize.STRING, // 作者
    title: Sequelize.STRING   // 题目
},{
    sequelize,
    tableName:'hot_book'
})

module.exports = {
    HotBook
}
// 排序 重要