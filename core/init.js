const Router = require('koa-router')
// 实现自动加载某一个文件下面的所有模块
// npm install require-directory --save
const requireDirectory = require('require-directory')

// 把app.js里面功能性的代码都放到这个里面来
// 这就是一个初始化管理器,可以精简app.js里面的代码
class InitManager{
    // 这个里面没有app，我们需要的到app
    // 这里写一个入口方法
    static initCore(app) {
        // 这里把app挂在在这个类里面
        InitManager.app = app
        // 之后去启动这个里面所有的方法
        InitManager.InitLoadRouters()
        InitManager.loadHttpExcepttion()
        InitManager.loadConfig()
    }

    // 自动加载
    static InitLoadRouters() {
        // 这里不能直接写路径，这叫做硬编码，一旦这个函数的位置变了就找不到api.js了。
        // 第一种解决办法是写在配置里，第二种是写绝对路径，因为api永远相对根目录的位置是不变的，利用process.cwd()可以找到当前项目根目录文件夹的绝对路径
        const apiDirectory = `${process.cwd()}/app/api`
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        }) // 第一个参数代表模块，就是我要导入模块，一般都是这个，可认为是固定参数，第二个参数是要导入什么文件夹下面的所有模块
        // modules里面就是文件夹里面导出的所有模块，支持嵌套文件夹

        // 还可以有第三个参数，一个对象里面有个visit属性，这个属性可以传一个函数，每抓到一个导出就执行一下这个函数

        // 把modules里面的所有路由都注册,这个函数会被传一个参数，这参数就是我拿到的每一个导出
        function whenLoadModule(obj) {
            // 判断一下这个东西是一个router则把他注册了,调用这个router的routes方法

            // 这里导出的时候有可能是直接导出router，还有可能是导出{router}，这种这里讲道理应该有一个兼容，但是这里没写，这里直接是默认我们是以router这种方式去导出

            if (obj instanceof Router) {
                InitManager.app.use(obj.routes())
            }
        }
    }

    static loadHttpExcepttion() {
        // 启动的时候往全局变量上面挂一些异常的类，在使用的时候就不用再去每一次都require了
        const errors = require('./http-exception')
        global.errs = errors
    }

    static loadConfig(path = '') {
        // 启动的时候往全局变量挂配置文件
        const configPath = path || process.cwd() + '/config/config.js'
        const config = require(configPath)
        global.config = config
    }
    
}

module.exports = InitManager
