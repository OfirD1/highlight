/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var xpathRange = __webpack_require__(6);

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
    if (false) {} else if (toHighlight.selection) {
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1
(function() {
  var $, Util, evaluateXPath, findChild, fromNode, getNodeName, getNodePosition, simpleXPathJQuery, simpleXPathPure, toNode;

  $ = __webpack_require__(0);

  Util = __webpack_require__(3);

  evaluateXPath = function(xp, root, nsResolver) {
    var exception, idx, name, node, step, steps, _i, _len, _ref;
    if (root == null) {
      root = document;
    }
    if (nsResolver == null) {
      nsResolver = null;
    }
    try {
      return document.evaluate('.' + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (_error) {
      exception = _error;
      console.log("XPath evaluation failed.");
      console.log("Trying fallback...");
      steps = xp.substring(1).split("/");
      node = root;
      for (_i = 0, _len = steps.length; _i < _len; _i++) {
        step = steps[_i];
        _ref = step.split("["), name = _ref[0], idx = _ref[1];
        idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
        node = findChild(node, name.toLowerCase(), idx);
      }
      return node;
    }
  };

  simpleXPathJQuery = function($el, relativeRoot) {
    var jq;
    jq = $el.map(function() {
      var elem, idx, path, tagName;
      path = '';
      elem = this;
      while ((elem != null ? elem.nodeType : void 0) === Util.NodeTypes.ELEMENT_NODE && elem !== relativeRoot) {
        tagName = elem.tagName.replace(":", "\\:");
        idx = $(elem.parentNode).children(tagName).index(elem) + 1;
        idx = "[" + idx + "]";
        path = "/" + elem.tagName.toLowerCase() + idx + path;
        elem = elem.parentNode;
      }
      return path;
    });
    return jq.get();
  };

  simpleXPathPure = function($el, relativeRoot) {
    var getPathSegment, getPathTo, jq, rootNode;
    getPathSegment = function(node) {
      var name, pos;
      name = getNodeName(node);
      pos = getNodePosition(node);
      return "" + name + "[" + pos + "]";
    };
    rootNode = relativeRoot;
    getPathTo = function(node) {
      var xpath;
      xpath = '';
      while (node !== rootNode) {
        if (node == null) {
          throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
        }
        xpath = (getPathSegment(node)) + '/' + xpath;
        node = node.parentNode;
      }
      xpath = '/' + xpath;
      xpath = xpath.replace(/\/$/, '');
      return xpath;
    };
    jq = $el.map(function() {
      var path;
      path = getPathTo(this);
      return path;
    });
    return jq.get();
  };

  findChild = function(node, type, index) {
    var child, children, found, name, _i, _len;
    if (!node.hasChildNodes()) {
      throw new Error("XPath error: node has no children!");
    }
    children = node.childNodes;
    found = 0;
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      name = getNodeName(child);
      if (name === type) {
        found += 1;
        if (found === index) {
          return child;
        }
      }
    }
    throw new Error("XPath error: wanted child not found.");
  };

  getNodeName = function(node) {
    var nodeName;
    nodeName = node.nodeName.toLowerCase();
    switch (nodeName) {
      case "#text":
        return "text()";
      case "#comment":
        return "comment()";
      case "#cdata-section":
        return "cdata-section()";
      default:
        return nodeName;
    }
  };

  getNodePosition = function(node) {
    var pos, tmp;
    pos = 0;
    tmp = node;
    while (tmp) {
      if (tmp.nodeName === node.nodeName) {
        pos += 1;
      }
      tmp = tmp.previousSibling;
    }
    return pos;
  };

  fromNode = function($el, relativeRoot) {
    var exception, result;
    try {
      result = simpleXPathJQuery($el, relativeRoot);
    } catch (_error) {
      exception = _error;
      console.log("jQuery-based XPath construction failed! Falling back to manual.");
      result = simpleXPathPure($el, relativeRoot);
    }
    return result;
  };

  toNode = function(path, root) {
    var customResolver, namespace, node, segment;
    if (root == null) {
      root = document;
    }
    if (!$.isXMLDoc(document.documentElement)) {
      return evaluateXPath(path, root);
    } else {
      customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement : document.ownerDocument.documentElement);
      node = evaluateXPath(path, root, customResolver);
      if (!node) {
        path = ((function() {
          var _i, _len, _ref, _results;
          _ref = path.split('/');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            segment = _ref[_i];
            if (segment && segment.indexOf(':') === -1) {
              _results.push(segment.replace(/^([a-z]+)/, 'xhtml:$1'));
            } else {
              _results.push(segment);
            }
          }
          return _results;
        })()).join('/');
        namespace = document.lookupNamespaceURI(null);
        customResolver = function(ns) {
          if (ns === 'xhtml') {
            return namespace;
          } else {
            return document.documentElement.getAttribute('xmlns:' + ns);
          }
        };
        node = evaluateXPath(path, root, customResolver);
      }
      return node;
    }
  };

  module.exports = {
    fromNode: fromNode,
    toNode: toNode
  };

}).call(this);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1
(function() {
  var $, Util;

  $ = __webpack_require__(0);

  Util = {};

  Util.NodeTypes = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  };

  Util.getFirstTextNodeNotBefore = function(n) {
    var result;
    switch (n.nodeType) {
      case Util.NodeTypes.TEXT_NODE:
        return n;
      case Util.NodeTypes.ELEMENT_NODE:
        if (n.firstChild != null) {
          result = Util.getFirstTextNodeNotBefore(n.firstChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.nextSibling;
    if (n != null) {
      return Util.getFirstTextNodeNotBefore(n);
    } else {
      return null;
    }
  };

  Util.getLastTextNodeUpTo = function(n) {
    var result;
    switch (n.nodeType) {
      case Util.NodeTypes.TEXT_NODE:
        return n;
      case Util.NodeTypes.ELEMENT_NODE:
        if (n.lastChild != null) {
          result = Util.getLastTextNodeUpTo(n.lastChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.previousSibling;
    if (n != null) {
      return Util.getLastTextNodeUpTo(n);
    } else {
      return null;
    }
  };

  Util.getTextNodes = function(jq) {
    var getTextNodes;
    getTextNodes = function(node) {
      var nodes;
      if (node && node.nodeType !== Util.NodeTypes.TEXT_NODE) {
        nodes = [];
        if (node.nodeType !== Util.NodeTypes.COMMENT_NODE) {
          node = node.lastChild;
          while (node) {
            nodes.push(getTextNodes(node));
            node = node.previousSibling;
          }
        }
        return nodes.reverse();
      } else {
        return node;
      }
    };
    return jq.map(function() {
      return Util.flatten(getTextNodes(this));
    });
  };

  Util.getGlobal = function() {
    return (function() {
      return this;
    })();
  };

  Util.contains = function(parent, child) {
    var node;
    node = child;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  Util.flatten = function(array) {
    var flatten;
    flatten = function(ary) {
      var el, flat, _i, _len;
      flat = [];
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        el = ary[_i];
        flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
      }
      return flat;
    };
    return flatten(array);
  };

  module.exports = Util;

}).call(this);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

$(document).ready(function () {
    var options = { 
        cssClass: 'highlight', 
        direction: 'rtl', 
        useCtrlKey: true,
        isChromeExtension: true 
    };
    var Sidebar = __webpack_require__(5);
    registerClickListener(new Sidebar(options));
});

function registerClickListener(Sidebar) {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.toggle) {
            Sidebar.toggle();
        }
    });
}



/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Highlighter = __webpack_require__(1);
var Storage = __webpack_require__(8);

var Sidebar = function Sidebar(options) { 
    Sidebar.options = $.extend(true, {}, options);
    Sidebar.isInitialized = false;
};

Sidebar.prototype.toggle = function () {
    var shouldInit = !Sidebar.isInitialized;
    if (shouldInit) {
        Sidebar.prototype.run();
    } else {
        Sidebar.toggle();
        if ($(Sidebar.shadowRoot.querySelector("#sidebarToggler")).is(':visible')) {
            Sidebar.load(false);
        } else {
            Sidebar.unload();
        }
    }
}
Sidebar.prototype.run = function () {
    Sidebar.build();
    Sidebar.init();
    Sidebar.initHighlighter();
    Sidebar.load(true);
    Sidebar.isInitialized = true;
};

/* --------------------------- */
/*     Building the sidebar    */
/* --------------------------- */

Sidebar.build = function () {
    Sidebar.shadowRoot = Sidebar.initShadowDOM();
    var $sidebarToggler = $(Sidebar.getSidebarTogglerHTML());
    var $sidebar = $(Sidebar.getSidebarHTML());
    Sidebar.shadowRoot.appendChild($sidebarToggler[0]);
    Sidebar.shadowRoot.appendChild($sidebar[0]);
};
Sidebar.initShadowDOM = function () {
    // Note: shadowDOM doesn't support adding <script> tag through innerHTML, but only through appendChild.
    // Moreover, unlike with stylesheets, shadowDOM doesn't act as a sandbox for Javascript code (use iframe for this).
    const injectDiv = document.createElement('div');
    injectDiv.setAttribute("id", "injector");
    const shadowRoot = injectDiv.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `\
        <link rel="stylesheet" type="text/css" href="${Sidebar.getResource("libs/bootstrap-4.1.3/bootstrap.min.css")}"></link>\
        <link rel="stylesheet" type="text/css" href="${Sidebar.getResource("libs/tippy-6.2.3/tippy.min.css")}"></link>\
        <link rel="stylesheet" type="text/css" href="${Sidebar.getResource("libs/font-awesome-5.13.0/css/all.min.css")}"></link>\
        <link rel="stylesheet" type="text/css" href="${Sidebar.getResource("css/sidebar.css")}"></link>\
    `;
    document.body.appendChild(injectDiv);
    return shadowRoot;
}
Sidebar.getSidebarTogglerHTML = function () {
    var sidebarToggler =
        `<a id="sidebarToggler" title="toggle sidebar">\
            <img id="sidebarTogglerImage" src="${Sidebar.getResource("images/svg/icon48.svg")}"></img>\
        </a>`;
    return sidebarToggler;
};
Sidebar.getSidebarHTML = function () {
    var buttons = [
        { id: "copier", label: 'Copy to clipboard', classes: 'fas fa-copy' },
        { id: "saver", label: 'Save', classes: 'fas fa-save' },
        { id: "flipper", label: 'Change sidebar position', classes: 'fas fa-compass' },
    ]
    var sidebar =
        `<div id="sidebar" class="collapsed">\
            <div id="buttons" class="text-left" style="direction: ${Sidebar.options.direction};">\
                <div class="btn-group">\
                    ${buttons.map(b => `<a id="${b.id}" class="${b.classes}" title="${b.label}"></a>`).join('')}
                </div>\
            </div>\
            <div id="cards">\
            </div>
        </div>`;
    return sidebar;
};
Sidebar.getSidebarRowHTML = function (id) {
    var sidebarRow =
        `<div id=${id} class="row sidebar-row">\
            <div class="col-sm-12 my-2">\
                <div class="card card-body px-2 py-2">\
                    <span class="content"></span>\
                    <div class="text-left">\
                        <div class="btn-group">\
                            <i id="delete" class="fas fa-trash" title="delete"></i>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>`;
    return sidebarRow;
};
Sidebar.getResource = function (path) {
    if (Sidebar.options.isChromeExtension) {
        path = chrome.extension.getURL(path);
    }
    return path;
}

/* ------------------------------------- */
/*    Initializing sidebar's elements    */
/* ------------------------------------- */

Sidebar.init = function () {
    Sidebar.initToggler();
    Sidebar.initButtons();
    Sidebar.initCards();
}

/* ------------------------------------- */
/*     Sidebar toggler initialization    */
/* ------------------------------------- */

Sidebar.initToggler = function () {
    Sidebar.shadowRoot.querySelector("#sidebarToggler").addEventListener("click", Sidebar.toggleSidebar);
};
// 'toggle' toggles both the sidebar and the sidebar's toggle itself
Sidebar.toggle = function () {
    Sidebar.toggleSidebarToggler();
    Sidebar.hide();
}
// 'toggleSidebarToggler' toggles the sidebar's toggle itself
Sidebar.toggleSidebarToggler = function () {
    var $toggler = $(Sidebar.shadowRoot.querySelector("#sidebarToggler"));
    if (!$toggler.is(':visible')) {
        $toggler.show();
    } else {
        $toggler.hide();
    }
}
// 'toggleSidebar' toggles the sidebar
Sidebar.toggleSidebar = function () {
    if (false) {}
    else if (Sidebar.show()) { }
    else if (Sidebar.hide()) { }
}
Sidebar.show = function ($sidebar) {
    var $sidebar = $(Sidebar.shadowRoot.querySelector('#sidebar'));
    var isShown = false;
    if ($sidebar.hasClass("collapsed")) {
        $sidebar.removeClass("collapsed");
        isShown = true;
    }
    return isShown;
}
Sidebar.hide = function ($sidebar) {
    var $sidebar = $(Sidebar.shadowRoot.querySelector('#sidebar'));
    var isHidden = false;
    if (!$sidebar.hasClass("collapsed")) {
        $sidebar.addClass("collapsed");
        isHidden = true;
    }
    return isHidden;
}

/* ------------------------------------- */
/*     Sidebar buttons initialization    */
/* ------------------------------------- */

Sidebar.initButtons = function () {
    $buttons = $(Sidebar.shadowRoot.querySelector('#buttons'));
    $buttons.find("#saver").on("click", function (e) { Sidebar.save(Sidebar.showTooltip(e.target)); });
    $buttons.find("#copier").on("click", function (e) { Sidebar.copyToClipboard(Sidebar.showTooltip(e.target)); });
    $buttons.find("#flipper").on("click", Sidebar.flipDirection);
};
Sidebar.save = function (callback) {
    Storage.save(Storage.storageType.chrome, Sidebar.options.cssClass, callback);
};
Sidebar.copyToClipboard = function (callback) {
    var contents =
        $(Sidebar.shadowRoot.querySelector("#sidebar"))
            .find(".content")
            .toArray()
            .map(s => $(s).text())
            .join(" ")
            .replace(/\s\s+/g, " ");
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(contents).select();
    document.execCommand("copy");
    $temp.remove();
    callback();
};
Sidebar.flipDirection = function () {
    var $sidebar = Sidebar.shadowRoot.querySelector("#sidebar");
    var $sidebarToggle = Sidebar.shadowRoot.querySelector("#sidebarToggler");
    var currentDirection = Sidebar.options.direction; //window.getComputedStyle($sidebar).getPropertyValue('direction');
    var fromTo = currentDirection === 'ltr' ?
        { currentPosition: 'left', toPosition: 'right', direction: 'rtl' } :
        { currentPosition: 'right', toPosition: 'left', direction: 'ltr' };

    // 1.a set sidebar's direction property
    Sidebar.options.direction = fromTo.direction;
    // 1.a. flip sidebar's direction
    $sidebar.style.direction = fromTo.direction;
    // 1.b. flip sidebar's position 
    $sidebar.style[fromTo.currentPosition] = 'unset',
        $sidebar.style[fromTo.toPosition] = '0px';
    // 2.a. flip sidebarToggler position
    $sidebarToggle.style[fromTo.currentPosition] = 'unset',
        $sidebarToggle.style[fromTo.toPosition] = '5px',
        $sidebarToggle.style.float = fromTo.toPosition;
    // 2.b. flip sidebarToggler image orientation
    $sidebarToggle.style.transform = fromTo.direction === 'ltr' ? 'scaleX(-1)' : 'scaleX(1)';
    // 3. flip Bootstrap's 'text-' element direction
    var elementsToFlip = Sidebar.shadowRoot.querySelectorAll('*[class^="text"]');
    if (elementsToFlip) {
        elementsToFlip.forEach(element => {
            // note: buttons are opposite to $sidebar direction
            element.classList.replace(
                ['text-', fromTo.toPosition].join(''), ['text-', fromTo.currentPosition].join('')
            );
        })
    }
};
Sidebar.showTooltip = function (element) {
    var tip = tippy(element, {
        content: 'done!',
        animation: 'fade',
        arrow: true,
        trigger: 'manual',
        position: 'bottom',
        zIndex: 2147483646,
        // the content is always in English 
        // (note: this property was added by me to tippy.min.js. )
        direction: 'ltr'
    })
    return function () {
        tip.show()
        setTimeout(function () { tip.hide(); tip.destroy(); }, 2000);
    }
}

/* ------------------------------------- */
/*       Sidebar cards initialization    */
/* ------------------------------------- */

Sidebar.initCards = function ($sidebar) {
    $cards = $(Sidebar.shadowRoot.querySelector('#cards'));
    $cards.sortable();
    $cards.disableSelection();
};

/* --------------------------- */
/*   Sidebar's rows functions  */
/* --------------------------- */

Sidebar.addRow = function (highlightedText, id) {
    var $sidebar = Sidebar.shadowRoot.querySelector("#cards");
    var $sidebarRow = $(Sidebar.getSidebarRowHTML(id));
    Sidebar.initSidebarRow($sidebarRow, highlightedText);
    $sidebar.appendChild($sidebarRow[0]);
};
Sidebar.initSidebarRow = function ($sidebarRow, highlightedText) {
    $sidebarRow.find(".content").text(highlightedText);
    $sidebarRow.on('click', Sidebar.scrollIntoView);
    $sidebarRow.find('#delete').on('click', Sidebar.deleteRow);
};
Sidebar.scrollIntoView = function (event) {
    var id = $(event.target).closest('.sidebar-row').prop('id');
    var options = { behavior: "smooth", block: "center", inline: "nearest" };
    $(`[id^='${id}']`)[0].scrollIntoView(options);
};
Sidebar.deleteRow = function (event) {
    var id = $(event.target).closest('.sidebar-row').prop('id');
    // 1. remove card
    var element = Sidebar.shadowRoot.querySelector(['#', id].join(''));
    element.parentNode.removeChild(element);
    // 2. remove highlights
    Highlighter.removeHighlightsById(id);
    event.stopPropagation();
};

/* ---------------------------- */
/*  Highlighter initialization  */
/* ---------------------------- */

Sidebar.initHighlighter = function () {
    $(document.body).mouseup(function (e) {
        // note: if you're debugging, make sure you don't press the debugger's '>' button ('resume script execution') 
        // that appears on top of the viewport, as this will count as another 'mouseup' event and will cause strange results.
        var isCtrlPressed = e.ctrlKey;
        if (!Sidebar.options.useCtrlKey || isCtrlPressed) {
            var selection = Highlighter.getSelection();
            if (!Sidebar.isInside(selection) && selection.toString() != "") {
                var rangesData = Highlighter.highlight({ selection: selection }, Sidebar.options.cssClass);
                Sidebar.addRow(rangesData.ranges[0].text(), rangesData.id);
            }
            selection.removeAllRanges();
        }
    });
};
Sidebar.isInside = function (selection) {
    var isInside = false;
    if (selection.toString() != "") {
        var anchorTag = selection.anchorNode.parentNode;
        var focusTag = selection.focusNode.parentNode;
        isInside = 
            $(anchorTag).parents("#sidebar").length ||
            $(focusTag).parents("#sidebar").length;
    }
    return isInside;
};

/* ------------------------------- */
/*   loading\unloading highlights  */
/* ------------------------------- */

Sidebar.load = function (shouldAddRows) {
    Storage.load(Storage.storageType.chrome, Sidebar.options.cssClass, function (rangeDatas) {
        if (shouldAddRows) {
            rangeDatas.forEach(function (rangeData) {
                var range = rangeData.ranges[0]; // there would always be a single range coming from storage
                Sidebar.addRow(range.text(), rangeData.id);
            })
        }
    });
};
Sidebar.unload = function () {
    Highlighter.removeHighlightsByClass(Sidebar.options.cssClass);
};

module.exports = Sidebar;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1
(function() {
  module.exports = {
    xpath: __webpack_require__(2),
    Range: __webpack_require__(7)
  };

}).call(this);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by CoffeeScript 1.7.1
(function() {
  var $, Range, Util, xpath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  xpath = __webpack_require__(2);

  Util = __webpack_require__(3);

  $ = __webpack_require__(0);

  Range = {};

  Range.sniff = function(r) {
    if (r.commonAncestorContainer != null) {
      return new Range.BrowserRange(r);
    } else if (typeof r.start === "string") {
      return new Range.SerializedRange(r);
    } else if (r.start && typeof r.start === "object") {
      return new Range.NormalizedRange(r);
    } else {
      console.error("Could not sniff range type");
      return false;
    }
  };

  Range.RangeError = (function(_super) {
    __extends(RangeError, _super);

    function RangeError(type, message, parent) {
      this.type = type;
      this.message = message;
      this.parent = parent != null ? parent : null;
      RangeError.__super__.constructor.call(this, this.message);
    }

    return RangeError;

  })(Error);

  Range.BrowserRange = (function() {
    function BrowserRange(obj) {
      this.commonAncestorContainer = obj.commonAncestorContainer;
      this.startContainer = obj.startContainer;
      this.startOffset = obj.startOffset;
      this.endContainer = obj.endContainer;
      this.endOffset = obj.endOffset;
    }

    BrowserRange.prototype.normalize = function(root) {
      var nr, r;
      if (this.tainted) {
        console.error("You may only call normalize() once on a BrowserRange!");
        return false;
      } else {
        this.tainted = true;
      }
      r = {};
      this._normalizeStart(r);
      this._normalizeEnd(r);
      nr = {};
      if (r.startOffset > 0) {
        if (r.start.nodeValue.length > r.startOffset) {
          nr.start = r.start.splitText(r.startOffset);
        } else {
          nr.start = r.start.nextSibling;
        }
      } else {
        nr.start = r.start;
      }
      if (r.start === r.end) {
        if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
          nr.start.splitText(r.endOffset - r.startOffset);
        }
        nr.end = nr.start;
      } else {
        if (r.end.nodeValue.length > r.endOffset) {
          r.end.splitText(r.endOffset);
        }
        nr.end = r.end;
      }
      nr.commonAncestor = this.commonAncestorContainer;
      while (nr.commonAncestor.nodeType !== Util.NodeTypes.ELEMENT_NODE) {
        nr.commonAncestor = nr.commonAncestor.parentNode;
      }
      return new Range.NormalizedRange(nr);
    };

    BrowserRange.prototype._normalizeStart = function(r) {
      if (this.startContainer.nodeType === Util.NodeTypes.ELEMENT_NODE) {
        r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
        return r.startOffset = 0;
      } else {
        r.start = this.startContainer;
        return r.startOffset = this.startOffset;
      }
    };

    BrowserRange.prototype._normalizeEnd = function(r) {
      var n, node;
      if (this.endContainer.nodeType === Util.NodeTypes.ELEMENT_NODE) {
        node = this.endContainer.childNodes[this.endOffset];
        if (node != null) {
          n = node;
          while ((n != null) && (n.nodeType !== Util.NodeTypes.TEXT_NODE)) {
            n = n.firstChild;
          }
          if (n != null) {
            r.end = n;
            r.endOffset = 0;
          }
        }
        if (r.end == null) {
          if (this.endOffset) {
            node = this.endContainer.childNodes[this.endOffset - 1];
          } else {
            node = this.endContainer.previousSibling;
          }
          r.end = Util.getLastTextNodeUpTo(node);
          return r.endOffset = r.end.nodeValue.length;
        }
      } else {
        r.end = this.endContainer;
        return r.endOffset = this.endOffset;
      }
    };

    BrowserRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    return BrowserRange;

  })();

  Range.NormalizedRange = (function() {
    function NormalizedRange(obj) {
      this.commonAncestor = obj.commonAncestor;
      this.start = obj.start;
      this.end = obj.end;
    }

    NormalizedRange.prototype.normalize = function(root) {
      return this;
    };

    NormalizedRange.prototype.limit = function(bounds) {
      var nodes, parent, startParents, _i, _len, _ref;
      nodes = $.grep(this.textNodes(), function(node) {
        return node.parentNode === bounds || $.contains(bounds, node.parentNode);
      });
      if (!nodes.length) {
        return null;
      }
      this.start = nodes[0];
      this.end = nodes[nodes.length - 1];
      startParents = $(this.start).parents();
      _ref = $(this.end).parents();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        parent = _ref[_i];
        if (startParents.index(parent) !== -1) {
          this.commonAncestor = parent;
          break;
        }
      }
      return this;
    };

    NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
      var end, serialization, start;
      serialization = function(node, isEnd) {
        var n, nodes, offset, origParent, path, textNodes, _i, _len;
        if (ignoreSelector) {
          origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0);
        } else {
          origParent = $(node).parent();
        }
        path = xpath.fromNode(origParent, root)[0];
        textNodes = Util.getTextNodes(origParent);
        nodes = textNodes.slice(0, textNodes.index(node));
        offset = 0;
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          offset += n.nodeValue.length;
        }
        if (isEnd) {
          return [path, offset + node.nodeValue.length];
        } else {
          return [path, offset];
        }
      };
      start = serialization(this.start);
      end = serialization(this.end, true);
      return new Range.SerializedRange({
        start: start[0],
        end: end[0],
        startOffset: start[1],
        endOffset: end[1]
      });
    };

    NormalizedRange.prototype.text = function() {
      var node;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.textNodes();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          _results.push(node.nodeValue);
        }
        return _results;
      }).call(this)).join('');
    };

    NormalizedRange.prototype.textNodes = function() {
      var end, start, textNodes, _ref;
      textNodes = Util.getTextNodes($(this.commonAncestor));
      _ref = [textNodes.index(this.start), textNodes.index(this.end)], start = _ref[0], end = _ref[1];
      return $.makeArray(textNodes.slice(start, +end + 1 || 9e9));
    };

    return NormalizedRange;

  })();

  Range.SerializedRange = (function() {
    function SerializedRange(obj) {
      this.start = obj.start;
      this.startOffset = obj.startOffset;
      this.end = obj.end;
      this.endOffset = obj.endOffset;
    }

    SerializedRange.prototype.normalize = function(root) {
      var contains, e, length, node, p, range, targetOffset, tn, _i, _j, _len, _len1, _ref, _ref1;
      range = {};
      _ref = ['start', 'end'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        try {
          node = xpath.toNode(this[p], root);
        } catch (_error) {
          e = _error;
          throw new Range.RangeError(p, ("Error while finding " + p + " node: " + this[p] + ": ") + e, e);
        }
        if (!node) {
          throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p]);
        }
        length = 0;
        targetOffset = this[p + 'Offset'];
        if (p === 'end') {
          targetOffset -= 1;
        }
        _ref1 = Util.getTextNodes($(node));
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          tn = _ref1[_j];
          if (length + tn.nodeValue.length > targetOffset) {
            range[p + 'Container'] = tn;
            range[p + 'Offset'] = this[p + 'Offset'] - length;
            break;
          } else {
            length += tn.nodeValue.length;
          }
        }
        if (range[p + 'Offset'] == null) {
          throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + 'Offset'] + " in element " + this[p]);
        }
      }
      contains = document.compareDocumentPosition != null ? function(a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_CONTAINED_BY;
      } : function(a, b) {
        return a.contains(b);
      };
      $(range.startContainer).parents().each(function() {
        var endContainer;
        if (range.endContainer.nodeType === Util.NodeTypes.TEXT_NODE) {
          endContainer = range.endContainer.parentNode;
        } else {
          endContainer = range.endContainer;
        }
        if (contains(this, endContainer)) {
          range.commonAncestorContainer = this;
          return false;
        }
      });
      return new Range.BrowserRange(range).normalize(root);
    };

    SerializedRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    SerializedRange.prototype.toObject = function() {
      return {
        start: this.start,
        startOffset: this.startOffset,
        end: this.end,
        endOffset: this.endOffset
      };
    };

    return SerializedRange;

  })();

  module.exports = Range;

}).call(this);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Highlighter = __webpack_require__(1);

var Storage = function Storage() {};

Storage.prototype.storageType = {
    chrome: 1,
    file: 2     // not yet implemented
}

Storage.key = "rangesData";

Storage.prototype.save = function (storageType, cssClass, callback) {
    var rangeDatas = Highlighter.getHighlightsFromDOM(cssClass);
    if (rangeDatas.length) {
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

/***/ })
/******/ ]);