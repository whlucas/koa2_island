// 用sequelize来链接数据库
const { Sequelize } = require('sequelize')
const {
    dbName,
    host,
    port,
    user,
    password
} = require('../config/config').database
// 首先需要实例化
// 他可以接收四个参数 dbName, 账号，密码，js对象
const sequelize = new Sequelize(dbName, user, password, {
    dialect: 'mysql', // 设置链接的数据库的类型，需要npm install mysql2 --save
    host,
    port,
    logging: console.log, // 显示原始的命令行
    timezone: '+08:00', // 设置时区为北京时间
    define: {
        timestamps: true, // 改成false 不会给你多生成create_time update_time字段
        // create_time update_time delete_time 这几个最好加上，记录每一条数据的相关时间
        paranoid: true, // 这个设置为true他会给你生成一个delete_time，用于记录删除时间
        createdAt: 'created_at', // 定义这个create_at的格式可以定义表createdAt生成格式
        updatedAt: 'updated_at', // 同理
        deletedAt: 'deleted_at',
        underscored: true // 这个写成true可以把所有的驼峰变成下划线，数据库的规范一般是下划线命名
    }
})

// 想要生成数据表必须要加上这一行，加了才会把那些模型都创建到数据库里面
sequelize.sync({
    // 这个force一定不能设置成true，只有开发阶段可以暂时改为true
    force: false // 把force设置成true，如果在model里面的user模块中加一个字段，则它会自动把之前的表删了，重新再建一个表
    // 上线阶段可以直接在DG里面改表，手动维护
})

module.exports = {
    sequelize
}