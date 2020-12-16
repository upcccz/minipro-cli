#!/usr/bin/env node

const version = require('../package').version; // 版本号

const program = require('commander'); // 命令行解析

const chalk = require('chalk'); // 命令行log样式

const leven = require('leven');

import createFile from './command/create';
import invokeComponent from './command/invoke';
import publishProgram from './command/publish-program';

function suggestCommands (unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name);

  let suggestion;

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
    console.log();
  }
}

// 设置版本号
program.version(version, '-v, --version');

program.usage('<command> [options]')

// 提供 create 命令
program
  .command('create')    
  .description('创建项目/页面/组件')
  .action(() => createFile());

program
  .command('invoke <pageName> <componentName>')
  .alias('ic')
  .description('为某个页面引入项目内某个组件')
  .action((pageName, componentName) => invokeComponent(pageName, componentName))

program
  .command('publish')
  .description('发布版本')
  .action(() => publishProgram())

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    suggestCommands(cmd)
    process.exitCode = 1
  })

program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`minipro-cli <command> -h, --help`)} for detailed usage of given command.`)
  console.log()
  console.log(`${chalk.cyan('Tips:')} ${chalk.yellow('除 minipro-cli create [project] 选项外，其余命令需要在小程序 app.json 同级目录下执行')}`);
  console.log()
})

program.commands.forEach(c => c.on('--help', () => {
  if (c._name === 'invoke') {
    console.log();
    console.log(`${chalk.cyan('e.g:')} minipro-cli ic index nav-list`);
  } else if (c._name === 'publish') {
    console.log();
    console.log(`${chalk.cyan('Tips:')} ${chalk.yellow('需要在小程序app.json同级目录配置 minicli.json 以提供当前小程序版本信息。')}`);
    console.log();
    console.log(`${chalk.cyan('Example (minicli.json):')}`);
    console.log();
    const example = {
      "version": "1.0.0",
      "versionDesc": "版本描述",
      "cliPath": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
    }
    console.log(JSON.stringify(example, null, 2));
    console.log();
    console.log(`${chalk.cyan('微信小程序命令行安装地址cliPath，请查看：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html')}`);
  }
  console.log();
}))

program.parse(process.argv);
