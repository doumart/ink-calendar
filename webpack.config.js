const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const evalTypescript = {
  test: /\.tsx?$/,
  use: [
    {loader:"esbuild-loader",
    options: {
                loader: 'tsx',
                target: 'es2015'
             }
  },
    "eslint-loader"
  ]
}

const evalCss = {
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader"
    },
  ]
}

const evalScss = {
  test: /\.s[ac]ss$/i,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader',
  ],
}

module.exports = {
  entry: "./src/index.tsx",

  target: "web",

  devtool: "inline-source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".esm"]
  },

  output: {
    path: path.join(__dirname, "build"),
    pathinfo: false,
    filename: "bundle.min.js",
    publicPath: '/',
  },

  module: {
    rules: [
      evalTypescript,
      evalCss,
      evalScss,
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html"
    }),
  ],

  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    overlay: true,
  },

  performance: {
    hints: 'warning'
  },
}
