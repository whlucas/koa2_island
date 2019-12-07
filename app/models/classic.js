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