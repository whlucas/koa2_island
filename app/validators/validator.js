const { LinValidator, Rule } = require('../../core/lin-validator')
// 这个里面是很多参数校验器
class PositiveIntergerValdator extends LinValidator{
    constructor() {
        super()
        // 需要校验的参数名叫什么，这里就叫什么
        this.id = [
            // 每一个id可以绑定一组规则，每一个规则都要new出来
            new Rule('isInt', '需要正整数', {min: 1}) // 第一个是规则名，第二个为提示信息，第三个是可选参数，比如这里最小值为1，加了这个就可以为正整数了
            // 多个规则必须同时满足才满足
        ]
    }
}

module.exports = { PositiveIntergerValdator }