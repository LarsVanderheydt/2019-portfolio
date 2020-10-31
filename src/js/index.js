import Vue from 'vue';
import App from './Vue/App.vue';

const initVue = () => {
  new Vue({
    el: '#app',
    render: h => h(App),
  });
}

window.onload = () => initVue();
