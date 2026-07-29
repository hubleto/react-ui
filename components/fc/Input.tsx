import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as uuid from 'uuid';
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
  invalid?: boolean
}

export interface InputProps {
  uid?: string,
  inputName?: string,
  inputClassName?: string,
  value?: any,
  onChange?: (input: any, value: any) => void,
  onInit?: (input: any) => void,
  readonly?: boolean,
  invalid?: boolean,
  cssClass?: string,
  cssStyle?: any,
  placeholder?: string,
  isModified?: boolean,
  isInitialized?: boolean,
  isInlineEditing?: boolean,
  showInlineEditingButtons?: boolean,
  onInlineEditCancel?: () => void,
  onInlineEditSave?: () => void,
  context?: any,
  parentForm?: any,
  children?: any,
  description?: InputDescription,
}

export interface InputState {
  readonly: boolean,
  invalid: boolean,
  value: any,
  origValue: any,
  onChange: (input: any, value: any) => void,
  onInit?: (input: any) => void,
  cssClass: string,
  cssStyle: object,
  isModified: boolean,
  isInitialized: boolean,
  isInlineEditing: boolean,
  showInlineEditingButtons: boolean,
  description: InputDescription,
}

export function getBaseStateFromProps(props: InputProps): InputState {
  const isModified: boolean = props.isModified ?? false;
  const isInitialized: boolean = props.isInitialized ?? false;
  const isInlineEditing: boolean = props.isInlineEditing ?? true;
  const showInlineEditingButtons: boolean = props.showInlineEditingButtons ?? false;
  const readonly: boolean = props.readonly ?? false;
  const invalid: boolean = props.invalid ?? false;
  const value: any = props.value;
  const onChange: any = props.onChange ?? null;
  const onInit: any = props.onInit ?? null;
  const cssClass: string = props.cssClass ?? '';
  const cssStyle: object = props.cssStyle ?? {};
  const description: any = props.description ?? null;

  return {
    isModified,
    isInitialized,
    isInlineEditing,
    showInlineEditingButtons,
    readonly,
    invalid,
    value,
    origValue: value,
    onChange,
    onInit,
    cssClass,
    cssStyle,
    description,
  };
}

export interface UseInputOptions<S extends InputState> {
  // Replicates a subclass's overridden `getStateFromProps`: receives the base
  // state already computed and returns the final (possibly extended) state.
  // `props`/`baseState` are intentionally loosely typed here (`any`) because
  // this composes across multiple layers (Input -> Varchar -> Tel, etc.) and
  // each layer's actual runtime shape is richer than what a single generic
  // signature can express; the calling component always has the precise
  // types available via its own closured `props` variable.
  getStateFromProps?: (props: any, baseState: any) => S,
  // Replicates a subclass's overridden `serialize()`.
  serialize?: (state: S) => string,
  translationContext?: string,
  translationContextInner?: string,
}

export interface InputHandle<S extends InputState = InputState> {
  props: InputProps,
  state: S,
  setState: (partial: Partial<S>, callback?: () => void) => void,
  onChange: (value: any) => void,
  serialize: () => string,
  inlineEditEnable: () => void,
  inlineEditSave: () => void,
  inlineEditCancel: () => void,
  getClassName: () => string,
  translate: (orig: string, context?: string, contextInner?: string, vars?: any) => string,
  refInputWrapper: React.RefObject<any>,
  refInputElement: React.RefObject<any>,
  refValueElement: React.RefObject<any>,
  refInput: React.RefObject<any>,
}

// Every subclass in the original codebase used to `extends Input`, override
// `getStateFromProps`/`serialize`/lifecycle hooks, and get all the shared
// value/inline-edit/registry machinery for free via inheritance. Since
// function components can't be subclassed, that shared machinery now lives
// in this hook. A "subclass" input calls:
//
//   const input = useInput(props, { getStateFromProps: (p, base) => ({...base, myExtraField: ...}) });
//
// and gets back the same state/handlers the class version exposed as
// `this.state` / `this.setState` / `this.onChange` / etc.
export function useInput<S extends InputState = InputState>(
  props: InputProps,
  options: UseInputOptions<S> = {}
): InputHandle<S> {
  const computeState = useCallback((p: InputProps): S => {
    const base = getBaseStateFromProps(p);
    return options.getStateFromProps ? options.getStateFromProps(p, base) : (base as S);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setStateRaw] = useState<S>(() => computeState(props));

  const stateRef = useRef(state);
  stateRef.current = state;
  const propsRef = useRef(props);
  propsRef.current = props;
  const isFirstRender = useRef(true);
  const pendingCallbacks = useRef<Array<() => void>>([]);

  const refInputWrapper = useRef(null);
  const refInputElement = useRef(null);
  const refValueElement = useRef(null);
  const refInput = useRef(null);

  const { translate } = useTranslation(options.translationContext, options.translationContextInner);

  const setState = useCallback((partial: Partial<S>, callback?: () => void) => {
    setStateRaw(prev => ({ ...prev, ...partial }));
    if (callback) pendingCallbacks.current.push(callback);
  }, []);

  // Flushes setState-style callbacks after the state has actually committed,
  // matching the timing of `this.setState(partial, callback)` in the class version.
  useEffect(() => {
    if (pendingCallbacks.current.length > 0) {
      const cbs = pendingCallbacks.current;
      pendingCallbacks.current = [];
      cbs.forEach(cb => cb());
    }
  }, [state]);

  const onChange = useCallback((value: any) => {
    if (typeof propsRef.current.onChange === 'function') {
      setState({ invalid: false, value } as Partial<S>, () => {
        if (typeof propsRef.current.onChange === 'function') {
          propsRef.current.onChange(handle, value);
        }
      });
    } else {
      setState({ invalid: false, value } as Partial<S>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setState]);

  const serialize = useCallback((): string => {
    if (options.serialize) return options.serialize(stateRef.current);
    return stateRef.current.value ? stateRef.current.value.toString() : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inlineEditEnable = useCallback(() => {
    if (!stateRef.current.readonly) {
      setState({ origValue: stateRef.current.value, isInlineEditing: true } as Partial<S>, () => {
        if (propsRef.current.parentForm) {
          propsRef.current.parentForm.setState({ isInlineEditing: true });
        }
      });
    }
  }, [setState]);

  const inlineEditSave = useCallback(() => {
    setState({ origValue: stateRef.current.value, isInlineEditing: false } as Partial<S>, () => {
      if (propsRef.current.onInlineEditSave) propsRef.current.onInlineEditSave();
    });
  }, [setState]);

  const inlineEditCancel = useCallback(() => {
    setState({ value: stateRef.current.origValue, isInlineEditing: false } as Partial<S>, () => {
      onChange(stateRef.current.origValue);
      if (propsRef.current.onInlineEditCancel) propsRef.current.onInlineEditCancel();
    });
  }, [setState, onChange]);

  const getClassName = useCallback((): string => {
    return (
      "hubleto component input"
      + " " + propsRef.current.inputClassName
      + " " + (stateRef.current.cssClass ?? "")
      + " " + (stateRef.current.invalid ? 'invalid' : '')
      + " " + (stateRef.current.readonly ? "bg-muted" : "")
      + " " + (stateRef.current.isInlineEditing ? 'editing' : '')
      + " " + (stateRef.current.isModified ? 'modified' : '')
    );
  }, []);

  const handle: InputHandle<S> = {
    get props() { return propsRef.current; },
    get state() { return stateRef.current; },
    setState,
    onChange,
    serialize,
    inlineEditEnable,
    inlineEditSave,
    inlineEditCancel,
    getClassName,
    translate,
    refInputWrapper,
    refInputElement,
    refValueElement,
    refInput,
  };

  // Matches componentDidMount: register with the parent form + global registry,
  // and call onInit.
  useEffect(() => {
    if (props.uid) {
      globalThis.hubleto.reactElements[props.uid] = handle;
    }
    if (propsRef.current.parentForm && propsRef.current.inputName) {
      propsRef.current.parentForm.inputs[propsRef.current.inputName.toString()] = handle;
      if (stateRef.current.onInit) stateRef.current.onInit(handle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.uid]);

  // Matches componentDidUpdate: sync specific prop changes into state.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStateRaw(prev => ({
      ...prev,
      isInitialized: props.isInitialized,
      isInlineEditing: props.isInlineEditing,
      showInlineEditingButtons: props.showInlineEditingButtons,
      value: props.value,
      cssClass: props.cssClass,
      readonly: props.readonly,
      invalid: props.invalid,
      description: props.description,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.isInitialized,
    props.isInlineEditing,
    props.showInlineEditingButtons,
    props.value,
    props.cssClass,
    props.readonly,
    props.invalid,
    props.description,
  ]);

  return handle;
}

export function renderDefaultInputElement<S extends InputState>(input: InputHandle<S>) {
  return <input
    type="text"
    value={input.state.value ?? ''}
    readOnly={input.state.readonly}
    ref={input.refInput}
  ></input>;
}

export function renderDefaultValueElement<S extends InputState>(input: InputHandle<S>) {
  let value = (input.state.value ?? '') + '';
  if (value == '') return <span className="no-value"></span>;
  else return <span>{input.state.value.toString()}</span>;
}

export function renderLoadingInfo() {
  return <div className="badge badge-warning">[loading]</div>;
}

export interface InputChromeProps<S extends InputState> {
  input: InputHandle<S>,
  renderInputElement?: () => React.ReactNode,
  renderValueElement?: () => React.ReactNode,
}

// Shared markup that used to live in `Input.render()`. Every leaf input
// composes this instead of inheriting a `render()` method: it supplies its
// own `renderInputElement` / `renderValueElement`, and this component
// handles the inline-edit-mode chrome (wrapper div, hidden serialized value,
// save/cancel buttons, unit suffix, error boundary) identically to before.
export function InputChrome<S extends InputState>({
  input,
  renderInputElement = () => renderDefaultInputElement(input),
  renderValueElement = () => renderDefaultValueElement(input),
}: InputChromeProps<S>) {
  const { props, state } = input;

  if (!state.isInitialized) return renderLoadingInfo();

  try {
    globalThis.hubleto.setTranslationContext?.((input as any).translationContext ?? '');

    return (
      <div
        ref={input.refInputWrapper}
        className={input.getClassName()}
      ><div className="inner">
        {state.isInlineEditing
          ? <>
            <input
              id={props.uid}
              name={props.uid}
              type="hidden"
              value={input.serialize()}
              style={{width: "100%", fontSize: "0.4em"}}
              className="value bg-light"
              readOnly={true}
            ></input>
            <div ref={input.refInputElement} className="input-element">
              {renderInputElement()}
              {props.description?.unit ? <div className="input-unit">{props.description.unit}</div> : null}
            </div>
            {state.showInlineEditingButtons ?
              <div className="inline-editing-buttons always-visible">
                <button
                  className={"btn btn-success-outline"}
                  onClick={() => { input.inlineEditSave(); }}
                >
                  <span className="icon !py-0"><i className="fas fa-check"></i></span>
                </button>
                <button
                  className={"btn btn-cancel-outline"}
                  onClick={() => { input.inlineEditCancel(); }}
                >
                  <span className="icon !py-0"><i className="fas fa-times"></i></span>
                </button>
              </div>
              : null
            }
          </>
          : <>
            <div ref={input.refValueElement} className="value-element" onClick={() => { input.inlineEditEnable(); }}>
              {renderValueElement()}
              {props.description?.unit ? <div className="input-unit">{props.description.unit}</div> : null}
            </div>
          </>
        }
      </div></div>
    );
  } catch(e) {
    const errMsg = 'Failed to render input for ' + (props.description?.title ?? props.inputName) + '.';
    console.error(errMsg);
    console.error(e);
    return <div className="alert alert-danger">{errMsg} Check console for error log.</div>
  }
}

// Base input component (default export), used wherever `<Input ...>` was
// rendered directly rather than one of its subclasses.
export default function Input(rawProps: InputProps) {
  const props: InputProps = {
    inputClassName: '',
    ...rawProps,
  };
  const input = useInput(props);
  return <InputChrome input={input} />;
}
