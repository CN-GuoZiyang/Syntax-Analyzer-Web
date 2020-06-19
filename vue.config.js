const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  publicPath:"./",
  // 输出文件目录
  outputDir: 'dist',
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        features: ['!gotoSymbol'],
        languages: ["c"],// 配置需要的languages，减少打包后的体积
        output: "./static/js/monaco-editor"
      })
    ]
  }
}