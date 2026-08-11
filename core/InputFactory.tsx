import React, { Component } from 'react'

import InputLookup from "../components/cc/Inputs/Lookup";
import InputVarchar from "../components/cc/Inputs/Varchar";
import InputPassword from "../components/cc/Inputs/Password";
import InputTextarea from "../components/cc/Inputs/Textarea";
import InputInt from "../components/cc/Inputs/Int";
import InputBoolean from "../components/cc/Inputs/Boolean";
import InputColor from "../components/cc/Inputs/Color";
import InputFile from "../components/cc/Inputs/File";
import InputImage from "../components/cc/Inputs/Image";
import InputTags from "../components/cc/Inputs/Tags2";
import InputDateTime from "../components/cc/Inputs/DateTime";
import InputEnumValues from "../components/cc/Inputs/EnumValues";

export function InputFactory(inputProps: any): React.JSX.Element {
  let inputToRender: React.JSX.Element = <></>;
  let description: any = inputProps.description;

  if (!description) {
    return <div className="alert alert-warning">No description for input [{inputProps.inputName}]. Check console for error log.</div>
  }

  try {
    if (description.enumValues) {
      inputToRender = <InputEnumValues {...inputProps} enumValues={description.enumValues} enumCssClasses={description.enumCssClasses}/>
    } else {
      if (typeof description.reactComponent === 'string' && description.reactComponent !== '') {
        inputToRender = globalThis.hubleto.renderReactElement(description.reactComponent, inputProps) ?? <></>;
      } else {
        switch (description.type ?? '') {
          case 'varchar': inputToRender = <InputVarchar {...inputProps} />; break;
          case 'password': inputToRender = <InputPassword {...inputProps} />; break;
          case 'text': inputToRender = <InputTextarea {...inputProps} />; break;
          case 'json': inputToRender = <InputTextarea {...inputProps} />; break;
          case 'decimal': case 'int': case 'currency': inputToRender = <InputInt {...inputProps} />; break;
          case 'boolean': inputToRender = <InputBoolean {...inputProps} />; break;
          case 'lookup': inputToRender = <InputLookup {...inputProps} />; break;
          case 'color': inputToRender = <InputColor {...inputProps} />; break;
          case 'tags': inputToRender = <InputTags {...inputProps} model={description.model} recordId={inputProps.record.id} />; break;
          case 'file': inputToRender = <InputFile {...inputProps} />; break;
          case 'image': inputToRender = <InputImage {...inputProps} />; break;
          case 'datetime': case 'date': case 'time': inputToRender = <InputDateTime {...inputProps} type={description.type} />; break;
          default: inputToRender = <InputVarchar {...inputProps} />;
        }
      }
    }
  } catch (e) {
    inputToRender = <div className="alert alert-danger">Failed to initialize input [{inputProps.inputName}]. Check console for error log.</div>
    console.error('Failed to initialize input for ' + inputProps.inputName);
    console.error(e);
  }

  return inputToRender;
}
