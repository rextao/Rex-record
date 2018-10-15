// 用于对账本数据的比较
const { date } = require('./tools');

class Process {
  constructor(data) {
    this.data = data;
  }

  // 支付宝与其他账单对比
  alipayWithOthers() {
    const alipayData = this.data[0];
    const others = this.data.splice(1);
    // others包含除alipay之外的其他账单
    if (others[0]) {
      Process.cgbWithAlipay(others[0], alipayData);
    }
  }

  // cgb与alipay对比
  static cgbWithAlipay(cgb = [], alipay) {
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
    console.log(result.length);
    console.log(cgb.length);
    console.log(alipay.length);
  }

  init() {
    this.alipayWithOthers();
  }
}
exports.Process = Process;
