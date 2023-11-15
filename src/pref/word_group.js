function initWordGroup() {
    CustomBlockerUtil.processPage();
    document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
    document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
    var page = new WordGroupPage();
    page.init();
    page.load();
}
var WordGroupPage = (function () {
    function WordGroupPage() {
    }
    WordGroupPage.prototype.init = function () {
        var _this = this;
        this.listContainer = document.getElementById("js_rule-list");
        this.editor = new WordGroupEditor();
        this.editor.onSave = function () {
            _this.listContainer.innerHTML = "";
            _this.load();
        };
    };
    WordGroupPage.prototype.load = function () {
        var _this = this;
        var scope = this;
        this.listContainer.innerHTML = "";
        cbStorage.loadAll(function (rules, groups) {
            _this.groups = groups;
            console.log(groups);
            var _loop_1 = function (group) {
                console.log(group.name);
                var li = _this.getInterface(group);
                li.addEventListener('click', function () { _this.selectWordGroup(group); });
                _this.listContainer.appendChild(li);
            };
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var group = groups_1[_i];
                _loop_1(group);
            }
        });
    };
    WordGroupPage.prototype.getInterface = function (group) {
        var li = document.createElement("li");
        li.className = "rule-list__item";
        li.innerHTML = group.name;
        var buttonContainer = document.createElement('DIV');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(this.createSelectButton(group));
        buttonContainer.appendChild(this.createDeleteButton(group));
        li.appendChild(buttonContainer);
        var keywordsDiv = document.createElement('DIV');
        keywordsDiv.className = 'keywords';
        var keywords = new Array();
        for (var _i = 0, _a = group.words; _i < _a.length; _i++) {
            var word = _a[_i];
            var keywordSpan = document.createElement('SPAN');
            keywordSpan.className = (word.is_regexp) ? "keyword keyword--regex" : "keyword keyword--normal";
            keywordSpan.innerHTML = word.word;
            keywordsDiv.appendChild(keywordSpan);
            keywordsDiv.appendChild(document.createTextNode(" "));
        }
        li.appendChild(keywordsDiv);
        return li;
    };
    WordGroupPage.prototype.createSelectButton = function (group) {
        var _this = this;
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonEdit';
        button.value = chrome.i18n.getMessage('buttonLabelEdit');
        button.addEventListener('click', function () { _this.selectWordGroup(group); }, true);
        return button;
    };
    WordGroupPage.prototype.createDeleteButton = function (group) {
        var _this = this;
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonDelete';
        button.value = chrome.i18n.getMessage('buttonLabelDelete');
        button.addEventListener('click', function () { _this.deleteWordGroup(group); }, true);
        return button;
    };
    WordGroupPage.prototype.selectWordGroup = function (group) {
        this.editor.setGroup(group);
    };
    WordGroupPage.prototype.deleteWordGroup = function (group) {
        var _this = this;
        var message = chrome.i18n.getMessage('wordGroupDelete').replace("___GROUP___", group.name);
        if (window.confirm(message)) {
            cbStorage.deleteWordGroup(group, function () {
                try {
                    var bgWindow = chrome.extension.getBackgroundPage();
                    bgWindow.reloadLists(true);
                }
                catch (ex) {
                    alert(ex);
                }
                _this.load();
            });
        }
    };
    return WordGroupPage;
}());
var WordGroupEditor = (function () {
    function WordGroupEditor() {
        this.uiTitle = document.getElementById("rule_editor_title");
        this.wordEditor = new WordEditor();
        this.alertDiv = document.getElementById('rule_editor_alert');
        var self = this;
        this.wordEditor.addWordHandler = function (word) {
            cbStorage.addWordToWordGroup(self.group, word);
        };
        this.wordEditor.deleteWordHandler = function (word) {
            console.log("TODO addWordHandler");
            cbStorage.removeWordFromWordGroup(self.group, word);
        };
        document.getElementById("rule_editor_save_button").addEventListener("click", function () {
            if (self.group) {
                if (self.uiTitle.value == "") {
                    self.showMessage(chrome.i18n.getMessage('errorWordGroupNameEmpty'));
                    return;
                }
                self.group.name = self.uiTitle.value;
                cbStorage.saveWordGroup(self.group, function () {
                    console.log("Group was saved. name=" + self.group.name);
                    try {
                        var bgWindow = chrome.extension.getBackgroundPage();
                        self.showMessage(chrome.i18n.getMessage('wordGroupSaveDone'));
                        bgWindow.reloadLists(true);
                    }
                    catch (ex) {
                        alert(ex);
                    }
                    if (self.onSave) {
                        self.onSave();
                    }
                });
            }
        });
        document.getElementById("js_word_group_create_button").addEventListener("click", function () {
            console.log("create new group");
            var group = cbStorage.createWordGroup();
            group.name = "New Group";
            self.setGroup(group);
        });
    }
    WordGroupEditor.prototype.setGroup = function (group) {
        this.uiTitle.value = group.name;
        this.group = group;
        this.wordEditor.setWords(group.words);
        this.hideMessage();
        this.uiTitle.focus();
    };
    WordGroupEditor.prototype.showMessage = function (str) {
        this.alertDiv.style.display = 'block';
        this.alertDiv.innerHTML = str;
    };
    WordGroupEditor.prototype.hideMessage = function () {
        this.alertDiv.style.display = 'none';
    };
    return WordGroupEditor;
}());
var WordGroupWrapper = (function () {
    function WordGroupWrapper(group) {
        this.group = group;
    }
    WordGroupWrapper.prototype.getInterface = function (group) {
        if (!this.li) {
            this.li = document.createElement("li");
            this.li.innerHTML = this.group.name;
            var buttonContainer = document.createElement('DIV');
            buttonContainer.className = 'button-container';
            buttonContainer.appendChild(this.createSelectButton());
            buttonContainer.appendChild(this.createDeleteButton());
            this.li.appendChild(buttonContainer);
            var keywordsDiv = document.createElement('DIV');
            keywordsDiv.className = 'keywords';
            var keywords = new Array();
            console.log("words.length=" + String(this.group.words.length));
            for (var i = 0, l = this.group.words.length; i < l; i++) {
                var keywordSpan = document.createElement('SPAN');
                keywordSpan.className = (this.group.words[i].is_regexp) ? "keyword keyword--regex" : "keyword keyword--normal";
                keywordSpan.innerHTML = this.group.words[i].word;
                keywordsDiv.appendChild(keywordSpan);
                keywordsDiv.appendChild(document.createTextNode(" "));
            }
            this.li.appendChild(keywordsDiv);
        }
        return this.li;
    };
    WordGroupWrapper.prototype.createSelectButton = function () {
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonEdit';
        button.value = chrome.i18n.getMessage('buttonLabelEdit');
        return button;
    };
    WordGroupWrapper.prototype.createDeleteButton = function () {
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonDelete';
        button.value = chrome.i18n.getMessage('buttonLabelDelete');
        return button;
    };
    return WordGroupWrapper;
}());
window.onload = initWordGroup;
//# sourceMappingURL=word_group.js.map