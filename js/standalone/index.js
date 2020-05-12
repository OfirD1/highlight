$(document).ready(function () {
    var options = { 
        cssClass: 'highlight', 
        direction: 'rtl', 
        useCtrlKey: true,
        isChromeExtension: true 
    };
    var Sidebar = require('./sidebar.js');
    registerClickListener(new Sidebar(options));
});

function registerClickListener(Sidebar) {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.toggle) {
            Sidebar.toggle();
        }
    });
}

