
import React, { Component } from 'react';
import Modal, { ModalProps } from "./Modal";
import Form, { FormProps } from "./Form";

interface FormCardButtonProps {
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

interface FormCardButtonState {
  cssClass: string,
  icon: string,
}

export default class FormCardButton extends Component<FormCardButtonProps> {
  state: FormCardButtonState;

  constructor(props: FormCardButtonProps) {
    super(props);

    this.state = {
      cssClass: props.cssClass ?? 'btn-primary',
      icon: props.icon ?? 'fas fa-check',
    }
  }

  render() {
    return (
      <>
        <Modal 
          uid={this.props.uid}
          //{...this.props.modal}
          hideHeader={true}
        >
          <Form 
            uid={this.props.form?.uid ?? this.props.uid}
            model={this.props.form?.model ?? ''}
            showInModal={true}
            id={this.props.recordId}
            {...this.props.form}
          />
        </Modal>

        <button
          id={"adios-card-button-" + this.props.uid}
          //@ts-ignore
          onClick={() => ADIOS.modalToggle(this.props.uid)}
          className={"btn " + this.state.cssClass + " shadow-sm mb-1 p-4"}
          style={{width: '14em'}}
        >
          <i 
            className={this.state.icon} 
            style={{fontSize: '4em'}}
          ></i>

          <div className="text-center pt-4 mt-4 h5">{ this.props.text }</div>
          { this.props.subtitle ? (
            <div className="text-center small">{ this.props.subtitle }</div>
          ) : ''}
        </button>
      </>
    );
  }
}

