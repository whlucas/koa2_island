// 这里有一个拼接url的简单方法
const util = require('util')

const axios = require('axios')

// 这个类来管理微信小程序的业务

const { User } = require('../models/user') 

const { generateToken } = require('../../core/util')

const { Auth } = require('../../middlewares/auth')

class WXManager{
    static async codeToToken (code) {
        // 小程序的登录不用账户密码，要一个code码
        // 这个code码是前端生成后发过来，然后我们调用微信提供的服务
        // 如果这个code是合法的，则会给我们一个openid，他是标记一个用户的唯一标识

        // 小程序没有注册的过程

        // 调微信的服务要传三个参数一个是code，其余两个是appid，和appsecret，这个需要自己申请，这两个我们写在配置里面

        // 拼接url
        const url = util.format(global.config.wx.loginUrl, global.config.wx.appId, global.config.wx.appSecret, code) // 传入url以及参数
        console.log(url, 'url')
        // 在这里发http请求曲调微信的服务
        const result = await axios.get(url)
        console.log(result.data)
        // 首先看一下有没有返回结果
        if(result.status !== 200){
            throw new global.errs.AuthFailed('openid获取失败')
        }
        // 如果返回正常返回这个errCode是不是0.则失败看文档
        const errCode = result.data.errcode
        if (errCode !== 0) {
            throw new global.errs.AuthFailed('openid获取失败' + errCode)
        }

        // 拿到openid给这个用户建立档案，写入到表里面去，一般不用openid代替用户id
        // 当同一个用户第二次来之后，也就是登录状态失效了之后再次来的时候，由于他的表里面已经有openid了，所以就不要在添加了
        // 所以要多一层判断
        // 通过openid查userid逻辑写到model里面

        // 首先查询看有没有
        let user = await User.getUserByOpenid(result.data.openid)
        if(!user) {
            user = await User.registerByOpenid(result.data.openid)
        }

        // 没啥问题就给他一个token
        return generateToken(user.id, Auth.USER)
    }
}

module.exports = {
    WXManager,
}