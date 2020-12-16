const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

import Config from '../config';

import Utils from '../utils'

import Log from '../utils/log'

export default async function (answers) {
  const { name } = answers;

  const src = Config.templatePath.project;
  const dist  = path.join(process.cwd(), './'+ name);

  const isExist = Utils.checkFileIsExists(dist);

  if (isExist) {
    Log.error('当前project路径已存在，请重新确认，path:' + dist)
    return;
  }

  Utils.copy(src, dist, {
    writeAfter(filePath: string) {
      if (filePath.endsWith('project.config.json')) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
          const updateData = handlebars.compile(data)(answers);
          fs.writeFile(filePath, updateData, (err) => {
            if (err) Log.error('更新自定义配置文件失败')
          })
        })
      }
    }
  }).then(() => {
    Log.success('生产 project 模板成功!');
  }).catch(err => {
    Log.error(`生成模板失败 ${err}`);
  })
}