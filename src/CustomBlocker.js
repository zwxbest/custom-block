function getCustomBlockerSrcPath() {
    var scripts = document.getElementsByTagName("script");
    var rx = new RegExp("(.*\/)CustomBlocker\.js");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var path = scripts[i].getAttribute("src");
        if (path && path.match(rx)) {
            return [RegExp.$1, scripts[i].parentElement];
        }
    }
}
(function () {
    var scriptPath = getCustomBlockerSrcPath();
    var files = [
        "rule/Storage.js", "rule/Rule.js", "rule/Word.js", "rule/WordGroup.js", "util.js", "uuid.js"
    ];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var path = scriptPath[0] + file;
        var tag = document.createElement("SCRIPT");
        tag.setAttribute("src", path);
        tag.setAttribute("type", "text/javascript");
        tag.setAttribute("extension", "CustomBlocker");
        scriptPath[1].appendChild(tag);
    }
})();
//# sourceMappingURL=CustomBlocker.js.map