function func1() {
    try {
        fun2()
    } catch (error) {
        throw error
    }
}

function func2() {
    try {
        fun3()
    } catch (error){
        throw error
    }
}

function func3() {
    try{
        console.log(0/a)
    } catch (error) {
        throw error
    }
}

// 函数设计
// 如果函数fun3里面出现了错误，两种处理方法
// 1.返回一个false 或者null这样 这样的话再fun2里面需要判断fun3有没有返回值，但这样会丢失异常
// 2.throw new Error 抛出异常 这样的话需要在fun2，以及fun1里面进行try catch 这种方式更加规范，也就是调用函数的时候一般都需要try catch

// 但实际上一般不会每个函数都写try catch，怎么办
// 1.一般调用别人的函数比如第三方库的时候都要去trychatch，自己写的函数确定没问题可以不try catch

// 全局异常处理
// 在所有函数调用的最顶部需要设计一个机制，可以监听到任何的异常


// try catch 无法捕捉除async await以外的异步异常
// 这里讲一下异步编程模型里面的异常处理联调
// 主要还是因为await会阻塞线程，等待这个执行完事才走下面的

// 只要一个函数返回的是Promise，那么在执行这个函数的时候就可以用await来执行，则可以用try catch来做异常处理
// 如果其中一个函数用了async await 那么调用的函数最好都加上async await
function func1() {
    func2()
}

async function func2() {
    try {
        await func3() // await能够监听到reject里面抛出的异常
        // 如果这里不加await则promise则会产生一个没有处理的异常，在控制台里面则会打印一段warning提示Unhandle promise
    } catch (error) {
        console.log('error')
    }
}

async function func3() {
    await setTimeout(() => {
        throw new Error('error')
    }, 1000)
    // 但是这么写没有用因为这个异步函数不是promise，需要把这个函数用promise包装起来
}

// 只要返回的是promise就行了，不用再用async和await来包装这个函数

// 我们在调用包的时候，他给我们返回的一般都是封装好的promise，不用我们再自己封一遍
function func3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const r = Math.random()
            if (r < 0.5) {
                // 如果这个随机数小于0.5则抛出一个异常，但是在promise里面抛出异常不能用throw来抛出，要用reject来抛出
                reject('error')
            } else {
                // 正确调用resolve
            }
        }, 1000);
    })
}

func1()