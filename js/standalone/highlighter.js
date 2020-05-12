"use strict";

var xpathRange = require('xpath-range');

// Highlighter provides a simple way to draw highlighted <span> tags over
// selected ranges within a document.
var Highlighter = function Highlighter() {};

//
// Highlights a given target (options are: selection, xpath+offset, range (normalized)),
// colorizing it with the given cssClass.
//
Highlighter.prototype.highlight = function (toHighlight, cssClass) {
    var normedRanges = [];
    var id = generateId();
    if (false) {
    } else if (toHighlight.selection) {
        normedRanges = Highlighter.selectionToNormedRange(toHighlight.selection);
    } else if (toHighlight.xpathOffset) {
        normedRanges = Highlighter.xpathOffsetToNormedRange(toHighlight.xpathOffset);
    } else if (toHighlight.ranges) {
        normedRanges = toHighlight.ranges;
    }
    normedRanges.forEach(function (normedRange) {
        Highlighter.highlightRange(normedRange, cssClass, id);
    });
    return { id: id, ranges: normedRanges };
}
Highlighter.prototype.toHighlight = {
    selection: null,
    xpathOffset: null,
    ranges: null,
};

//
// Converts a DOM selection to a range (normalized)
// Note: a normalized range is the only form of object that's ready for a highlight
// The following is an excerpt from xpath-range node-module readme file:
/// ### NormalizedRange
// This object provides different properties than the DOM Range, but encapsulates the same concept.
// It also adds a few other methods.
//
Highlighter.selectionToNormedRange = function (selection) {
    // Note: when there's no scripting in play, a selection will always be a single range.
    var normedRanges = Highlighter.captureDocumentSelection(selection);
    return normedRanges;
}
Highlighter.captureDocumentSelection = function (selection) {
    var i,
        len,
        ranges = [],
        rangesToIgnore = [];
    if (selection.isCollapsed) {
        return [];
    }
    // A user can normally only select one range at a time, so the rangeCount will usually be 1. 
    // Scripting can be used to make the selection contain more than one range.
    for (i = 0; i < selection.rangeCount; i++) {
        var r = selection.getRangeAt(i),
            browserRange = new xpathRange.Range.BrowserRange(r),
            normedRange = browserRange.normalize().limit(document.body);

        // If the new range falls fully outside our this.element, we should
        // add it back to the document but not return it from this method.
        if (normedRange === null) {
            rangesToIgnore.push(r);
        } else {
            ranges.push(normedRange);
        }
    }

    // BrowserRange#normalize() modifies the DOM structure and deselects the
    // underlying text as a result. So here we remove the selected ranges and
    // reapply the new ones.
    // (my comment: i.e., it invalidates the selection) 
    selection.removeAllRanges();

    for (i = 0, len = rangesToIgnore.length; i < len; i++) {
        selection.addRange(rangesToIgnore[i]);
    }

    // Add normed ranges back to the selection
    for (i = 0, len = ranges.length; i < len; i++) {
        var range = ranges[i],
            drange = document.createRange();
        drange.setStartBefore(range.start);
        drange.setEndAfter(range.end);
        selection.addRange(drange);
    }

    return ranges;
};

//
// Converts an xpath+offset to a range (normalized)
// Note: a normalized range is the only form of object that's ready for a highlight
//
Highlighter.xpathOffsetToNormedRange = function (xpathOffset) {
    var range = new xpathRange.Range.SerializedRange(xpathOffset);
    return [xpathRange.Range.sniff(range).normalize(document)];
};

//
// highlightRange wraps the DOM Nodes within the provided range with a highlight
// element of the specified class and returns the highlight Elements.
//
// normedRange - A NormalizedRange to be highlighted.
// cssClass - A CSS class to use for the highlight (default: 'annotator-hl')
// id (my addition) - An id to set into the <span> element
// Returns an array of highlight Elements.
//
Highlighter.highlightRange = function (normedRange, cssClass, id) {
    if (typeof cssClass === 'undefined' || cssClass === null) {
        throw new Error("cssClass is needed to perform a highlight")
    }
    var white = /^\s*$/;

    // Ignore text nodes that contain only whitespace characters. This prevents
    // spans being injected between elements that can only contain a restricted
    // subset of nodes such as table rows and lists. This does mean that there
    // may be the odd abandoned whitespace node in a paragraph that is skipped
    // but better than breaking table layouts.
    var nodes = normedRange.textNodes(),
        results = [];
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        if (!white.test(node.nodeValue)) {
            var hl = document.createElement('span');
            hl.className = cssClass;
            hl.id = getIdForIndex(id, i);
            node.parentNode.replaceChild(hl, node);
            hl.appendChild(node);
            results.push(hl);
        }
    }
    return results;
}

//
// Removes a highlight by id/class
// note: a highlight may span different elements, in which case a 'highlight' is 
// actually comprised of multiple <span>s drawn one after another, 
// all sharing an id+index suffix
//
Highlighter.prototype.removeHighlightsById = function (id) {
    var highlights = $(`[id^='${id}']`).toArray();
    Highlighter.removeHighlights(highlights);
};

Highlighter.prototype.removeHighlightsByClass = function (cssClass) {
    var highlights = $(`.${cssClass}`).toArray();
    Highlighter.removeHighlights(highlights);
};

//
// Removes the given highlights from DOM
//
Highlighter.removeHighlights = function (highlights) {
    highlights.forEach(function (highlight) {
        if (highlight.parentNode !== null) {
            $(highlight).replaceWith(highlight.childNodes);
        }
    });
};

//
// Gets all highlights from DOM, returning them as ranges (normalized), grouped by id
// note: the grouping is needed because a highlight may span different elements,
// in which case a 'highlight' is actually comprised of multiple <span>s drawn 
// one after another, all sharing an id+index suffix
//
Highlighter.prototype.getHighlightsFromDOM = function (cssClass) {
    var rangeDatas = [];
    var highlights = $(`.${cssClass}`).toArray();
    if (highlights) {
        var rangeDatas = groupBy(highlights, function (item) {
            var separator = '-';
            var idSplitted = item.id.split(separator);
            idSplitted.pop();
            return idSplitted.join(separator);
        }).map(function (group) {
            return Highlighter.prototype.getRangeByHighlightId(group.key, cssClass);
        });
    }
    return rangeDatas;
};

//
// Gets a range (normalized) by a highlight id
//
Highlighter.prototype.getRangeByHighlightId = function (highlightId, cssClass) {
    var $elements = $(`[id^='${highlightId}']`);
    var range = document.createRange();
    var firstTextNode = $elements.first()[0].firstChild;
    var lastTextNode = $elements.last()[0].firstChild;
    range.setStart(firstTextNode, 0);
    range.setEnd(lastTextNode, lastTextNode.length);
    var browserRange = new xpathRange.Range.BrowserRange(range);
    var normedRange = browserRange.normalize().limit(document.body);
    var rangeData = normedRange.serialize('body', `[class^="${cssClass}"]`);
    return rangeData;
};

//
// Generates an id (used to identify a highlight element)
//
function generateId() {
    // since the id is used elsewhere as an argument for `querySelector`,
    // and since 'querySelector' doesn't work well with leading digits,
    // we prefix the id with some letter, 'h' was chosen as it is the first letter in 'highlight'.
    var ID_PREFIX = "h-"; 
    var result, i, j;
    result = '';
    for (j = 0; j < 32; j++) {
        if (j == 8 || j == 12 || j == 16 || j == 20)
            result = result + '-';
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
    }
    return [ID_PREFIX, result].join('');
}
function getIdForIndex(id, index) {
    return [id, index].join('-');
}

//
// Groups records by a given key
//
function groupBy(records, key) {
    return records.reduce(function (accumulator, record) {
        var groupKey = key instanceof Function ? key(record) : record[key];
        var group = accumulator.find(g => g && g.key === groupKey);
        if (group) {
            group.values.push(record);
        } else {
            accumulator.push({ key: groupKey, values: [records] });
        }
        return accumulator;
    }, []);
}

//
// Gets a selection
//
Highlighter.prototype.getSelection = function (selection, cssClass) {
    var selection = "";
    if (window.getSelection) {
        selection = window.getSelection();
    } else if (document.selection) {
        selectedText = document.selection.createRange();
    }
    return selection;
}

module.exports = new Highlighter();