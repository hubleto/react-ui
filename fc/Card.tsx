import React from 'react';

export interface CardProps {
  uid: string,
  title?: string,
  content: string
}

export default function Card(props: CardProps) {
  return (
    <div
      id={"hubleto-card-" + props.uid}
      className="hubleto component card"
    >
      {props.title ? (
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">{ props.title }</h6>
        </div>
      ) : ''}

      <div className="card-body">
        <div dangerouslySetInnerHTML={{ __html: props.content ?? "" }} />
      </div>
    </div>
  );
}
