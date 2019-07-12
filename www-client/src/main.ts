import Vue from 'vue';
import App from './App.vue';

import './plugins/vuetify';
import './plugins/aws';
import { store } from './store/store';


Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  store
}).$mount('#app');



