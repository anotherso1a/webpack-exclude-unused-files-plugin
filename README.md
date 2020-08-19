# webpack-exclude-unused-files-plugin

在构建过程中使用，筛选出指定目录下的所有未被webpack处理的文件，主要用于优化仓库文件，清除无用文件

## Install

```sh
npm i webpack-exclude-unused-files-plugin -D
```

## Usage

```js
// webpack.config.js
const ExcludeUnusedFilesPlugin = require('webpack-exclude-unused-files-plugin')
module.exports = {
  // other options
  plugins: [
    new ExcludeUnusedFilesPlugin()
  ]
}
```

## Options

### include

The files need to be checked, only accept absolute path string, can use arrays, default value is `path.resolve('src')`

### exclude

The files need to be ignored, accept path-string, regexp and micromatch-string.

### needRM

If you need remove unused files at webpack builded, you can make `needRM` to be True.
