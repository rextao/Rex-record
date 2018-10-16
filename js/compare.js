// 用于对账本数据的比较
const tools = require('./tools');
const { date } = require('./tools');

class Compare {
  constructor(data) {
    // 原始数据
    this.data = data;
    // 解析成功+cgb+alipay的全部字符串
    this.parseallstr = '';
    // 解析成功数组
    this.parseresult = [];
  }

  getParseResult() {
    return this.parseresult;
  }

  setParseResult(result) {
    this.parseresult = result;
  }

  // 支付宝与其他账单对比
  alipayWithOthers() {
    const alipayData = this.data[0];
    const others = this.data.splice(1);
    // others包含除alipay之外的其他账单
    if (others[0]) {
      this.cgbWithAlipay(others[0], alipayData);
    }
  }

  // cgb与alipay对比
  cgbWithAlipay(cgb = [], alipay) {
    const result = [];
    // cgb,alipay账单第一行都为自定义信息，第二行为描述信息，即账单title
    for (let i = 2; i < cgb.length; i += 1) {
      const cgbitem = cgb[i];
      const cgbtime = cgbitem[0];// 时间
      const cbgprice = cgbitem[1];// 价格
      for (let j = 2; j < alipay.length; j += 1) {
        const alipayitem = alipay[j];
        const alipaytime = alipayitem[0];// 时间
        const alipayprice = alipayitem[1];// 价格
        // 如账单时间相同，价格相同
        if (date.isSame(cgbtime, alipaytime) && cbgprice === alipayprice) {
          cgbitem.push(...alipayitem.splice(2));
          result.push(cgbitem);
          alipay.splice(j, 1);
          cgb.splice(i, 1);
          break;
        }
      }
    }
    this.parseresult = result;
    console.log(`成功解析：${result.length},cgb剩余：${cgb.length},alipay剩余：${alipay.length}`);
    this.setParseStr(result, cgb, alipay);
  }

  /**
   * 设置解析字符串
   * @param result
   * @param cgb
   * @param alipay
   */
  setParseStr(result, cgb, alipay) {
    result.push('***************************************');
    result.push(...cgb);
    result.push('***************************************');
    result.push(...alipay);
    this.parseallstr = tools.tableToString(result);
  }

  init() {
    this.alipayWithOthers();
  }
}
exports.Compare = Compare;
