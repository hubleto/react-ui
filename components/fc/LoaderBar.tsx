import React, { Component } from 'react';

export interface LoaderBarProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl',
  children?: any,
}

const LoaderBar = (props: LoaderBarProps) => {
  const size = props.size ?? 'base';

  return <div className={"hubleto component loader-bar " + (props.size ?? '')}>
    {props.children}
  </div>;
}

export default LoaderBar;