import React, { useState, useRef, useEffect, useCallback, Dispatch } from 'react'
import Spinner from "./Spinner";

export interface InputDescription {
  type?: string,
  title?: string,
  readonly?: boolean,
  required?: boolean,
  placeholder?: string,
  decimals?: number,
  step?: number,
  icon?: string,
  unit?: string,
  format?: string,
  description?: string,
  reactComponent?: string,
  lookupModel?: string,
  enumValues?: Array<any>,
  enumCssClasses?: Array<any>,
  autocomplete?: { endpoint: string, creatable: boolean },
  predefinedValues?: any,
  endpoint?: any,
  model?: any,
  info?: any,
  invalid?: boolean,
}

export interface InputProps {
  ref?: any,
  uid?: string,
  translationContext?: string,
  translationContextInner?: string,
  inputName?: string,
  inputClassName?: string,
  value?: any,
  origValue?: any,
  changed?: any,
  renderValueElement?: (input: any) => React.JSX.Element,
  renderInputElement?: (input: any) => React.JSX.Element,
  loadData?: () => void,
  onChange?: (input: any, value: any) => void,
  onInit?: (input: any) => void,
  onInlineEditCancel?: () => void,
  onInlineEditSave?: () => void,
  readonly?: boolean,
  invalid?: boolean,
  cssClass?: string,
  cssStyle?: any,
  placeholder?: string,
  isModified?: boolean,
  isInitialized?: boolean,
  isInlineEditing?: boolean,
  context?: any,
  parentForm?: any,
  children?: any,
  description?: InputDescription,
  data: Array<any>,
}

export interface InputHandle extends InputProps {
  setReadonly: Dispatch<any>,
  setInvalid: Dispatch<any>,
  setValue: Dispatch<any>,
  setOrigValue: Dispatch<any>,
  setChanged: Dispatch<any>,
  setCssClass: Dispatch<any>,
  setCssStyle: Dispatch<any>,
  setIsModified: Dispatch<any>,
  setIsInitialized: Dispatch<any>,
  setIsInlineEditing: Dispatch<any>,
  setData: Dispatch<any>,
  setDescription: Dispatch<any>,

  refInputWrapper: any,
  refInputElement: any,
  refValueElement: any,
  refInput: any,
}

const Input = (props: InputProps) => {

  const translate = (orig: string, context?: string, contextInner?: string, vars?: any): string => {
    try {
      return globalThis.hubleto.translate(
        orig,
        context ?? props.translationContext,
        contextInner ?? props.translationContextInner,
        vars
      );
    } catch (e) {
      return orig;
    }
  };

  const [changed, setChanged] = useState(false);
  const [cssClass, setCssClass] = useState(props.cssClass ?? '');
  const [cssStyle, setCssStyle] = useState(props.cssStyle ?? {});
  const [data, setData] = useState(props.data ?? []);
  const [description, setDescription] = useState({} as InputDescription);
  const [inputClassName, setInputClassName] = useState(props.inputClassName ?? '');
  const [inputName, setInputName] = useState(props.inputName ?? '');
  const [invalid, setInvalid] = useState(props.invalid ?? false);
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? false);
  const [isInlineEditing, setIsInlineEditing] = useState(props.isInlineEditing ?? false);
  const [isModified, setIsModified] = useState(props.isModified ?? false); 
  const [origValue, setOrigValue] = useState(props.value ?? null);
  const [readonly, setReadonly] = useState(props.readonly ?? false);
  const [uid, setUid] = useState(props.uid ?? null);
  const [value, setValue] = useState(props.value ?? null);

  const refInputWrapper = useRef(null);
  const refInputElement = useRef(null);
  const refValueElement = useRef(null);
  const refInput = useRef(null);

  useEffect(() => {
    if (props.onInit) {
      props.onInit(_this);
    } else {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    setInvalid(false);
    if (props.onChange) {
      props.onChange(_this, value);
    }
    setChanged(origValue != value);
  }, [value]);

  const getClassName = useCallback((): string => {
    return (
      "hubleto component input"
      + " " + (inputClassName ?? "")
      + " " + (cssClass ?? "")
      + " " + (changed ? 'changed' : '')
      + " " + (invalid ? 'invalid' : '')
      + " " + (readonly ? "readonly" : "")
      + " " + (isInlineEditing ? 'editing' : '')
      + " " + (isModified ? 'modified' : '')
    );
  }, [changed, invalid, readonly, isInlineEditing, isModified]);

  const serialize = useCallback((): string => {
    return value ? value.toString() : '';
  }, []);

  const renderInputElement = (input: any): React.JSX.Element => {
    if (props.renderInputElement) return props.renderInputElement(_this);

    return <input
      type="text"
      value={value ?? ''}
      readOnly={readonly}
      ref={refInput}
    ></input>
  };

  const renderValueElement = (input: any): React.JSX.Element => {
    if (props.renderValueElement) return props.renderValueElement(_this);
    
    if (serialize() == '') return <span className="no-value"></span>;
    else return <span>{serialize()}</span>;
  };

  const _this = {
    changed, setChanged,
    cssClass, setCssClass,
    cssStyle, setCssStyle,
    data, setData,
    description, setDescription,
    inputClassName, setInputClassName,
    invalid, setInvalid,
    isInitialized, setIsInitialized,
    isInlineEditing, setIsInlineEditing,
    isModified, setIsModified,
    origValue, setOrigValue,
    readonly, setReadonly,
    value, setValue,

    onChange: props.onChange,

    renderInputElement,
    renderValueElement
  }

  if (!isInitialized) return <Spinner size="xs" />;

  try {
    return (
      <div
        ref={refInputWrapper}
        className={getClassName()}
        style={cssStyle}
      ><div className="inner border-l border-l-primary border-l-1 pl-0.5">
        {isInlineEditing
          ? <>
            <input
              id={uid}
              name={uid}
              type="hidden"
              value={serialize()}
              style={{width: "100%", fontSize: "0.4em"}}
              className="value bg-light"
              readOnly={true}
            ></input>
            <div ref={refInputElement} className="input-element">
              {renderInputElement(_this)}
              {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
            </div>
          </>
          : <div
            ref={refValueElement}
            className="value-element"
          >
            {renderValueElement(_this)}
            {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
          </div>
        }
      </div></div>
    );
  } catch(e) {
    const errMsg = 'Failed to render input for ' + (description?.title ?? inputName) + '.';
    console.error(errMsg);
    console.error(e);
    return <div className="alert alert-danger">{errMsg} Check console for error log.</div>
  }
};

export default Input;