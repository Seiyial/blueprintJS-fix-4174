import * as React from "react";
import { AbstractPureComponent2 } from "../../common";
import { IIntentProps, IProps } from "../../common/props";
export interface ITextAreaProps extends IIntentProps, IProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Whether the text area should take up the full width of its container.
     */
    fill?: boolean;
    /**
     * Whether the text area should appear with large styling.
     */
    large?: boolean;
    /**
     * Whether the text area should appear with small styling.
     */
    small?: boolean;
    /**
     * Whether the text area should automatically grow vertically to accomodate content.
     */
    growVertically?: boolean;
    /**
     * Ref handler that receives HTML `<textarea>` element backing this component.
     */
    inputRef?: (ref: HTMLTextAreaElement | null) => any;
}
export interface ITextAreaState {
    height?: number;
}
export declare class TextArea extends AbstractPureComponent2<ITextAreaProps, ITextAreaState> {
    static displayName: string;
    state: ITextAreaState;
    private internalTextAreaRef;
    componentDidMount(): void;
    render(): JSX.Element;
    private handleChange;
    private handleInternalRef;
}
