import createProject from '../core/create-project';
import createPage from '../core/create-page';
import createComponent from '../core/create-component';

const inquirer = require('inquirer');                     // 启动交互命令行

const question = [
  // 选择模式使用 project-> 初始化项目 | page -> 创建页面 | component -> 创建组件
  {
    type: 'list',
    name: 'mode',
    message: '选择想要创建的模版',
    choices: [
      'project',
      'page',
      'component',
    ]
  },
  
  // 设置名称
  {
    type: 'input',
    name: 'name',
    default: answer => answer.mode === 'project' ? 'mini-pro': 'index',
    message: answer => `设置 ${answer.mode} 名称 (e.g: ${answer.mode === 'project' ? 'mini-pro': 'index'}):`,
  },

  // 设置project 的 appid
  {
    type: 'input',
    name: 'appId',
    message: '设置小程序项目的appid',
    default: '',
    when(answer) {
      return answer.mode === 'project';
    }
  },

  // 设置project 的 libVersion
  {
    type: 'input',
    name: 'libVersion',
    message: '设置小程序项目的微信基础库版本',
    default: '2.7.3',
    when(answer) {
      return answer.mode === 'project';
    }
  },
];

export default function() {
  // 获取交互的结果
  inquirer.prompt(question).then(answers => {
    const { name, mode } = answers;
      switch (mode) {
        case 'project':
          createProject(answers);
          break;
        case 'page':
          createPage(name);
          break;
        case 'component':
          createComponent(name);
      }
  });
};