/// <reference types="react" />
import { AbstractPureComponent2, IRef } from "../../common";
import { HTMLInputProps, IControlledProps, IIntentProps, IProps, MaybeElement } from "../../common/props";
import { IconName } from "../icon/icon";
export interface IInputGroupProps extends IControlledProps, IIntentProps, IProps {
    /**
     * Whether the input is non-interactive.
     * Note that `rightElement` must be disabled separately; this prop will not affect it.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the component should take up the full width of its container.
     */
    fill?: boolean;
    /** Ref handler or a ref object that receives HTML `<input>` element backing this component. */
    inputRef?: IRef<HTMLInputElement>;
    /**
     * Element to render on the left side of input.  This prop is mutually exclusive
     * with `leftIcon`.
     */
    leftElement?: JSX.Element;
    /**
     * Name of a Blueprint UI icon to render on the left side of the input group,
     * before the user's cursor.  This prop is mutually exclusive with `leftElement`.
     * Usage with content is deprecated.  Use `leftElement` for elements.
     */
    leftIcon?: IconName | MaybeElement;
    /** Whether this input should use large styles. */
    large?: boolean;
    /** Whether this input should use small styles. */
    small?: boolean;
    /** Placeholder text in the absence of any value. */
    placeholder?: string;
    /**
     * Element to render on right side of input.
     * For best results, use a minimal button, tag, or small spinner.
     */
    rightElement?: JSX.Element;
    /** Whether the input (and any buttons) should appear with rounded caps. */
    round?: boolean;
    /**
     * HTML `input` type attribute.
     * @default "text"
     */
    type?: string;
}
export interface IInputGroupState {
    leftElementWidth?: number;
    rightElementWidth?: number;
}
export declare class InputGroup extends AbstractPureComponent2<IInputGroupProps & HTMLInputProps, IInputGroupState> {
    static displayName: string;
    state: IInputGroupState;
    private leftElement;
    private rightElement;
    private refHandlers;
    render(): JSX.Element;
    componentDidMount(): void;
    componentDidUpdate(prevProps: IInputGroupProps & HTMLInputProps): void;
    protected validateProps(props: IInputGroupProps): void;
    private maybeRenderLeftElement;
    private maybeRenderRightElement;
    private updateInputWidth;
}
