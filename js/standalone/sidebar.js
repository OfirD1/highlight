var Highlighter = require('./highlighter.js');
var Storage = require('./storage.js');

var Sidebar = function Sidebar() { 
    Sidebar.isInitialized = false;
    Sidebar.options = { isChromeExtension: chrome.extension !== undefined };
    $.getJSON(Sidebar.getResource("config.json"), function (customOptions) {
        $.extend(true, Sidebar.options, customOptions)
    });
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
            <div id="buttons" class="text-left">\
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
                    <span class="sidebar-row-content"></span>\
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
    Sidebar.setPosition();
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
    if (false) { }
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
    $buttons.find("#flipper").on("click", Sidebar.setPosition);
};
Sidebar.save = function (callback) {
    if (Sidebar.isChromeExtension) {
        Storage.save(Storage.storageType.chrome, Sidebar.options.cssClass, callback);
    }
};
Sidebar.copyToClipboard = function (callback) {
    var contents =
        $(Sidebar.shadowRoot.querySelector("#sidebar"))
            .find(".sidebar-row-content")
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
Sidebar.setPosition = function () {
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
    $sidebarRow.find(".sidebar-row-content").text(highlightedText);
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
    if (Sidebar.isChromeExtension) {
        Storage.load(Storage.storageType.chrome, Sidebar.options.cssClass, function (rangeDatas) {
            if (shouldAddRows) {
                rangeDatas.forEach(function (rangeData) {
                    var range = rangeData.ranges[0]; // there would always be a single range coming from storage
                    Sidebar.addRow(range.text(), rangeData.id);
                })
            }
        });
    }
};
Sidebar.unload = function () {
    Highlighter.removeHighlightsByClass(Sidebar.options.cssClass);
};

module.exports = Sidebar;