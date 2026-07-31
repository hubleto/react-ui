import React from "react";
import { FormDescriptionContext, FormMetaContext, useRecordField, useChangeRecord } from "../Form";
import { Input } from "./Input";

export const InputWrapper = React.memo(({ name, cssClass, customInputProps }: any) => {
  const description = React.useContext(FormDescriptionContext);
  const meta = React.useContext(FormMetaContext);
  const inputDescription = description?.inputs?.[name] ?? {};
  console.log('InputWrapper', name, customInputProps, description);

  return (
    <div
      id={meta?.uid + '_' + name}
      className={
        'input-wrapper'
        + (cssClass ? ' ' + cssClass : '')
        + (inputDescription.required ? ' required' : '')
      }
    >
      <label className="input-label" htmlFor={meta?.uid + '_' + name}>
        {inputDescription.title ?? ''}
      </label>
      <div className="input-body">
        {inputDescription.icon && <div className="input-icon"><i className={inputDescription.icon}></i></div>}
        <Input name={name} customInputProps={customInputProps} />
        {inputDescription.info}
      </div>
      {inputDescription.description && (
        <div className="input-description">{inputDescription.description}</div>
      )}
    </div>
  );
});

