const { LinValidator, Rule } = require('../../core/lin-validator')
// 导入User这个模型
// 只要是操作数据库都要调用我们创建的模型
const { User } = require('../models/user')
const { LoginType, ArtType } = require('../lib/enum')

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

class NotEmptyValidator extends LinValidator{
    constructor() {
        super()
        this.token = [
            new Rule('isLength', '不允许为空', {min: 1})
        ]
    }
}

// 这是提取出来了一个对type校验的规则
function checkType(vals) {
    let type = vals.body.type || vals.path.type  // 这里可以在多个地方找到type，他不一定是在body里面传参
    if (!type) {
        throw new Error('type是必须参数')
    }
    // 因为不是从body里面取的了，从url或者?后面取得都是字符串
    type = parseInt(type) // 这里要转成数字

    // 这里有一种方法可以把它存起来，这样从v.get('path.type')拿到的就是int型的了
    // this.parsed.path.type = type

    if (!LoginType.isThisType(type)) {
        throw new Error('type参数不合法')
    }
}

function checkArtType(vals) {
    let type = vals.body.type || vals.path.type
    if (!type) {
        throw new Error('type是必须参数')
    }
    type = parseInt(type)

    if (!ArtType.isThisType(type)) {
        throw new Error('type参数不合法')
    }
}

// 用这个类来统一checkArtType和checkType
// 创建这个类的时候传参就表示他是检查登录类型还是实体类型了

// 为什么类可以解决这个问题，因为类可以保存一个变量的状态，函数不行
class Checker {
    constructor(type) {
        // 这里传进来需要校验的枚举
        this.enumType = type
    }

    check(vals) {
        let type = vals.body.type || vals.path.type
        if (!type) {
            throw new Error('type是必须参数')
        }
        type = parseInt(type)

        // 然后判断参数里面的type在不在枚举里面
        if (!this.enumType.isThisType(type)) {
            throw new Error('type参数不合法')
        }

    }
}

class LikeValidator extends PositiveIntergerValdator {
    constructor() {
        super()
        // 继承一下之前写过的正整数的验证
        // 再加一个一个type的枚举验证

        const checker = new Checker(ArtType)
        this.validateType = checker.check.bind(checker) // 棒一下this让他指向自己
        // this.validateType = checkArtType
    }
}

// 为了给他改个名，但实际上用的还是LikeValidator
class ClassicValidator extends LikeValidator {

}

class SearchValidator extends LinValidator {
    constructor() {
        super()
        this.q = [
            new Rule('isLength', '搜索关键词不能为空', {
                min: 1,
                max: 16
            })
        ]
        // 从第几条开始取
        this.start = [
            // 传了就要校验
            new Rule('isInt', '不符合规范', {
                min: 0,
                max: 60000
            }),
            // 可能不传
            // 第二个是错误信息，一般没有
            new Rule('isOptional', '', 0)
        ]
        // 取几条
        this.count = [
            new Rule('isInt', '不符合规范', {
                min: 1,
                max: 20
            }),
            new Rule('isOptional', '', 20)
        ]

    }
}

class AddShortCommentValidator extends PositiveIntergerValdator {
    constructor() {
        super()
        this.content = [
            new Rule('isLength', '必须在1到12个字符之间', {
                min: 1,
                max: 12
            })
        ]
    }
}


module.exports = { 
    PositiveIntergerValdator,
    RegisterValidator,
    TokenValidator,
    NotEmptyValidator,
    LikeValidator,
    ClassicValidator,
    SearchValidator,
    AddShortCommentValidator
}