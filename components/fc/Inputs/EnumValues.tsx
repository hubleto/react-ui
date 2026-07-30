import React, { useState } from 'react'
import Input, { InputProps } from '../Input'

export interface EnumValuesInputProps extends InputProps {
  enumValues?: {};
  enumCssClasses?: {};
  uiStyle?: 'select' | 'buttons' | 'buttons-vertical';
}

const EnumValuesInput = React.memo((props: EnumValuesInputProps) => {

  const normalizedProps: EnumValuesInputProps = {
    ...props,
    inputClassName: 'int',
    uiStyle: 'select',
    isInitialized: true,
  };

  const [enumValues, setEnumValues] = useState(normalizedProps.enumValues);
  const [enumCssClasses, setEnumCssClasses] = useState(normalizedProps.enumCssClasses);
  const [uiStyle, setUiStyle] = useState(normalizedProps.uiStyle);

  return <Input
    {...normalizedProps}

    serialize={(input: any): string => {
      if (!enumValues) return '';
      if (!enumValues[input.value]) return Object.keys(enumValues)[0];
      return '';
    }}

    renderValueElement={(input: any): React.JSX.Element => {
      let value = enumValues ? enumValues[input.value] : null;
      let cssClass = enumCssClasses ? enumCssClasses[input.value] : null;

      if (!value) {
        if (enumValues) value = enumValues[Object.keys(enumValues)[0]];
        else value = '-';
      }

      return <>
        <div className={"badge " + (cssClass ?? '')}>
          {value}
        </div>
      </>;
    }}

    renderInputElement={(input: any): React.JSX.Element => {
      if (!enumValues) return <></>;

      let value = input.value ?? null;
      if (!enumValues[value]) value = Object.keys(enumValues)[0];

      if (uiStyle == 'select') {
        return <>
          <select
            ref={input.refInput}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => input.changeValue(e.target.value)}
            className={
              "bg-white"
              + " " + (input.invalid ? 'is-invalid' : '')
              + " " + (input.cssClass ?? "")
              + " " + (input.readonly ? "bg-muted" : "")
            }
            disabled={input.readonly}
          >
            {Object.keys(enumValues).map((key: string|number) => {
              if (enumValues == undefined) return <></>;
              return <option key={key} value={key}>{enumValues[key] ?? ''}</option>
            })}
          </select>
        </>;
      } else if (uiStyle == 'buttons' || uiStyle == 'buttons-vertical') {
        return <div
          ref={input.refInput}
          className={"btn-group gap-1 " + (uiStyle == 'buttons-vertical' ? " flex-col w-full" : "")}
        >{Object.keys(enumValues).map((key: string|number) => {
          const enumValue = enumValues ? (enumValues[key] ?? '') : '';
          const enumCssClass = enumCssClasses ? (enumCssClasses[key] ?? '') : '';
          return <button
            key={key}
            className={
              "btn " + (input.readonly && input.value != key ? "btn-disabled" : "")
              + " " + (input.value == key ? "btn-primary " + enumCssClass : "btn-transparent")
            }
            onClick={() => { if (!input.readonly) input.changeValue(key); }}
          >
            <span className="text">{enumValue}</span>
          </button>;
        })}</div>;
      } else {
        return <></>;
      }
    }}
  />;
}, () => true);

export default EnumValuesInput;
