/**
 * 账单比较器
 * 主要功能：将信用卡主要为cgb账单与支付宝账单比较，获取更加详细的信息
 * 注意：由于比较使用了数组，故需要数据格式一致，尤其是时间与金额
 *       要求第一列为时间2018-11-05，第二列为金额;
 *       账单数据从第others[2]行开始，支付宝账单从alipayData[1]开始
 */
const tools = require('./tools');
const config = require('./config');

const { billOrder } = config.filename;

class Compare {
  constructor(data) {
    // 原始数据
    this.data = data;
    // 账单起止时间
    this.billTimeRange = data[0].billTimeRange;// data[0]为alipayData
    // 解析成功+cgb+alipay的全部字符串
    this.compareallstr = '';
    // 解析成功数组
    this.compared = [];
    // 微信剩余数据
    this.wechatRes = {};
  }

  // 循环银行账单，查找相符的微信与支付宝账单
  loopBankBill() {
    const result = [];
    const bankRes = [];
    // 支付宝账单
    const [alipayData, wechatData] = this.data;
    // 仅仅用于console.table显示使用
    const alipayOriSum = alipayData.billSum;
    const wechatOriSum = wechatData.billSum;
    // 数据的原始长度，用于最后console.table使用,consoleTableObj这个对象只是用于显示结果使用
    const consoleTableObj = {
      alipay: { ori: alipayOriSum, res: 0, success: 0 },
      wechat: { ori: wechatOriSum, res: 0, success: 0 },
    };
    // 银行账单
    const bankBills = this.data.splice(2);
    // bankBills可能有多个账单，如中信或支付宝账单
    // 由于银行账单第一行为自定义信息，第二行为title信息，顾从第三行开始循环
    bankBills.forEach((bill, index) => {
      const resTemp = [];
      const tempObj = {};
      const bankIndex = index + 2;// 前两个账单是支付宝与微信
      tempObj.ori = bill.length;
      for (let i = 2; i < bill.length; i += 1) {
        const item = bill[i];
        const [time, price] = item;
        const key = `${time}##${price.toFixed(2)}`;
        let sumTemp = 0;
        if (alipayData[key]) {
          Compare.pushCompareResult(result, item, alipayData, key);
          // delete操作无法在push函数中进行
          delete alipayData[key];
          sumTemp = alipayData.billSum;
          alipayData.billSum = sumTemp - 1;
        } else if (wechatData[key]) {
          Compare.pushCompareResult(result, item, wechatData, key);
          // delete操作无法在push函数中进行
          delete wechatData[key];
          sumTemp = wechatData.billSum;
          wechatData.billSum = sumTemp - 1;
        } else {
          resTemp.push(item);// 没有匹配上的数据
        }
      }
      tempObj.res = resTemp.length;
      tempObj.success = tempObj.ori - tempObj.res;
      consoleTableObj[billOrder[bankIndex]] = tempObj;
      bankRes.push(resTemp);
    });
    consoleTableObj.alipay.res = alipayData.billSum;
    consoleTableObj.wechat.res = wechatData.billSum;
    consoleTableObj.alipay.success = consoleTableObj.alipay.ori - consoleTableObj.alipay.res;
    consoleTableObj.wechat.success = consoleTableObj.wechat.ori - consoleTableObj.wechat.res;
    // 保存解析数据
    this.compared = result;
    // 将数据转换为字符串
    this.setCompareAllStr(result, alipayData, wechatData, bankRes);
    // 将微信剩余数据保存下
    this.wechatRes = wechatData;
    console.log('**************解析结果：******************');
    console.table(consoleTableObj);
  }

  /**
   * 设置比较结果的全部字符串
   * @param compared    解析成功数据
   * @param alipayData  支付宝剩余数据
   * @param wechatData  微信剩余数据
   * @param bankRes     银行剩余数据
   */
  setCompareAllStr(compared, alipayData, wechatData, bankRes) {
    const result = [];
    result.push('*****************解析成功数据**********************');
    result.push(...compared);
    result.push('*****************支付宝剩余数据**********************');
    const alipayArr = Object.keys(alipayData).map(key => alipayData[key]);
    result.push(...alipayArr);
    result.push('*****************微信剩余数据**********************');
    const wechatArr = Object.keys(wechatData).map(key => wechatData[key]);
    result.push(...wechatArr);
    bankRes.forEach((item, index) => {
      const billName = billOrder[index + 2];
      result.push(`*****************${billName}剩余数据**********************`);
      result.push(...item);
    });
    this.compareallstr = tools.tableToString(result);
  }

  /**
   * 获取banbill的全部信息，支付宝或微信除了价格和时间信息，push到result中
   * @param result    结果result数组
   * @param bankbill  信用卡账单
   * @param obj     支付宝或微信账单对象
   * @param key     对应的key（time##price）
   * @returns {*|number}
   */
  static pushCompareResult(result, bankbill, obj, key) {
    // 如果支付宝或微信账单有这个key，说明数据存在
    const temp = [];
    temp.push(...bankbill);
    temp.push(...obj[key].splice(2));
    result.push(temp);
  }

  init() {
    this.loopBankBill();
  }
}
exports.Compare = Compare;
