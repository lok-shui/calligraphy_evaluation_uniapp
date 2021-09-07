import Vue from 'vue'
import Vuex from 'vuex'
import appConfig from '../js/config.js'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
       count:0,
    },
    mutations: {
        increment (state) {
          state.count++
        },
		
		
		
	}
});

export default store
