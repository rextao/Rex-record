const config = require('./config');
const tools = require('./tools');
const file = require('./file');

const { folder } = config;
const billtemp = `./../${folder.billtemp}`;

const { bill } = config.filename;

/**
 * 根据config配置filename.bill获取真实的文件名
 * @returns {Promise<any | never>}
 */
function getRealBillName() {
  return file.getFilesAsync(billtemp).then((files) => {
    const result = {};
    const billKeys = Object.keys(bill);
    const hasAlipay = bill.alipay;// 是否有支付宝账单
    if (!hasAlipay) {
      console.log('*************无支付宝账单无法解析*************');
      console.log(files);
      return Promise.reject();
    }
    billKeys.forEach((key) => {
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

  // 提取需要的信息
  static extract(data = []) {
    const table = [];
    // 为了标识账单
    table.push('alipay');
    for (let i = 0; i < data.length; i += 1) {
      const row = data[i];
      const newrow = [];
      // 保证金额一列存在，再提取数据
      if (row[9]) {
        // tools.replaceT将row[0]中的\t与两边空格去掉
        const time = tools.replaceT(row[4]);
        newrow.push(time.split(' ')[0]);// 最近修改时间
        const price = tools.replaceT(row[9]);
        if (i === 4) {// 避免文字被转换为NaN
          newrow.push(price);// 入账金额
        } else {
          newrow.push(parseFloat(price));// 入账金额
        }
        newrow.push(tools.replaceT(row[7]));// 交易对方
        newrow.push(tools.replaceT(row[8]));// 商品名称
        table.push(newrow);
      }
    }
    return table;
  }

  init() {
    return file.readFileAsync(this.folderName + this.filename, 'gbk').then((outputstr) => {
      // 利用不同类型账单对应的convertor对数据进行转换
      const converData = AlipayParser.convertor(outputstr);
      console.log('alipay账单数：', converData.length);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = AlipayParser.extract(converData);
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
    table.push('cgb');
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
      console.log('cgb账单数：', converData.length);
      // 提取账单中需要的信息，并对数据进行转换；
      const exbill = CgbParser.extract(converData);
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
  const keys = Object.keys(billNameMap);
  const promiseArr = [];
  // billNameMap存储的是
  keys.forEach((item) => {
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
      // 调用billNameMap中的对应的解析器
      // 如新增账单，需要增加调用，callParser返回的是Promise.all
      const promiseAllParser = callParser(billNameMap);
      return promiseAllParser.then(data => Promise.resolve(data));
    }).catch(err => console.log(err));
  }
}

exports.Parser = Parser;
