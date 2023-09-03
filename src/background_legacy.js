function createRuleTable() {
    console.log("createRuleTable");
    LegacyRulePeer.getInstance().createTable(function () {
        LegacyWordPeer.getInstance().createTable(loadLists);
    });
}
function loadLists() {
    cbStorage.loadAll(function (rules, groups) {
        ruleList = rules;
        loadSmartRuleEditorSrc();
    });
}
function syncAll(rulesToSync, callback) {
    if (rulesToSync.length == 0) {
        console.log("Snyc done.");
        callback();
    }
    else {
        var scope_1 = this;
        var rule = rulesToSync.pop();
        var obj = {};
        var storage = cbStorage;
        var json = storage.convertRuleToJSON(rule);
        json["merge"] = true;
        obj[storage.getRuleJSONKey(rule)] = json;
        chrome.storage.sync.set(obj, function () {
            scope_1.syncAll(rulesToSync, callback);
        });
    }
}
function migrateToChromeSync(onMingrationDone) {
    cbStorage.getDeviceId(function (deviceId) {
        LegacyRulePeer.getInstance().loadAll(function (rules) {
            var rulesToSync = [];
            for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
                var rule = rules_1[_i];
                if (!rule.global_identifier || rule.global_identifier == "") {
                    rule.global_identifier = UUID.generate();
                    console.log("Rule has no UUID. Generated. " + rule.global_identifier);
                }
                var ruleObj = rule.getRule();
                ruleObj.updaterId = deviceId;
                rulesToSync.push(ruleObj);
            }
            syncAll(rulesToSync, onMingrationDone);
        });
    });
}
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.local.set({ migrationDone: true }, function () {
            console.log("Migration flag set.");
        });
    }
    else if (details.reason == "update") {
        console.log("DATA MIGRATION NEEDED? Checking...");
        chrome.storage.local.get(["migrationDone"], function (result) {
            if (!result["migrationDone"]) {
                console.log("Migration flag is empty. Start migration...");
                migrateToChromeSync(function () {
                    console.log("Migration done.");
                    chrome.storage.local.set({ migrationDone: true }, function () {
                        console.log("Migration flag set.");
                    });
                });
            }
        });
    }
});
function manualDataMigration() {
    console.log("manualDataMigration");
    migrateToChromeSync(function () {
        console.log("Migration done.");
        chrome.storage.local.set({ migrationDone: true }, function () {
            console.log("Migration flag set.");
        });
    });
}
//# sourceMappingURL=background_legacy.js.map