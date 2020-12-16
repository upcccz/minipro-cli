import Log from '../utils/log';
import Utils from '../utils'

const fs = require('fs');
const path = require('path');


export default function (pageName: string, componentName: string) {
  const appJsonPath = Utils.checkAppJsonExist();

  if (!appJsonPath) {
    Log.error('不存在 app.json，请重新确认路径');
    return;
  }

  const pagePath = Utils.findPagePath(appJsonPath);

  const pageJsonPath = path.join(process.cwd(), `/${pagePath}/${pageName}/${pageName}.json`);
  const isPageJsonExist = Utils.checkFileIsExists(pageJsonPath);
  if (!isPageJsonExist) {
    Log.error(`不存在对应的 page.json 文件，请重新确认路径。path: ${pageJsonPath}`)
    return;
  }

  const pageJson = JSON.parse(fs.readFileSync(pageJsonPath));
  const componentPath = path.resolve(pagePath, `../components/${componentName}/${componentName}`);
  const isComponentExist = Utils.checkFileIsExists(`${componentPath}.json`);
  if (!isComponentExist) {
    Log.error(`不存在对应的组件文件，请重新确认路径。path: ${componentPath}`)
    return;
  }
  if (pageJson.usingComponents) {
    pageJson.usingComponents[componentName] = componentPath.replace(process.cwd(), '');
  } else {
    pageJson.usingComponents = {
      [componentName]: componentPath.replace(process.cwd(), '')
    }
  }
  
  fs.writeFileSync(pageJsonPath, JSON.stringify(pageJson, null, 2));
  Log.success(`为页面 ${pageName} 引入组件 ${componentName} 成功`);
}