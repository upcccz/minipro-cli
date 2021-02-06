import log from '../utils/log';
import utils, { TemplateType } from '../utils'
import { getPath, getCopyDir } from '../utils/get-path';
import Config from '../config';

const fs = require('fs');
const srcPagePath = Config.templatePath.page;

export default async function (name: string) {
  const pathData = getPath();

  if (!pathData) {
    return;
  }

  const distPagePath = getCopyDir(name, TemplateType.页面)
  const isPageExist = fs.existsSync(distPagePath);
  if (isPageExist) {
    log.error(`存在 Page: ${distPagePath} ，请重新确认路径`);
    return;
  }

  const isSuccess = await utils.formatCopy(srcPagePath, distPagePath, { name }).catch(console.log);
  if (isSuccess) {
    // 更新app.json
    let jsonConf = JSON.parse(fs.readFileSync(pathData.appJsonPath));
    jsonConf.pages.push(`${pathData.pagePrefix}/${name}/${name}`);
    fs.writeFileSync(pathData.appJsonPath, JSON.stringify(jsonConf, null, 2)); // 输出保持两个空格缩进
    log.success('生成 Page 模板成功');
  } else {
    log.error('生成 Page 模板失败');
  }
}