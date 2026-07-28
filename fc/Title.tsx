import React from 'react';

export interface TitleProps {
  uid: string,
  title: string,
  right?: string,
  left?: string
}

export default function Title(props: TitleProps) {
  return (
    <div
      id={"hubleto-title-" + props.uid}
      className="hubleto component title p-4"
    >
      <div className="row">
        <div className="col-lg-12 p-0">
          <div
            className="h3 text-primary mb-0"
            dangerouslySetInnerHTML={{ __html: props.title }}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div
          className="col-lg-6 p-0 d-flex"
          style={{ gap: '0.05em' }}
          dangerouslySetInnerHTML={{ __html: props.left ?? "" }}
        />
        <div
          className='col-lg-6 p-0 d-flex justify-content-end'
          style={{ gap: '0.05em' }}
          dangerouslySetInnerHTML={{ __html: props.right ?? "" }}
        />
      </div>
    </div>
  );
}
