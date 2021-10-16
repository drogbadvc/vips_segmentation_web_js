var system = require('system');
var renderScript = require('./render.js');
var blockScript = require('./block.js');

if (system.args.length === 1) {
    console.error('Must specify an url!');
    phantom.exit();
} else {
    var url = system.args[1];
    if (system.args.length > 2) {
        var disable = system.args[2];
        console.log(disable);
        renderScript.disableLoadingResource(disable);
    }
}

var vips = function (page) {
    page.evaluate(blockScript.blockExtraction);
    page.render('VIPS.png');
    phantom.exit();
};

renderScript.open(url, vips);
