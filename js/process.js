/**
 * 处理过程
 */
const file = require('./file');
const config = require('./config');
const { date } = require('./tools');

const { folder } = config;
const billtemp = `./../${folder.billtemp}`;
const billoriginal = `./../${folder.billoriginal}`;

class Process {
  constructor(timearr) {
    // 账单名,init函数会对此赋值
    this.billname = '';
    // 文件夹名字，如2018年10月（）
    this.foldername = '';
    this.init(timearr);
  }

  // 初始化process一些属性
  init(arr) {
    this.getBillName(arr);
  }

  /**
   * 根据时间，拼接需要的文件夹与文件名称
   * @param arr [startTime, endTime]
   */
  getBillName(arr) {
    // 账单从7日到下月6日，不使用endTime,避免下个月前几天无数据
    const [startTime] = arr;
    // 2018-10类似这样的日期
    const start = startTime.substr(0, 7);
    // 2018-10-06类似这样的日期
    const end = date.add(startTime, 1, 'M').subtract(1, 'days');
    // 2018-10
    this.foldername = `${date.add(start, 1, 'M').format('YYYY-MM')}`;
    // 2018-10月账单(09月07日-10月06日)
    this.billname = `${this.foldername}账单(${date.moment(startTime).format('MM月DD日')}-${end.format('MM月DD日')})`;
  }

  /**
   * 将temp下的文件挪动到original/2018-10类似的文件夹下
   */
  moveTempToOriginal() {
    file.readDirAsync(billtemp).then((files) => {
      console.log(`*************账单已备份到${billoriginal}${this.foldername}/*************`);
      file.moveFiles(billtemp, files, `${billoriginal}${this.foldername}/`);
    }).catch(err => console.log(err));
  }

  /**
   * 将解析后的全部账单写入
   */
  writeAlltoBillParse() {

  }
}

exports.Process = Process;
