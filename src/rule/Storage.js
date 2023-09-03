var CustomBlockerStorage = (function () {
    function CustomBlockerStorage() {
        this.deviceId = null;
    }
    CustomBlockerStorage.prototype.createRule = function () {
        return {
            dirty: false,
            isNew: false,
            deleted: false,
            insert_date: 0,
            update_date: 0,
            delete_date: 0,
            updaterId: null,
            words: [],
            wordGroups: [],
            hideNodes: [],
            searchNodes: [],
            hiddenCount: 0,
            staticXpath: null,
            appliedWords: [],
            appliedWordsMap: null,
            is_disabled: false,
            rule_id: 0,
            user_identifier: null,
            global_identifier: null,
            title: null,
            url: null,
            site_regexp: null,
            example_url: null,
            search_block_css: null,
            search_block_xpath: null,
            search_block_by_css: true,
            hide_block_css: null,
            hide_block_xpath: null,
            hide_block_by_css: true,
            block_anyway: false,
            specify_url_by_regexp: false,
            existing: false
        };
    };
    CustomBlockerStorage.prototype.createWord = function () {
        return {
            word_id: 0,
            rule_id: 0,
            word: null,
            newWord: null,
            is_regexp: false,
            is_complete_matching: false,
            is_case_sensitive: false,
            is_include_href: false,
            dirty: false,
            isNew: false,
            deleted: false,
            insert_date: 0,
            update_date: 0,
            delete_date: 0,
            regExp: null,
            label: null,
            checkedNodes: []
        };
    };
    CustomBlockerStorage.prototype.createWordGroup = function () {
        return {
            name: null,
            global_identifier: null,
            updaterId: null,
            words: []
        };
    };
    CustomBlockerStorage.prototype.loadAll = function (callback) {
        var scope = this;
        chrome.storage.sync.get(null, function (allObj) {
            console.log(allObj);
            var rules = [];
            var groups = [];
            var groupMap = [];
            for (var key in allObj) {
                if (key.indexOf("G-") == 0) {
                    var group = cbStorage.createWordGroup();
                    scope.initWordGroupByJSON(group, allObj[key]);
                    groupMap[group.global_identifier] = group;
                    groups.push(group);
                }
            }
            for (var key in allObj) {
                if (key.indexOf("R-") == 0) {
                    var rule = cbStorage.createRule();
                    scope.initRuleByJSON(rule, allObj[key], groupMap);
                    rules.push(rule);
                }
            }
            scope.getDisabledRuleIDList(function (ids) {
                for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                    var rule = rules_1[_i];
                    for (var _a = 0, ids_1 = ids; _a < ids_1.length; _a++) {
                        var ruleId = ids_1[_a];
                        if (rule.global_identifier == ruleId) {
                            rule.is_disabled = true;
                            break;
                        }
                    }
                }
                callback(rules, groups);
            }, false);
        });
    };
    CustomBlockerStorage.prototype.getDisabledRuleIDList = function (callback, useCache) {
        if (this.disabledRuleIDList && useCache) {
            callback(this.disabledRuleIDList);
            return;
        }
        var scope = this;
        chrome.storage.local.get(["disabledRules"], function (result) {
            if (result["disabledRules"]) {
                scope.disabledRuleIDList = result["disabledRules"];
            }
            else {
                scope.disabledRuleIDList = [];
            }
            callback(scope.disabledRuleIDList);
        });
    };
    CustomBlockerStorage.prototype.disableRule = function (rule, callback) {
        var scope = this;
        rule.is_disabled = true;
        this.getDisabledRuleIDList(function (ids) {
            scope.disabledRuleIDList.push(rule.global_identifier);
            console.log("disableRule ids=");
            console.log(scope.disabledRuleIDList);
            chrome.storage.local.set({ disabledRules: scope.disabledRuleIDList }, function () {
                chrome.extension.getBackgroundPage().reloadLists();
                callback();
            });
        }, true);
    };
    CustomBlockerStorage.prototype.enableRule = function (rule, callback) {
        var scope = this;
        rule.is_disabled = false;
        this.getDisabledRuleIDList(function (ids) {
            for (var i = scope.disabledRuleIDList.length - 1; i >= 0; i--) {
                if (scope.disabledRuleIDList[i] === rule.global_identifier) {
                    scope.disabledRuleIDList.splice(i, 1);
                    break;
                }
            }
            console.log("enableRule ids=");
            console.log(scope.disabledRuleIDList);
            chrome.storage.local.set({ disabledRules: scope.disabledRuleIDList }, function () {
                chrome.extension.getBackgroundPage().reloadLists();
                callback();
            });
        }, true);
    };
    CustomBlockerStorage.prototype.toggleRule = function (rule, callback) {
        if (rule.is_disabled) {
            this.enableRule(rule, callback);
        }
        else {
            this.disableRule(rule, callback);
        }
    };
    CustomBlockerStorage.prototype.saveRule = function (rule, callback) {
        if (CustomBlockerUtil.isEmpty(rule.global_identifier)) {
            rule.global_identifier = UUID.generate();
            console.log("UUID is generated. " + rule.global_identifier);
        }
        var scope = this;
        this.getDeviceId(function (deviceId) {
            var obj = {};
            rule.updaterId = deviceId;
            var jsonObj = scope.convertRuleToJSON(rule);
            console.log(document.getElementById('rule_editor_save_merge_checkbox'));
            if (document.getElementById('rule_editor_save_merge_checkbox') && document.getElementById('rule_editor_save_merge_checkbox').checked) {
                console.log("rule is checked!");
                jsonObj["merge"] = true;
            }
            obj[scope.getRuleJSONKey(rule)] = jsonObj;
            chrome.storage.sync.set(obj, function () {
                console.log("Saved rule.");
                if (callback) {
                    callback();
                }
            });
        });
    };
    CustomBlockerStorage.prototype.saveWordGroup = function (group, callback) {
        if (CustomBlockerUtil.isEmpty(group.global_identifier)) {
            group.global_identifier = UUID.generate();
            console.log("UUID is generated. " + group.global_identifier);
        }
        var scope = this;
        this.getDeviceId(function (deviceId) {
            group.updaterId = deviceId;
            var jsonObj = scope.convertWordGroupToJSON(group);
            console.log(jsonObj);
            var obj = {};
            obj[scope.getWordGroupJSONKey(group)] = jsonObj;
            chrome.storage.sync.set(obj, function () {
                console.log("Saved rule.");
                if (callback) {
                    callback();
                }
            });
        });
    };
    CustomBlockerStorage.prototype.deleteWordGroup = function (group, callback) {
        console.log("deleteWordGroup " + this.getWordGroupJSONKey(group));
        chrome.storage.sync.remove(this.getWordGroupJSONKey(group), function () {
            if (callback) {
                callback();
            }
        });
    };
    CustomBlockerStorage.createWordInstance = function (url, title) {
        var rule = cbStorage.createRule();
        rule.title = title;
        rule.site_regexp = url;
        rule.example_url = url;
        return rule;
    };
    CustomBlockerStorage.prototype.deleteRule = function (rule, callback) {
        chrome.storage.sync.remove(this.getRuleJSONKey(rule), function () {
            console.log("Deleted rule.");
            if (callback) {
                callback();
            }
        });
    };
    CustomBlockerStorage.prototype.addWordToRule = function (rule, word) {
        rule.words.push(word);
    };
    CustomBlockerStorage.prototype.removeWordFromRule = function (group, word) {
        var wordIndex = group.words.indexOf(word);
        if (wordIndex >= 0) {
            group.words.splice(wordIndex, 1);
        }
    };
    CustomBlockerStorage.prototype.addWordToWordGroup = function (group, word) {
        group.words.push(word);
    };
    CustomBlockerStorage.prototype.removeWordFromWordGroup = function (group, word) {
        var wordIndex = group.words.indexOf(word);
        if (wordIndex >= 0) {
            group.words.splice(wordIndex, 1);
        }
    };
    CustomBlockerStorage.prototype.getRuleJSONKey = function (rule) {
        return "R-" + rule.global_identifier;
    };
    CustomBlockerStorage.prototype.getWordGroupJSONKey = function (group) {
        return "G-" + group.global_identifier;
    };
    CustomBlockerStorage.prototype.convertRuleToJSON = function (rule) {
        var obj = {};
        for (var _i = 0, _a = CustomBlockerStorage.JSON_RULE_CONVERSION_RULE; _i < _a.length; _i++) {
            var prop = _a[_i];
            obj[prop[1]] = rule[prop[0]];
        }
        obj["w"] = [];
        obj["wg"] = [];
        if (rule.words) {
            for (var _b = 0, _c = rule.words; _b < _c.length; _b++) {
                var word = _c[_b];
                obj["w"].push(this.convertWordToJSON(word));
            }
        }
        if (rule.wordGroups) {
            for (var _d = 0, _e = rule.wordGroups; _d < _e.length; _d++) {
                var group = _e[_d];
                obj["wg"].push(group.global_identifier);
            }
        }
        console.log(obj);
        return obj;
    };
    CustomBlockerStorage.prototype.convertWordGroupToJSON = function (group) {
        var obj = {};
        for (var _i = 0, _a = CustomBlockerStorage.JSON_WORD_GROUP_CONVERSION_RULE; _i < _a.length; _i++) {
            var prop = _a[_i];
            obj[prop[1]] = group[prop[0]];
        }
        obj["w"] = [];
        for (var _b = 0, _c = group.words; _b < _c.length; _b++) {
            var word = _c[_b];
            obj["w"].push(this.convertWordToJSON(word));
        }
        return obj;
    };
    CustomBlockerStorage.prototype.convertWordToJSON = function (word) {
        var flags = [];
        if (word.is_regexp) {
            flags.push(CustomBlockerStorage.JSON_WORD_FLAG_REGEXP);
        }
        if (word.is_complete_matching) {
            flags.push(CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING);
        }
        if (word.is_case_sensitive) {
            flags.push(CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE);
        }
        if (word.is_include_href) {
            flags.push(CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF);
        }
        if (flags.length > 0) {
            var obj = {};
            obj["w"] = word.word;
            obj["f"] = flags;
            return obj;
        }
        else {
            return word.word;
        }
    };
    CustomBlockerStorage.prototype.initRuleByJSON = function (rule, json, groupMap) {
        for (var _i = 0, _a = CustomBlockerStorage.JSON_RULE_CONVERSION_RULE; _i < _a.length; _i++) {
            var prop = _a[_i];
            rule[prop[0]] = json[prop[1]];
        }
        rule.words = [];
        rule.wordGroups = [];
        var words = json["w"];
        if (words) {
            for (var _b = 0, words_1 = words; _b < words_1.length; _b++) {
                var word = words_1[_b];
                var wordObj = this.createWord();
                this.initWordByJSON(wordObj, word);
                rule.words.push(wordObj);
            }
        }
        var wordGroups = json["wg"];
        if (wordGroups) {
            for (var _c = 0, wordGroups_1 = wordGroups; _c < wordGroups_1.length; _c++) {
                var group = wordGroups_1[_c];
                if (groupMap[group]) {
                    rule.wordGroups.push(groupMap[group]);
                }
                else {
                    console.log("WordGroup not found for ID:" + group);
                }
            }
        }
        return rule;
    };
    CustomBlockerStorage.prototype.initWordGroupByJSON = function (group, json) {
        for (var _i = 0, _a = CustomBlockerStorage.JSON_WORD_GROUP_CONVERSION_RULE; _i < _a.length; _i++) {
            var prop = _a[_i];
            group[prop[0]] = json[prop[1]];
        }
        group.words = [];
        var words = json["w"];
        for (var _b = 0, words_2 = words; _b < words_2.length; _b++) {
            var word = words_2[_b];
            var wordObj = this.createWord();
            this.initWordByJSON(wordObj, word);
            group.words.push(wordObj);
        }
        return group;
    };
    CustomBlockerStorage.prototype.initWordByJSON = function (word, obj) {
        if (typeof (obj) == "string") {
            word.word = obj;
        }
        else {
            var jsonObj = obj;
            word.word = jsonObj["w"];
            if (jsonObj["f"]) {
                var flags = jsonObj["f"];
                for (var _i = 0, flags_1 = flags; _i < flags_1.length; _i++) {
                    var flagNum = flags_1[_i];
                    if (flagNum == CustomBlockerStorage.JSON_WORD_FLAG_REGEXP) {
                        word.is_regexp = true;
                    }
                    if (flagNum == CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING) {
                        word.is_complete_matching = true;
                    }
                    if (flagNum == CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE) {
                        word.is_case_sensitive = true;
                    }
                    if (flagNum == CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF) {
                        word.is_include_href = true;
                    }
                }
            }
        }
    };
    CustomBlockerStorage.prototype.validateRule = function (params) {
        var errors = [];
        if ('' == params.title)
            errors.push(chrome.i18n.getMessage('errorTitleEmpty'));
        if ('' == params.site_regexp)
            errors.push(chrome.i18n.getMessage('errorSiteRegexEmpty'));
        if ('' != params.search_block_xpath) {
            try {
                CustomBlockerUtil.getElementsByXPath(params.search_block_xpath);
            }
            catch (e) {
                errors.push(chrome.i18n.getMessage('errorHideXpathInvalid'));
            }
        }
        if ('' != params.hide_block_xpath) {
            try {
                CustomBlockerUtil.getElementsByXPath(params.hide_block_xpath);
            }
            catch (e) {
                errors.push(chrome.i18n.getMessage('errorSearchXpathInvalid'));
            }
        }
        return errors;
    };
    CustomBlockerStorage.prototype.mergeRules = function (localObj, remoteObj) {
        var remoteWords = remoteObj["w"];
        var localWords = localObj["w"];
        for (var _i = 0, remoteWords_1 = remoteWords; _i < remoteWords_1.length; _i++) {
            var remoteWord = remoteWords_1[_i];
            var duplicate = false;
            for (var _a = 0, localWords_1 = localWords; _a < localWords_1.length; _a++) {
                var localWord = localWords_1[_a];
                if (JSON.stringify(localWord) == JSON.stringify(remoteWord)) {
                    duplicate = true;
                }
            }
            if (!duplicate) {
                localObj["w"].push(remoteWord);
            }
        }
        return localObj;
    };
    CustomBlockerStorage.prototype.syncRule = function (deviceId, key, oldValue, newValue, onLocalChange) {
        console.log("Key=%s", key);
        console.log(oldValue);
        console.log(newValue);
        if (newValue && newValue["ui"] == deviceId) {
            console.log("Local change.");
            onLocalChange();
            return;
        }
        if (newValue == null) {
        }
        else if (oldValue == null) {
        }
        else {
            if (newValue["merge"]) {
                var merged = this.mergeRules(oldValue, newValue);
                merged["ui"] = deviceId;
                var obj = {};
                obj[key] = merged;
                chrome.storage.sync.set(obj, function () {
                    console.log("Merged rule was saved.");
                });
            }
        }
    };
    CustomBlockerStorage.prototype.sync = function (changes, namespace, onLocalChange) {
        console.log("Syncing namespace %s", namespace);
        var scope = this;
        this.getDeviceId(function (deviceId) {
            for (var key in changes) {
                var change = changes[key];
                if (key == "disabledRules") {
                    if (onLocalChange) {
                        onLocalChange();
                    }
                }
                else {
                    scope.syncRule(deviceId, key, change.oldValue, change.newValue, onLocalChange);
                }
            }
        });
    };
    CustomBlockerStorage.prototype.getDeviceId = function (callback) {
        if (this.deviceId) {
            callback(this.deviceId);
            return;
        }
        var scope = this;
        chrome.storage.local.get(["deviceId"], function (result) {
            if (result["deviceId"]) {
                scope.deviceId = result["deviceId"];
                callback(scope.deviceId);
                return;
            }
            scope.deviceId = UUID.generate();
            chrome.storage.local.set({ deviceId: scope.deviceId }, function () {
                callback(scope.deviceId);
            });
        });
    };
    CustomBlockerStorage.init = function () {
        CustomBlockerStorage.JSON_RULE_CONVERSION_RULE = [
            ["global_identifier", "g"],
            ["title", "t"],
            ["url", "uu"],
            ["specify_url_by_regexp", "ur"],
            ["site_regexp", "ux"],
            ["example_url", "ue"],
            ["search_block_css", "sc"],
            ["search_block_xpath", "sx"],
            ["search_block_by_css", "st"],
            ["hide_block_css", "hc"],
            ["hide_block_xpath", "hx"],
            ["hide_block_by_css", "ht"],
            ["insert_date", "di"],
            ["update_date", "du"],
            ["updaterId", "ui"],
            ["block_anyway", "b"]
        ];
        CustomBlockerStorage.JSON_WORD_GROUP_CONVERSION_RULE = [
            ["global_identifier", "g"],
            ["name", "n"]
        ];
        CustomBlockerStorage.JSON_WORD_FLAG_REGEXP = 1;
        CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING = 2;
        CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE = 3;
        CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF = 4;
    };
    return CustomBlockerStorage;
}());
CustomBlockerStorage.init();
var cbStorage = new CustomBlockerStorage();
//# sourceMappingURL=Storage.js.map