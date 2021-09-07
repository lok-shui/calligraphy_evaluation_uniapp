import appConfig from './config.js';
import app from './app.js';
import basicRequest from './basicRequest.js';
import pageHelper from './pageHelper.js';



/**
 * @param {Object} 普通登录的方法(不适用小程序未携带openid)
 */
const login = function(opt){
	//1后台，2会员中心，21会员移动
	var servicesPath = appConfig.getServicePath() + 'users/loginUser';
	let clientid = "";
	basicRequest.request({
		url: servicesPath, 
		waitingtip: '正在登录中......', 
		data: { 
			username: opt.account, 
			password: opt.password 
		},
		ajaxOpt:{
			method:"POST"
		},
		success: function(response,parameters){
			if(opt.success){
				opt.success(response,parameters);
			}else{
				uni.showToast({title:"登录成功",icon:"success"});
				let returnData = response.data.data;
				app.setToken(returnData.fd_token);
				app.setState(returnData);
				toMain();
			}
		},
		error:function(data,message,parameters){
			console.log("登录失败:"+message);
			pageHelper.showToast("登录失败:"+message);
		}
	});
};

/**
 * @param {Object} 普通登录的方法(不适用小程序未携带openid)
 */
const loginOut = function(opt){
	//1后台，2会员中心，21会员移动
	var servicesPath = appConfig.getServicePath() + 'users/loginUser';
	let clientid = "";
	basicRequest.request({
		url: servicesPath, 
		waitingtip: '正在登录中......', 
		data: { 
			username: opt.account, 
			password: opt.password 
		},
		ajaxOpt:{
			method:"POST"
		},
		success: function(response,parameters){
			if(opt.success){
				opt.success(response,parameters);
			}else{
				uni.showToast({title:"登录成功",icon:"success"});
				let returnData = response.data.data;
				app.setToken(returnData.fd_token);
				app.setState(returnData);
				toMain();
			}
		},
		error:function(data,message,parameters){
			console.log("登录失败:"+message);
			pageHelper.showToast("登录失败:"+message);
		}
	});
};

const toMain = function(){
	uni.reLaunch({
		url:"../index/index_home"
	});
};

const toLogin = function(){
	uni.reLaunch({
	    url: '/pages/public/login'
	});
};


export default {
	login
};
