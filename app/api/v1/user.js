const bcrypt = require('bcryptjs')
const Router = require('koa-router')
const { success } = require('../../lib/helper')
const { User } = require('../../models/user')
const {
    HttpException,
    ParameterException
} = require('../../../core/http-exception')


const { RegisterValidator } = require('../../validators/validator')

const router = new Router({
    prefix: '/v1/user' // 前缀
})

// 注册 新增数据 post

router.post('/register', async (ctx) => {
    // 编写api路径
    // 参数确定
    // 参数校验
    // 通过v.get拿到参数
    // 把数据存到数据库里面去

    // 这里每来一次请求就实例化一次
    // 如果用中间键的形式来写那就是router.post('/register',new RegisterValidator() async (ctx) => {})
    // 这样只会实例化一次
    // 如果要挂在属性validator.a = 1,若下一次请求修改这个validator的变量，那么上一个请求就拿不到他自己挂载的变量
    // 因为只有一个validator，解决办法就是每一个请求都实例化一个自己的validator

    // 所以原则是不要以实例化对象的方式来当中间键

    const v = await new RegisterValidator().validate(ctx) // 这个地方验证器里面有一个异步，需要阻塞线程，等到参数验证过后再走下面的代码 所以这个必须放到第一行

    // 这里进行密码加密
    // 两个原则，两个用户的密码相同，但加密后的密码不能相同（用于防范彩虹攻击），密码不能是明文
    // 在model模块里面进行密码的加密， 就不用写在api里面了
    // const salt = bcrypt.genSaltSync(10)  // 生成一个盐，一般这个数字是10，10只的是计算机生成这个盐所花费的成本，带Sync的函数是同步的版本
    // 这个值越大计算机生成这个盐的成本就越高，破解难度就越大
    // const psw = bcrypt.hashSync(v.get('body.password1'), salt) // 生成加密后的密码，第一个参数是原密码，第二个参数是盐

    

    const user = {
        email: v.get('body.email'),
        password: v.get('body.password1'),
        nickname: v.get('body.nickname')
    }
    await User.create(user) // 通过这个命令来往数据库里面新增一条数据,它会返回一个promise，用await求值，得到结果
    // 第二次提交一样的值的时候会报错，因为我们设置的email是不可重复

    // 一种解决方式用try catch自己抛出一个异常出来
    // try {
    //     const r = await User.create(user)
    // } catch(error) {
    //     throw new ParameterException('email不能重复')
    // }

    // 这种不是很好，因为异常不一定就一定是这个异常
    // 在这个接口的参数验证那里在加一条验证



    // 成功以后的返回
    // ctx.body{...}
    // throw new global.errs.Success()
    success()

})


module.exports = router