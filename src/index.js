var Popup = (function () {
    function Popup() {
        this.prevHoverRule = null;
    }
    Popup.prototype.openRuleEditor = async function () {
        this.removeHighlight();
        // var bgWindow = chrome.extension.getBackgroundPage();
        // bgWindow.openRulePicker(null);
        await  chrome.runtime.sendMessage({ command: "openRulePicker" });
        window.close();
    };
    Popup.prototype.highlightRuleElements = async function (rule) {
        // var bgWindow = chrome.extension.getBackgroundPage();
        // bgWindow.highlightRuleElements(rule);
        await  chrome.runtime.sendMessage({ command: "highlightRuleElements",rule: rule });

    };
    Popup.prototype.getAppliedRules =  async function () {
        try {
            CustomBlockerUtil.processPage();
        }
        catch (ex) {
            document.write(ex);
            return;
        }
        this.refreshButton();
        // var bgWindow = chrome.extension.getBackgroundPage();
        var scope = this;
        await chrome.runtime.sendMessage({ command: "getAppliedRules2" , test: 'test'});
        // bgWindow.getAppliedRules(function (list) {
        //     try {
        //         scope.renderApplierRules(list);
        //     }
        //     catch (ex) {
        //     }
        // });
    };

    chrome.runtime.onMessage.addListener( async function (request, sender) {
        if (request.command === "renderApplierRules") {
            console.log(request.rules)
            popup.renderApplierRules(request.rules);
        }
    })

    Popup.prototype.setBlockOn = async function (on) {
        var blockvar = on ? 'false': 'true';
        await chrome.storage.local.set({blockDisabled: blockvar})
        // var bgWindow = chrome.extension.getBackgroundPage();
        // bgWindow.setIconDisabled(!on);
        await chrome.runtime.sendMessage({ command: "setIconDisabled", isDisabled: !on});
        this.refreshButton();
    };
    Popup.prototype.refreshButton = function () {
        chrome.storage.local.get(["blockDisabled"], function (result) {
            if (result["blockDisabled"]) {
                var isDisabled = ('true' == result["blockDisabled"]);
                document.getElementById('buttonOn').checked = !isDisabled;
                document.getElementById('buttonOff').checked = isDisabled;
            }
            })
    };
    Popup.prototype.getLiMouseoverAction = function (rule) {
        var scope = this;
        return function () {
            if (scope.prevHoverRule == rule)
                return;
            scope.prevHoverRule = rule;
            scope.highlightRuleElements(rule);
        };
    };
    Popup.prototype.removeHighlight = async function () {
        if (this.prevHoverRule != null) {
            this.prevHoverRule = null;
            // var bgWindow = chrome.extension.getBackgroundPage();
            // bgWindow.highlightRuleElements(null);
            await chrome.runtime.sendMessage({ command: "highlightRuleElements" });

        }
    };
    Popup.prototype.renderApplierRules = function (list) {
        var ul = document.getElementById('activeRules');
        var scope = this;
        ul.addEventListener('mouseout', function () { scope.removeHighlight(); }, false);
        if (list != null && list.length > 0) {
            for (var i = 0, l = list.length; i < l; i++) {
                var rule = list[i];
                var li = document.createElement('LI');
                var tip = CustomBlockerUtil.getRuleDetailTip(rule);
                if (tip) {
                    li.title = tip;
                }
                li.addEventListener('mouseover', this.getLiMouseoverAction(rule), true);
                var divTitle = document.createElement('DIV');
                divTitle.className = 'title';
                divTitle.innerHTML = CustomBlockerUtil.shorten(rule.title, 42);
                var divCount = document.createElement('DIV');
                divCount.className = 'count ' + ((rule.hiddenCount && rule.hiddenCount > 0) ? 'hit' : 'noHit');
                divCount.innerHTML = (rule.hiddenCount) ? rule.hiddenCount.toString() : '0';
                var buttonContainer = document.createElement('SPAN');
                buttonContainer.className = 'button-container';
                var editButton = document.createElement('INPUT');
                editButton.type = 'BUTTON';
                editButton.className = 'buttonEdit';
                editButton.addEventListener('click', this.getEditRuleAction(rule), true);
                editButton.value = chrome.i18n.getMessage('buttonLabelEdit');
                var disableButton = document.createElement('input');
                disableButton.type = 'BUTTON';
                disableButton.value = (rule.is_disabled) ? 'OFF' : 'ON';
                disableButton.className = (rule.is_disabled) ? 'buttonOff' : 'buttonOn';
                disableButton.addEventListener('click', this.getDisableAction(rule, disableButton), false);
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(disableButton);
                li.appendChild(buttonContainer);
                li.appendChild(divCount);
                li.appendChild(divTitle);
                ul.appendChild(li);
            }
        }
        else {
            var emptyLi = document.createElement('LI');
            emptyLi.className = 'empty';
            emptyLi.innerHTML = 'None';
            ul.appendChild(emptyLi);
        }
    };
    Popup.prototype.getEditRuleAction = function (rule) {
        var scope = this;
        return async function () {
            scope.removeHighlight();
            // var bgWindow = chrome.extension.getBackgroundPage();
            // bgWindow.openRulePicker(rule);
            await  chrome.runtime.sendMessage({ command: "openRulePicker",rule: rule });
            window.close();
        };
    };
    Popup.prototype.getDisableAction = function (rule, disableButton) {
        return function (event) {
            cbStorage.toggleRule(rule, function () {
                disableButton.value = (rule.is_disabled) ? 'OFF' : 'ON';
                disableButton.className = (rule.is_disabled) ? 'buttonOff' : 'buttonOn';
            });
        };
    };
    return Popup;
}());
var popup = new Popup();
window.onload = function () {
    popup.getAppliedRules();
    document.getElementById('versionLabel').innerHTML = chrome.runtime.getManifest().version;
    document.getElementById('buttonOn').addEventListener('click', function () { popup.setBlockOn(true); }, false);
    document.getElementById('buttonOff').addEventListener('click', function () { popup.setBlockOn(false); }, false);
    document.getElementById('buttonOpenPreferenceTop').addEventListener('click', function openPreference() { window.open('pref/index.html?p=i1'); }, false);
    document.getElementById('buttonCreateRule').addEventListener('click', function () { popup.openRuleEditor(); }, false);
};
//# sourceMappingURL=index.js.map