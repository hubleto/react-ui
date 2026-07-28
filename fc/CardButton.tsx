import React from 'react';

export interface CardButtonProps {
  uid: string,
  onClick?: string, // TODO: nepouziva sa
  href?: string,
  text: string,
  icon: string,
  subtitle?: string,
  cssClass?: string,
}

export default function CardButton(props: CardButtonProps) {
  return (
    <a
      id={"hubleto-card-button-" + props.uid}
      href={
        props.href ? (
          props.href.startsWith('/')
              //@ts-ignore
            ? globalThis.hubleto.config.projectUrl + props.href
            : window.location.href + '/' + props.href
        ) : '#'
      }
      className={"btn " + props.cssClass + " shadow-sm mb-1 p-4 d-inline-flex flex-column"}
      style={{width: '14em'}}
    >
      <i
        className={props.icon}
        style={{fontSize: '4em'}}
      ></i>

      <div className="mt-4 h5 d-flex justify-content-center align-items-center" style={{height: '2.5em'}}>{props.text}</div>
      {props.subtitle ? (
        <div className="text-center small">{ props.subtitle }</div>
      ) : ''}
    </a>
  );
}
