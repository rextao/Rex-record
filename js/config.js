// 存储数据的文件夹
const folder = {
  // 下载账单的临时存放，程序运行成功后，会删除此文件夹内容
  billtemp: 'billtemp/',
  // 下载账单备份地方
  billoriginal: 'billoriginal/',
  // 解析后文件存储地址
  billparse: 'billparse/',
  // 解析的随手记账本存放地址
  billSui: 'billSui/',
};
// 文件名字下的默认账单
const filename = {
  // 文档解析顺序，如新增，需增加billOrder与bill
  // 支付宝账单，微信账单，广发银行，中信银行
  billOrder: ['alipay', 'wechat', 'cgb', 'citic'],
  bill: {
    // billtemp,文件夹下账单名，程序会搜索value，如搜索到则此账单为key
    // 例如，cgb: '123123',如文件名搜索到123123，则认为这个文件为cgb
    alipay: 'alipay', // 支付宝
    wechat: '微信支付',
    cgb: '100023557368', // 广发信用卡
    citic: '账单明细', // 中信银行
  },
};

// 随手记用于获取对应类型的map
// 会通过检索key，获取相应类型
const category = {
  '购物-服饰': [],
  '购物-化妆品': [],
  '购物-其他': [],
  '购物-网购': [],
  '物业-燃气费': [],
  '物业-电费': ['国网北京市电力公司'],
  '物业-水费': [],
  '物业-房租': [],
  '物业-物业费': [],
  '物业-维修费': [],
  '物业-暖气费': [],
  '交通-地铁费': [],
  '交通-打车': ['滴滴快车', '滴滴打车'],
  '交通-火车票': ['铁路总公司', '火车票'],
  '吃喝-吃吃喝喝': ['比格比萨', '麦当劳', '火锅', '味多美', '好利来', '食宝街店', '肯德基', '原麦山丘', '美团合作商家', '杨国福'],
  '吃喝-超市': ['多点新鲜', '沃尔玛', '超市', '柒一拾壹'],
  '吃喝-外卖': ['饿了么'],
  '交流通讯-话费': ['中国移动'],
  '交流通讯-网费': [],
  '娱乐-健身': [],
  '娱乐-电影': ['淘票票'],
  '娱乐-玩乐': [],
  '家人-红包': [],
  '家人-大宝': ['亲密付', '耀匀'],
  '医疗-医药费': ['医药有限公司', '大药房'],
  '医疗-治疗费': [],
  '金融-房贷': [],
  '金融-保险费': [],
  '金融-罚款': [],
  '金融-手续费': [],
  '金融-分期费': [],
  '礼品-礼物': [],
};

exports.folder = folder;
exports.filename = filename;
exports.category = category;
