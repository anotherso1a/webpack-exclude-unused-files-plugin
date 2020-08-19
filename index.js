const path = require("path");
const fs = require("fs");
const rm = require('rimraf').sync
const micromatch = require('micromatch')
let join = path.join;
/**
 * @param startPath  起始目录文件夹路径
 * @returns {Array}
 */
function findSync(startPath) {
  let result = [];
  function finder(path) {
    let files = fs.readdirSync(path);
    files.forEach((val) => {
      let fPath = join(path, val);
      let stats = fs.statSync(fPath);
      if (stats.isDirectory()) finder(fPath);
      if (stats.isFile()) result.push(fPath);
    });
  }
  finder(startPath);
  return result;
}

const isPathStringRE = /^[./\w]+$/


class ExcludeUnusedFilesPlugin {
  constructor(options = {}){
    this.options = options
  }
  apply(compiler) {
    let includeFiles,excludeFiles
    Array.isArray(this.options.include)
      ? includeFiles = this.options.include
      : includeFiles = [ this.options.include || path.resolve("src") ]
    Array.isArray(this.options.exclude)
      ? excludeFiles = this.options.exclude
      : excludeFiles = [ this.options.exclude ]

    let fileNames = includeFiles.reduce((c,v)=>{
      if(!v) return c
      return c.concat(findSync(v))
    },[])

    if(!fileNames.length) {
      console.error(`Can't resolve include files with Option ${this.options.include}`)
    }

    fileNames = fileNames.map(e => path.relative(path.resolve(), e)) // exclude只对根目录下的路径做匹配

    excludeFiles.forEach(pattern => {
      if(!pattern) return
      Object.prototype.toString.call(pattern) === "[object String]"
        ? isPathStringRE.test(pattern)
          ? fileNames = fileNames.filter(e => !new RegExp(pattern).test(e))
          : fileNames = micromatch.not([...fileNames], pattern)
        : Object.prototype.toString.call(pattern) === "[object RegExp]"
          ? fileNames = fileNames.filter(e => !pattern.test(e))
          : console.error(`Your exclude option ${pattern} dosen't work, exclude options only accept path-string, regexp-expression and micromath-string.`)
    })

    if(!fileNames.length) {
      console.error(`Your exclude options has excluded all include files.`)
    }

    fileNames = new Set([...fileNames.map(e => path.resolve(e))]) // 匹配完成后还原为绝对路径

    compiler.hooks.compilation.tap("ExcludeUnusedFilesPlugin", (compilation) => {
      compilation.hooks.buildModule.tap(
        "ExcludeUnusedFilesPlugin",
        (normalModule) => {
          let absPath = normalModule.resource.split("?")[0];
          fileNames.has(absPath) && fileNames.delete(absPath);
        }
      );
    });
    compiler.hooks.done.tap("ExcludeUnusedFilesPlugin", () => {
      if(this.options.needRM){
        fileNames.forEach(p => rm(p))
      }else{
        console.log(
          "------------unused files----------",
          JSON.stringify([...fileNames], null, 2)
        );
      }
    });
  }
}

module.exports = ExcludeUnusedFilesPlugin;
