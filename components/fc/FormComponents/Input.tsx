import React from "react";
import { FormDescriptionContext, FormMetaContext } from "../Form";
import { useRecordField, useChangeRecord } from "../FormRecordStore";

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
import InputTags from "../../cc/Inputs/Tags2";


const Input = (props: any) => {
  const { name, content, cssClass, renderOnlyInputField, customInputProps, debug } = props;

  const description = React.useContext(FormDescriptionContext);
  const form = React.useContext(FormMetaContext);
  const value = useRecordField(r => r[name]);
  const changeRecord = useChangeRecord();

  const inputDescription = description?.inputs?.[name] ?? {};
  const isModified = useRecordField(r => r[name] !== form.originalRecord[name]);
  const isInlineEditing = true;

  const inputProps: InputProps = {
    inputName: name,
    value,
    description: inputDescription,
    readonly: form.readonly || inputDescription.readonly || inputDescription.disabled,
    isModified,
    isInlineEditing,
    uid: form.uid + '_' + name, // stable, no uuid.v4() per render
    invalid: form.invalidInputs.some(
      (v) => v.name.toLowerCase() === name.toLowerCase()
    ) ?? false,
    ...inputDescription,
    ...customInputProps,
    onChange: (input: any, newValue: any) => {
      changeRecord({ [name]: newValue === '' ? null : newValue });
    },
  };

  let input = null;

  if (inputDescription.enumValues) {
    input = <InputEnumValues {...inputProps} enumValues={inputDescription.enumValues} />;
  }

  if (typeof inputDescription.reactComponent === 'string' && inputDescription.reactComponent !== '') {
    input = globalThis.hubleto.renderReactElement(inputDescription.reactComponent, inputProps) ?? null;
  }

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

    //@ts-ignore
    case 'tags': input = <InputTags {...inputProps} recordId={value?.id} />; break;

    case 'file': input = <InputFile {...inputProps} />; break;
    case 'image': input = <InputImage {...inputProps} />; break;
    case 'date': input = <InputDateTime {...inputProps} type={inputDescription.type} />; break;
    case 'time': input = <InputDateTime {...inputProps} type={inputDescription.type} />; break;
    case 'datetime': input = <InputDateTime {...inputProps} type={inputDescription.type} />; break;
    default:
      console.warn('Unknown input type ' + inputDescription.type + ' for input named ' + name + '. Rendering Varchar.');
      input = <InputVarchar {...inputProps} />;
    break;
  }

  let finalContent = null;

  if (content) finalContent = content;
  else if (renderOnlyInputField) finalContent = input;
  else finalContent = <div
    id={form.uid + '_' + name}
    className={
      'input-wrapper'
      + (cssClass ? ' ' + cssClass : '')
      + (inputDescription.required ? ' required' : '')
    }
  >
    <label className="input-label" htmlFor={form.uid + '_' + name}>
      {inputDescription.title ?? ''}
    </label>
    <div className="input-body">
      {inputDescription.icon && <div className="input-icon"><i className={inputDescription.icon}></i></div>}
      {input}
      {inputDescription.info}
    </div>
    {inputDescription.description && (
      <div className="input-description">{inputDescription.description}</div>
    )}
  </div>;

  return finalContent;

}

export default Input;