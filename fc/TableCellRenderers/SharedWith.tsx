import React from 'react';
import { TableCellRendererProps, useTableCellRendererState } from '../TableCellRenderer';

export default function SharedWithTableCellRenderer(props: TableCellRendererProps) {
  const state = useTableCellRendererState(props);

  if (state.data && state.data[state.columnName]) {
    let valuesPerUser: any = {};

    try {
      valuesPerUser = JSON.parse(state.data[state.columnName]);
    } catch (ex) {
      valuesPerUser = {};
    }

    Object.keys(valuesPerUser).map((idUser: any) => {
      if (valuesPerUser[idUser] != 'read' && valuesPerUser[idUser] != 'modify') {
        delete valuesPerUser[idUser];
      }
    })

    let userCount = Object.keys(valuesPerUser).length;

    if (userCount > 0) return <><i className='fas fa-share-nodes pr-2'></i> {userCount} user(s)</>;
    else return null;
  } else {
    return null;
  }
}
