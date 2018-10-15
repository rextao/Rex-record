const iconv = require('iconv-lite');
const fs = require('fs');
const config = require('./config');

const { folder } = config;

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
function getFilesAsync(path) {
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

function moveFilesAsync(from, to) {
  return new Promise((resolve, reject) => {
    fs.access(to, fs.constants.F_OK, (err) => {
      if (err) {
        reject(err);
      }
    });
  })

}


exports.readFileAsync = readFileAsync;
exports.getFilesAsync = getFilesAsync;
