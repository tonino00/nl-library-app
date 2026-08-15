/// <reference types="react-scripts" />

// react-scripts só declara tipos para *.module.css (CSS Modules); imports de
// CSS "soltos" como side-effect (ex.: 'react-toastify/dist/ReactToastify.css')
// não têm declaração ambiente própria e precisam desta aqui.
declare module '*.css';
