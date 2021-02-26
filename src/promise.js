class MyPromise {
    constructor(executor) {
        this.state = 0;
        this.value = null;
        this.reason = null;
        this.fulfilledList = [];
        this.rejectedList = [];
        executor(MyPromise.resolve.bind(this), MyPromise.reject.bind(this));
    }

    static resolve(value) {
        if (this.state === 0) {
            this.state = 1;
            this.value = value;
            setTimeout(() => {
                this.fulfilledList.forEach(cb => {
                    cb();
                })
            })
        }
        // thenable对象的处理
        if (value !== null &&
            (
                typeof value === 'object' ||
                typeof value === 'function'
            ) &&
            typeof value.then === 'function'
        ) {
            // todo
        }
        // 已经是MyPromise对象的处理
        if (value instanceof MyPromise) {
            return value;
        }
        // 其他情况的处理
        return new MyPromise((resolve, reject) => {
            resolve(value);
        })
    }

    static reject(reason) {
        if (this instanceof MyPromise) {
            if (this.state === 0) {
                this.state = 2;
                this.reason = reason;
                setTimeout(() => {
                    this.rejectedList.forEach(cb => {
                        cb();
                    })
                })
            }
        } else {
            return new MyPromise((resolve, reject) => {
                reject(reason)
            })
        }
    }

    then(fulfilled, rejected) {
        if (this.state === 1) {
            return new MyPromise((resolve) => {
                typeof fulfilled === 'function' ? resolve(fulfilled(this.value)) : resolve(this.value)
            })
        }
        if (this.state === 2) {
            return new MyPromise((resolve, reject) => {
                typeof rejected === 'function' ? reject(rejected(this.reason)) : reject(this.reason)
            })
        }
        return new MyPromise((resolve, reject) => {
            this.fulfilledList.push(() => {
                typeof fulfilled === 'function' ? resolve(fulfilled(this.value)) : resolve(this.value)
            });
            this.rejectedList.push(() => {
                typeof rejected === 'function' ? reject(rejected(this.reason)) : reject(this.reason)
            });
        })
    }
}

let a = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("test")
        reject("success")
    }, 2000)
});
MyPromise.resolve(a).then(value => {
    console.log(value)
}, reason => {
    console.log(reason)
})
a.then(result => {
    console.log(result)
    return "sadasd"
}).then(result => {
    console.log(result)
}, reject => {
    console.log(reject)
})