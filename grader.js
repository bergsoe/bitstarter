#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();

    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        // http://nodejs.org/api/process.html#process_process_exit_code
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlContents = function(htmlContents) {
    return cheerio.load(htmlContents);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlContents = function(htmlContents, checksfile) {
    $ = cheerioHtmlContents(htmlContents);
    var checks = loadChecks(checksfile).sort();
    var out = {};

    // 'checks' is an array.
    for(var ii in checks) {
        // Here '$(val)' looks up 'val' in the html file and returns (I guess)
        // an array of matches. 'val' can probably be many other things than a
        // string.
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlfile, checksfile) {
    var htmlContents = fs.readFileSync(htmlfile);
    return cheerioHtmlContents(htmlContents, checksfile);
};

var processHtmlContents = function(htmlContents, checksfile) {
    var checkJson = checkHtmlContents(htmlContents, checksfile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>',
                'Path to checks.json',
                clone(assertFileExists),
                CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>',
                'Path to index.html',
                clone(assertFileExists),
                HTMLFILE_DEFAULT)
        .option('u, --url <url>',
                'URL for html to check',
                clone(function (x) { return x.toString(); }),
                undefined)
        .parse(process.argv);

    if (program.url) {
        var action = function(result, response) {
            if (result instanceof Error) {
                console.error('Error: ' + util.format(response.message));
            } else {
                processHtmlContents(result, program.checks);
            }
        };
        restler.get(program.url).on('complete', action);
    } else {
        processHtmlContents(fs.readFileSync(program.file), program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
