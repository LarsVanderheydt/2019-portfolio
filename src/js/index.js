import $ from 'jquery';
import MouseEffect from './MouseEffect';
import Vue from 'vue';
import App from './Vue/App.vue';

const params = {
  webGLCanvasID: "canvas",
  planeElementID: "backgrounds",

  // TWEAK THOSE VALUES TO CHANGE OVERALL EFFECT

  // size of the effect (0: no effect, 1: full window)
  pointerSize: 0.02,
  // how much to increase/decrease opacity on each frame
  opacitySpeed: 0.025,
  // strength of the velocity of the mouse effect
  velocityStrength: 0.125,
  // the bigger the more displacement
  displacementStrength: 0.125,
  // does not change anything visually, but the smaller the scale the better the performance
  canvasScale: 0.525,
  colors: [0.5, 1.0]
};

const initVue = () => {
  new Vue({
    el: '#app',
    render: h => h(App),
  })
}

window.onload = () => {
  // // init everything
  // const mouseEffect = new MouseEffect(params);

  // // if there's an error during the WebGL context creation
  // mouseEffect.curtains.onError(() => {
  //   document.body.classList.add("no-webgl");
  // });

  // // add the plane to start the effect
  // mouseEffect.addPlane();

  initVue();
}