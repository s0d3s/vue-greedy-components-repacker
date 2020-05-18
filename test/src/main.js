
import Vue from 'vue'

import App from './test.vue'


new Vue({
  el: '#app',
  render: h => h(App),
  mounted () {
      console.log('mounted')
  }
})
