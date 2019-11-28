const { Sequelize, Model } = require('sequelize') // 用后面接冒号的形式可以给这个改名
const { sequelize } = require('../../core/db') 

// 这里需要定义模型，用面向对象的形式
class User extends Model {

}

User.init({ // 第一个参数：表头
    // 如果我们没有显示的自己创建id，则sequelize会自动的给我们创建一个主键id
    // 这里主动的设置一下
    // 如果非要自己设置id编号，最好用数字，因为他的查询性能是最好的，尤其不能用最忌字符串，查询起来很慢
    // 自定义的时候要考虑并发的时候会不会重复，下一个用户来的时候要查一下当前的编号编到哪了
    // 为什么自增长不好，它会暴露用户的id号，但这种担心没必要
    // 我们要做到的是即使他获取到了编号也没办法获取用户信息
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true, // 设置为主键
        autoIncrement: true // 设置为自增长的
    },
    nickname: Sequelize.STRING, // 后面接这个参数的数据类型,利用sequelize里面的内置类型
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    // 如果想进行更详细的定义,利用对象的方式创建

    // 这个是微信小程序给每一个用户创建的id，一个用户对一个小程序的id是唯一的，但是一个用户对多个小程序则有很多openid
    // 如果我要找永远标识这个用户的id叫做unionID

    // 如果这个小程序将来的用户不一定非要是微信小程序的，不是微信小程序的就没有这个openid,所以这个作为id不合适
    openid: {
        type: Sequelize.STRING(64),
        unique: true
    },

    // 如果我在这里先运行一遍了
    // 之后我还想再加上一个test字段,发现加不上
    // 解决办法把之前的表删掉，再运行一遍
    // 第二个办法在sequlize.sync()里面加参数
    // test: Sequelize.STRING


}, {
    sequelize, // 来指定实例化后的sequelize
    tableName: 'user' // 规定这个表名
}) 