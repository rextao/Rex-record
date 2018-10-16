/**
 * 处理过程
 */
const file = require('./file');
const config = require('./config');
const { date } = require('./tools');
const { Parser } = require('./parse');

const { folder } = config;

const billtemp = `./../${folder.billtemp}`;
const billoriginal = `./../${folder.billoriginal}`;
const billparse = `./../${folder.billparse}`;


function getAlipayBillDate(data) {
  const datestr = data[0][0];
  const arr = datestr.split('[');
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
  init(data) {
    // arr为账单起始与结束时间，[startTime, endTime],alipay中有账单时间显示
    // [2018-09-07,2018-10-06]
    const timearr = getAlipayBillDate(data);
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
    // 2018-10
    this.foldername = date.getNextMonth(starttime);
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
   * @param billname
   */
  static writeAlltoBillParse(str, billname) {
    console.log(`*************解析后的账单在：billparse/${billname}.csv*************`);
    file.writeStr(`${billparse}${billname}.csv`, str);
  }
}

exports.Process = Process;
