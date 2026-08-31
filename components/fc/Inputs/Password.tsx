import React, { useRef, useState } from 'react'
import Input, { InputProps, InputMeta, InputMetaContext } from '../Input'
import Translator from '@hubleto/react-ui/core/Translator';

const T = new Translator('Hubleto\\ReactUi', 'Components\\Inputs\\Password');

const ValueComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);
  return <span>***</span>;
}

const InputComponent = (props: InputProps) => {
  const input = React.useContext(InputMetaContext);

  const [showPassword, setShowPassword] = useState(false);

  const password1 = input.value[0] ?? '';
  const password2 = input.value[1] ?? '';

  return <>
    <div className={"block pr-2"}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={password1}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          input.changeValue([e.currentTarget.value, input.value[1] ?? '']);
        }}
        placeholder={T.translate("New password")}
        className={
          (input.invalid ? 'is-invalid' : '')
          + " " + (input.cssClass ?? "")
          + " " + (input.readonly ? "bg-muted" : "")
          + " " + (password1 == password2 ? "" : "bg-red-100")
        }
        disabled={input.readonly}
      />
      <input
        type={showPassword ? 'text' : 'password'}
        value={password2}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          input.changeValue([input.value[0] ?? '', e.currentTarget.value]);
        }}
        placeholder={T.translate("Confirm new password")}
        className={
          (input.invalid ? 'is-invalid' : '')
          + " " + (input.cssClass ?? "")
          + " " + (input.readonly ? "bg-muted" : "")
          + " " + (password1 == password2 ? "" : "bg-red-100")
        }
        disabled={input.readonly}
      />
    </div>
    <span
      className="btn btn-light"
      onClick={() => { setShowPassword(!showPassword); }}
    >
      <span className="icon"><i className={"fas " + (showPassword ? "fa-low-vision" : "fa-eye")}></i></span>
    </span>
  </>;
}

const PasswordInput = (props: InputProps) => {
  return <Input
    inputClassName='int'
    isInitialized={true}
    renderValueComponent={(input: InputMeta) => <ValueComponent {...props} />}
    renderInputComponent={(input: InputMeta) => <InputComponent {...props} />}
    {...props}
  />;
};

export default PasswordInput;
