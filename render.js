var page = require('webpage').create();
page.viewportSize = {width: 1280, height: 2000};
page.settings.loadImages = false;
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

var open = function (url, callback) {
    console.log('Open url: ' + url);
    page.open(url, function (status) {
        console.log("Status: " + status);
        if (status === "success") {
            callback(page);
        }
    });
};
module.exports.open = open;

var disableLoadingResource = function (disable) {
    if (disable) {
        page.settings.loadImages = false;
        page.onResourceRequested = function (requestDate, request) {
            //request.abort();
        };
        page.onResourceReceived = function (res) {
        };
    }
};
module.exports.disableLoadingResource = disableLoadingResource;