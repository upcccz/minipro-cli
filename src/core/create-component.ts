import Log from '../utils/log';
import Utils, { TemplateType } from '../utils'
import Config from '../config';
import invokeComponent from '../command/invoke';

const srcComponentPath = Config.templatePath.component;
const inquirer = require('inquirer');                     // 启动交互命令行

export default async function (name: string) {

  const appJsonPath = Utils.checkAppJsonExist();

  if (!appJsonPath) {
    Log.error('不存在 app.json，请重新确认路径');
    return;
  }
  
  const distComponentPath = Utils.findTempDistPath(appJsonPath, name, TemplateType.组件)
  const isComponentExist = Utils.checkFileIsExists(distComponentPath);
  if (isComponentExist) {
    Log.error(`存在 Component: ${isComponentExist} ，请重新确认路径`);
    return;
  }

  const isSuccess = await Utils.formatCopy(srcComponentPath, distComponentPath, { name }).catch(console.log);
  if (isSuccess) {
    Log.success('生成 Component 模板成功');
  } else {
    Log.error('生成 Component 模板失败');
  }

  const question = [
    {
      type: 'input',
      name: 'pageStr',
      message: '是否需要在某些页面引入，输入多个以,隔开（e.g: index,about）'
    }
  ]

  inquirer.prompt(question).then(answers => {
    const { pageStr } = answers;
    if (!pageStr) {
      return;
    }
    const pageArr = pageStr.split(',');
    pageArr.forEach((pageName) => {
      invokeComponent(pageName, name);
    })
  })
}