/**
 * 账单解析器
 * 主要功能：将billtemp中的账单，解析为需要的数据
 * 主要步骤：
 * 1. 根据config.finame，获取billtemp每种账单的实际文件名（为了方便，可能每个月账单只有后缀某些字符不同，
 *    不用每次都更改程序的文件名）
 * 2. 利用不同的文件解析器，读取每种账单为数组，并其他有价值的信息（为了比较，且不需要很多无用信息）
 * 注意：
 * 1. 在账单第一行增加自定义信息，从第二行开始为原始账单信息（通常为tilte）第三行是数据
 */
const config = require('./config');
const tools = require('./tools');
const file = require('./file');

const { folder } = config;
const billtemp = `./../${folder.billtemp}`;

const { bill, billOrder } = config.filename;

/**
 * 根据config配置filename.bill获取真实的文件名
 * @returns {Promise<any | never>}
 */
function getRealBillName() {
  return file.readDirAsync(billtemp).then((files) => {
    const result = {};
    const hasAlipay = bill.alipay;// 是否有支付宝账单
    if (!hasAlipay) {
      console.log('*************无支付宝账单无法解析*************');
      console.log(files);
      return Promise.reject();
    }
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
    return Promise.resolve(result);
  }).catch(err => console.log(err));
}

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

  /**
   * 价格处理，支出为正，收入为负，为了与其他账单整合
   * @param price
   * @param inorout
   * @return {number}
   */
  static priceProcess(price, inorout) {
    const p = parseFloat(price);
    return inorout.indexOf('收入') !== -1 ? -p : p;
  }

  // 提取需要的信息
  static extract(data = []) {
    const table = [];
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      // 将"起始日期:[2018-09-07 00:00:00]    终止日期:[2018-10-07 00:00:00]"
      if (i === 2) {
        table.push(row[0]);
      }
      // 保证金额一列存在，再提取数据
      if (row[9]) {
        // tools.replaceT将row[0]中的\t与两边空格去掉
        const time = tools.replaceT(row[4]);
        newrow.push(time.split(' ')[0]);// 最近修改时间
        const price = tools.replaceT(row[9]);
        const inorout = tools.replaceT(row[10]);// 收/支
        const state = tools.replaceT(row[11]);// 交易状态
        if (i === 4) { // 避免文字被转换为NaN
          newrow.push(price);// 入账金额
        } else if (i !== 4 && AlipayParser.isDeal(state)) { // 交易成功再入
          newrow.push(AlipayParser.priceProcess(price, inorout));// 入账金额
          newrow.push(tools.replaceT(row[7]));// 交易对方
          newrow.push(tools.replaceT(row[8]));// 商品名称
          newrow.push(state);// 交易状态
          table.push(newrow);
        }
      }
    }
    return table;
  }

  init() {
    return file.readFileAsync(this.folderName + this.filename, 'gbk').then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = AlipayParser.convertor(outputstr);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = AlipayParser.extract(converData);
      console.log('alipay账单数：', exbill.length);
      return Promise.resolve(exbill);
    });
  }
}

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
      console.log('cgb账单数：', exbill.length);
      return Promise.resolve(exbill);
    });
  }
}

function callParser(billNameMap) {
  const parseMap = {
    cgb(name) {
      return new CgbParser(name);
    },
    alipay(name) {
      return new AlipayParser(name);
    },
  };
  const promiseArr = [];
  // billNameMap存储的是
  billOrder.forEach((item) => {
    const vals = billNameMap[item];
    const parser = parseMap[item](vals);
    promiseArr.push(parser.init());
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
