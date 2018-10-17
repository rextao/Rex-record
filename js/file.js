const iconv = require('iconv-lite');
const fs = require('fs');

/**
 * 根据path目录，以encoding的编码形式，读取数据
 * @param path        路径
 * @param encoding    读取编码，默认utf8
 * @return {Promise<any>}  返回值Promise(string)
 */
function readFileAsync(path, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // 读取的文档按照encoding解码
        const cdata = iconv.decode(data, encoding);
        resolve(cdata);
      }
    });
  });
}

/**
 * 获取path目录下的全部文件
 * @param path         要获取文件的目录
 * @return {Promise<any>}   promise，resolve为文件列表数组arr
 */
function readDirAsync(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (stats.isDirectory()) {
        fs.readdir(path, (dirErr, files) => {
          if (dirErr) {
            reject(dirErr);
          } else {
            resolve(files);
          }
        });
      } else {
        reject(err);
      }
    });
  });
}

/**
 * 内部使用：
 * 给定某个文件夹fromfolder，以及文件夹下的文件数组fromfiles
 * 移动到to文件夹下
 * @param fromfolder
 * @param fromfiles
 * @param to
 */
function moveFiles(fromfolder, fromfiles, to) {
  fs.access(to, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdirSync(to);
    }
    fromfiles.forEach((item) => {
      fs.rename(`${fromfolder}${item}`, `${to}/${item}`, (renameerr) => {
        if (renameerr) {
          throw renameerr;
        }
      });
    });
  });
}

/**
 * 将from文件夹下的全部内容移动到to目录下
 * @param from
 * @param to
 */
function moveFilesAsync(from, to) {
  // 读取当前文件夹下内容，获取文件列表files
  readDirAsync(from).then((files) => {
    moveFiles(from, files, to);
  }).catch(err => console.log(err));
}

/**
 * 向to这个文件，写入str的内容
 * @param to
 * @param str
 */
function writeStr(to, str) {
  // 默认编码utf8
  fs.writeFileSync(to, str, { encoding: 'utf8' });
}

exports.readFileAsync = readFileAsync;
exports.readDirAsync = readDirAsync;
exports.moveFilesAsync = moveFilesAsync;
exports.writeStr = writeStr;
