import log from '../utils/log';
import { getPath } from '../utils/get-path';

const fs = require('fs');
const inquirer = require('inquirer');                     // 启动交互命令行
const child_process = require('child_process');           // 开启子进程
const path = require('path');

/**
 * 根据当前版本提供可更变版本的选择
 *
 * @param {string} version
 * @return {string[]} 返回一个可供选择的版本数组
 */
function getVersionChoices(version: string): string[] {
  const choices = ['版本升级: ', '特性更新: ', '修订补丁: '];
  let aVersion = version;
  const versionReg = /(\d+.){2,3}\d+/g;
  if (!versionReg.test(aVersion)) {
    aVersion = '1.0.0'; // 如果不符合规格的version 默认写为1.0.0
    log.warn('配置的 version 不符合规范, 已默认修正为1.0.0');
  }

  for(let i = 0; i < choices.length; i++) {
    const cVersion = aVersion.split('.').map((s, idx) => idx ===i ? Number(s) + 1 : s).join('.')
    choices[i] = choices[i] + cVersion;
  }

  choices.unshift('no change');

  return choices;
}

function handleQuestion(version: string) {
  return [
    // 设置版本号
    {
      type: 'list',
      name: 'version',
      message: `设置上传的版本号 (当前版本号: ${version}):`,
      default: 1,
      choices: getVersionChoices(version),
      filter(opts) {
        if (opts === 'no change') {
          return version;
        }
        return opts.split(': ')[1];
      },
    },

    // 设置上传描述
    {
      type: 'input',
      name: 'versionDesc',
      message: `写一个简单的介绍来描述这个版本的改动过:`,
      default: 'a little change'
    },
  ]
}

export default async function publishProgram() {
  const pathData = getPath();

  if (!pathData) {
    return;
  }

  const { rootPath, projectJsonPath, miniJson } = pathData;

  // 读取minicli.json 获取当前版本和小程序命令行安装地址
  const isMiniCliJsonExist = fs.existsSync(miniJson);

  if (!isMiniCliJsonExist) {
    log.error('需要配置 minicli.json 以提供小程序命令行工具安装地址及小程序版本信息')
    log.warn('具体微信小程序命令行工具说明，请查看：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html')
    return;
  }

  const minicliJson = JSON.parse(fs.readFileSync(miniJson));
  const { version, cliPath } = minicliJson
  if (!version) {
    log.error('需要在 minicli.json中提供 version 字段');
    return;
  }

  if (!cliPath) {
    log.error('需要在 minicli.json中提供 cliPath 字段');
    log.warn('安装地址请查看：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html');
    return;
  }

  const answers = await inquirer.prompt(handleQuestion(version)).catch(console.log)

  if (!projectJsonPath) {
    log.error('未找到 project.config.json，请重新确认路径');
  }

  const projectPath = path.resolve(projectJsonPath, '../')

  console.log('开始上传体验版 ...');

  // 上传体验版
  child_process.execSync(`${cliPath} upload --project ${projectPath} -v ${answers.version}  -d "${answers.versionDesc}"`,  { stdio: 'inherit' });

  // 修改minicli.json
  minicliJson.version = answers.version;
  minicliJson.versionDesc = answers.versionDesc;
  fs.writeFileSync(miniJson, JSON.stringify(minicliJson, null, 2))

  child_process.execSync(`cd ${rootPath}`)

}