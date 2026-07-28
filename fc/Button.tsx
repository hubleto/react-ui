import React from 'react';

export interface ButtonProps {
  uid: string,
  type?: string,
  onClick?: any,
  href?: string,
  text?: string,
  title?: string,
  icon?: string,
  target?: string,
  cssClass?: string
  cssStyle?: object
}

function getStateFromProps(props: ButtonProps) {
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

export default function Button(props: ButtonProps) {
  const { cssClass, cssStyle, icon } = getStateFromProps(props);

  return (
    <div
      id={"hubleto-button-" + props.uid}
      className="hubleto component button"
    >
      <a
        className={"hubleto ui Button btn " + cssClass + (props.icon && props.text ? " btn-icon-split" : "")}
        style={cssStyle}
        href={
          props.href ? (
            props.href.startsWith('/')
              ? globalThis.hubleto.config.projectUrl + props.href
              : props.href.startsWith('?')
                ? window.location.href + props.href
                : window.location.href + '/' + props.href
          ) : '#'
        }
        onClick={props.onClick}
        target={props.target}
        title={props.title}
      >
        <span className="icon">
          <i className={icon}></i>
        </span>
        {props.text ? <span className="text">{props.text}</span> : null}
      </a>
    </div>
  );
}
