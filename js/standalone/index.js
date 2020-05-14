$(document).ready(function () {
    var Sidebar = require("./sidebar.js");
    $.getJSON(Sidebar.getResource("config.json"), function (config) {
        var instance = new Sidebar(config);
        if (Sidebar.isChromeExtension) {
            registerClickListener(instance);
        } else {
            instance.toggle();
        }
    });
    
});
function registerClickListener(Sidebar) {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.toggle) {
            Sidebar.toggle();
        }
    });
}

