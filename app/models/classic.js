// 技巧 在这个项目里面，找了一些关键词
// music sentence movie 合称为classic
// music sentence movie book 合称为art 

const { Sequelize, Model } = require('sequelize')
const { sequelize } = require('../../core/db')

// 讲道理我们应该定义一个基类去继承Model，然后子类去继承基类，去直接定义sequelize，但是这种方式sequelize不支持
// 所以我们用了下面的方式，原因就是他的用init这种方式去建表，而不是直接在class里面去定义

// 这里先抽离出来music sentence movie这三者共同的东西
const classicFields = {
    image: {
        type: Sequelize.STRING,    // 图片
        // 这里来一个get，每当我读取这个image里面的东西的时候都要走这个方法，同理password加密时用到的set
        // get() {
        //     return global.config.host + this.getDatavalue('image')
        // }
        // 如何拿到拼接过后的image字段，就是在查询语句的下面，比如查询结果返回给art了，那就是const i = art.get('image') 或者直接 const t = art.image就拿到了
        // 拿到原始的数据库里面的url const s = art.getDataValue('image')

        // 但是在这个里面不好使
        // 本来是好使的在最后把结果传出的时候调用内置的序列化方法，就可以调用这个里的get方法得到拼接过后的url
        // 但是我们在db.js里面重写了model的toJSON方法，返回的是我克隆之后的this.dataValues里面的字段，这个里面的字段直接返回是不受这里的get方法的影响的，所以就还是原来的了

        // 所以一个不是很好的方法就是要再对我们自己重写的这个toJSON里面的方法动手脚
    },
    content: Sequelize.STRING,     // 内容
    pubdate: Sequelize.DATEONLY,   // 发布日期
    fav_nums: {                    // 点赞数量
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    title: Sequelize.STRING,       // 标题
    type: Sequelize.TINYINT,       // 代号，用来标记是哪一类
}



// 电影和句子就是上面的六个，可以拿来直接建表
class Movie extends Model {}

Movie.init(classicFields, {
    sequelize,
    tableName: 'movie'
})

class Sentence extends Model {}

Sentence.init(classicFields, {
    sequelize,
    tableName: 'sentence'
})

// music比他们多一个链接，所以要再加一条之后建表
class Music extends Model {}

const musicFields = Object.assign({
    url: Sequelize.STRING
}, classicFields)

Music.init(musicFields, {
    sequelize,
    tableName: 'music'
})


module.exports = {
    Movie,
    Sentence,
    Music
}