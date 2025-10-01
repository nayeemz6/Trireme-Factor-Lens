// src/react-plotly-js.d.ts
declare module 'react-plotly.js' {
  import { Component } from 'react';
  import { Layout, Data } from 'plotly.js';

  export interface PlotProps {
    data: Partial<Data>[];
    layout?: Partial<Layout>;
    config?: any;
    frames?: any[];
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
    onPurge?: (graphDiv: any) => void;
    revision?: any;
    style?: React.CSSProperties;
    className?: string;
  }

  export default class Plot extends Component<PlotProps> {}
}
