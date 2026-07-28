import React from 'react';
import Modal from "./Modal";
import Form, { FormProps } from "./Form";

export interface FormCardButtonProps {
  uid: string,
  onClick?: string, // TODO: nepouziva sa
  href?: string,
  text: string,
  icon: string,
  subtitle?: string,
  cssClass?: string,
  recordId?: number,
  form?: FormProps
}

export default function FormCardButton(props: FormCardButtonProps) {
  const cssClass = props.cssClass ?? 'btn-primary';
  const icon = props.icon ?? 'fas fa-check';

  return (
    <>
      <Modal
        uid={props.uid}
        //{...props.modal}
        hideHeader={true}
      >
        <Form
          uid={props.form?.uid ?? props.uid}
          model={props.form?.model ?? ''}
          showInModal={true}
          id={props.recordId}
          {...props.form}
        />
      </Modal>

      <button
        id={"hubleto-card-button-" + props.uid}
        //@ts-ignore
        onClick={() => HubletoReactUi.modalToggle(props.uid)}
        className={"btn " + cssClass + " shadow-sm mb-1 p-4"}
        style={{width: '14em'}}
      >
        <i
          className={icon}
          style={{fontSize: '4em'}}
        ></i>

        <div className="text-center pt-4 mt-4 h5">{ props.text }</div>
        { props.subtitle ? (
          <div className="text-center small">{ props.subtitle }</div>
        ) : ''}
      </button>
    </>
  );
}
