require('module-alias/register') // 用npm包module-alias来定义别名，别名定义在package.json里面的moduleAliases对象里面然后再根文件里面引入这句话就可以了
const Koa = require('koa')
const path = require('path')
const InitManager = require('./core/init')
const parser = require('koa-bodyparser')
const catchError = require('./middlewares/exception')

// 前端如何取到服务端的静态资源
// 用这个包
const static = require('koa-static')

const app = new Koa()

app.use(parser())
app.use(catchError) // 用了这个自己写的异常处理方法，可以把一些提示返回给客户端

// 使用app.use 来使用这个中间键
// 参数是一个root，就是static文件夹的路径
// 用path.join来拼出来这个static文件夹的路径
// 进行了这么一个操作之后就只需要lcalhost:3000/images/movie.4.png就可以拿到图片了，因为图片在images文件夹下面，所以需要在中间加一个image
// 也就是说如果正确访问了我这个服务下面的images文件夹下面的图片就可以拿到了，但是我们数据库里面只记录的相对的地址，那么如何正确访问到我的这个服务，需要在配置里面配置一下我的这个服务的地址，然后再查询出我这个图片或者其他静态资源的时候给他们的前面拼上我的这个配置信息的地址，这里我写到了classic的model里面，查到这个image的时候就改了
app.use(static(path.join(__dirname, './static'))) // 当前项目路径加上static的相对路径

// 静态资源放在哪
// 1.放在这个项目里面，污染项目代码
// 2.自己搞一个静态资源服务器 这个机器的带宽要大一点，因为静态资源体积大
// 云服务 OSS 贵 要一个ECS就是linux 要一个rds就是关系型数据库就是mysql 可以做CDN
// github 上可以放一些东西 但能放的比较小，大概300mb左右吧

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




// 讲一下部署
// 需要部署到一个有外网ip的服务器
// 需要购买一个云服务器 Linux
// 一般都是通过域名访问，所以需要注册域名、备案（不备案不能访问）
// 域名的解析，要和这个服务器ip关联起来

// 在linux服务器里面去装mysql，node等，可以用xampp来装mysql

// 在服务器里面把代码跑起来之后就可以用ip加端口号去访问了

// 通过域名访问看上去是不带端口的，但是他默认会访问80端口

// 但是如果我这个机器要起很多服务，就要用到nginx了
// 安装nginx之后要把这个nginx的端口设置为80，这样一旦我这个nginx启动，我这个网站默认就回去默认的访问这个nginx

// 我的这些机器假设起了三个服务，分别占用的端口号为：node 3000 python: 5000 java: 8000
// 这些可以用nginx来转发，当我以yiyue.pro来访问这个服务器的时候让他去访问localhost: 3000这个端口
// 访问别的域名的时候就访问别的ip+端口上

// https 证书 免费的有：lets encrypt 但三个月要续期一次，买阿里云的服务器送一年
// https默认是443端口，所以nginx通常监听两个端口，一个是80，一个是443

// 小程序 的云开发不用申请域名 不用https证书

app.listen(3000)