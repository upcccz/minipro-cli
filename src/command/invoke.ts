import log from '../utils/log';
import { getPath } from '../utils/get-path';

const fs = require('fs');
const path = require('path');

export default function (pageName: string, componentName: string) {
  const pathData = getPath();

  if (!pathData) {
    return;
  }

  const { appJsonPath, pagePrefix } = pathData;


  const pageJsonPath = path.resolve(appJsonPath, `../${pagePrefix}/${pageName}/${pageName}.json`);
  const isPageJsonExist = fs.existsSync(pageJsonPath);
  if (!isPageJsonExist) {
    log.error(`不存在对应的 page.json 文件，请重新确认路径。path: ${pageJsonPath}`)
    return;
  }

  const pageJson = JSON.parse(fs.readFileSync(pageJsonPath));
  const componentPath = path.resolve(appJsonPath, `../components/${componentName}/${componentName}`);
  const isComponentExist = fs.existsSync(`${componentPath}.json`);
  if (!isComponentExist) {
    log.error(`不存在对应的组件文件，请重新确认路径。path: ${componentPath}`)
    return;
  }
  if (pageJson.usingComponents) {
    pageJson.usingComponents[componentName] = componentPath.replace(path.resolve(appJsonPath, '../'), '');
  } else {
    pageJson.usingComponents = {
      [componentName]: componentPath.replace(process.cwd(), '')
    }
  }
  
  fs.writeFileSync(pageJsonPath, JSON.stringify(pageJson, null, 2));
  log.success(`为页面 ${pageName} 引入组件 ${componentName} 成功`);
}