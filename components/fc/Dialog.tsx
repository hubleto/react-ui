import React, { useState, useEffect } from 'react';

export interface DialogProps {
  uid: string,
  headerClassName?: string,
  contentClassName?: string,
  footerClassName?: string,
  renderHeader?: (dialog: any) => React.JSX.Element,
  renderFooter?: (dialog: any) => React.JSX.Element,
  onClose?: (dialog: any) => void,
  children: any,
}

export interface DialogMeta extends DialogProps {
  close: () => void,
}

export const DialogMetaContext = React.createContext<DialogMeta>(null);

const Dialog = (props: DialogProps) => {

  const [visible, setVisible] = useState(true);
  useEffect(() => { globalThis.hubleto.reactElements[props.uid] = myself; }, [props.uid]);

  const close = () => {
    setVisible(false);
    if (props.onClose) props.onClose(myself);
  }

  const myself: DialogMeta = {
    ...props,
    close
  }

  return <DialogMetaContext.Provider value={myself}>{visible ?
    <div className="hubleto component dialog">
      <div className={"dialog-header " + (props.headerClassName ?? '')}>
        {props.renderHeader ? props.renderHeader(myself) : null}
      </div>
      <div className={"dialog-content " + (props.contentClassName ?? '')}>
        {props.children}
      </div>
      <div className={"dialog-footer " + (props.footerClassName ?? '')}>
        {props.renderFooter ? props.renderFooter(myself) :
          <div className="btn btn-transparent" onClick={() => close()}>
            <span className="text">Close</span>
          </div>
        }
      </div>
    </div>
  : null}</DialogMetaContext.Provider>;
}

export default Dialog;