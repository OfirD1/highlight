$(document).ready(function () {
    var Sidebar = require('./sidebar.js');
    var instance = new Sidebar();
    if (instance.isChromeExtension) {
        registerClickListener(instance);
    } else {
        instance.toggle();
    }
});

function registerClickListener(Sidebar) {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.toggle) {
            Sidebar.toggle();
        }
    });
}
