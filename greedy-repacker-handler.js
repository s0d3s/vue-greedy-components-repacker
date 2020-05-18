const JavaScriptObfuscator = require('javascript-obfuscator');
const JSOOptions = {
    compact: true,
    controlFlowFlattening: false,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: false,
    disableConsoleOutput: false,
    domainLock: [],
    identifierNamesGenerator: 'hexadecimal',
    identifiersDictionary: [],
    identifiersPrefix: '',
    inputFileName: '',
    log: false,
    renameGlobals: false,
    reservedNames: [],
    reservedStrings: [],
    rotateStringArray: true,
    seed: 0,
    selfDefending: false,
    shuffleStringArray: true,
    sourceMap: false,
    sourceMapBaseUrl: '',
    sourceMapFileName: '',
    sourceMapMode: 'separate',
    splitStrings: false,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: false,
    stringArrayThreshold: 0.75,
    target: 'browser',
    transformObjectKeys: false,
    unicodeEscapeSequence: false
};

const options = {
    entry:'src',
    dist:'repacked',
    exclude:[],
    verbose: false,
    overwrite: false,
    copyOther: true
}

function getAttrs(attrs){
    if(typeof attrs !== 'object'||Object.keys(attrs).length===0) return '';
    let finalAttrs = '';
    for(let attr in attrs)
        finalAttrs += ' '+attr+(attrs[attr]===true?'':'='+attrs[attr]);

    return finalAttrs;
}

TemplateHandler = function(object){
    let attrs = getAttrs(object.attrs);    
    let raw = '\n<template'+attrs+'>\n';
    
    raw += object.content.trim();
    
    return raw+'\n</template>\n';
}
ScriptHandler = function(object){
    let attrs = getAttrs(object.attrs);
    let raw = '\n<script'+attrs+'>\n';
    
    raw += JavaScriptObfuscator.obfuscate(object.content.trim(), JSOOptions);//also object.map.sourcesContent
    
    return raw+'\n</script>\n';
}
StyleHandler = function(object){
    let attrs = getAttrs(object.attrs);
    let raw = '\n<style'+attrs+'>\n';
    
    raw += object.content.trim();
    
    return raw+'\n</style>\n';
}
CustomBlockHandler = function(object){
    let attrs = getAttrs(object.attrs);
    let customBlockName = object.type;
    let raw = '\n<'+customBlockName+attrs+'>\n';
    
    raw += object.content.trim();
    
    return raw+'\n</'+customBlockName+'>\n';
}

module.exports = {
    options: options,
    template: TemplateHandler,
    script: ScriptHandler,
    style: StyleHandler,
    customBlock: CustomBlockHandler
}