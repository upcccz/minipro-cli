

import log from './log';
import utils, { TemplateType } from './index'

const pathObj = {} as Record<string, string>;
const path = require('path');
const fs = require('fs');

export function getPath(): Record<string, string>|null {
  if (Object.keys(pathObj).length) {
    return pathObj;
  } else {
    const cwd = process.cwd();
    const projectJsonPath = path.resolve(cwd, './project.config.json');
    if (fs.existsSync(projectJsonPath)) {
      pathObj.rootPath = cwd;
      pathObj.projectJsonPath = projectJsonPath;
      pathObj.miniJson = path.resolve(cwd, './minicli.json')
      const pathStrc = utils.handlePath(cwd);
      const fileArr = pathStrc.file;
      if (fileArr.length) {
        for (let i = 0, l = fileArr.length; i < l; i++) {
          if (fileArr[i].endsWith('app.json')) {
            pathObj.appJsonPath = fileArr[i];
            break;
          }
        }
      }

      if (pathObj.appJsonPath) {
        pathObj.pagePrefix = utils.findPagePath(pathObj.appJsonPath)
        pathObj.pagePath = path.resolve(pathObj.appJsonPath, `../${pathObj.pagePrefix}`)
      } else {
        log.error('app.json 不存在，请确认后重试')
      }

      if (pathObj.appJsonPath) {
        pathObj.componentPath = path.resolve(pathObj.appJsonPath, '../components')
        pathObj.componentPrefix = pathObj.componentPath.replace(path.resolve(pathObj.appJsonPath, '../'), '');
      }
      
      return pathObj;
    } else {
      log.error('project.config.json 不存在，请切换到项目根目录进行命令行操作')
      return null
    }
  }
}

export function getCopyDir(fileName: string, type: TemplateType) {
  const pathData = getPath();
  if (pathData) {
    const appJsonPath = pathData.appJsonPath;
    const pagePath = pathData.pagePrefix;
    if (type === TemplateType.页面) {
      return path.resolve(appJsonPath, `../${pagePath}/${fileName}`)
    } else if (type === TemplateType.组件) {
      return path.resolve(appJsonPath, `../components/${fileName}`)
    }
  }
}