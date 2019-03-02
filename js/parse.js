/**
 * 账单解析器
 * 主要功能：将billtemp中的账单，解析为需要的数据
 * 主要步骤：
 * 1. 根据config.finame，获取billtemp每种账单的实际文件名（为了方便，可能每个月账单只有后缀某些字符不同，
 *    不用每次都更改程序的文件名）
 * 2. 利用不同的文件解析器，读取每种账单为数组，并其他有价值的信息（为了比较，且不需要很多无用信息）
 * 注意：
 * 1. 在账单第一行增加自定义信息，从第二行开始为原始账单信息（通常为tilte）第三行是数据
 * 2. 一定要保证第三行为真实数据，compare中，从第三行开始循环,顾需要在extract函数中对数据进行处理
 * 3. 数据第1,2列必须是时间（格式：20191001），price
 * 4. 支付宝与微信账单返回obj对象（time##price为key），其他账单返回列表，信用卡账单一定会在支付宝或微信中找到
 *    主要是循环银行账单，在支付宝或微信账单中匹配信息
 * 5. 由于time##作为key，顾time为20101010格式，price保留两位小数
 * 如何添加新的解析器：
 * 1. 在config,filename.billOrder，配置新的key（新的银行），bill中新增key-value
 * 2. 此文件中新增类似CgbParser的解析器，有init方法
 * 3. 在parseMap配置响应的解析器
 */
const config = require('./config');
const tools = require('./tools');
const file = require('./file');

const { folder } = config;
const billtemp = `./../${folder.billtemp}`;

const { bill, billOrder } = config.filename;

/**
 * 根据config配置filename.bill获取真实的文件名
 * 主要逻辑：1、无支付宝账单且无微信账单不解析
 * @returns {Promise<any | never>}
 */
function getRealBillName() {
  return file.readDirAsync(billtemp).then((files) => {
    const result = {};
    const hasAlipay = bill.alipay;// 是否有支付宝账单
    const hasWechat = bill.wechat;// 是否有微信账单
    if (!hasAlipay && !hasWechat) {
      console.log('*************无支付宝与账单无法解析*************');
      console.log(files);
      return Promise.reject();
    }
    // 循环billOrder，查找账单实际文件名
    billOrder.forEach((key) => {
      const vals = bill[key];
      files.forEach((item, index) => {
        if (item.indexOf(vals) !== -1) {
          result[key] = item;
          files.splice(index, 1);
        }
      });
    });
    console.log('*************当前需要解析的账单*************');
    console.log(result);
    // 例：result = {
    //   "alipay": "alipay_record_20190228_2132.csv",
    //   "citic": "201901账单明细(人民币).csv"
    // }
    return Promise.resolve(result);
  }).catch(err => console.log(err));
}
/**
 * 价格处理，支出为正，收入为负，为了与其他账单整合
 * @param price 字符串价格
 * @param inorout
 * @return {number}
 */
function priceProcess(price, inorout) {
  const p = parseFloat(price);
  // 如果price是汉字，则p会解析为NaN
  if (Number.isNaN(p)) {
    return price;
  }
  // 第二参数未传入
  if (!inorout) {
    return p;
  }
  return inorout.indexOf('收入') !== -1 ? -p : p;
}
// 支付宝账单解析器
class AlipayParser {
  constructor(name, folderName = billtemp) {
    this.filename = name;
    this.folderName = folderName;
  }

  static convertor(str) {
    return tools.stringToTable(str, row => row.split(','));
  }

  // 交易是否成功
  static isDeal(str) {
    return str.indexOf('交易关闭') === -1;
  }

  // 提取需要的信息，支付宝账单第一行为日期，顾不再手动加入自定义信息
  static extract(data = []) {
    const searchObj = {};// 便于查询
    let billSum = 0;
    const table = [];
    searchObj.billName = 'alipay账单';
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      const state = tools.replaceT(row[11]);// 交易状态
      // 将"起始日期:[2018-09-07 00:00:00]    终止日期:[2018-10-07 00:00:00]"
      if (i === 2) {
        [searchObj.billTimeRange] = row;
      }
      // 保证金额一列存在，再提取数据
      if (row[9] && AlipayParser.isDeal(state)) {
        // tools.replaceT将row[0]中的\t与两边空格去掉
        let time = tools.replaceT(row[4]);
        let key = '';
        [time] = time.split(' ');// 获取[0]元素
        time = time.replace(/-/g, '');// 将2019-10-1的时间格式转换为20191001形式
        newrow.push(time);// 最近修改时间
        const inorout = tools.replaceT(row[10]);// 收/支
        const price = priceProcess(tools.replaceT(row[9]), inorout);
        // 主要是为了确定title行
        if (Number.isNaN(parseFloat(price.toString()))) { // title行
          key = 'title';
        } else {
          key = `${time}##${price.toFixed(2)}`;// 时间与price组成的key
        }
        newrow.push(price);// 入账金额
        newrow.push(tools.replaceT(row[7]));// 交易对方
        newrow.push(tools.replaceT(row[8]));// 商品名称
        // newrow.push(state);// 交易状态，其实不需要显示交易状态，只有交易成功的数据被记录
        searchObj[key] = newrow;
        table.push(newrow);
        billSum += 1;
      }
    }
    // 记录总共条数
    searchObj.billSum = billSum - 1;// 由于第一行row[9]为title，不是数据，顾需要减1
    return searchObj;
  }

  init() {
    return file.readFileAsync(this.folderName + this.filename, 'gbk').then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = AlipayParser.convertor(outputstr);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = AlipayParser.extract(converData);
      return Promise.resolve(exbill);
    });
  }
}
// 微信账单
class WechatParser {
  constructor(name, folderName = billtemp) {
    this.filename = name;
    this.folderName = folderName;
  }

  // 将csv读取过来的str，利用split分为数组
  static convertor(str) {
    return tools.stringToTable(str, row => row.split(','));
  }

  static extract(data = []) {
    const searchObj = {};
    let sumRedPackage = 0;// 红包总额
    let billSum = 0;
    searchObj.billName = 'wechat账单';
    // 微信账单从16行为详细，之前为注释和综述
    for (let i = 16; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      // 2019-01-30 09:25:36
      let time = row[0];
      let price = row[5].replace('¥', ''); // row[5]=¥1.02,并保留两位小数
      const inorout = row[4];// 收/支
      price = priceProcess(price, inorout);// 带正负数值金额
      const type = row[1];// 支付类型
      // 如果是红包，不再将数据假如neworw,而是计算总额，最后统一加到newrow最后一行
      if (type === '微信红包') {
        sumRedPackage += price;
      } else {
        let key = '';
        [time] = time.split(' ');
        time = time.replace(/-/g, '');// 将2019-10-1的时间格式转换为20191001形式
        newrow.push(time); // 只获取年月日
        newrow.push(price);// 入账金额
        if (i === 16) { // title行
          key = 'title';
        } else {
          key = `${time}##${price.toFixed(2)}`;
        }
        newrow.push(row[2]);// 支付对方 （描述）
        newrow.push(row[6]);// 支付方式（建设银行、中信）
        searchObj[key] = newrow;
        billSum += 1;// 记录总共条数
      }
    }
    // 将红包总额放于最后，
    searchObj.sumRedPackage = sumRedPackage;
    // 记录总共条数
    searchObj.billSum = billSum; // for循环后，还有个sumRedPackage也算一条记录，但一行也为title，顾实际数量为billSum
    // billSum 记录
    return searchObj;
  }

  init() {
    // 获取每个文件的实际数据，String类型
    return file.readFileAsync(this.folderName + this.filename).then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = WechatParser.convertor(outputstr);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = WechatParser.extract(converData);
      return Promise.resolve(exbill);
    });
  }
}
// 广发银行
class CgbParser {
  constructor(name, folderName = billtemp) {
    this.filename = name;
    this.folderName = folderName;
  }

  // 将csv读取过来的str，利用split分为数组
  static convertor(str) {
    return tools.stringToTable(str, (row, index) => {
      if (index === 0) {
        return row.split(',');
      }
      const arr = row.split(',"');
      const result = [];
      if (arr[1]) {
        result.push(...arr[0].split(','));
        result.push(...arr[1].split('",'));
      }
      return result;
    });
  }

  // 提取需要的信息
  static extract(data = []) {
    const table = [];
    // 在table第一行增加自定义信息，用于表示一些内容；无需要则增加no
    table.push('no');
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      // tools.replaceT将row[0]中的\t与两边空格去掉
      newrow.push(tools.replaceT(row[0]));// 交易日
      const price = tools.replaceT(row[3]).replace(',', '');
      if (i === 0) {
        newrow.push(price);// 入账金额
      } else {
        newrow.push(parseFloat(price));// 入账金额
      }
      newrow.push(tools.replaceT(row[1]));// 交易摘要
      table.push(newrow);
    }
    return table;
  }

  init() {
    // 获取每个文件的实际数据，String类型
    return file.readFileAsync(this.folderName + this.filename, 'gbk').then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = CgbParser.convertor(outputstr);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = CgbParser.extract(converData);
      return Promise.resolve(exbill);
    });
  }
}
// 中信银行
class CiticParser {
  constructor(name, folderName = billtemp) {
    this.filename = name;
    this.folderName = folderName;
  }

  // 将csv读取过来的str，利用split分为数组
  static convertor(str) {
    return tools.stringToTable(str, row => row.split(','));
  }

  // 提取需要的信息
  static extract(data = []) {
    const table = [];
    // 在table第一行增加自定义信息，用于表示一些内容；无需要则增加no
    table.push('Citic账单');
    for (let i = 1; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      // tools.replaceT将row[0]中的\t与两边空格去掉
      newrow.push(tools.replaceT(row[1]));// 交易日
      const price = tools.replaceT(row[6]);
      newrow.push(priceProcess(price));// 入账金额
      newrow.push(tools.replaceT(row[3]));// 交易描述
      table.push(newrow);
    }
    return table;
  }

  init() {
    // 获取每个文件的实际数据，String类型
    return file.readFileAsync(this.folderName + this.filename, 'gbk').then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = CiticParser.convertor(outputstr);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = CiticParser.extract(converData);
      return Promise.resolve(exbill);
    });
  }
}

// 调用解析器，因此解析器中最少要包含init方法
function callParser(billNameMap) {
  const parseMap = {
    cgb(name) {
      return new CgbParser(name);
    },
    wechat(name) {
      return new WechatParser(name);
    },
    alipay(name) {
      return new AlipayParser(name);
    },
    citic(name) {
      return new CiticParser(name);
    },
  };
  const promiseArr = [];
  // billNameMap存储的是
  billOrder.forEach((item) => {
    const vals = billNameMap[item];
    // 如果未找到账单
    if (!vals) {
      promiseArr.push([]);
    } else {
      const parser = parseMap[item](vals);
      promiseArr.push(parser.init());
    }
  });
  return Promise.all(promiseArr);
}

class Parser {
  static init() {
    // 实际账单key-文件名
    const realBillName = getRealBillName();
    return realBillName.then((billNameMap) => {
      const len = Object.keys(billNameMap).length;
      if (len === 0) {
        return Promise.reject(new Error('billtemp文件夹下无账单，无法继续进行文件解析'));
      }
      if (len === 1) {
        return Promise.reject(new Error('billtemp文件夹需要至少两种账单才能解析'));
      }
      // 调用billNameMap中的对应的解析器
      // 如新增账单，需要增加调用，callParser返回的是Promise.all
      const promiseAllParser = callParser(billNameMap);
      return promiseAllParser.then(data => Promise.resolve(data));
    });
  }
}

exports.Parser = Parser;
