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
      obj[key] = others[i - 1].length === 0 ? 0 : others[i - 1].length - 2;
      func(obj);
    }
    return func();
  }

  static consoleResultTable(arr, result, alipayRes, others) {
    for (let i = 0; i < arr.length; i += 1) {
      const obj = arr[i];
      if (i === 0) {
        obj.success = result.length;
        obj.res = alipayRes.length;
      } else {
        const otherLen = others[i - 1].length === 0 ? 0 : others[i - 1].length - 2;
        obj.success = obj.num - otherLen;
        obj.res = otherLen;
      }
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
    this.setCompared(result);
    console.log('**************解析结果：******************');
    Compare.consoleResultTable(consoleArr, result, alipayRes, others);
    console.table(consoleArr);
  }

  // 循环其他账单，分别与alipay账单的每一行（item）比较，获得结果
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
