import resolve from 'rollup-plugin-node-resolve'; // 依赖引用插件
import commonjs from 'rollup-plugin-commonjs'; // commonjs模块转换插件
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-typescript2';
import packageJSON from './package.json';
import { eslint } from 'rollup-plugin-eslint' // eslint插件

const { preserveShebangs } = require('rollup-plugin-preserve-shebangs'); // rollup 无法识别 #!/usr/bin/env node 文件，该插件用来解决这个问题

const path = require('path');
const getPath = _path => path.resolve(__dirname, _path);
const isDev = process.env.NODE_ENV !== 'production';

const extensions = [
  '.js',
  '.ts',
]

// eslint
const esPlugin = eslint({
  throwOnError: true,
  include: ['src/**/*.ts'],
  exclude: ['node_modules/**', 'lib/**']
})

// ts
const tsPlugin = ts({
  tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
  extensions,
  tsconfigOverride: {
    compilerOptions: {
      module: 'ES2015'
    }
  }
})

// 基础配置
const config = {
  input: getPath('./src/index.ts'),
  output: [{
    file: packageJSON.main, // 通用模块
    format: 'umd',
  }],
  plugins:[
    resolve(extensions),
    commonjs(),
    tsPlugin,
    esPlugin,
    preserveShebangs(),
    !isDev && terser()
  ]
}

export default config;
