import Log from '../utils/log';
import Utils, { TemplateType } from '../utils'
import Config from '../config';

const fs = require('fs');
const srcPagePath = Config.templatePath.page;

export default async function (name: string) {
  const appJsonPath = Utils.checkAppJsonExist();

  if (!appJsonPath) {
    Log.error('不存在 app.json，请重新确认路径');
    return;
  }

  const distPagePath = Utils.findTempDistPath(appJsonPath, name, TemplateType.页面)
  const isPageExist = Utils.checkFileIsExists(distPagePath);
  if (isPageExist) {
    Log.error(`存在 Page: ${distPagePath} ，请重新确认路径`);
    return;
  }

  const isSuccess = await Utils.formatCopy(srcPagePath, distPagePath, { name }).catch(console.log);
  if (isSuccess) {
    // 更新app.json
    let jsonConf = JSON.parse(fs.readFileSync(appJsonPath));
    jsonConf.pages.push(`${Utils.findPagePath(appJsonPath)}/${name}/${name}`);
    fs.writeFileSync(appJsonPath, JSON.stringify(jsonConf, null, 2)); // 输出保持两个空格缩进
    Log.success('生成 Page 模板成功');
  } else {
    Log.error('生成 Page 模板失败');
  }
}