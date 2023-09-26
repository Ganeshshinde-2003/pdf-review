const fs = require('fs-extra');
const path = require('path');

(async () => {

  fs.emptyDirSync(
    path.resolve(__dirname, '../static/lib')
  );

  fs.rmdir(
    path.resolve(__dirname, '../static/lib')
  );

  fs.copySync(
    path.resolve(__dirname, '../node_modules/@pdftron/pdfjs-express/public'),
    path.resolve(__dirname, '../static/lib')
  )

  fs.copySync(
    path.resolve(__dirname, '../node_modules/@pdftron/pdfjs-express/webviewer.min.js'),
    path.resolve(__dirname, '../static/lib/webviewer.min.js')
  )

})()