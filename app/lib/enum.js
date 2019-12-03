function isThisType(val) {
    for(let key in this) {
        if(this[key] === val){ // 这里传过来的可能是是字符串，这里是数字，所以写===可能不太行
            return true
        }
    }
    return false
}

// 这里模拟一下枚举
const LoginType = {
    USER_MINI_PROGRAM: 100,
    USER_EMAIL: 101,
    USER_MOBILE: 102,
    ADMIN_EMAIL: 200,
    isThisType
}

module.exports = { LoginType }