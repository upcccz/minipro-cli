
微信小程序脚手架工具
### Install

```sh
npm i minipro-cli -g
```

### Usage

```sh
minipro-cli -h
minipro-cli <command> -h
```

### Commands

需要注意的是，除了 minipro-cli create [project] 选项外，其他命令都需要在小程序根目录(project.config.json所在目录)下执行。

#### create

```sh
minipro-cli create
# 根据选择创建 project page component
```

说明：

+ project: 根据交互创造小程序项目
  + 项目名称：默认为 mini-pro。
  + appid：提供小程序appid，不然生成的项目无法正常导入微信开发者IDE，也无法正常上传
  + 依赖微信基础库的版本号：默认为2.7.3。

+ page: 根据交互在小程序项目内创建 page 模板
  + 页面名称：默认为 index
  + 会自动在 app.json 中引入创建的 page，不需要再手动引入

+ component
  + 组件名称：默认为 index。
  + 在创建时会询问是否需要在某些页面引入，并更新对应页面 page.json 的 usingComponents 字段。

#### invoke

```sh
# 为 index 页面引入本地 nav-list 组件
minipro-cli invoke index nav-list
```

#### publish

```sh
# 上传小程序体验版
minipro-cli publish
```

需要提供 minicli.json (与 project.config.json 处于同级目录)

```js
// example
{
  "version": "1.0.0", // 用于发布版本时提供更新版本的版本号
  "versionDesc": "版本描述", // 当前版本的描述，发布之后会使用新版本描述的覆盖
  "cliPath": "/Applications/wechatwebdevtools.app/Contents/MacOS/cli" // 微信小程序命令行的安装地址
}
```

使用小程序命令行执行 publish 命令需要打开微信开发者工具的服务端口，设置-安全设置-服务端口-开启。

微信小程序命令行安装地址cliPath，请查看[微信小程序命令行](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)。