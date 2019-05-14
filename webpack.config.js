const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(tif|tiff)$/, use: ['file-loader']
      },
    ]
  }
};