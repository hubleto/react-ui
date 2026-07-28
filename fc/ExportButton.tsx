import React from 'react';
import Notification, { NotificationOptions } from "@hubleto/react-ui/core/Notification";
import * as uuid from 'uuid';
import { jsPDF } from "jspdf";

import html2canvas from 'html2canvas';
import { NotyfNotification } from "notyf";

export interface ExportButtonProps {
  uid: string,
  type?: string,
  href?: string,
  text?: string,
  icon?: string,
  cssClass?: string
  customCssClass?: string
  cssStyle?: object,
  exportType: string,
  exportElementId: string,
  exportFileName?: string
}

function getStateFromProps(props: ExportButtonProps) {
  switch (props.type) {
    case 'save':
      return { icon: 'fas fa-check', cssClass: 'btn-success', cssStyle: props.cssStyle };
    case 'delete':
      return { icon: 'fas fa-check', cssClass: 'btn-danger', cssStyle: props.cssStyle };
    case 'close':
      return { icon: 'fas fa-times', cssClass: 'btn-light', cssStyle: props.cssStyle };
    default:
      return {
        cssClass: props.cssClass ?? 'btn-primary',
        cssStyle: props.cssStyle,
        icon: props.icon ?? 'fas fa-check',
      };
  }
}

export default function ExportButton(props: ExportButtonProps) {
  const { cssClass, cssStyle, icon } = getStateFromProps(props);

  const doExport = () => {
    if (!props.exportElementId) {
      Notification.error('export-element-id not initialized');
      return;
    }

    const imgElement = document.getElementById(props.exportElementId);
    if (!imgElement) {
      alert("Error");
      return;
    }

    $('#hubleto-export-overlay-' + props.uid).fadeIn(180, () => {
      $(imgElement).addClass('export-img');
      let infoNotification: NotyfNotification = Notification.custom({
        type: "info",
        message: "Exporting file",
        duration: 0
      } as NotificationOptions);

      setTimeout(() => {
        switch (props.exportType) {
          case 'image':
            html2canvas(imgElement, {
              scale: window.devicePixelRatio * 1.35
            }).then((canvas: any) => {
              const imageDataURL = canvas.toDataURL("image/png");
              const a = document.createElement("a");
              a.href = imageDataURL;
              a.download = props.exportFileName ?? uuid.v4();
              a.click();
            });

            $(imgElement).removeClass('export-img');
            $('#hubleto-export-overlay-' + props.uid).fadeOut();
          break;
          case 'pdf':
            html2canvas(imgElement).then((canvas: any) => {
              const imageDataURL = canvas.toDataURL("image/png");
              const pdf = new jsPDF('l', 'mm', 'a4');

              const imgProps = pdf.getImageProperties(imageDataURL);
              const width = pdf.internal.pageSize.getWidth() - 10;
              const height = (imgProps.height * width) / imgProps.width;

              pdf.addImage(imageDataURL, 'PNG', 5, 5, width, height);
              pdf.save(props.exportFileName ?? uuid.v4() + '.pdf');
            });

            $(imgElement).removeClass('export-img');
            $('#hubleto-export-overlay-' + props.uid).fadeOut();
          break;
          default:
            Notification.error('export-type must be pdf or image');
        }

        Notification.dismiss(infoNotification);
      }, 500);
    });
  };

  return (
    <>
      <div
        id={"hubleto-export-overlay-" + props.uid}
        style={{ position: 'fixed', left: '0', top: '0', width: '100vw', height: '100vh', background: 'white', zIndex: '1000', display: 'none' }}
      >
        <div className='alert alert-success' role='alert'>
          <i className='fas fa-check mr-4 align-self-center'></i>
          Exportujem rozpis do obrázku<br/>
        </div>
      </div>
      <button
        id={"hubleto-export-button-" + props.uid}
        className={props.customCssClass ? props.customCssClass : ("hubleto ui Button btn " + cssClass + " btn-icon-split")}
        style={cssStyle}
        onClick={doExport}
      >
        <span className="icon">
          <i className={icon}></i>
        </span>
        <span className="text">{props.text}</span>
      </button>
    </>
  );
}
