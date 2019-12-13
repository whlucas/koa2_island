const {sequelize} = require('../../core/db')
const {
    Sequelize,
    Model
} = require('sequelize')

class Comment extends Model{

    // 在这里定义exclude也不太好
    // sequelize最好不要在构造函数里面定义字段，可以定义在这个模型的原型链上面
    // 一旦在这里定义了构造函数,并且用了这个模型去做查询,那么再返回结果里面只会给你保留设置了defaulValue的字段
    // constructor(id) {
    //     super()
    //     this.exclude = []
    // }

    // 新增评论的方法，顺道做了点赞的功能
    static async addComment(bookID, content){
        // 先查一下看有没有
        const comment = await Comment.findOne({
            where:{
                book_id:bookID, 
                content // 内容完全相同
            }
        })
        // 如果没有就添加一次记录，有的话就num加一
        if(!comment){
            // 存一条记录
            // 你好酷 你真酷，
            return await Comment.create({
                book_id: bookID,
                content,
                nums:1
            })
        }else{
            return await comment.increment('nums', {
                by: 1
            })
        }
    }

    // 查询bookid的所有短评
    static async getComments(bookID) {
        const comments = await Comment.findAll({
            where: {
                book_id: bookID
            }
        })
        return comments
    }

    // ctx.body传入的一般都是一个对象，koa会自动帮我们调用JSON.stringify进行序列化，这个对象一般都是一个模型
    // 这个模型都是基于model这个基类定义的，所以在model上面重写这个toJSON方法就可以实现自己的序列化

    // 这个模型里面的可以和定义在model原型链里面的toJSON同时起作用
    toJSON(){
        return {
            // 由于在api里面返回出去的是模型，
            // 所以要在这里定义返回出去的这个模型的属性
            // 在这个里面如何取到这个模型定义的属性
            // 在外面设置这个模型的属性可以用getDataValue
            // 在这里就可以用getDataValue就可以拿到在init的时候定义的这个模型的属性
            // 这个是实例化的方法,这个this就是这个类,他下面有很多方法
            // 或者直接this.content也可以取到
            content:this.getDataValue('content'),
            nums:this.getDataValue('nums'),
            // 这么写的好处就是只要我的ctx.body返回这个模型，那么他就会返回我这个里面定义的结果

            // 我有很多字段，删除几个返回其他的怎么办
            // this.dataValues可以拿到所有的字段，把这个拷贝一份，删除不要的，再返回就可以了
        }
    }
}

// 在这里在prototype上面的exclude上赋值一个数组，这个数组里面是排除模型里面字段的名称
// 我在model的原型链上面定义了这个方法将他们排除
// 但最好不要在原型链上面去改这个，太通用了，写死了，最好在api里面去改这个东西
// 举例在classic里面next接口
// Comment.prototype.exclude = ['book_id','id']



Comment.init({
    // 内容
    content:Sequelize.STRING(12),
    // 记录热门短频的数量，如果第二个人输入了同一个短频，这个num加一，等同于点赞，点赞这个也加一
    nums:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    book_id:Sequelize.INTEGER,
    // 这里可以定义exclude，它会出现在对象里面，但是这里定义的都会出现在数据表里面
    // exclude:['book_id','id']
},{
    sequelize,
    tableName:'comment'
})

 module.exports = {
     Comment
 }