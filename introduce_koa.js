const Koa = require('koa'); // 首先引入koa  这里只能用commonJS来引用，但不能用ES6的import from，在这里不支持 

const app = new Koa() // 把这个koa对象实例化，这个实例化的对象最大的特点是这个上面有很多中间键

const Router = require('koa-router')
const router = new Router()

// 把一个函数在use里面去注册一下,成为中间键，当前端发送一个请求到服务器里面去就会经过这个中间键，就会执行这个函数
// 但是koa只会默认执行第一个中间键，后面再有的话就得用它传给你的next去执行了

// 中间键函数前面要加async next后面要加next() 
app.use(async (ctx, next) => {
    console.log('hello')
    await next() // 这样他就会去给你执行注册的下一个中间键函数, 执行返回下一个中间键的结果'wuhaolin'
    // 如果没有这个await那么返回被promise包装的结果 promise('wuhaolin')

    // await，第一个功能求值，他不但能够实现返回原先a.then((res)=>{console.log(res)})里面的res，还可以对表达式求值
})

app.use(async (ctx, next) => {
    console.log('world')
    // 第二个功能,阻塞线程
    // 现在需要把这个中间键函数变成一个异步的,用axios发一个请求
    const axios = require('axios')
    const res = await axios.get('http://7yue.pro') // 这个axios返回一个promise，被await拿到里面的值并赋给res
    console.log(res) // 如果不加await，不阻塞这个console.log(res),应该先于上一行执行,啥也打印不出来，加了await就可以打印出来了
    return "wuhaolin" // 这里return之后就能在上一个中间键的next()后面拿到返回值
})

// async 的功能，被async包裹的函数这个函数的返回值会被强制返回成promise，如果要用await则必须要加async

// 如果中间键函数不加async和await，则可能不按照洋葱模型来执行，比如一个加了await有的没有加await，那么没有加await的先执行，因为await会阻塞线程

// 为什么一定要保证洋葱模型
// 第一个中间键能够成功生效的条件是后面的中间键都成功走完了，比如我在第一个中间键中记录后面的所有中间键的用时
app.use(async (ctx, next) => {
    console.log('1')
    await next() // 这里执行过后就表示后面的中间键都执行完了，如何保证，那么就是要保证洋葱模型
    console.log('计时')
})

// 传参，第一种方式，return一个结果，则可以在上一层中间键中拿到这个结果，但是如果有第三方的中间键函数则无法使用这个方式
// 第二，直接放到ctx的里面，但是上一层要想拿到ctx里面的值则一定要在await next()之后获取，因为在这个之后后面的中间键就走完了，所以也要保证洋葱模型


// 尝试写一个请求
// koa里面一切都是中间键
app.use(async (ctx, next) => {
    // 第一种写很多if，这样可以实现，但这样不现实
    if(ctx.path === '/classic/latest' && ctx.method === 'GET'){
        ctx.body = { key: 'classic' } // 想要返回jason只需要返回一个对象就可以了，它会自动的给你变回json
    }
})

// 所以我们要用插件koa-router
// 三部，实例化引入的Router，写router，注册

// 第一个是路由地质，第二个是一个中间键函数,这个中间键函数由下面的router.routes()帮我们注册了
router.get('/classic/latest', (ctx, next) => {
    ctx.body = {
        key: 'classic'
    }
}) 

app.use(router.routes())

app.listen(3000) // 开启服务