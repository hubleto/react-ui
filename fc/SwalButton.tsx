import React from 'react';
import Swal, { SweetAlertOptions } from "sweetalert2";
import Notification from "@hubleto/react-ui/core/Notification";
import request from "@hubleto/react-ui/core/Request";

export interface SwalButtonProps {
  uid: string,
  confirmUrl: string,
  confirmParams?: Object,
  onConfirmCallback?: (data: any) => void,
  swal: SweetAlertOptions,
  type?: string,
  onclick?: string, // TODO: nepouziva sa
  href?: string,
  text?: string,
  icon?: string,
  css?: string,
  successMessage?: string
}

function getStateFromProps(props: SwalButtonProps) {
  switch (props.type) {
    case 'save':
      return { icon: 'fas fa-check', css: 'btn-success' };
    case 'delete':
      return { icon: 'fas fa-check', css: 'btn-danger' };
    case 'close':
      return { icon: 'fas fa-times', css: 'btn-light' };
    default:
      return {
        css: props.css ?? 'btn-primary',
        icon: props.icon ?? 'fas fa-check',
      };
  }
}

export default function SwalButton(props: SwalButtonProps) {
  const { css, icon } = getStateFromProps(props);

  const onClick = () => {
    Swal.fire({
      title: props.swal.title ?? 'Title',
      html: props.swal.html ?? 'body',
      icon: props.swal.icon ?? 'info',
      showCancelButton: props.swal.showCancelButton ?? true,
      cancelButtonText: props.swal.cancelButtonText ?? 'No',
      confirmButtonText: props.swal.confirmButtonText ?? 'Yes',
      confirmButtonColor: props.swal.confirmButtonColor ?? '#dc4c64'
    } as SweetAlertOptions).then((result) => {
      if (result.isConfirmed) {
        request.post(
          props.confirmUrl,
          props.confirmParams ?? {},
          {
            __IS_AJAX__: '1'
          },
          (data: any) => {
            Notification.success(props.successMessage ?? 'Confirmed');
            if (props.onConfirmCallback) props.onConfirmCallback(data);
          }
        );
      }
    })
  };

  return (
    <div
      id={"hubleto-button-" + props.uid}
      className="hubleto component button"
    >
      <button
        className={"hubleto ui Button btn " + css + " btn-icon-split"}
        onClick={onClick}
      >
        <span className="icon">
          <i className={icon}></i>
        </span>
        <span className="text">{props.text}</span>
      </button>
    </div>
  );
}
