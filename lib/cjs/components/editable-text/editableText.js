"use strict";
/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableText = void 0;
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var react_lifecycles_compat_1 = require("react-lifecycles-compat");
var common_1 = require("../../common");
var props_1 = require("../../common/props");
var utils_1 = require("../../common/utils");
var compatibility_1 = require("../../compatibility");
var BUFFER_WIDTH_EDGE = 5;
var BUFFER_WIDTH_IE = 30;
var EditableText = /** @class */ (function (_super) {
    tslib_1.__extends(EditableText, _super);
    function EditableText(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            content: function (spanElement) {
                _this.valueElement = spanElement;
            },
            input: function (input) {
                if (input != null) {
                    _this.inputElement = input;
                    // temporary fix for #3882
                    if (!_this.props.alwaysRenderInput) {
                        _this.inputElement.focus();
                    }
                    if (_this.state != null && _this.state.isEditing) {
                        var supportsSelection = inputSupportsSelection(input);
                        if (supportsSelection) {
                            var length_1 = input.value.length;
                            input.setSelectionRange(_this.props.selectAllOnFocus ? 0 : length_1, length_1);
                        }
                        if (!supportsSelection || !_this.props.selectAllOnFocus) {
                            input.scrollLeft = input.scrollWidth;
                        }
                    }
                }
            },
        };
        _this.cancelEditing = function () {
            var _a = _this.state, lastValue = _a.lastValue, value = _a.value;
            _this.setState({ isEditing: false, value: lastValue });
            if (value !== lastValue) {
                utils_1.safeInvoke(_this.props.onChange, lastValue);
            }
            utils_1.safeInvoke(_this.props.onCancel, lastValue);
        };
        _this.toggleEditing = function () {
            if (_this.state.isEditing) {
                var value = _this.state.value;
                _this.setState({ isEditing: false, lastValue: value });
                utils_1.safeInvoke(_this.props.onConfirm, value);
            }
            else if (!_this.props.disabled) {
                _this.setState({ isEditing: true });
            }
        };
        _this.handleFocus = function () {
            var _a = _this.props, alwaysRenderInput = _a.alwaysRenderInput, disabled = _a.disabled, selectAllOnFocus = _a.selectAllOnFocus;
            if (!disabled) {
                _this.setState({ isEditing: true });
            }
            if (alwaysRenderInput && selectAllOnFocus && _this.inputElement != null) {
                var length_2 = _this.inputElement.value.length;
                _this.inputElement.setSelectionRange(0, length_2);
            }
        };
        _this.handleTextChange = function (event) {
            var value = event.target.value;
            // state value should be updated only when uncontrolled
            if (_this.props.value == null) {
                _this.setState({ value: value });
            }
            utils_1.safeInvoke(_this.props.onChange, value);
        };
        _this.handleKeyEvent = function (event) {
            var altKey = event.altKey, ctrlKey = event.ctrlKey, metaKey = event.metaKey, shiftKey = event.shiftKey, which = event.which;
            if (which === common_1.Keys.ESCAPE) {
                _this.cancelEditing();
                return;
            }
            var hasModifierKey = altKey || ctrlKey || metaKey || shiftKey;
            if (which === common_1.Keys.ENTER) {
                // prevent IE11 from full screening with alt + enter
                // shift + enter adds a newline by default
                if (altKey || shiftKey) {
                    event.preventDefault();
                }
                if (_this.props.confirmOnEnterKey && _this.props.multiline) {
                    if (event.target != null && hasModifierKey) {
                        insertAtCaret(event.target, "\n");
                        _this.handleTextChange(event);
                    }
                    else {
                        _this.toggleEditing();
                    }
                }
                else if (!_this.props.multiline || hasModifierKey) {
                    _this.toggleEditing();
                }
            }
        };
        var value = props.value == null ? props.defaultValue : props.value;
        _this.state = {
            inputHeight: 0,
            inputWidth: 0,
            isEditing: props.isEditing === true && props.disabled === false,
            lastValue: value,
            value: value,
        };
        return _this;
    }
    EditableText.prototype.render = function () {
        var _a;
        var _b = this.props, alwaysRenderInput = _b.alwaysRenderInput, disabled = _b.disabled, multiline = _b.multiline;
        var value = this.props.value == null ? this.state.value : this.props.value;
        var hasValue = value != null && value !== "";
        var classes = classnames_1.default(common_1.Classes.EDITABLE_TEXT, common_1.Classes.intentClass(this.props.intent), (_a = {},
            _a[common_1.Classes.DISABLED] = disabled,
            _a[common_1.Classes.EDITABLE_TEXT_EDITING] = this.state.isEditing,
            _a[common_1.Classes.EDITABLE_TEXT_PLACEHOLDER] = !hasValue,
            _a[common_1.Classes.MULTILINE] = multiline,
            _a), this.props.className);
        var contentStyle;
        if (multiline) {
            // set height only in multiline mode when not editing
            // otherwise we're measuring this element to determine appropriate height of text
            contentStyle = { height: !this.state.isEditing ? this.state.inputHeight : null };
        }
        else {
            // minWidth only applies in single line mode (multiline == width 100%)
            contentStyle = {
                height: this.state.inputHeight,
                lineHeight: this.state.inputHeight != null ? this.state.inputHeight + "px" : null,
                minWidth: this.props.minWidth,
            };
        }
        // If we are always rendering an input, then NEVER make the container div focusable.
        // Otherwise, make container div focusable when not editing, so it can still be tabbed
        // to focus (when the input is rendered, it is itself focusable so container div doesn't need to be)
        var tabIndex = alwaysRenderInput || this.state.isEditing || disabled ? null : 0;
        // we need the contents to be rendered while editing so that we can measure their height
        // and size the container element responsively
        var shouldHideContents = alwaysRenderInput && !this.state.isEditing;
        return (React.createElement("div", { className: classes, onFocus: this.handleFocus, tabIndex: tabIndex },
            alwaysRenderInput || this.state.isEditing ? this.renderInput(value) : undefined,
            shouldHideContents ? undefined : (React.createElement("span", { className: common_1.Classes.EDITABLE_TEXT_CONTENT, ref: this.refHandlers.content, style: contentStyle }, hasValue ? value : this.props.placeholder))));
    };
    EditableText.prototype.componentDidMount = function () {
        this.updateInputDimensions();
    };
    EditableText.prototype.componentDidUpdate = function (prevProps, prevState) {
        var state = {};
        // allow setting the value to undefined/null in controlled mode
        if (this.props.value !== prevProps.value && (prevProps.value != null || this.props.value != null)) {
            state.value = this.props.value;
        }
        if (this.props.isEditing != null && this.props.isEditing !== prevProps.isEditing) {
            state.isEditing = this.props.isEditing;
        }
        if (this.props.disabled || (this.props.disabled == null && prevProps.disabled)) {
            state.isEditing = false;
        }
        this.setState(state);
        if (this.state.isEditing && !prevState.isEditing) {
            utils_1.safeInvoke(this.props.onEdit, this.state.value);
        }
        this.updateInputDimensions();
    };
    EditableText.prototype.renderInput = function (value) {
        var _a = this.props, maxLength = _a.maxLength, multiline = _a.multiline, type = _a.type, placeholder = _a.placeholder;
        var props = {
            className: common_1.Classes.EDITABLE_TEXT_INPUT,
            maxLength: maxLength,
            onBlur: this.toggleEditing,
            onChange: this.handleTextChange,
            onKeyDown: this.handleKeyEvent,
            placeholder: placeholder,
            value: value,
        };
        var _b = this.state, inputHeight = _b.inputHeight, inputWidth = _b.inputWidth;
        if (inputHeight !== 0 && inputWidth !== 0) {
            props.style = {
                height: inputHeight,
                lineHeight: !multiline && inputHeight != null ? inputHeight + "px" : null,
                width: multiline ? "100%" : inputWidth,
            };
        }
        return multiline ? (React.createElement("textarea", tslib_1.__assign({ ref: this.refHandlers.input }, props))) : (React.createElement("input", tslib_1.__assign({ ref: this.refHandlers.input, type: type }, props)));
    };
    EditableText.prototype.updateInputDimensions = function () {
        if (this.valueElement != null) {
            var _a = this.props, maxLines = _a.maxLines, minLines = _a.minLines, minWidth = _a.minWidth, multiline = _a.multiline;
            var _b = this.valueElement, parentElement_1 = _b.parentElement, textContent = _b.textContent;
            var _c = this.valueElement, scrollHeight_1 = _c.scrollHeight, scrollWidth = _c.scrollWidth;
            var lineHeight = getLineHeight(this.valueElement);
            // add one line to computed <span> height if text ends in newline
            // because <span> collapses that trailing whitespace but <textarea> shows it
            if (multiline && this.state.isEditing && /\n$/.test(textContent)) {
                scrollHeight_1 += lineHeight;
            }
            if (lineHeight > 0) {
                // line height could be 0 if the isNaN block from getLineHeight kicks in
                scrollHeight_1 = utils_1.clamp(scrollHeight_1, minLines * lineHeight, maxLines * lineHeight);
            }
            // Chrome's input caret height misaligns text so the line-height must be larger than font-size.
            // The computed scrollHeight must also account for a larger inherited line-height from the parent.
            scrollHeight_1 = Math.max(scrollHeight_1, getFontSize(this.valueElement) + 1, getLineHeight(parentElement_1));
            // IE11 & Edge needs a small buffer so text does not shift prior to resizing
            if (compatibility_1.Browser.isEdge()) {
                scrollWidth += BUFFER_WIDTH_EDGE;
            }
            else if (compatibility_1.Browser.isInternetExplorer()) {
                scrollWidth += BUFFER_WIDTH_IE;
            }
            this.setState({
                inputHeight: scrollHeight_1,
                inputWidth: Math.max(scrollWidth, minWidth),
            });
            // synchronizes the ::before pseudo-element's height while editing for Chrome 53
            if (multiline && this.state.isEditing) {
                this.setTimeout(function () { return (parentElement_1.style.height = scrollHeight_1 + "px"); });
            }
        }
    };
    EditableText.displayName = props_1.DISPLAYNAME_PREFIX + ".EditableText";
    EditableText.defaultProps = {
        alwaysRenderInput: false,
        confirmOnEnterKey: false,
        defaultValue: "",
        disabled: false,
        maxLines: Infinity,
        minLines: 1,
        minWidth: 80,
        multiline: false,
        placeholder: "Click to Edit",
        type: "text",
    };
    EditableText = tslib_1.__decorate([
        react_lifecycles_compat_1.polyfill
    ], EditableText);
    return EditableText;
}(common_1.AbstractPureComponent2));
exports.EditableText = EditableText;
function getFontSize(element) {
    var fontSize = getComputedStyle(element).fontSize;
    return fontSize === "" ? 0 : parseInt(fontSize.slice(0, -2), 10);
}
function getLineHeight(element) {
    // getComputedStyle() => 18.0001px => 18
    var lineHeight = parseInt(getComputedStyle(element).lineHeight.slice(0, -2), 10);
    // this check will be true if line-height is a keyword like "normal"
    if (isNaN(lineHeight)) {
        // @see http://stackoverflow.com/a/18430767/6342931
        var line = document.createElement("span");
        line.innerHTML = "<br>";
        element.appendChild(line);
        var singleLineHeight = element.offsetHeight;
        line.innerHTML = "<br><br>";
        var doubleLineHeight = element.offsetHeight;
        element.removeChild(line);
        // this can return 0 in edge cases
        lineHeight = doubleLineHeight - singleLineHeight;
    }
    return lineHeight;
}
function insertAtCaret(el, text) {
    var selectionEnd = el.selectionEnd, selectionStart = el.selectionStart, value = el.value;
    if (selectionStart >= 0) {
        var before_1 = value.substring(0, selectionStart);
        var after_1 = value.substring(selectionEnd, value.length);
        var len = text.length;
        el.value = "" + before_1 + text + after_1;
        el.selectionStart = selectionStart + len;
        el.selectionEnd = selectionStart + len;
    }
}
function inputSupportsSelection(input) {
    switch (input.type) {
        // HTMLTextAreaElement
        case "textarea":
            return true;
        // HTMLInputElement
        // see https://html.spec.whatwg.org/multipage/input.html#do-not-apply
        case "text":
        case "search":
        case "tel":
        case "url":
        case "password":
            return true;
        default:
            return false;
    }
}
//# sourceMappingURL=editableText.js.map