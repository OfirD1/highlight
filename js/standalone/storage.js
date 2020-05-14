var Highlighter = require('./highlighter.js');

var Storage = function Storage() {};

Storage.prototype.storageType = {
    chrome: 1,
    file: 2     // not yet implemented
}

Storage.key = "rangesData";

Storage.prototype.save = function (storageType, cssClass, callback) {
    var rangeDatas = Highlighter.getHighlightsFromDOM(cssClass);
    switch (storageType) {
        case (Storage.prototype.storageType.chrome): {
            Storage.saveToChrome(rangeDatas, callback);
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
Storage.prototype.load = function (storageType, cssClass, onSuccess) {
    var ranges = []
    switch (storageType) {
        case (Storage.prototype.storageType.chrome): {
            ranges = Storage.loadFromChrome(cssClass, onSuccess);
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

Storage.saveToChrome = function (rangeDatas, callback) {
    chrome.storage.sync.set({ [Storage.key]: JSON.stringify(rangeDatas) }, callback);
};
Storage.loadFromChrome = function (cssClass, onSuccess) {
    chrome.storage.sync.get([Storage.key], function (result) {
        var stored = result[Storage.key];
        if (stored) {
            var ranges = JSON.parse(stored).map(function (rangeData) {
                return Highlighter.highlight({ xpathOffset: rangeData }, cssClass);
            });
            onSuccess(ranges);
        } else {
            console.log('no saved highlights');
        }
    });
}

module.exports = new Storage();