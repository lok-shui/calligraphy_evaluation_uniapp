import Vue from 'vue'
import App from './App'

import appConfig from 'js/config.js';
import token from 'js/getTokenValue.js';


import store from './store'

import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
Vue.component('uni-load-more',uniLoadMore);

Vue.config.productionTip = false

Vue.prototype.$store = store;
Vue.prototype.$appConfig = appConfig;
Vue.prototype.$token = token;

App.mpType = 'app';

import tokenUtil from './js/getTokenValue.js';
const app = new Vue({
	store,
    ...App,
	created:function(){//每次都加载数据
		var me = this;
		const value = uni.getStorageSync(appConfig.stateKeyName);
		if(value!=undefined){
			//me.$store.dispatch('login',value);
		 }else{
			 me.$store.commit("loginOut");
			 uni.reLaunch({
				url:"/pages/public/login"
			 })
		 }
	},
	onLaunch:function() {
		// tokenUtil.getTokenVal();
	}
	
	
});
app.$mount();
console.log("main.js..............");

