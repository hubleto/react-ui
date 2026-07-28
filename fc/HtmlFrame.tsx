import React from 'react';

export interface HtmlFrameProps {
  iframeId?: string,
  content?: string,
  className?: string,
}

export default function HtmlFrame(props: HtmlFrameProps) {
  return <>
    <iframe
      src="about:blank"
      className={props.className}
      srcDoc={props.content}
      id={props.iframeId}
    />
  </>
}
