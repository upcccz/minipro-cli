import log from '../utils/log';
import utils, { TemplateType } from '../utils'
import { getPath, getCopyDir } from '../utils/get-path';
import Config from '../config';
import invokeComponent from '../command/invoke';

const fs = require('fs');
const srcComponentPath = Config.templatePath.component;
const inquirer = require('inquirer');                   // 启动交互命令行

export default async function (name: string) {
  const pathData = getPath();

  if (!pathData) {
    return;
  }
  
  const distComponentPath = getCopyDir(name, TemplateType.组件)
  const isComponentExist = fs.existsSync(distComponentPath);
  if (isComponentExist) {
    log.error(`存在 Component: ${isComponentExist} ，请重新确认路径`);
    return;
  }

  const isSuccess = await utils.formatCopy(srcComponentPath, distComponentPath, { name }).catch(console.log);
  if (isSuccess) {
    log.success('生成 Component 模板成功');
  } else {
    log.error('生成 Component 模板失败');
  }

  const question = [
    {
      type: 'input',
      name: 'pageStr',
      message: '是否需要在某些页面引入，输入多个以,隔开（e.g: index,about）',
      default: '否'
    }
  ]

  inquirer.prompt(question).then(answers => {
    const { pageStr } = answers;
    if (!pageStr || pageStr === '否') {
      return;
    }
    const pageArr = pageStr.split(',');
    pageArr.forEach((pageName) => {
      invokeComponent(pageName, name);
    })
  })
}