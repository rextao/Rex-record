/**
 * 处理过程
 */
const file = require('./file');
const tools = require('./tools');
const config = require('./config');
const { date } = require('./tools');

const { folder } = config;
const { category } = config;

const billtemp = `./../${folder.billtemp}`;
const billoriginal = `./../${folder.billoriginal}`;
const billparse = `./../${folder.billparse}`;
const billSui = `./../${folder.billSui}`;

function getAlipayBillDate(billTimeRange) {
  const arr = billTimeRange.split('[');
  const startTime = arr[1].split(' ')[0];
  let endTime = arr[2].split(' ')[0];
  endTime = date.subtract(endTime, 1, 'days').format('YYYY-MM-DD');
  return [startTime, endTime];
}
class Process {
  constructor() {
    // 账单名,init函数会对此赋值
    this.billname = '';
    // 文件夹名字，如2018年10月（）
    this.foldername = '';
  }

  // 初始化process一些属性
  init(billTimeRange) {
    // 获取alipay账单时间，时间在compare时保存在billTimeRange中
    // arr为账单起始与结束时间，起始日期:[2018-10-07 00:00:00]    终止日期:[2018-11-07 00:00:00]
    // 通过getAlipayBillDate，获取到[2018-09-07,2018-10-06]
    const timearr = getAlipayBillDate(billTimeRange);
    // 根据开始时间设置文件与文件夹名
    this.setBillname(timearr[0]);
    // 移动billtemp下的文件到billoriginal文件夹下
    this.moveTempToOriginal();
  }

  /**
   * 根据开始时间，获取需要的文件夹与文件名称，设置在实例process属性上
   * @param starttime 利用开始时间推出结束
   */
  setBillname(starttime) {
    // 账单从7日到下月6日
    // starttime = 2018-10-1;date.getNextMonth(starttime);获取为2018-11
    this.foldername = starttime.slice(0, 7);
    // 2018-10月账单(09月07日-10月06日)
    this.billname = `${this.foldername}账单(${date.getBillRange(starttime)})`;
  }

  /**
   * 将temp下的文件挪动到original/2018-10类似的文件夹下
   */
  moveTempToOriginal() {
    console.log(`*************原始账单在：billoriginal/${this.foldername}/*************`);
    file.moveFilesAsync(billtemp, `${billoriginal}${this.foldername}/`);
  }

  /**
   * 将str全部内容写入billname这个文件中
   * @param str
   */
  writeAlltoBillParse(str) {
    console.log(`*************解析后的账单在：billparse/${this.billname}.csv*************`);
    file.writeStr(`${billparse}${this.billname}.csv`, str);
  }

  // 将结果写入随手记中，根据随手记的格式转换后写入billSui
  // -。-圈子比较倒闭了吗-。-appstore没有软件了20181115
  // 很多信息都是空着的
  // 由于考虑到微信剩余的，出自银行卡
  writeComparedtoSui(arr, wechatRes) {
    const result = [['交易类型', '日期', '分类', '子分类', '账户1', '账户2', '金额', '成员', '商家', '项目', '备注']];
    arr.forEach((item) => {
      const row = [];
      row.push('支出'); // 交易类型
      row.push(item[0]);// 日期
      // 分类，子分类
      const cate = Process.convertCategory(item.slice(2));
      if (cate) {
        row.push(...cate.split('-'));
      } else {
        row.push('');
        row.push('');
      }
      row.push('现金'); // 账户1
      row.push(''); // 账户2
      row.push(item[1]); // 金额
      row.push('本人'); // 成员
      row.push(''); // 商家
      row.push(''); // 项目
      row.push(''); // 备注
      row.push(...item.slice(2)); // 其他信息
      result.push(row);
    });
    Object.keys(wechatRes).forEach((key) => {
      const row = [];
      const val = wechatRes[key];
      if (Array.isArray(val) && val[3].indexOf('建设银行') !== -1) {
        row.push('支出'); // 交易类型
        row.push(val[0]);// 日期
        // 分类，子分类
        const cate = Process.convertCategory(val[2]);
        if (cate) {
          row.push(...cate.split('-'));
        } else {
          row.push('');
          row.push('');
        }
        row.push('建设银行'); // 账户1
        row.push(''); // 账户2
        row.push(val[1]); // 金额
        row.push('本人'); // 成员
        row.push(''); // 商家
        row.push(''); // 项目
        row.push(''); // 备注
        row.push(val[2]); // 其他信息
        result.push(row);
      }
    });
    const str = tools.tableToString(result);
    console.log(`*************随手记账单在：billSui/${this.billname}.csv*************`);
    file.writeStr(`${billSui}${this.billname}.csv`, str);
  }

  // 根据config。category转换类型
  static convertCategory(itemArr) {
    const categorykeys = Object.keys(category);
    for (let i = 0; i < categorykeys.length; i += 1) {
      const catekey = categorykeys[i];
      const arr = category[catekey];
      // category的每个词
      for (let j = 0; j < arr.length; j += 1) {
        const item = arr[j];
        for (let k = 0; k < itemArr.length; k += 1) {
          if (itemArr[k].indexOf(item) !== -1) {
            return catekey;
          }
        }
      }
    }
    return '';
  }
}

exports.Process = Process;
