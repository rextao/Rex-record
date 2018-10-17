/**
 * 账单比较器
 * 主要功能：将信用卡主要为cgb账单与支付宝账单比较，获取更加详细的信息
 */
const tools = require('./tools');
const { date } = require('./tools');

class Compare {
  constructor(data) {
    // 原始数据
    this.data = data;
    // 解析成功+cgb+alipay的全部字符串
    this.compareallstr = '';
    // 解析成功数组
    this.compared = [];
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
    console.log(`成功解析：${result.length},cgb剩余：${cgb.length},alipay剩余：${alipay.length}`);
    this.setCompared(result);
    this.setCompareAllStr(result, cgb, alipay);
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
