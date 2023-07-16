# vue-greedy-components-repacker [Archived as a memory😉]

 - [About](#about)
 - [Introduce](#introduce)
   - [Arguments](#arguments)
 - [Sections custom handler](#sections-custom-handler)


## About
The script processes each section of the component, and then packs it back. You can use standard section handlers or write your own
By default, script processing only **\<script>** section \(via [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)), other is copied.

![enter image description here](https://github.com/s0d3s/vue-greedy-components-repacker/blob/master/header.png?raw=true)

## Introduce

### Arguments

    --source --src
Input directory

    --dist
Output directory

    --create-conf -c
Copy default section processor to current dir

    --alt-handler --alt
Path to custom section handler

    --rewrite -r
If passed, then origin file fill be overwritten

    --verbose -v
Pring trace info

    --exclude
Exclude some files from processing

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

This options may be overwritten with the global options


**`template/style/script/customBlock`** retrieves block object and must return string.
