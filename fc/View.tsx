import request from "@hubleto/react-ui/core/Request";
import React, { useState, useEffect, useRef } from 'react';
import Spinner from '@hubleto/react-ui/fc/Spinner';

export interface ViewProps {
  uid: string,
  controller: string,
  evalScriptTags?: boolean,
  params?: Array<any>,
}

export default function View(props: ViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');

  useEffect(() => {
    request.get(
      props.controller,
      {
        __IS_AJAX__: true
      },
      (data: any) => {
        setHtml(data);
      }
    );
    // Re-runs whenever `controller` or `params` change, matching the
    // original componentDidMount + componentDidUpdate comparison.
  }, [props.controller, props.params]);

  useEffect(() => {
    if (props.evalScriptTags && html !== '') {
      let scripts = divRef.current?.getElementsByTagName('script');
      if (scripts) {
        for (var n = 0; n < scripts.length; n++) {
          eval(scripts[n].innerHTML) // run script inside div
        }
      }
    }
    // Runs after `html` is set, matching the original setState callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  if (html == '') return <Spinner size="xl" />;

  return (
    <div
      ref={divRef}
      id={"hubleto-view-" + props.uid}
      className="hubleto component view"
      dangerouslySetInnerHTML={{__html: html}}
    >
    </div>
  );
}
