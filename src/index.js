#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const async = require('async');
const { parse } = require('@vue/component-compiler-utils');
const compiler = require('vue-template-compiler');

const defaultHandlerPath = './defaultSectionsProcessors.js';
const c = {
    Reset : "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    
    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
    
    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
} 

const context = process.cwd();

var argv = require('optimist')
    .boolean(['exclude', 'rewrite', 'verbose', 'copy'])
    .alias({
        'verbose':'v',
        'create-conf':'c',
        'alt-handler':'alt',
        'source':'src',
        'copy-other':'copy',
        'rewrite':'r'
    })
    .argv;
/*
    --source --src
    --dist
    --create-conf -c
    --alt-handler --alt
    --copy-other --copy
    --rewrite -r
    --verbose -v
    --exclude
*/
if(argv.c){
    let scriptContext = path.dirname(require.main.filename);
    
    fs.copyFile(path.resolve(scriptContext, 'defaultSectionsProcessors.js'), path.resolve(context, 'greedy-repacker-handler.js'), function(){
        console.log(`\n\n${c.FgCyan}File ${c.FgYellow}[greedy-repacker-handler.js]${c.FgCyan} with default sections handlers was copied to ${c.FgWhite}${context}${c.Reset}\n`)
    });
    return;
}

const handler = require(argv.alt&&fs.existsSync(argv['alt'])?argv['alt']:defaultHandlerPath);
var opt = handler.options;

if(argv.source)opt.entry = argv.source;
if(argv.dist)opt.dist = argv.dist;
if(argv.verbose)opt.verbose = argv.verbose;
if(argv.rewrite)opt.rewrite = argv.rewrite;
if(argv.copy)opt.copy = argv.copy;
if(argv.exclude)opt.exclude = argv._;

function makeDir(dir) {
    const sep = path.sep;
    const initDir = path.isAbsolute(dir) ? sep : '';
    dir.split(sep).reduce((parentDir, childDir) => {
      const currentDir = path.resolve(parentDir, childDir);
      if (!fs.existsSync(currentDir)) {
        fs.mkdirSync(currentDir);
      }
      return currentDir;
    }, initDir);
}

function isNeedle(filePath='', isFile=false){
    //TODO
    if(isFile){
        return /\.vue$/.test(filePath);
    }else{
        return true;
    }
}

function processComponent(compObj){ 
    /*      compObj be like
        {
            template:{
                type: 'template',
                content: STRING,
                start: INT,
                attrs: {},
                end: INT 
            },
            script:{
                type: 'script',
                content: STRING,
                start: INT,
                attrs: {},
                end: INT,
                map:{}
            },
            style:[{
                type: 'style',
                content: STRING,
                start: INT,
                attrs: {},
                end: INT,
                map:{}
            }],
            cucustomBlocks{
                type: customBlockName,
                content: STRING,
                start: INT,
                attrs: {},
                end: INT
            }
        }
    */
    let repackedComponent = ''
    
    if(compObj.template){
        repackedComponent += handler.template(compObj.template);
    }
    if(compObj.script){
        repackedComponent += handler.script(compObj.script);
    }
    if(compObj.styles){
        for(let style in compObj.styles)
            repackedComponent += handler.style(compObj.styles[style]);
    }
    if(compObj.customBlocks){
        for(let customBlock in compObj.customBlocks)
            repackedComponent += handler.customBlock(compObj.customBlocks[customBlock]);
    }
    return repackedComponent;
}

function getFiles (dirPath, callback) {
    
    fs.readdir(dirPath, function (err, files) {
        
        if (err) return callback(err);
        
        console.group();
        
        let filePaths = {};
        if(isNeedle(dirPath)){
            if(opt.verbose)console.log(`${c.FgGreen}Processing${c.Reset} - %s`, dirPath);
            if(!opt.overwrite)makeDir(path.resolve(context, dirPath.replace(new RegExp(opt.entry), opt.dist))); 
        }else{
            if(opt.verbose)console.log(`${c.FgRed}Skiping${c.Reset} - %s`, dirPath);
            console.groupEnd();
            callback(err, filePaths);
            return;
        }
        filePaths[dirPath] = [];
        async.eachSeries(files, function (fileName, eachCallback){
            var filePath = path.join(dirPath, fileName);
            
            
            fs.stat(filePath, function (err, stat) {
                if (err) return eachCallback(err);

                if (stat.isDirectory()) {
                    getFiles(filePath, function (err, subDirFiles) {
                        if (err) return eachCallback(err);
                            
                        filePaths = Object.assign(filePaths, subDirFiles);
                        eachCallback(null);
                    });
                } else {
                    if (isNeedle(filePath, true)) {                        
                        filePaths[dirPath].push(path.basename(filePath));
                            
                        //if(opt.verbose)console.log(`${c.FgCyan}Repacking${c.Reset} - `, path.basename(filePath));//Unsorted output due to recursion
                        
                        fs.readFile(filePath, {encoding:'utf-8'}, function(err, source){
                            let componentData = processComponent(parse({source, filename: path.basename(filePath), compiler, compilerParseOptions:{pad:'line'}}));
                            let newFilePath = opt.overwrite? filePath:filePath.replace(new RegExp(opt.entry), opt.dist);                            
                            fs.writeFileSync(newFilePath, componentData);
                        });
                        
                        
                    }else if(!opt.overwrite){
                        fs.copyFile(filePath, filePath.replace(new RegExp(opt.entry), opt.dist), function(){});
                    }
                    eachCallback(null);
                }
            });
        }, function (err) {
            console.groupEnd();
            callback(err, filePaths);
        });

    });
}

if(opt.verbose){
    console.time('Execution time');
    console.log(`${c.FgGreen}----------------------------------${c.Reset}`);
    console.log(`Working directory - ${c.Underscore}%s${c.Reset}\n`, path.resolve(opt.entry));
    console.table(opt);
    console.log(`${c.FgGreen}----------------------------------${c.Reset}`);
}

getFiles(opt.entry, function (err, files) {
    if(opt.verbose){        
        console.log(`\n${c.FgGreen}---------Repacked  files----------${c.Reset}\n`);
        for(let dir in files)
            for(let fileInd in files[dir])
                console.log(`${c.Underscore}%s${c.Reset} ${c.FgCyan}repacked${c.Reset}`, path.normalize(dir+'/'+files[dir][fileInd]));
        console.log(`\n${c.FgGreen}----------------------------------${c.Reset}\n`);
        
        console.log(err || `${c.FgYellow} Successful end${c.Reset}\n`);
        console.timeEnd('Execution time');
    }
});
