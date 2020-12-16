const fs = require('fs');
const path = require('path');

interface PathStructure {
  dir: string[];
  file: string[];
}

export enum TemplateType {
  '页面' = 'page',
  '组件' = 'component'
}

interface FormatCopyOptions {
  name: string;
}

interface CopyOptions {
  // 文件读写之前的钩子，参数是读文件地址，用来在写之前修改文件名
  writeBefore?(filePath: string): string;
  // 文件读写之后的钩子，参数都是写文件地址，用来在写完之后修改文件内容
  writeAfter?(filePath: string): void;
}

export default {
  /**
   * 分析目录，分为文件夹和文件
   * @param {string} path
   * @returns {PathStructure}
   */
  handlePath(path: string): PathStructure {
    // 同步读取所有路径 返回一个二维数组
    const files = fs.readdirSync(path);
    const pathResult: PathStructure = {
      dir: [],
      file: [],
    }

    // 循环添加到数组中
    files.forEach((item) => {
      var nowPath  = path + '/' + item;
      var status = fs.statSync(nowPath);
      if (status.isDirectory()) {
        // 标记为文件夹 并进行递归
        pathResult.dir.push(nowPath);
        const result = this.handlePath(nowPath);
        pathResult.dir.push(...result.dir);
        pathResult.file.push(...result.file);
      } else {
        pathResult.file.push(nowPath);
      }
    })

    return pathResult;
  },

  /**
   * 复制目录到目标目录
   * @param {String} src 源路径
   * @param {String} dist 目标路径
   * @param {CopyOptions} options 相关选项，暂支持写文件之前之后的钩子传入
   */
  copy(src, dist, options?: CopyOptions) {
    return new Promise((resolve, reject) => {
      try {
        // 读取目录 => 处理模板文件的路径 
        const pathResult = this.handlePath(src);

        // 创建目录 => 在项目目录先同步建好目录再写入，避免写丢，目录没有无法正常写入
        fs.access(dist, function(err){
          if(err){
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
          }
          pathResult.dir.forEach((dirPath) => {
            fs.mkdirSync(dist + dirPath.replace(src, ''))
          })
  
          pathResult.file.forEach((filePath) => {
            let _dist = dist + '/' + filePath.replace(src, '');
            const finallyDist = options?.writeBefore?.(filePath) || '';
            fs.writeFileSync(finallyDist || _dist, fs.readFileSync(filePath));
            options?.writeAfter?.(_dist);
          })
          resolve(true);
        });

      } catch (error) {
        reject(error);
      }
    })
  },

  /**
   * 检查路径是否存在
   *
   * @param {String} path
   * @returns {Boolean} 存在为true
   */
  checkFileIsExists(path): boolean {
    return fs.existsSync(path);
  },

  /**
   * 确定当前目录下的pages目录
   * 
   * @param {string} path app.json的路径
   * @returns {string} 返回pages目录
   */
  findPagePath(path: string): string {
    const jsonConf = JSON.parse(fs.readFileSync(path));
    const aPath = jsonConf.pages[0].split('/');
    const aPagePath = aPath.slice(0, -2);
    return aPagePath.join('/');
  },

  /**
   * 将模板根据配置修改后复制到目标路径，暂时只实现只更改文件名称
   *
   * @param {string} templatePath 源文件路径
   * @param {string} distPath 目标文件路径
   * @param {FormatCopyOptions} options
   * @returns {Promise<boolean>} 是否成功完成复制操作
   */
  formatCopy(templatePath: string, distPath: string, options: FormatCopyOptions) {
    return new Promise((resolve, reject) => {
      // 先创建目录
      fs.mkdirSync(distPath);
      const { name } = options;
      
      this.copy(templatePath, distPath, {
        writeBefore(filePath: string): string {
          const ext = filePath.split('.')[1];
          return `${distPath}/${name}.${ext}`;
        }
      }).then(() => {
        resolve(true);
      }).catch(err => {
        reject(err);
      })
    })
  },

  /**
   * 检查当前执行命令的目录下是否存在 app.json
   * 存在则返回 app.json 的文件路径，不存在返回空字符串
   * @returns {string}
   */
  checkAppJsonExist():string {
    const appJsonPath = path.join(process.cwd(), './app.json');
    const isExist = this.checkFileIsExists(appJsonPath);
    if (isExist) {
      return appJsonPath;
    }
    return '';
  },

  /**
   * 用来找到当前模板应该复制到哪个路径
   * 
   * @param {string} appJsonPath app.json的文件路径，以便解析出page目录
   * @param {string} fileName 当前模板的名称
   * @param {TemplateType} type 模板的类型
   * @returns {string} 返回模板应该复制到的目标路径
   */
  findTempDistPath(appJsonPath: string, fileName: string, type: TemplateType): string {
    const pagePath = this.findPagePath(appJsonPath);

    if (type === TemplateType.页面) {
      return path.join(process.cwd(), `${pagePath}/${fileName}`);
    } else if (type === TemplateType.组件) {
      return path.resolve(`${process.cwd()}/${pagePath}`, `../components/${fileName}`)
    }

    return '';
  },

  /**
   * 存在 project.config.json 与 app.json 不在同一级目录的情况
   * 因为调用小程序命令行工具需要在 project.config.json 目录下
   * 这个方法用来实现找到 project.config.json 目录，并 cd 到该目录
   * @returns {string} 返回project.config.json的路径
   */
  cdProjectJson(): string {
    const pathArr = this.handlePath(path.resolve(process.cwd(), '../'));
    let projectJsonPath = '';
    pathArr.file.forEach((filePath) => {
      if (filePath.endsWith('project.config.json')) {
        projectJsonPath = filePath;
      }
    })
    return projectJsonPath;
  }
}