const {sequelize} = require('../../core/db')
const {Sequelize,Model} = require('sequelize')


class Flow extends Model{

}

// 数据库表与表之间要有关联

Flow.init({
    index: Sequelize.INTEGER,   // 期刊的序号
    artId: Sequelize.INTEGER,  // 实体表的id，查到真正实体的相关信息
    type: Sequelize.INTEGER     // 对应的哪一个类型的表，结合art_id唯一定位一个实体
},{
    sequelize,
    tableName:'flow'
})

module.exports = {
    Flow
}