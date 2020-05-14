var Highlighter = require('./highlighter.js');

var Storage = function Storage() {};

Storage.prototype.storageType = {
    chrome: 1,
    file: 2     // not yet implemented
}

Storage.prototype.save = function (storageType, url, cssClass, callback) {
    var rangesData = Highlighter.getHighlightsFromDOM(cssClass);  
    switch (storageType) {
        case (Storage.prototype.storageType.chrome): {
            Storage.saveToChrome(url, rangesData, callback);
            break;
        }
        case (Storage.prototype.storageType.file): {
            throw new Error("not yet implemented");
            break;
        }
        default:
            break;
    }
};
Storage.prototype.load = function (storageType, url, cssClass, onSuccess) {
    var ranges = []
    switch (storageType) {
        case (Storage.prototype.storageType.chrome): {
            ranges = Storage.loadFromChrome(url, cssClass, onSuccess);
            break;
        }
        case (Storage.prototype.storageType.file): {
            throw new Error("not yet implemented");
            break;
        }
        default:
            break;
    }
    return ranges;
};

Storage.saveToChrome = function (url, toSave, callback) {
    var key = Storage.getKey(url);
    if (toSave.length) {
        chrome.storage.sync.set({ [key]: JSON.stringify(toSave) }, callback);
    } else {
        chrome.storage.sync.remove([key], function (removedItems) {}); 
    }
};
Storage.loadFromChrome = function (url, cssClass, onSuccess) {
    var key = Storage.getKey(url)
    chrome.storage.sync.get([key], function (result) {
        if (!$.isEmptyObject(result)) {
            var stored = result[key];
            var ranges = JSON.parse(stored).map(function (rangeData) {
                return Highlighter.highlight({ xpathOffset: rangeData }, cssClass);
            });
            onSuccess(ranges);
        } else {
            console.log('no saved highlights');
        }
    });
}

Storage.getKey = function (url) {
    const keySuffix = "rangesData";
    return [url, keySuffix].join('/');
}

module.exports = new Storage();