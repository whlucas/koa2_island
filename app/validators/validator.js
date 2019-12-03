const { LinValidator, Rule } = require('../../core/lin-validator')
// 导入User这个模型
// 只要是操作数据库都要调用我们创建的模型
const { User } = require('../models/user')
const { LoginType } = require('../lib/enum')

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

class RegisterValidator extends LinValidator{
    constructor() {
        super()
        this.email = [
            new Rule('isEmail', '不符合Email规范')
        ]
        this.password1 = [
            new Rule('isLength', '密码至少6个字符，最多32个字符', {
                min: 6,
                max: 32
            }),
            new Rule('matches', '密码不符合规范', '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]')
        ]
        this.password2 = this.password1
        this.nickname = [
            new Rule('isLength', '昵称不符合长度规范', {
                min: 6,
                max: 32
            })
        ]
    }
    validatePassword(vals){ // 这个是自定义规则，前面必须以validate开头，后面可以随便取，vars代表用户传过来的所有参数
        const psw1 = vals.body.password1 // 如果参数是通过post的body传进来的，就这么写
        const psw2 = vals.body.password2
        if(psw1 !== psw2) {
            throw new Error('两个密码必须相同') // 这个异常会被LinValidator内部处理,于上面的异常提示信息一起抛出
        }
    }

    async validateEmail(vals) {
        const email = vals.body.email
        const user = await User.findOne({  // 查询一个  注意要加await，来对返回的promise求值
            where: {   // 查询条件，可以传其他的条件，一般是且关系
                email: email   // 前面代表数据库中的字段email，后面是我们传进来的参数email
            }   
        })
        if (user) {
            throw new Error('email已存在')
        }
    }
}

class TokenValidator extends LinValidator{
    constructor() {
        super()
        this.account = [
            new Rule('isLength', '不符合账号规则', {
                min: 4,
                max: 32
            })
        ]
        this.secret = [
            // 密码不是非必要的，比如小程序当中，若已经是合法的用户了，则不需要登录了，只需要account就可以了
            // 传统的web用户则需要用户密码
            // 手机号登录也不一定要密码
            // 1.可以不传 2.如果传则需要满足一定的验证条件 这种可以通过自定义函数来解决
            // LinValidator 也给出了解决方式
            new Rule('isOptional'), // 可不传
            new Rule('isLength', '至少6个字符', {
                min: 6,
                max: 128
            })
        ]
    }
    // 指定当前用户登录的方式
    // this.type
    // 用自定义函数的方式来写
    validateLoginType(vals) {
        if(!vals.body.type) {
            throw new Error('type是必传参数')
        }
        if(!LoginType.isThisType(vals.body.type)){
            throw new Error('type参数不合法')
        }
    }
}


module.exports = { 
    PositiveIntergerValdator,
    RegisterValidator,
    TokenValidator
}