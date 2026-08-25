import React, { useState, useEffect } from 'react';

export interface DialogProps {
  uid: string,
  headerClassName?: string,
  contentClassName?: string,
  footerClassName?: string,
  renderHeader?: (dialog: any) => React.JSX.Element,
  renderFooter?: (dialog: any) => React.JSX.Element,
  children: any,
}

const Dialog = (props: DialogProps) => {

  const [visible, setVisible] = useState(true);
  useEffect(() => { globalThis.hubleto.reactElements[props.uid] = myself; }, [props.uid]);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const myself = {
    uid: props.uid,
    show, hide
  }

  if (visible) {
    return <div className="hubleto component dialog">
      <div className={"dialog-header " + (props.headerClassName ?? '')}>
        {props.renderHeader ? props.renderHeader(myself) : null}
      </div>
      <div className={"dialog-content " + (props.contentClassName ?? '')}>
        {props.children}
      </div>
      <div className={"dialog-footer " + (props.footerClassName ?? '')}>
        {props.renderFooter ? props.renderFooter(myself) :
          <div className="btn btn-transparent" onClick={() => hide()}>
            <span className="text">Close</span>
          </div>
        }
      </div>
    </div>;
  } else return null;
}

export default Dialog;