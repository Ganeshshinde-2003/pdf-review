const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const samplesBase = path.resolve(__dirname, './samples');
const samples = fs.readdirSync(samplesBase);

app.use('/samples', express.static('samples'))
app.use('/static', express.static('static'))

samples.forEach(sampleName => {
  app.get(`/${sampleName}`, (_, res) => {
    const htmlTemplate = fs.readFileSync(path.resolve(__dirname, './templates/sample.html')) + '';
    const html = htmlTemplate.replace('{{SCRIPT_SRC}}', '/' + path.relative(__dirname, `./samples/${sampleName}/index.js`));
    res.send(html);
  })
})

app.get('/', (_, res) => {
  const rootTemplate = fs.readFileSync(path.resolve(__dirname, './templates/index.html')) + '';

  const html = samples.reduce((acc, sampleName) => {
    return acc + `
      <a href='/${sampleName}'>• ${sampleName}</a>
    `
  }, '')

  const finalHTML = rootTemplate.replace('{{LINKS}}', html)

  res.send(finalHTML);
})

app.listen(3000, () => {
  console.log('🚀 App listening on port 3000')
})