import React from 'react';
import { TableCellRendererProps, useTableCellRendererState } from '../TableCellRenderer';

export default function HyperlinkTableCellRenderer(props: TableCellRendererProps) {
  const state = useTableCellRendererState(props);

  if (state.data && state.data[state.columnName]) {
    return <>
      <a
        href={state.data[state.columnName]}
        target='_blank'
        // onClick={(e) => { e.stopPropagation(); }}
        className="btn btn-blue-outline btn-small"
      >
        <span className="icon"><i className="fa-solid fa-up-right-from-square"></i></span>
        <span className="text">{state.data[state.columnName]}</span>
      </a>
    </>
  } else {
    return null;
  }
}
