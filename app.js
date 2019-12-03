const Koa = require('koa')
const InitManager = require('./core/init')
const parser = require('koa-bodyparser')
const catchError = require('./middlewares/exception')

const app = new Koa()

app.use(parser())
app.use(catchError) // 用了这个自己写的异常处理方法，可以把一些提示返回给客户端

// 这里获得app了之后启动入口方法，把app传进去,解决那边没有app的问题
InitManager.initCore(app)

// 这里临时导入一下models里面的代码，为了能够执行代码生成数据表
// require('./app/models/user')


// api 版本 业务变动
// 客户端兼容性 老版本返回 classic 新版本返回 music
// v1 v2 v3 支持3个版本如何兼容

// api 携带版本号 
// 两种方式：1.版本号加在路径里面 2.版本号加在查询参数里面 3.加在http header里面

// 如果有两个版本的api，需要把它们写在一个路由里面吗
// 这样写不好，会让你的函数太冗长，且一旦一个版本不要了，则需要再回到这个路由去修改代码，这是非常危险的，修改代码可能会出现许多问题
// 这不符合开闭原则，对修改关闭，对扩展开放
// 所以要对每一个版本的api都做一个路由，每一个版本统一管理

// 我们这里是吧版本号都放在一个路径里面去

// 把路由都放到api文件夹里面，在这里面引入、注册


app.listen(3000)