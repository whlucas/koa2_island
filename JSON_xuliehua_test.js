const obj = {
    name: 'whl',
    age:18
}

// 这个的作用是将对象转化为字符串，用于各个语言之间的传递
JSON.stringify(obj)

// 但是在这个对象里面重写一个方法toJSON
// 之后再用JSON.stringify去序列化的时候返回的就是这个函数return回来的结果了
const obj = {
    name: 'whl',
    age: 18,
    toJSON: function() {
        return {
            name1: 'shuai'
        }
    }
}