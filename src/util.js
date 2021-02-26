/**
 * 防抖
 * @param fn
 * @param time
 * @returns {function(...[*]=): void}
 */
export const debounce = (fn, time) => {
    let timer = null;
    return (...args) => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, time);
    }
}
/**
 * 节流
 * @param fn
 * @param time
 * @returns {function(*=): void}
 */
export const throttle = (fn, time) => {
    let flag = false;
    return (args) => {
        if (!flag) {
            flag = true;
            setTimeout(() => {
                fn.apply(this, args);
                flag = false;
            }, time)
        }
    }
}
/**
 *深拷贝
 */
export const deepCopy = (target) => {
    function recursive(tar, map) {
        if (map.has(tar)) return tar;
        if (typeof tar === 'object') map.set(tar, 1);
        const type = Object.prototype.toString.call(tar);
        switch (type) {
            case 'object Array':
                let arr = [];
                for (let item of tar) {
                    arr.push(recursive(item, map));
                }
                return arr;
            case 'object map':
                let temp = new Map();
                for (let [key, value] of tar) {
                    temp.set(key, recursive(value, map));
                }
                return temp;
            case 'object Set':
                let set = new Set();
                for (let item of tar) {
                    set.add(recursive(item, map));
                }
                return set;
            case 'object Object':
                let obj = {};
                Object.keys(tar).forEach(value => {
                    obj[value] = recursive(tar[value], map);
                })
                return obj;
            case 'object Function':
            default:
                return tar;
        }
    }

    return recursive(target, new Map());
}
/**
 * bind的实现
 * @param fn
 * @param context
 * @returns {function(...[*]=): (*)}
 */
export const bind = (fn, context) => {
    let arr = [];
    return function temp(...args) {
        arr = arr.concat(args)
        if (arr.length >= fn.length) return () => fn.apply(context, arr)
        else return temp
    }
}
/**
 * 千位分隔符
 * @param num
 * @returns {string}
 */
export const numFormat = (num) => {
    return num.toString().replace(/\d+/, function (n) { // 先提取整数部分
        return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
            return $1 + ",";
        });
    });
}
const timeout = (time) => new Promise(resolve => {
    setTimeout(resolve, time)
})
/**
 * 数组拍平
 * @param arr
 * @returns {*}
 */
export const flatten = (arr) => {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr);
    }
    return arr
}
export const flatten1 = (arr) => {
    return arr.reduce((pre, cur) => {
        return pre.concat(Array.isArray(cur) ? flatten1(cur) : cur)
    }, [])
}
/**
 * 排序
 * @type {{"1": (function(*): *)}}
 */
export const sort = {
    1: function (arr) {
        for (const [val, index] of arr.entries()) {
            for (let i = 0; i < arr.length - index; i++) {
                if (arr[i] > arr[i + 1]) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
                }
            }
        }
        return arr;
    }
}
console.log(sort[1]([2, 3, 1, 1, 123, 4234, 12]))

/**
 * 最大并发任务调度
 */
export class Schedule {
    constructor() {
        this.scheduleList = []
        this.currentNumber = 0
    }

    add(fn) {
        const temp = new Promise(resolve => {
            this.scheduleList.push(resolve)
        })
        const promise = new Promise(resolve => {
            temp.then((res) => {
                fn().then((res) => {
                    resolve()
                    this.currentNumber--;
                    this.call();
                })
            })
        })
        this.call();
        return promise;
    }

    call() {
        while (this.currentNumber < 2 && this.scheduleList.length !== 0) {
            const temp = this.scheduleList.shift();
            temp();
            this.currentNumber++;
        }
    }
}

/**
 * 发布订阅模式
 */
class EventEmitter {
    constructor() {
        this.events = {}
    }

    on(name, handler) {
        if (name in this.events) {
            this.events[name].push(handler);
        } else {
            this.events[name] = [handler];
        }
    }

    emit(name) {
        if (name in this.events) {
            for (const event of this.events[name]) {
                event()
            }
        }
    }
}

/**
 * 实现Promise.all方法
 * @param arr
 * @returns {Promise<any>}
 */
export const all = (arr) => {
    const results = []
    return new Promise((resolve, reject) => {
        for (const item of arr) {
            item.then((res) => {
                results.push(res);
                results.length === arr.length && resolve(results);
            }, reason => {
                reject(reason);
            })
        }
    })
}
