var WordGroupPicker = (function () {
    function WordGroupPicker(select) {
        var _this = this;
        this.select = select;
        var scope = this;
        this.select.addEventListener("change", function () {
            var index = _this.select.selectedIndex;
            if (index > 0) {
                var group = scope.selectableGroups[index - 1];
                scope.onSelectGroup(group);
            }
        });
    }
    WordGroupPicker.prototype.refresh = function () {
        this.select.innerHTML = "";
        var emptyOption = document.createElement("OPTION");
        emptyOption.innerHTML = "----";
        this.select.appendChild(emptyOption);
        if (!this.groups)
            return;
        this.selectableGroups = [];
        for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
            var group = _a[_i];
            var contains = false;
            if (this.rule) {
                for (var _b = 0, _c = this.rule.wordGroups; _b < _c.length; _b++) {
                    var selectedGroup = _c[_b];
                    if (selectedGroup.global_identifier == group.global_identifier) {
                        contains = true;
                        break;
                    }
                }
            }
            if (!contains) {
                var option = document.createElement("option");
                option.innerHTML = group.name;
                this.selectableGroups.push(group);
                this.select.appendChild(option);
            }
        }
        this.select.selectedIndex = 0;
    };
    WordGroupPicker.prototype.setGroups = function (groups) {
        this.groups = groups;
    };
    WordGroupPicker.prototype.setRule = function (rule) {
        this.rule = rule;
    };
    return WordGroupPicker;
}());
//# sourceMappingURL=word_group_picker.js.map