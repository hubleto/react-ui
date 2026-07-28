import React, { useState } from 'react';
import * as uuid from 'uuid';

export interface FormInputProps {
  children: any,
  title?: string|React.JSX.Element,
  description?: string,
  required?: boolean,
}

export default function FormInput(props: FormInputProps) {
  // uuid is generated once per mount, matching the original class's
  // constructor-time uuid generation (it never changes across re-renders).
  const [uid] = useState(() => uuid.v4());

  const title = props.title;
  const description = props.description ?? '';
  const required = props.required ?? false;

  return <>
    <div
      id={uid}
      className={"input-wrapper" + (required == true ? " required" : "")}
      key={uid}
    >
      {title ?
        <label className="input-label" htmlFor={uid}>
          {title}
        </label>
      : null}

      <div className="input-body" key={uid}>
        {props.children}
      </div>

      {description
        ? <>
          <i
            className="input-description fas fa-info"
            title={description}
          ></i>
        </>
        : null
      }
    </div>
  </>;
}
