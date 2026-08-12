import React from "react";
import { FormDescriptionContext, FormMetaContext } from "../Form";
import { useRecordField } from "../FormRecordStore";

import { InputProps } from "../Input";

import InputLookup from "../Inputs/Lookup";
import InputInt from "../Inputs/Int";
import InputColor from "../Inputs/Color";
import InputVarchar from "../Inputs/Varchar";
import InputTextarea from "../Inputs/Textarea";
import InputBoolean from "../Inputs/Boolean";
import InputEnumValues from "../Inputs/EnumValues";
import InputDateTime from "../Inputs/DateTime";

import InputPassword from "../../cc/Inputs/Password";
import InputFile from "../../cc/Inputs/File";
import InputImage from "../../cc/Inputs/Image";


const Input = React.memo((props: any) => {
  const { field, content, cssClass, renderOnlyInputField, customInputProps, debug, children } = props;

  const description = React.useContext(FormDescriptionContext);
  const form = React.useContext(FormMetaContext);
  // const R = useRecord();
  const value = useRecordField(field); // R[name];

  const inputDescription = description?.inputs?.[field] ?? {};
  const isModified = value !== form.originalRecord[field];

  const readonly =
    (props.hasOwnProperty('readonly') ? props.readonly
    : (form.hasOwnProperty('readonly') ? form.readonly
    : (inputDescription.hasOwnProperty('readonly') ? inputDescription.readonly
    : false)))
  ;

  const inputProps: InputProps = {
    ...props,
    field: field,
    value,
    description: inputDescription,
    readonly: readonly,
    isModified,
    uid: form.uid + '_' + name, // stable, no uuid.v4() per render
    invalid: false,
    ...inputDescription,
    ...customInputProps,
    onChange: (input: any, newValue: any) => {
      form.changeField(input, newValue);
    },
  };

  let input = null;

  if (inputDescription.enumValues) {
    input = <InputEnumValues {...inputProps} />;
  } else if (typeof inputDescription.reactComponent === 'string' && inputDescription.reactComponent !== '') {
    input = globalThis.hubleto.renderReactElement(inputDescription.reactComponent, inputProps) ?? null;
  } else {
    switch (inputDescription.type ?? '') {
      case 'varchar': input = <InputVarchar {...inputProps} />; break;
      case 'password': input = <InputPassword {...inputProps} />; break;
      case 'text': input = <InputTextarea {...inputProps} />; break;
      case 'json': input = <InputTextarea {...inputProps} />; break;
      case 'int': input = <InputInt {...inputProps} />; break;
      case 'decimal': input = <InputInt {...inputProps} />; break;
      case 'currency': input = <InputInt {...inputProps} />; break;
      case 'boolean': input = <InputBoolean {...inputProps} />; break;
      case 'lookup': input = <InputLookup {...inputProps} />; break;
      case 'color': input = <InputColor {...inputProps} />; break;
      case 'file': input = <InputFile {...inputProps} />; break;
      case 'image': input = <InputImage {...inputProps} />; break;
      case 'date': input = <InputDateTime {...inputProps} />; break;
      case 'time': input = <InputDateTime {...inputProps} />; break;
      case 'datetime': input = <InputDateTime {...inputProps} />; break;
      default:
        if (children) {
          input = children;
        } else {
          // console.warn('Unknown input type ' + inputDescription.type + ' for input named ' + name + '. Rendering Varchar.');
          // input = <>
          //   <div className='badge badge-error'>Unknown input type {inputDescription.type} for input named {name}. Rendering Varchar.</div>
          //   <InputVarchar {...inputProps} />
          // </>;
          input = null;
        }
      break;
    }
  }

  let finalContent = null;

  if (content) finalContent = content;
  else finalContent = <div
    id={form.uid + '_' + field}
    title={inputDescription.title}
    className={
      'input-wrapper'
      + (cssClass ? ' ' + cssClass : '')
      + (inputDescription.required ? ' required' : '')
    }
  >
    {renderOnlyInputField ? null : <label className="input-label" htmlFor={form.uid + '_' + name}>
      {inputDescription.title ?? ''}
    </label>}
    <div className="input-body">
      {inputDescription.icon && <div className="input-icon"><i className={inputDescription.icon}></i></div>}
      {input}
      {inputDescription.info}
    </div>
    {renderOnlyInputField ? null : inputDescription.description && (
      <div className="input-description">{inputDescription.description}</div>
    )}
  </div>;

  return finalContent;

}, () => true);

export default Input;