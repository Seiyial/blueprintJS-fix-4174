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
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT, CONTEXTMENU_WARN_DECORATOR_NO_METHOD, } from "../../common/errors";
import { getDisplayName, isFunction, safeInvoke } from "../../common/utils";
import { isDarkTheme } from "../../common/utils/isDarkTheme";
import * as ContextMenu from "./contextMenu";
export function ContextMenuTarget(WrappedComponent) {
    var _a;
    if (!isFunction(WrappedComponent.prototype.renderContextMenu)) {
        console.warn(CONTEXTMENU_WARN_DECORATOR_NO_METHOD);
    }
    return _a = class ContextMenuTargetClass extends WrappedComponent {
            render() {
                const element = super.render();
                if (element == null) {
                    // always return `element` in case caller is distinguishing between `null` and `undefined`
                    return element;
                }
                if (!React.isValidElement(element)) {
                    console.warn(CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT);
                    return element;
                }
                const oldOnContextMenu = element.props.onContextMenu;
                const onContextMenu = (e) => {
                    // support nested menus (inner menu target would have called preventDefault())
                    if (e.defaultPrevented) {
                        return;
                    }
                    if (isFunction(this.renderContextMenu)) {
                        const menu = this.renderContextMenu(e);
                        if (menu != null) {
                            const darkTheme = isDarkTheme(ReactDOM.findDOMNode(this));
                            e.preventDefault();
                            ContextMenu.show(menu, { left: e.clientX, top: e.clientY }, this.onContextMenuClose, darkTheme);
                        }
                    }
                    safeInvoke(oldOnContextMenu, e);
                };
                return React.cloneElement(element, { onContextMenu });
            }
        },
        _a.displayName = `ContextMenuTarget(${getDisplayName(WrappedComponent)})`,
        _a;
}
//# sourceMappingURL=contextMenuTarget.js.map