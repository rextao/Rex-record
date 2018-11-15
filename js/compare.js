/**
 * 账单比较器
 * 主要功能：将信用卡主要为cgb账单与支付宝账单比较，获取更加详细的信息
 * 注意：由于比较使用了数组，故需要数据格式一致，尤其是时间与金额
 *       要求第一列为时间2018-11-05，第二列为金额;
 *       账单数据从第others[2]行开始，支付宝账单从alipayData[1]开始
 */
const tools = require('./tools');
const { date } = require('./tools');
const config = require('./config');

const { billOrder } = config.filename;

class Compare {
  constructor(data) {
    // 原始数据
    this.data = data;
    // 解析成功+cgb+alipay的全部字符串
    this.compareallstr = '';
    // 解析成功数组
    this.compared = [];
  }

  // console 打印一些信息，方便查看结果
  static consoleOriTable(alipayData, others) {
    const func = tools.initConsoleTable('bill', 'num');
    func({ alipay: alipayData.length - 1 });
    for (let i = 1; i < billOrder.length; i += 1) {
      const key = billOrder[i];
      const obj = {};
      obj[key] = others[i - 1].length - 2;
      func(obj);
    }
    return func();
  }

  static consoleResultTable(arr, key, value) {
    const obj = arr[0];
    obj[key] = value;
    return arr;
  }

  static consoleResTable(arr, res, ohters) {
    const obj1 = arr[0];
    obj1.res = res;
    for (let i = 1; i < arr.length; i += 1) {
      const obj = arr[i];
      obj.res = ohters[i - 1].length - 2;
    }
    return arr;
  }

  // 支付宝与其他账单对比
  alipayWithOthers() {
    // 支付宝账单
    const alipayData = this.data[0];
    // 其他账单
    const others = this.data.splice(1);
    const consoleArr = Compare.consoleOriTable(alipayData, others); // 用于存console.table打印的arr，方便查看结果
    // 循环alipay账单
    const alipayRes = [];
    const result = [];
    for (let i = 1; i < alipayData.length; i += 1) {
      const item = alipayData[i];
      const compareResult = Compare.loopOthers(item, others);
      if (compareResult.length !== 0) {
        result.push(compareResult);
      } else {
        alipayRes.push(item);
      }
    }
    this.setCompareAllStr(result, alipayRes, ...others);
    console.log('**************解析结果：******************');
    Compare.consoleResultTable(consoleArr, 'sucess', result.length);
    Compare.consoleResTable(consoleArr, alipayRes.length, others);
    console.table(consoleArr);
  }

  static loopOthers(item, others) {
    const result = [];
    const alipayDate = item[0];
    const alipayPrice = item[1];
    // 每个不同的账单
    for (let i = 0; i < others.length; i += 1) {
      const bill = others[i];
      // 账单的每一行
      for (let j = 2; j < bill.length; j += 1) {
        const row = bill[j];
        // 如账单时间相同，价格相同
        if (date.isSame(alipayDate, row[0]) && alipayPrice === row[1]) {
          result.push(...item);
          result.push(...row.splice(2));
          bill.splice(j, 1);
          return result;
        }
      }
    }
    return result;
  }

  // cgb与alipay对比
  cgbWithAlipay(cgb = [], alipay) {
    // cgb有两行无用信息，非数据
    // alipay，生成未成功解析账单是删除alipay成功解析的行
    console.log(`原始账单：cgb为：${cgb.length - 2}，alipay为：${alipay.length}`);
    const resultcgb = [];
    const result = [];
    // cgb账单第一行都为自定义信息，第二行为描述信息，即账单title
    for (let i = 2; i < cgb.length; i += 1) {
      // 判断数据是否匹配上；
      let ismatch = false;
      const cgbitem = cgb[i];
      const cgbtime = cgbitem[0];// 时间
      const cbgprice = cgbitem[1];// 价格
      // alipay没有title的描述信息，第一行为自定义信息
      for (let j = 1; j < alipay.length; j += 1) {
        const alipayitem = alipay[j];
        const alipaytime = alipayitem[0];// 时间
        const alipayprice = alipayitem[1];// 价格
        // 两个账单时间递减排列,如cgbtime在aplipaytime之后，则表示cgb账单肯定没有匹配的了
        if (date.isAfter(cgbtime, alipaytime)) {
          break;
        }
        // 如账单时间相同，价格相同
        if (date.isSame(cgbtime, alipaytime) && cbgprice === alipayprice) {
          cgbitem.push(...alipayitem.splice(2));
          result.push(cgbitem);
          alipay.splice(j, 1);
          ismatch = true;
          break;
        }
      }
      // alipay循环完，发现ismatch为false，表示当前i的item未匹配上
      if (!ismatch) {
        resultcgb.push(cgbitem);
      }
    }
    console.log(`成功解析：${result.length},cgb剩余：${resultcgb.length},alipay剩余：${alipay.length}`);
    this.setCompared(result);
    this.setCompareAllStr(result, resultcgb, alipay);
  }

  getCompared() {
    return this.compared;
  }

  // 设置比较结果数组
  setCompared(result) {
    this.compared = result;
  }

  /**
   * 设置比较结果的全部字符串
   * @param items
   */
  setCompareAllStr(...items) {
    const result = [];
    items.forEach((item) => {
      result.push(...item);
      result.push('***************************************');
    });
    this.compareallstr = tools.tableToString(result);
  }

  init() {
    this.alipayWithOthers();
  }
}
exports.Compare = Compare;
