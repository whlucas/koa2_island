// 用sequelize来链接数据库
const { Sequelize,Model } = require('sequelize')
const { unset, clone, isArray } = require('lodash')
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
        underscored: true, // 这个写成true可以把所有的驼峰变成下划线，数据库的规范一般是下划线命名

        // 这里我们在全局上定义一些预先的查询条件scopes，在这定义的可以在所有的model里面调用，当然scopes也可以定义在model里面
        scopes: {
            // key名可以随便来，每一个key代表一组查询条件，调用的时候使用，可以定义很多
            bh: {
                attributes: {
                    exclude: ['updated_at','deleted_at','created_at']
                }
            }
        }
    }
})

// 想要生成数据表必须要加上这一行，加了才会把那些模型都创建到数据库里面
sequelize.sync({
    // 这个force一定不能设置成true，只有开发阶段可以暂时改为true
    force: false // 把force设置成true，如果在model里面的user模块中加一个字段，则它会自动把之前的表删了，重新再建一个表
    // 上线阶段可以直接在DG里面改表，手动维护
})

// ctx.body传入的一般都是一个对象，koa会自动帮我们调用JSON.stringify进行序列化，这个对象一般都是一个模型
// 这个模型都是基于model这个基类定义的，所以在model上面重写这个toJSON方法就可以实现自己的序列化
// 由于在api里面返回出去的是模型，所以要在toJSON中定义返回出去的这个模型的属性
// 如何把这个对象定义在基类model上面，用原型链
// 因为希望所有的model在被toJSON实例化的时候都不要返回关于时间的字段
Model.prototype.toJSON = function () {
    // 先用lodash拷贝一下，防止删除模型里面的数据，cloneDeep是深拷贝
    let data = clone(this.dataValues)
    // lodash里面的删除属性方法
    unset(data, 'updated_at')
    unset(data, 'created_at')
    unset(data, 'deleted_at')

    // 由于这里重写了toJSON
    // 我最后返回的是这个dataValue里面的东西，这个里面的东西不会受get写在模型里面的get方法影响，干扰了原先toJSON调用get方法返回的逻辑，所以这里要拿到这个里面的东西强行加上前缀
    for (key in data) {
        if (key === 'image') {
            // 由于数据库里面可能有些存的不是相对路径，是以http开头的绝对路径，所以要再判断一下
            if (!data[key].startsWith('http'))
                data[key] = global.config.host + data[key]
        }
    }

    if (isArray(this.exclude)) {
        // 我在模型上面的原型链上挂一个exclude，他是一个数组，数组里面是要排除的字段
        // 然后遍历数组，前提是判断传进来的是一个数组
        this.exclude.forEach(
            (value) => {
                unset(data, value)
            }
        )
    }
    // this.exclude
    // exclude
    // a,b,c,d,e
    return data
}

module.exports = {
    sequelize
}