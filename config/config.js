module.exports = {
    // prod
    environment: 'dev',
    database: {
        dbName: 'island',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Lll-13999520192'
    },
    security:{
        secretKey: "abcdefg", // 这个可以非常长
        expiresIn: 60*60*24*30 // 过期时间一个小时
    },
    wx: {
        appId: 'wxd6bd80ba32f8dc86',
        appSecret: '35f2a2131102ceb0bbfa9336bd97937e',
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    },
    yushu: {
            detailUrl: 'http://t.yushu.im/v2/book/id/%s',
            keywordUrl: 'http://t.yushu.im/v2/book/search?q=%s&count=%s&start=%s&summary=%s'
        },
    host: 'http://localhost:3000/'
}