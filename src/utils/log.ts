const chalk                  =  require('chalk');                        // 命令行log样式

export default {
  success(msg) {
    console.log(chalk.green(`>> ${msg}`));
  },
  error(msg) {
    console.log(chalk.red(`>> ${msg}`));
  },
  warn(msg) {
    console.log(chalk.yellow(`>> ${msg}`));
  }
};
