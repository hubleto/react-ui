import React, { useState, useEffect } from 'react';
import { HubletoComponentProps } from '@hubleto/react-ui/core/Component';

export interface DialogProps extends HubletoComponentProps {
  headerClassName?: string,
  contentClassName?: string,
  footerClassName?: string,
  children: any,
}

export default function Dialog(props: DialogProps) {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  // Preserves the original API: external code calls
  // globalThis.hubleto.reactElements[uid].show() / .hide()
  useEffect(() => {
    if (props.uid) {
      globalThis.hubleto.reactElements[props.uid] = { show, hide };
    }
    // setVisible is referentially stable, so show/hide never change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.uid]);

  if (!visible) return null;

  return (
    <div className="hubleto component dialog">
      <div className={"dialog-header " + (props.headerClassName ?? '')}>

      </div>
      <div className={"dialog-content " + (props.contentClassName ?? '')}>
        {props.children}
      </div>
      <div className={"dialog-footer " + (props.footerClassName ?? '')}>
        <div
          className="btn btn-transparent"
          onClick={hide}
        >
          <span className="text">Close</span>
        </div>
      </div>
    </div>
  );
}
