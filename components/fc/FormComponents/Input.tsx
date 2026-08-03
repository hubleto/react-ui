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


const Input = ({ name, content, cssClass, renderOnlyInputField, customInputProps }: any) => {
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
    case 'varchar': input = <InputVarchar {...inputProps} />;
    case 'password': input = <InputPassword {...inputProps} />;
    case 'text': case 'json': input = <InputTextarea {...inputProps} />;
    case 'decimal': case 'int': case 'currency': input = <InputInt {...inputProps} />;
    case 'boolean': input = <InputBoolean {...inputProps} />;
    case 'lookup': input = <InputLookup {...inputProps} />;
    case 'color': input = <InputColor {...inputProps} />;

    //@ts-ignore
    case 'tags': input = <InputTags {...inputProps} recordId={value?.id} />;

    case 'file': input = <InputFile {...inputProps} />;
    case 'image': input = <InputImage {...inputProps} />;
    case 'datetime': case 'date': case 'time':
      input = <InputDateTime {...inputProps} type={inputDescription.type} />;
    default: input = <InputVarchar {...inputProps} />;
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