import FlexGL from './flexgl';

(function makeGlobal() {
  if (typeof window !== 'undefined') {
    window.FlexGL = FlexGL;
  }
})();
