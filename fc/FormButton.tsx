import React from 'react';
import Modal from "./Modal";
import Form, { FormProps } from "./Form";

export interface FormButtonProps {
  uid: string,
  css?: string,
  icon?: string,
  text: string,
  formDescription?: FormProps
}

export default function FormButton(props: FormButtonProps) {
  const css = props.css ?? 'btn-primary';
  const icon = props.icon ?? 'fas fa-check';

  return (
    <>
      <Modal
        uid={props.uid}
        //{...props.modal}
        hideHeader={true}
      >
        <Form
          uid={props.uid}
          showInModal={true}
          {...props.formDescription}
        />
      </Modal>
      <div
        id={"hubleto-button-" + props.uid}
        className="hubleto component button"
      >
        <button
          onClick={() => HubletoReactUi.modalToggle(props.uid)}
          className={"hubleto ui Button btn " + css + " btn-icon-split"}
        >
          <span className="icon">
            <i className={icon}></i>
          </span>
          <span className="text">{props.text}</span>
        </button>
      </div>
    </>
  );
}
