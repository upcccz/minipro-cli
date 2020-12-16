const path = require('path');

export default {
  // 模板路径
  templatePath: {
    project: path.join(__dirname, '../template/project'),
    page: path.join(__dirname, '../template/page'),
    component: path.join(__dirname, '../template/component'),
  }
};
