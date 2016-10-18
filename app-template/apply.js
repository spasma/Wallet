#!/usr/bin/env node

'use strict';

//

var templates = {
  'package.json': '/',
  'Makefile': 'cordova/',
  'ProjectMakefile': 'cordova/',
  'config-template.xml': '/',
  'ionic.config.json': '/',
  'Package.appxmanifest': 'cordova/wp/',
  '.desktop': 'webkitbuilds/',
  'setup-win.iss': 'webkitbuilds/',
  'build-macos.sh': 'webkitbuilds/',
  //  'bower.json': '/',
};
var configDir = process.argv[2] || 'copay';
var JSONheader = ' { ' + "\n" + '  "//":"Changes to this file will be overwritten",' + "\n" + '  "//":"        Modify it in the app-template directory", ' + "\n";

var MakefileHeader = "# PLEASE! Do not edit this file directly \n#       Modify it at app-template/\n";

var fs = require('fs-extra');
var path = require('path');



var configBlob = fs.readFileSync(configDir + '/appConfig.json', 'utf8');
var config = JSON.parse(configBlob, 'utf8');

/////////////////
console.log('Applying ' + config.nameCase + ' template');

Object.keys(templates).forEach(function(k) {
  var targetDir = templates[k];
  console.log(' #    ' + k + ' => ' + targetDir);

  var content = fs.readFileSync(k, 'utf8');


  if (k.indexOf('.json') > 0) {
    content = content.replace('{', JSONheader);

  } else if (k.indexOf('Makefile') >= 0) {
    content = MakefileHeader + content;
  }


  Object.keys(config).forEach(function(k) {
    if (k.indexOf('_') == 0) return;

    var r = new RegExp("\\*" + k.toUpperCase() + "\\*", "g");
    content = content.replace(r, config[k]);
  });

  var r = new RegExp("\\*[A-Z]{3,30}\\*", "g");
  var s = content.match(r);
  if (s) {
    console.log('UNKNOWN VARIABLE', s);
    process.exit(1);
  }

  if(k === 'config-template.xml'){
    k = 'config.xml';
  }
  fs.writeFileSync('../' + targetDir + k, content, 'utf8');
});

/////////////////
console.log('Copying ' + configDir + '/appConfig.json' + ' to root');
configBlob = configBlob.replace('{', JSONheader);
fs.writeFileSync('../appConfig.json', configBlob, 'utf8');

////////////////
var externalServices;
try {
  console.log('Copying ' + configDir + '/externalServices.json' + ' to root');
  externalServices = fs.readFileSync(configDir + '/externalServices.json', 'utf8');
} catch(err) {
  externalServices = '{}';
  console.log('External services not configured');
}
fs.writeFileSync('../externalServices.json', externalServices, 'utf8');

function copyDir(from, to, cb) {
  console.log('Copying dir ' + from + ' to');
  var files = [];
  fs.walk(from)
    .on('data', function(item) {
      if ((item.stats["mode"] & 0x4000)) {

        var tmp = item.path + '/';
        var l = tmp.length - from.length;
        if (tmp.indexOf(from) == l) return; // #same dir

        console.log('[apply.js.81]', l); //TODO

        console.log('[apply.js.78]', from); //TODO
        // console.log('[apply.js.78]', to); //TODO
        console.log('[apply.js.78]', item.path); //TODO
        console.log('[apply.js.78]', tmp.indexOf(from)); //TODO
      }
      if (item.path.indexOf('DS_Store') >= 0) return;

      files.push(item.path)
    })
    .on('end', function() {
      files.forEach(function(i) {
        console.log(' #    ' + i);
        fs.copySync(i, to + path.basename(i));
      });
      return cb();

    })

}


copyDir(configDir + '/img/', '../www/img/', function() {
  console.log("apply.js finished. \n\n");
});
