'use strict';
const path = require('path')
// const gulp = require('gulp')
// const fancyLog = require('fancy-log');
// const PluginError = require('plugin-error');
// const through = require('through2');
// const cheerio = require('cheerio')
// const PLUGIN_NAME = 'gulp-html-integrator'
// const isLocalPath = require('is-local-path');
// const async = require('async')
var minify = require('html-minifier').minify;
const {Bundler} = require('polymer-bundler');
const parse5 = require('parse5');

const bundler = new Bundler({
  inlineScripts: true,
  inlineCss: true,
});

const fs = require('fs')

bundler.generateManifest(['src/app/index.html']).then((manifest) => {
  bundler.bundle(manifest).then((result) => {
    var html = parse5.serialize(result.documents.get('src/app/index.html').ast)
    var output = minify(html, {
      collapseWhitespace: true,
      minifyCSS: function (text) {
        console.log(text.substr(0,10))
        console.log('-'.repeat(50))
      },
      minifyJS: function (text, inline) {
        console.log(text.substr(0,10))
        return text
      }
    })
    fs.writeFileSync('target.html', output)
    // console.log(parse5.serialize(result.documents.get('src/app/index.html').ast));
  });
});