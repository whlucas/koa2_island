const jwt = require('jsonwebtoken')
/***
 * 
 */
const findMembers = function (instance, {
    prefix,
    specifiedType,
    filter
}) {
    // 递归函数
    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null)
            return []

        let names = Reflect.ownKeys(instance)
        names = names.filter((name) => {
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name)
        })

        return [...names, ..._find(instance.__proto__)]
    }

    function _shouldKeep(value) {
        if (filter) {
            if (filter(value)) {
                return true
            }
        }
        if (prefix)
            if (value.startsWith(prefix))
                return true
        if (specifiedType)
            if (instance[value] instanceof specifiedType)
                return true
    }

    return _find(instance)
}

// 写一个生成jwt令牌的方法
const generateToken = function (uid, scope) {
    const secretKey = global.config.security.secretKey
    const expiresIn = global.config.security.expiresIn
    // 这个函数就是用来生成令牌的，第一个参数payload,可以往令牌里面写入一些我们自定义的信息，第二个私钥，第三个配置，key写到配置文件里面去
    const token = jwt.sign({
        uid,           // 往令牌里面写入的自定义的信息
        scope
    }, secretKey, {
        expiresIn
    })
    return token
}



module.exports = {
    findMembers,
    generateToken,
}