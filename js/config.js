// 存储数据的文件夹
const folder = {
  // 下载账单的临时存放，程序运行成功后，会删除此文件夹内容
  billtemp: 'billtemp/',
  // 下载账单备份地方
  billoriginal: 'billoriginal/',
  // 解析后文件存储地址
  billparse: 'billparse/',
  // 解析的圈子账本存放地址
  billQuan: 'billQuan/',
};
// 文件名字下的默认账单
const filename = {
  // 文档解析顺序，如新增，需增加billOrder与bill
  billOrder: ['alipay', 'cgb'],
  bill: {
    // billtemp,文件夹下账单名，程序会搜索value，如搜索到则此账单为key
    // 例如，cgb: '123123',如文件名搜索到123123，则认为这个文件为cgb
    alipay: 'alipay', // 支付宝
    cgb: '100023557368', // 广发信用卡
  },
};

// 圈子笔记用于获取对应类型的map
// 会通过检索key，获取相应类型
const category = {
  铁路总公司: '交通',
  携程网: '交通',
  火车票: '交通',
  滴滴快车: '交通',
  滴滴打车: '交通',
  多点新鲜: '超市',
  沃尔玛: '超市',
  超市: '超市',
  淘票票: '娱乐',
  饿了么: '外卖',
  麦当劳: '吃喝',
  大众点评: '吃喝',
  火锅: '吃喝',
  味多美: '吃喝',
  好利来: '吃喝',
  食宝街店: '吃喝',
  肯德基: '吃喝',
  原麦山丘: '吃喝',
  美团合作商家: '吃喝',
  耀匀: '亲密付',
};

exports.folder = folder;
exports.filename = filename;
exports.category = category;
