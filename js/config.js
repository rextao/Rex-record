// 存储数据的文件夹
const folder = {
  // 下载账单的临时存放，程序运行成功后，会删除此文件夹内容
  billtemp: 'billtemp/',
};
// 文件名字下的默认账单
const filename = {
  // 账单解析顺序，避免读取文件后，解析错误
  billOrder: ['alipay', 'cgb'],
  bill: {
    // billtemp,文件夹下账单名，程序会搜索value，如搜索到则此账单为key
    // 例如，cgb: '123123',如文件名搜索到123123，则认为这个文件为cgb
    alipay: 'alipay', // 支付宝
    cgb: '100023557368', // 广发信用卡
  },
};
exports.folder = folder;
exports.filename = filename;