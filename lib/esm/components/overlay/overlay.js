/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
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
import { __assign, __decorate, __extends } from "tslib";
import classNames from "classnames";
import * as React from "react";
import { polyfill } from "react-lifecycles-compat";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { findDOMNode } from "react-dom";
import { AbstractPureComponent2, Classes, Keys } from "../../common";
import { DISPLAYNAME_PREFIX } from "../../common/props";
import { safeInvoke } from "../../common/utils";
import { Portal } from "../portal/portal";
var Overlay = /** @class */ (function (_super) {
    __extends(Overlay, _super);
    function Overlay(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            container: function (ref) { return (_this.containerElement = findDOMNode(ref)); },
        };
        _this.maybeRenderChild = function (child) {
            if (child == null) {
                return null;
            }
            // add a special class to each child element that will automatically set the appropriate
            // CSS position mode under the hood. also, make the container focusable so we can
            // trap focus inside it (via `enforceFocus`).
            var decoratedChild = typeof child === "object" ? (React.cloneElement(child, {
                className: classNames(child.props.className, Classes.OVERLAY_CONTENT),
                tabIndex: 0,
            })) : (React.createElement("span", { className: Classes.OVERLAY_CONTENT }, child));
            var _a = _this.props, onOpening = _a.onOpening, onOpened = _a.onOpened, onClosing = _a.onClosing, onClosed = _a.onClosed, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
            // a breaking change in react-transition-group types requires us to be explicit about the type overload here,
            // using a technique similar to Select.ofType() in @blueprintjs/select
            var CSSTransitionImplicit = CSSTransition;
            return (React.createElement(CSSTransitionImplicit, { classNames: transitionName, onEntering: onOpening, onEntered: onOpened, onExiting: onClosing, onExited: onClosed, timeout: transitionDuration }, decoratedChild));
        };
        _this.handleBackdropMouseDown = function (e) {
            var _a = _this.props, backdropProps = _a.backdropProps, canOutsideClickClose = _a.canOutsideClickClose, enforceFocus = _a.enforceFocus, onClose = _a.onClose;
            if (canOutsideClickClose) {
                safeInvoke(onClose, e);
            }
            if (enforceFocus) {
                // make sure document.activeElement is updated before bringing the focus back
                _this.bringFocusInsideOverlay();
            }
            safeInvoke(backdropProps.onMouseDown, e);
        };
        _this.handleDocumentClick = function (e) {
            var _a = _this.props, canOutsideClickClose = _a.canOutsideClickClose, isOpen = _a.isOpen, onClose = _a.onClose;
            var eventTarget = e.target;
            var stackIndex = Overlay_1.openStack.indexOf(_this);
            var isClickInThisOverlayOrDescendant = Overlay_1.openStack
                .slice(stackIndex)
                .some(function (_a) {
                var elem = _a.containerElement;
                // `elem` is the container of backdrop & content, so clicking on that container
                // should not count as being "inside" the overlay.
                return elem && elem.contains(eventTarget) && !elem.isSameNode(eventTarget);
            });
            if (isOpen && canOutsideClickClose && !isClickInThisOverlayOrDescendant) {
                // casting to any because this is a native event
                safeInvoke(onClose, e);
            }
        };
        _this.handleDocumentFocus = function (e) {
            if (_this.props.enforceFocus &&
                _this.containerElement != null &&
                e.target instanceof Node &&
                !_this.containerElement.contains(e.target)) {
                // prevent default focus behavior (sometimes auto-scrolls the page)
                e.preventDefault();
                e.stopImmediatePropagation();
                _this.bringFocusInsideOverlay();
            }
        };
        _this.handleKeyDown = function (e) {
            var _a = _this.props, canEscapeKeyClose = _a.canEscapeKeyClose, onClose = _a.onClose;
            if (e.which === Keys.ESCAPE && canEscapeKeyClose) {
                safeInvoke(onClose, e);
                // prevent browser-specific escape key behavior (Safari exits fullscreen)
                e.preventDefault();
            }
        };
        _this.state = { hasEverOpened: props.isOpen };
        return _this;
    }
    Overlay_1 = Overlay;
    Overlay.getDerivedStateFromProps = function (_a) {
        var hasEverOpened = _a.isOpen;
        if (hasEverOpened) {
            return { hasEverOpened: hasEverOpened };
        }
        return null;
    };
    Overlay.prototype.render = function () {
        var _a;
        // oh snap! no reason to render anything at all if we're being truly lazy
        if (this.props.lazy && !this.state.hasEverOpened) {
            return null;
        }
        var _b = this.props, children = _b.children, className = _b.className, usePortal = _b.usePortal, isOpen = _b.isOpen;
        // TransitionGroup types require single array of children; does not support nested arrays.
        // So we must collapse backdrop and children into one array, and every item must be wrapped in a
        // Transition element (no ReactText allowed).
        var childrenWithTransitions = isOpen ? React.Children.map(children, this.maybeRenderChild) : [];
        childrenWithTransitions.unshift(this.maybeRenderBackdrop());
        var containerClasses = classNames(Classes.OVERLAY, (_a = {},
            _a[Classes.OVERLAY_OPEN] = isOpen,
            _a[Classes.OVERLAY_INLINE] = !usePortal,
            _a), className);
        var transitionGroup = (React.createElement(TransitionGroup, { appear: true, className: containerClasses, component: "div", onKeyDown: this.handleKeyDown, ref: this.refHandlers.container }, childrenWithTransitions));
        if (usePortal) {
            return (React.createElement(Portal, { className: this.props.portalClassName, container: this.props.portalContainer }, transitionGroup));
        }
        else {
            return transitionGroup;
        }
    };
    Overlay.prototype.componentDidMount = function () {
        if (this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.isOpen && !this.props.isOpen) {
            this.overlayWillClose();
        }
        else if (!prevProps.isOpen && this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentWillUnmount = function () {
        this.overlayWillClose();
    };
    /**
     * @public for testing
     * @internal
     */
    Overlay.prototype.bringFocusInsideOverlay = function () {
        var _this = this;
        // always delay focus manipulation to just before repaint to prevent scroll jumping
        return requestAnimationFrame(function () {
            // container ref may be undefined between component mounting and Portal rendering
            // activeElement may be undefined in some rare cases in IE
            if (_this.containerElement == null || document.activeElement == null || !_this.props.isOpen) {
                return;
            }
            var isFocusOutsideModal = !_this.containerElement.contains(document.activeElement);
            if (isFocusOutsideModal) {
                // element marked autofocus has higher priority than the other clowns
                var autofocusElement = _this.containerElement.querySelector("[autofocus]");
                var wrapperElement = _this.containerElement.querySelector("[tabindex]");
                if (autofocusElement != null) {
                    autofocusElement.focus();
                }
                else if (wrapperElement != null) {
                    wrapperElement.focus();
                }
            }
        });
    };
    Overlay.prototype.maybeRenderBackdrop = function () {
        var _a = this.props, backdropClassName = _a.backdropClassName, backdropProps = _a.backdropProps, hasBackdrop = _a.hasBackdrop, isOpen = _a.isOpen, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
        if (hasBackdrop && isOpen) {
            return (React.createElement(CSSTransition, { classNames: transitionName, key: "__backdrop", timeout: transitionDuration },
                React.createElement("div", __assign({}, backdropProps, { className: classNames(Classes.OVERLAY_BACKDROP, backdropClassName, backdropProps.className), onMouseDown: this.handleBackdropMouseDown, tabIndex: this.props.canOutsideClickClose ? 0 : null }))));
        }
        else {
            return null;
        }
    };
    Overlay.prototype.overlayWillClose = function () {
        document.removeEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        document.removeEventListener("mousedown", this.handleDocumentClick);
        var openStack = Overlay_1.openStack;
        var stackIndex = openStack.indexOf(this);
        if (stackIndex !== -1) {
            openStack.splice(stackIndex, 1);
            if (openStack.length > 0) {
                var lastOpenedOverlay = Overlay_1.getLastOpened();
                if (lastOpenedOverlay.props.enforceFocus) {
                    document.addEventListener("focus", lastOpenedOverlay.handleDocumentFocus, /* useCapture */ true);
                }
            }
            if (openStack.filter(function (o) { return o.props.usePortal && o.props.hasBackdrop; }).length === 0) {
                document.body.classList.remove(Classes.OVERLAY_OPEN);
            }
        }
    };
    Overlay.prototype.overlayWillOpen = function () {
        var openStack = Overlay_1.openStack;
        if (openStack.length > 0) {
            document.removeEventListener("focus", Overlay_1.getLastOpened().handleDocumentFocus, /* useCapture */ true);
        }
        openStack.push(this);
        if (this.props.autoFocus) {
            this.bringFocusInsideOverlay();
        }
        if (this.props.enforceFocus) {
            document.addEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        }
        if (this.props.canOutsideClickClose && !this.props.hasBackdrop) {
            document.addEventListener("mousedown", this.handleDocumentClick);
        }
        if (this.props.hasBackdrop && this.props.usePortal) {
            // add a class to the body to prevent scrolling of content below the overlay
            document.body.classList.add(Classes.OVERLAY_OPEN);
        }
    };
    var Overlay_1;
    Overlay.displayName = DISPLAYNAME_PREFIX + ".Overlay";
    Overlay.defaultProps = {
        autoFocus: true,
        backdropProps: {},
        canEscapeKeyClose: true,
        canOutsideClickClose: true,
        enforceFocus: true,
        hasBackdrop: true,
        isOpen: false,
        lazy: true,
        transitionDuration: 300,
        transitionName: Classes.OVERLAY,
        usePortal: true,
    };
    Overlay.openStack = [];
    Overlay.getLastOpened = function () { return Overlay_1.openStack[Overlay_1.openStack.length - 1]; };
    Overlay = Overlay_1 = __decorate([
        polyfill
    ], Overlay);
    return Overlay;
}(AbstractPureComponent2));
export { Overlay };
//# sourceMappingURL=overlay.js.map