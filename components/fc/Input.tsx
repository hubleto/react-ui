import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
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
  field?: string,
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
  context?: any,
  parentForm?: any,
  children?: any,
  description?: InputDescription,
  data?: Array<any>,
}

export interface InputMeta {
  field,
  changed,
  inputClassName,
  setInputClassName,
  setReadonly,
  setInvalid,
  setValue,
  setChanged,
  setCssClass,
  setCssStyle,
  setIsInitialized,
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
  cssStyle,
  isModified, setIsModified,
  origValue, setOrigValue,
  onChange,
  translate
};

export const InputMetaContext = React.createContext<InputMeta>(null);

const Input = forwardRef<InputMeta, InputProps>((props, ref) => {

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
  const [description, setDescription] = useState(props.description ?? {});
  const [inputClassName, setInputClassName] = useState(props.inputClassName ?? '');
  const [field, setField] = useState(props.field ?? '');
  const [invalid, setInvalid] = useState(props.invalid ?? false);
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? false);
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
      props.onInit(meta);
    }
  }, []);

  useEffect(() => { setChanged(props.changed ?? false); }, [props.changed]);
  useEffect(() => { setCssClass(props.cssClass ?? ''); }, [props.cssClass]);
  useEffect(() => { setCssStyle(props.cssStyle ?? {}); }, [props.cssStyle]);
  useEffect(() => { setDescription(props.description ?? {}); }, [props.description]);
  useEffect(() => { setInvalid(props.invalid ?? false); }, [props.invalid]);
  useEffect(() => { setIsModified(props.isModified ?? false); }, [props.isModified]);
  useEffect(() => { setReadonly(props.readonly ?? false); }, [props.readonly]);

  const getClassName = useCallback((): string => {
    return (
      "hubleto component input"
      + " " + (inputClassName ?? "")
      + " " + (cssClass ?? "")
      + " " + (changed ? 'changed' : '')
      + " " + (invalid ? 'invalid' : '')
      + " " + (readonly ? "readonly" : "")
      + " " + (isModified ? 'modified' : '')
    );
  }, [changed, invalid, readonly, isModified]);

  const serialize = (): string => {
    if (props.serialize) props.serialize(meta);
    return value ? value.toString() : '';
  };

  const changeValue = (newValue: any): void => {
    if (readonly) return;

    // if (props.changeValue) props.changeValue(meta, newValue);
    setValue(newValue);
    if (props.onChange) props.onChange(meta, newValue);
    setChanged(origValue != newValue);
  };

  const renderInputComponent = (): React.JSX.Element => {
    if (props.inputComponent) return props.inputComponent;

    return <>
      <div className='badge'>[default input component]</div>
      <input
        type="text"
        value={value ?? ''}
        readOnly={readonly}
        ref={refInput}
      ></input>
    </>;
  };

  const renderValueComponent = (): React.JSX.Element => {
    if (props.valueComponent) return props.valueComponent;
    
    if (serialize() == '') return <span className="no-value"></span>;
    else return <span>{serialize()}</span>;
  };

  // const meta: InputMeta = {
  //   field,
  //   changed, setChanged,
  //   cssClass, setCssClass,
  //   cssStyle, setCssStyle,
  //   data, setData,
  //   description, setDescription,
  //   inputClassName, setInputClassName,
  //   invalid, setInvalid,
  //   isInitialized, setIsInitialized,
  //   isModified, setIsModified,
  //   origValue, setOrigValue,
  //   readonly, setReadonly,
  //   value, setValue,

  //   onChange: props.onChange,

  //   changeValue,
  //   translate
  // }

  // Build the meta object once so both the context Provider (for
  // descendants) and useImperativeHandle (for the parent via ref)
  // expose the exact same shape.
  const meta: InputMeta = {
    field,
    changed, setChanged,
    cssClass, setCssClass,
    cssStyle, setCssStyle,
    data, setData,
    description, setDescription,
    inputClassName, setInputClassName,
    invalid, setInvalid,
    isInitialized, setIsInitialized,
    isModified, setIsModified,
    origValue, setOrigValue,
    readonly, setReadonly,
    value, setValue,

    onChange: props.onChange,

    changeValue,
    translate,
    refInputWrapper,
    refInputElement,
    refValueElement,
    refInput,
  };

  // Expose `meta` imperatively to whoever holds a ref to <Input>.
  // This lets a parent ABOVE the InputMetaContext.Provider (like Tags,
  // which renders <Input> itself and therefore isn't a descendant of
  // its own Provider) still call things like setIsInitialized(true).
  useImperativeHandle(ref, () => meta);

  if (!isInitialized) return <Spinner size="xs" />;

  try {
    return <InputMetaContext.Provider value={{
      field,
      changed, setChanged,
      cssClass, setCssClass,
      cssStyle, setCssStyle,
      data, setData,
      description, setDescription,
      inputClassName, setInputClassName,
      invalid, setInvalid,
      isInitialized, setIsInitialized,
      isModified, setIsModified,
      origValue, setOrigValue,
      readonly, setReadonly,
      value, setValue,

      onChange: props.onChange,

      changeValue,
      translate,
      refInputWrapper,
      refInputElement,
      refValueElement,
      refInput,
    }}>
      <div
        ref={refInputWrapper}
        className={getClassName()}
        style={cssStyle}
      ><div className="inner">
        {readonly
          ? <div
            ref={refValueElement}
            className="value-element"
          >
            {renderValueComponent()}
            {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
          </div>
          : <>
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
              {renderInputComponent()}
              {description?.unit ? <div className="input-unit">{description.unit}</div> : null}
            </div>
          </>
        }
      </div></div>
    </InputMetaContext.Provider>;
  } catch(e) {
    const errMsg = 'Failed to render input for ' + (description?.title ?? field) + '.';
    console.error(errMsg);
    console.error(e);
    return <div className="alert alert-danger">{errMsg} Check console for error log.</div>
  }
});

export default Input;