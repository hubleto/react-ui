import React from 'react';

export interface TableCellRendererProps {
  columnName: string,
  column: any,
  data: Array<any>,
  options: any,
}

// Kept for type compatibility with code that imported this alongside Props.
export interface TableCellRendererState extends TableCellRendererProps {}

// The original class mirrored props into state via componentDidUpdate purely
// so subclasses could read `this.state.X` instead of `this.props.X` — the
// values were always identical to props, just one commit behind. Function
// components can read props directly, so this hook is a thin, render-safe
// pass-through kept mainly so "subclass" renderers (below, and elsewhere in
// the codebase) have a drop-in replacement for `this.state`.
export function useTableCellRendererState(props: TableCellRendererProps): TableCellRendererState {
  return props;
}

// Base renderer, used directly wherever `<TableCellRenderer .../>` used to be
// rendered as-is (default fallback: print the raw cell value).
export default function TableCellRenderer(props: TableCellRendererProps) {
  const state = useTableCellRendererState(props);
  return state.data[state.columnName];
}
