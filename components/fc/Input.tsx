import React, { useState, useRef, useEffect, useCallback, Dispatch } from 'react'
import { useTranslation } from './TranslatedComponent';

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
  uid?: string,
  translationContext?: string,
  translationContextInner?: string,
  inputName?: string,
  inputClassName?: string,
  value?: any,
  origValue?: any,
  changed?: any,
  renderValueElement?: () => React.JSX.Element,
  renderInputElement?: () => React.JSX.Element,
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

export function getInputHandle(props: InputProps): InputHandle {
  const [readonly, setReadonly] = useState(props.readonly ?? false);
  const [invalid, setInvalid] = useState(props.invalid ?? false);
  const [value, setValue] = useState(props.value ?? null);
  const [origValue, setOrigValue] = useState(null);
  const [changed, setChanged] = useState(false);
  const [cssClass, setCssClass] = useState(props.cssClass ?? '');
  const [cssStyle, setCssStyle] = useState(props.cssStyle ?? {});
  const [isModified, setIsModified] = useState(props.isModified ?? false); 
  const [isInitialized, setIsInitialized] = useState(props.isInitialized ?? false);
  const [isInlineEditing, setIsInlineEditing] = useState(props.isInlineEditing ?? false);
  const [data, setData] = useState(props.data ?? []);
  const [description, setDescription] = useState({} as InputDescription);

  const refInputWrapper = useRef(null);
  const refInputElement = useRef(null);
  const refValueElement = useRef(null);
  const refInput = useRef(null);

  return {
    readonly, setReadonly,
    invalid, setInvalid,
    value, setValue,
    origValue, setOrigValue,
    changed, setChanged,
    cssClass, setCssClass,
    cssStyle, setCssStyle,
    isModified, setIsModified,
    isInitialized, setIsInitialized,
    isInlineEditing, setIsInlineEditing,
    data, setData,
    description, setDescription,

    refInputWrapper,
    refInputElement,
    refValueElement,
    refInput,

  };
}

export default function Input(handle: InputHandle) {

  const _this = this;
  const { translate } = useTranslation(handle.translationContext, handle.translationContextInner);

  useEffect(() => {
    handle.setChanged(false);
    handle.setOrigValue(handle.value);
  }, []);

  useEffect(() => {
    handle.setInvalid(false);
    if (handle.onChange) {
      handle.onChange(_this, handle.value);
    }
    handle.setChanged(handle.origValue != handle.value);
  }, [handle.value]);

  const getClassName = useCallback((): string => {
    return (
      "hubleto component input"
      + " " + (handle.inputClassName ?? "")
      + " " + (handle.cssClass ?? "")
      + " " + (handle.changed ? 'changed' : '')
      + " " + (handle.invalid ? 'invalid' : '')
      + " " + (handle.readonly ? "readonly" : "")
      + " " + (handle.isInlineEditing ? 'editing' : '')
      + " " + (handle.isModified ? 'modified' : '')
    );
  }, [handle.changed, handle.invalid, handle.readonly, handle.isInlineEditing, handle.isModified]);

  const serialize = useCallback((): string => {
    return handle.value ? handle.value.toString() : '';
  }, []);

  const renderInputElement = useCallback((): React.JSX.Element => {
    if (handle.renderInputElement) return handle.renderInputElement();
    else return <input
      type="text"
      value={handle.value ?? ''}
      readOnly={handle.readonly}
      ref={handle.refInput}
    ></input>
  }, [handle.value, handle.readonly, handle.refInput]);

  const renderValueElement = useCallback((): React.JSX.Element => {
    if (handle.renderValueElement) return handle.renderValueElement();
    else if (serialize() == '') return <span className="no-value"></span>;
    else return <span>{serialize()}</span>;
  }, [handle.value, handle.readonly, handle.refInput]);

  if (!handle.isInitialized) return <div className="badge badge-warning">[...]</div>;

  try {
    return (
      <div
        ref={handle.refInputWrapper}
        className={getClassName()}
        style={handle.cssStyle}
      ><div className="inner">
        {handle.isInlineEditing
          ? <>
            <input
              id={handle.uid}
              name={handle.uid}
              type="hidden"
              value={serialize()}
              style={{width: "100%", fontSize: "0.4em"}}
              className="value bg-light"
              readOnly={true}
            ></input>
            <div ref={handle.refInputElement} className="input-element">
              {renderInputElement()}
              {handle.description?.unit ? <div className="input-unit">{handle.description.unit}</div> : null}
            </div>
          </>
          : <div
            ref={handle.refValueElement}
            className="value-element"
          >
            {renderValueElement()}
            {handle.description?.unit ? <div className="input-unit">{handle.description.unit}</div> : null}
          </div>
        }
      </div></div>
    );
  } catch(e) {
    const errMsg = 'Failed to render input for ' + (handle.description?.title ?? handle.inputName) + '.';
    console.error(errMsg);
    console.error(e);
    return <div className="alert alert-danger">{errMsg} Check console for error log.</div>
  }
}

