var eachWords = function (rule, func) {
    for (var _i = 0, _a = rule.words; _i < _a.length; _i++) {
        var word = _a[_i];
        func(word);
    }
    for (var _b = 0, _c = rule.wordGroups; _b < _c.length; _b++) {
        var group = _c[_b];
        for (var _d = 0, _e = group.words; _d < _e.length; _d++) {
            var word = _e[_d];
            func(word);
        }
    }
};
//# sourceMappingURL=Rule.js.map