# vue-greedy-components-repacker

 - [About]()
 - [Introduce]()
 - [Commands]()
 - [Sections custom handler]()

***Readme in progress...**

## About
The script processes each section of the component, and then packs it back. You can use standard section handlers or write your own
By default, script processing only **\<script>** section \(via [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)), other is copied.

![enter image description here](https://github.com/s0d3s/vue-greedy-components-repacker/blob/master/header.png?raw=true)

## Introduce

## Commands

    --source --src
0

    --dist
0

    --create-conf -c
0

    --alt-handler --alt
0

    --copy-other --copy
0

    --rewrite -r
0

    --verbose -v
0

    --exclude
0
## Sections custom handler
At first your handler must have module.exports, like:

    module.exports = {
      options: {
        entry:'src',
        dist:'repacked',
        exclude:[],
        verbose: false,
        overwrite: false,
        copyOther: false
      },
      template: function(obj),
      script: function(obj),
      style: function(obj),
      customBlock: function(obj)
    }
### 
**`options:`**

> entry: String

about 
> dist: String

about 
> exclude: Array

about 
> verbose: Boolean

about 
> overwrite: Boolean

about 
> copyOther: Boolean

about 

**`template/style/script/customBlock:`**
Must return string.