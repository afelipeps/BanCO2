// Plotly minified bundle ships sin tipos. Declaramos como any para que el
// react-plotly.js factory acepte el módulo. No queremos meter @types/plotly
// completo (~2 MB de tipos) en el benchmark.
declare module 'plotly.js-basic-dist-min';
