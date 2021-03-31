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
function test(){
    console.log(this)
}
throttle(test,0)()
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
    // 冒泡排序
    bubbleSort: function bubbleSort(arr) {
        for (const [, index] of arr.entries()) {
            for (let i = 0; i < arr.length - index; i++) {
                if (arr[i] > arr[i + 1]) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
                }
            }
        }
        return arr;
    },
    // 快速排序
    quickSort: function quickSort(target, left = 0, right = target.length - 1) {
        if (left >= right) return;
        let index = left;
        for (let i = left + 1; i <= right; i++) {
            if (target[i] <= target[left]) {
                [target[index + 1], target[i]] = [target[i], target[index + 1]];
                index++;
            }
        }
        [target[left], target[index]] = [target[index], target[left]];
        quickSort(target, left, index - 1);
        quickSort(target, index + 1, right)
        return target;
    }
}

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
/**
 * 中文数字转阿拉伯数字
 * @param str
 */
export const transformZh = (str) => {
    let res = 0;
    const zh = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const unit = ['', '十', '百', '千', '万'];
    for (let i = 0; i < str.length; i++) {
        // 针对'十二'这种简写情况特殊处理
        if (i === 0 && str[i] === "十") {
            res += 10;
            continue;
        }
        // 万特殊处理
        if (str[i] === '万') {
            res *= 10000;
            continue;
        }
        // 判断一到九的数字
        if (zh.indexOf(str[i]) > 0 && zh.indexOf(str[i]) <= 9) {
            if (i + 1 < str.length && str[i + 1] !== '万') {
                // 数字后紧跟单位，且不为万
                res += zh.indexOf(str[i]) * Math.pow(10, unit.indexOf(str[i + 1]));
            } else {
                if (str[i - 1] === '零' || unit.indexOf(str[i - 1]) < 1) {
                    // 数字前有零或者不存在说明是个位
                    res += zh.indexOf(str[i]);
                } else {
                    //数字前存在单位
                    res += Math.pow(10, unit.indexOf(str[i - 1]) - 1) * zh.indexOf(str[i]);
                }
            }
        }
    }
    console.log(res);
}
/**
 * 阿拉伯数字转中文
 * @param str
 */
export const transformArabic = (str) => {

}
//
// // import readline from 'readline';
// //
// // let rl = readline.createInterface({
// //     input: process.stdin,
// //     output: process.stdout
// // });
// //
// //
// // rl.on('line', function (line) {
// //
// // });

// 一个机器人位于一个 m x n 网格的左上角。
//
// 机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角。
//
// 问总共有多少条不同的路径？

function test1(m,n){
    let i=1,j=1,count=0;
    function it(){
        if(i===m&&j===n){
            count++;
            return;
        }
        if(i<m){
            i++;
            it();
            i--;
        }
        if(j<n){
            j++;
            it();
            j--;
        }
    }
    it();
    console.log(count);
}
test1(3,3)
















