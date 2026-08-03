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
  changeValue?: (input: any, newValue: any) => void,
  valueComponent?: React.JSX.Element,
  inputComponent?: React.JSX.Element,
  serialize?: (input: any) => string,
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

export const InputMetaContext = React.createContext<{
  setReadonly,
  setInvalid,
  setValue,
  setOrigValue,
  setChanged,
  setCssClass,
  setCssStyle,
  setIsModified,
  setIsInitialized,
  setIsInlineEditing,
  setData,
  setDescription,
  refInputWrapper,
  refInputElement,
  refValueElement,
  refInput,
  readonly,
  value,
  changeValue,
  description,
  isInitialized,
  data,
  invalid,
  cssClass,
}>(null);

const Input = React.memo((props: InputProps) => {

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

  // useEffect(() => {
  //   setInvalid(false);
  //   if (props.onChange) {
  //     props.onChange(_this, value);
  //   }
  //   setChanged(origValue != value);
  // }, [value]);

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

  const serialize = (): string => {
    if (props.serialize) props.serialize(_this);
    return value ? value.toString() : '';
  };

  const changeValue = (newValue: any): void => {
    if (props.changeValue) props.changeValue(_this, newValue);
    setValue(newValue);
    if (props.onChange) props.onChange(_this, newValue);
    setChanged(origValue != newValue);
  };

  const renderInputComponent = (): React.JSX.Element => {
    if (props.inputComponent) return props.inputComponent;

    return <input
      type="text"
      value={value ?? ''}
      readOnly={readonly}
      ref={refInput}
    ></input>
  };

  const renderValueComponent = (): React.JSX.Element => {
    if (props.valueComponent) return props.valueComponent;
    
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

    changeValue,
    // renderInputElement,
    // renderValueElement,
    translate
  }

  const valueComponent = renderValueComponent();
  const inputComponent = renderInputComponent();

  if (!isInitialized) return <Spinner size="xs" />;

  try {
    return <InputMetaContext.Provider value={{
      setReadonly,
      setInvalid,
      setValue,
      setOrigValue,
      setChanged,
      setCssClass,
      setCssStyle,
      setIsModified,
      setIsInitialized,
      setIsInlineEditing,
      setData,
      setDescription,
      refInputWrapper,
      refInputElement,
      refValueElement,
      refInput,
      readonly,
      value,
      changeValue,
      description,
      isInitialized,
      data,
      invalid,
      cssClass
    }}>
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
              {inputComponent}
              {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
            </div>
          </>
          : <div
            ref={refValueElement}
            className="value-element"
          >
            {valueComponent}
            {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
          </div>
        }
      </div></div>
    </InputMetaContext.Provider>;
  } catch(e) {
    const errMsg = 'Failed to render input for ' + (description?.title ?? inputName) + '.';
    console.error(errMsg);
    console.error(e);
    return <div className="alert alert-danger">{errMsg} Check console for error log.</div>
  }
}, () => true);

export default Input;