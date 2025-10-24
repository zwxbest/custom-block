var initDone = false;
var existingTabs = new Array();
var tabBadgeMap = new Array();
var ruleList = [];

function onStartBackground() {
    // updateDbIfNeeded(createRuleTable);
    reloadLists(false);
    GiteeSync.syncRemoteConfig(null,null)
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command === "onStartBackground") {
        onStartBackground();
    }
});


function removeFromExistingTabList(tabIdToRemove) {
    for (var id in existingTabs) {
        if (tabIdToRemove == id)
            existingTabs[id] = null;
    }
}

function addToExistingTabList(tabIdToAdd) {
    existingTabs[tabIdToAdd] = true;
}

function reloadLists(changed) {
    loadLists();
    if (changed) {
        GiteeSync.uploadConfig(null, null, null)
    }
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command === "reloadLists") {
        reloadLists(request.changed === 'true')
    }
});

function openRulePicker(selectedRule) {
    var status = (selectedRule) ? 'edit' : 'create';
    Analytics.trackEvent('openRulePicker', status);
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let tab = tabs[0]
            console.log(tab)
            var tabInfo = tabMap[tab.id];
            if (!tabInfo) {
                return;
            }
            var appliedRules = (tabInfo) ? tabInfo.appliedRules : [];
            tabInfo.postMessage({
                command: 'ruleEditor',
                rule: selectedRule,
                appliedRuleList: appliedRules
            });
        });
    } catch (ex) {
        console.log(ex);
    }
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command === "openRulePicker") {
        openRulePicker(request.rule)
    }
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log(changeInfo)
    if (changeInfo.url) {
        console.log("chrome.tabs.onUpdated")
        updateUrl(tab.id, null, tab);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command == "requestRules") {
        console.log("tabOnUpdate")
        tabOnUpdate(sender.tab.id, null, sender.tab);
    }
});
var CustomBlockerTab = (function () {
    function CustomBlockerTab(tabId, tab) {
        this.tabId = tab.id;
        this.url = tab.url;
        this.appliedRules = [];
        this.port = chrome.tabs.connect(tabId, {});
        var self = this;
        this.port.onMessage.addListener(function (msg) {
            self.onMessage(msg);
        });
    }

    CustomBlockerTab.prototype.execCallbackDb = function (param) {
        console.log("TODO execCallbackDb");
    };
    CustomBlockerTab.prototype.execCallbackSetApplied = function (param) {
        this.appliedRules = param.list;
        var iconPath = "icon/" + ((this.appliedRules.length > 0) ? 'icon.png' : 'icon_disabled.png');
        try {
            chrome.action.setIcon({
                path: iconPath,
                tabId: this.tabId
            });
        } catch (ex) {
            console.log(ex);
        }
    };
    CustomBlockerTab.prototype.execCallbackBadge = function (param) {
        var count = param.count;
        try {
            var badgeText = '' + count ;
            if (count == 0){
                badgeText = "";
            }
            tabBadgeMap[this.tabId] = badgeText;

            chrome.storage.local.get(["badgeDisabled"], function (result) {
                if (result["badgeDisabled"]) {
                    if ('true' !== result["badgeDisabled"]){
                        chrome.action.setBadgeText({
                            text: badgeText,
                            tabId: this.tabId
                        });
                    }
                }
            })
            chrome.action.setTitle({
                title: getBadgeTooltipString(count),
                tabId: this.tabId
            });
            this.appliedRules = param.rules;
        } catch (ex) {
            console.log(ex);
        }
    };
    CustomBlockerTab.prototype.postMessage = function (message) {
        try {
            this.port.postMessage(message);
        } catch (e) {
            console.log(e);
        }
    };
    CustomBlockerTab.prototype.onMessage = function (message) {
        switch (message.command) {
            case 'badge':
                this.execCallbackBadge(message.param);
                break;
            case 'setApplied':
                this.execCallbackSetApplied(message.param);
                break;
            case 'notifyUpdate':
                this.execCallbackDb(message.param);
                break;
        }
    };
    CustomBlockerTab.postMessage = function (tabId, message) {
        var tabInfo = tabMap[tabId];
        if (!tabInfo) {
            console.log("CustomBlockerTab.postMessage tab not found.");
            return;
        }
        tabInfo.postMessage(message);
    };
    CustomBlockerTab.postMessageToAllTabs = function (message) {
        for (var tabId in tabMap) {
            CustomBlockerTab.postMessage(tabId, message);
        }
    };
    return CustomBlockerTab;
}());
var tabMap = {};
var tabOnUpdate = async function (tabId, changeInfo, tab) {
    addToExistingTabList(tabId);
    var isDisabled = ('true' === (await chrome.storage.local.get('blockDisabled'))['blockDisabled']);
    _setIconDisabled(isDisabled, tabId);
    if (isDisabled) {
        return;
    }
    var url = tab.url;
    if (isValidURL(url)) {
         tabMap[tabId] = new CustomBlockerTab(tabId, tab);
        tabMap[tabId].postMessage({
            command: 'init',
            rules: ruleList,
            tabId: tabId
        });
    }
};

async function updateUrl(tabId, changeInfo, tab) {

    console.log("updateUrl")
    console.log(tabMap[tabId])
    var isDisabled = ('true' === (await chrome.storage.local.get('blockDisabled'))['blockDisabled']);
    _setIconDisabled(isDisabled, tabId);
    if (isDisabled) {
        return;
    }
    var url = tab.url;
    if (isValidURL(url)) {
        // if (!tabMap[tabId]) {
        //
        // }
        tabMap[tabId] = new CustomBlockerTab(tabId, tab);
        // tabMap[tabId] = new CustomBlockerTab(tabId, tab);
        tabMap[tabId].postMessage({
            command: 'reload',
            rules: ruleList,
            tabId: tabId
        });
    }
}

var VALID_URL_REGEX = new RegExp('^https?:');

function isValidURL(url) {
    return url != null && VALID_URL_REGEX.test(url);
}

function getForegroundCallback(tabId) {
    return function (param) {
    };
}
;

function handleForegroundMessage(tabId, param) {
    console.log("Foreground message received.");
    console.log(param);
    if (!param)
        return;
    var useCallback = false;
    switch (param.command) {
        case 'badge':
            break;
        case 'setApplied':
            break;
        case 'notifyUpdate':
            break;
    }
}

function getAppliedRules(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        try {
            let tab = tabs[0];
            var appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
            callback(appliedRules);
        } catch (ex) {
            console.log(ex);
        }
    });
}

async function getAppliedRules2() {
    var tabs = await chrome.tabs.query({active: true});
    try {
        let tab = tabs[0];
        var appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
        return appliedRules;
    } catch (ex) {
        console.log(ex);
    }
}
chrome.runtime.onMessage.addListener( async function (request, sender) {
    if (request.command === "getAppliedRules2") {
        let  appliedRules2 = await getAppliedRules2()
        await chrome.runtime.sendMessage({ command: "renderApplierRules",rules:appliedRules2 });
    }
});
var smartRuleEditorSrc = '';

async function loadSmartRuleEditorSrc() {
    // var xhr = new XMLHttpRequest();
    // xhr.onreadystatechange = function () {
    //     if (xhr.readyState == 4) {
    //         if (xhr.status == 0 || xhr.status == 200) {
    //             smartRuleEditorSrc = xhr.responseText;
    //         }
    //     }
    // };
    // xhr.open("GET", chrome.runtime.getURL('/smart_rule_editor_' + chrome.i18n.getMessage("extLocale") + '.html'), true);
    // xhr.send();
    var url= chrome.runtime.getURL('/smart_rule_editor_' + chrome.i18n.getMessage("extLocale") + '.html');
    const response = await fetch(url);
    if (response.status === 200 || response.status === 0 ){
        smartRuleEditorSrc = await response.text();
    }
    console.log(response.statusText);

}

{
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        removeFromExistingTabList(tabId);
        tabMap[tabId] = null;
    });
    chrome.tabs.onActivated.addListener(async function (_tabId, selectInfo) {
        var tabId = _tabId.tabId;
        for (var _index in existingTabs) {
            var tabIdToDisable = parseInt(_index);
            if (tabIdToDisable && tabIdToDisable != tabId) {
                CustomBlockerTab.postMessage(tabIdToDisable, {command: 'stop'});
            }
        }
        try {
            if ('true' === (await chrome.storage.local.get('blockDisabled'))['blockDisabled'])
                _setIconDisabled(!applied, tabId);
            else {
                var appliedRules = (tabMap[tabId]) ? tabMap[tabId].appliedRules : [];
                var applied = appliedRules.length > 0;
                var iconPath = "icon/" + ((applied) ? 'icon.png' : 'icon_disabled.png');
                chrome.action.setIcon({
                    path: iconPath,
                    tabId: tabId
                });
            }
            CustomBlockerTab.postMessage(tabId, {command: 'resume'});
            if (tabBadgeMap[tabId]) {
                if ((await chrome.storage.local.get('badgeDisabled'))['badgeDisabled'] !== "true") {
                    chrome.action.setBadgeText({
                        text: tabBadgeMap[tabId],
                        tabId: tabId
                    });
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    });
}

function setIconDisabled(isDisabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        _setIconDisabled(isDisabled, tabs[0].id);
    });
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command === "setIconDisabled") {
        setIconDisabled(request.isDisabled)
    }
});

async function _setIconDisabled(isDisabled, tabId) {
    if (isDisabled){
        chrome.action.setBadgeText({
            text: 'OFF',
            tabId: tabId
        });
    }
    var iconPath = "icon/" + ((isDisabled) ? 'icon_disabled.png' : 'icon.png');
    chrome.action.setIcon({
        path: iconPath,
        tabId: tabId
    });
}

function highlightRuleElements(rule) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        CustomBlockerTab.postMessage(tabs[0].id, {
            command: 'highlight',
            rule: rule
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.command === "highlightRuleElements") {
        highlightRuleElements(request.rule)
    }
});


function getBadgeTooltipString(count) {
    if (count > 1)
        return chrome.i18n.getMessage("tooltipCount").replace("__count__", count);
    else
        return chrome.i18n.getMessage("tooltipCountSingle");
}

// function menuCreateOnRightClick(clicked, tab) {
//     sendQuickRuleCreationRequest(clicked, tab, true);
//     Analytics.trackEvent('contextMenu', 'create');
// }
// ;
//
// function menuAddOnRightClick(clicked, tab) {
//     sendQuickRuleCreationRequest(clicked, tab, false);
//     Analytics.trackEvent('contextMenu', 'add');
// }
// ;

function sendQuickRuleCreationRequest(clicked, tab, needSuggestion) {
    var appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
    CustomBlockerTab.postMessage(tab.id, {
        command: 'quickRuleCreation',
        src: smartRuleEditorSrc,
        appliedRuleList: appliedRules,
        selectionText: clicked.selectionText,
        needSuggestion: needSuggestion
    });
}
;
// var menuIdCreate = chrome.contextMenus.create({
//     "title": chrome.i18n.getMessage('menuCreateRule'), "contexts": ["selection"],
//     "id": "menuIdCreate"
// });
// var menuIdAdd = chrome.contextMenus.create({
//     "title": chrome.i18n.getMessage('menuAddToExistingRule'), "contexts": ["selection"],
//     "id": "menuIdAdd"
// });
//
//
// chrome.contextMenus.onClicked.addListener((item, tab) => {
//     const id = item.menuItemId;
//     if(id === "menuIdCreate"){
//         menuCreateOnRightClick(item,tab)
//     }else if(id === "menuIdAdd"){
//         menuAddOnRightClick(item,tab)
//     }
// });

chrome.runtime.onInstalled.addListener(function (details) {
    console.log("reason=" + details.reason);
    console.log("previousVersion=" + details.previousVersion);
    if ("install" == details.reason) {
        console.log("New install.");
        window.open(chrome.runtime.getURL('/pref/welcome_install_' + chrome.i18n.getMessage("extLocale") + '.html?install'));
    } else if (details.reason == "update" && details.previousVersion && details.previousVersion.match(/^2\./)) {
        window.open(chrome.runtime.getURL('/welcome_' + chrome.i18n.getMessage("extLocale") + '.html'));
    }
});
// window.onload = function () {
//     onStartBackground();
// };
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//     cbStorage.sync(changes, namespace, function () {
//         cbStorage.loadAll(function (rules, groups) {
//             CustomBlockerTab.postMessageToAllTabs({command: 'reload', rules: rules});
//         });
//     });
// });
// //# sourceMappingURL=background.js.map