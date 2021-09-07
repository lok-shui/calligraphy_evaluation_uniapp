<script>
	//import cookies from 'js/weapp-cookie.js';
	// 配置自定义别名
	//cookies.config({ requestAlias: 'requestx' });
	import pageHelper from './js/pageHelper.js';
	import appConfig  from './js/config.js';
	export default {
		onLaunch: function() {
			console.log('App Launch');
			
		},
		onLoad: function() {
		},
		methods:{
			
		}
	}
	console.log("app.vue..............");
</script>

<style>
	@import "css/main.css";
	@import "css/icon.css";
	@import "./static/iconfont.wxss";
	/*每个页面公共css */
	/*@import "./static/iconfont.css";*/
	
	.iconfont {
	  font-family:"iconfont" !important;
	  font-size:16px;
	  font-style:normal;
	  -webkit-font-smoothing: antialiased;
	}	 
</style>
