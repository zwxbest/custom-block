var WordEditor = (function () {
    function WordEditor() {
        var addWordButton = document.getElementById('rule_editor_add_keyword_button');
        addWordButton.addEventListener('click', this.getAddWordAction(), true);
        document.getElementById('rule_editor_keyword').addEventListener('keydown', this.getAddWordByEnterAction(), true);
        WordEditor.changeKeywordColor(null);
        document.getElementById('rule_editor_keyword_complete_matching_checkbox').addEventListener('click', WordEditor.changeKeywordColor, false);
    }
    WordEditor.prototype.getWordElement = function (word) {
        var span = document.createElement('SPAN');
        var suffix = word.is_complete_matching ? 'red' : 'blue';
        if (word.is_regexp) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_regexp", suffix, "regex"));
        }
        if (word.is_case_sensitive) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_case_sensitive", suffix, "case_sensitive"));
        }
        if (word.is_include_href) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_include_href", suffix, "include_href"));
        }
        span.innerHTML += CustomBlockerUtil.    escapeHTML(word.word);
        span.className = 'word '
            + ((word.is_complete_matching) ? 'complete_matching' : 'not_complete_matching');
        var deleteButton = CustomBlockerUtil.createDeleteButton();
        deleteButton.addEventListener('click', this.getDeleteWordAction(word, span), true);
        span.appendChild(deleteButton);
        return span;
    };
    WordEditor.prototype.setWords = function (words) {
        document.getElementById('rule_editor_keywords').innerHTML = '';
        for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
            var word = words_1[_i];
            document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(word));
        }
    };
    WordEditor.prototype.getDeleteWordAction = function (word, span) {
        var self = this;
        return function () {
            span.parentNode.removeChild(span);
            if (self.deleteWordHandler) {
                self.deleteWordHandler(word);
            }
            else {
                console.warn("deleteWordHandler is null.");
            }
        };
    };
    WordEditor.prototype.getAddWordByEnterAction = function () {
        var self = this;
        return function (event) {
            if (13 == event.keyCode) {
                self.addWord();
            }
        };
    };
    WordEditor.prototype.getAddWordAction = function () {
        var self = this;
        return function () {
            self.addWord();
        };
    };
    WordEditor.prototype.addWord = function () {
        var self = this;
        var str = document.getElementById('rule_editor_keyword').value;
        if (!str || '' == str) {
            return;
        }
        var word = cbStorage.createWord();
        word.word = str;
        word.is_regexp =
            document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
        word.is_complete_matching =
            document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked;
        word.is_case_sensitive =
            document.getElementById('rule_editor_keyword_case_sensitive_checkbox').checked;
        word.is_include_href =
            document.getElementById('rule_editor_keyword_include_href_checkbox').checked;
        if (this.addWordHandler) {
            this.addWordHandler(word);
        }
        else {
            console.warn("addWordHandler is null.");
        }
        document.getElementById('rule_editor_keywords').appendChild(self.getWordElement(word));
        document.getElementById('rule_editor_keyword').value = '';
    };
    WordEditor.changeKeywordColor = function (sender) {
        document.getElementById('rule_editor_keyword').style.backgroundColor =
            (document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked) ? '#fed3de!important' : '#cdedf8!important';
    };
    return WordEditor;
}());
//# sourceMappingURL=word_editor.js.map