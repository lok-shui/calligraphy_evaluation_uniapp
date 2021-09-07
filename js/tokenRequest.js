import appConfig from '../js/config.js';
import app from '../js/app.js';


const request = function(options){
	let defaults = {
		url:"",//url地址
		data:{},//要传的值
		urlParams:{},//在url后面追加key=value的参数，必须为简单对象
		isShowLoading:true,
		waitingtip:"处理中,请稍候……",
		appendToken:true,
		ajaxOpt:{//ajax的参数配置
			withCredentials:false,
			//JSONP可以允许跨域，但是JSON不行
			dataType: 'json',//传输数据的数据类型
			//dataType: 'jsonp',//JSONP可以跨域，但是只支持GET
			type: 'POST',//HTTP请求类型	
			timeout: '100000' //超时时间设置为100秒
		},
		afterSucrcess:function(){
			
		}
	}	
	let parameters = {...defaults, ...options};
	
	if(parameters.isShowLoading){
		uni.showLoading({
		    title: parameters.waitingtip
		});
	}
	
	let data = parameters.data;
	let ajaxOpt = parameters.ajaxOpt;
	let servicesPath = parameters.url;
	let urlParams = parameters.urlParams;
	let _token = appConfig.restToken;
	// let _token = uni.getStorageSync('token');
	
	
	for(let key in urlParams){
		servicesPath = appendUrlParameter(servicesPath,key,urlParams[key]);
	}
	
	let header  = {//设置请求的 header，header 中不能设置 Referer。
		"Content-Type":"application/json"
	};
	if(parameters.appendToken && _token){
		header.token = _token;
		servicesPath = appendUrlParameter(servicesPath,"token",_token);
		console.log("【rootPostAjax】header.token："+header.token);
	}
	
	if(ajaxOpt.type=="POST"){//如果是POST需要设置参数
		header["content-type"] = "application/x-www-form-urlencoded";
	}

	console.log("【rootPostAjax】请求地址："+servicesPath);
	console.log('【rootPostAjax】请求参数：'+JSON.stringify(data));
	console.log('【rootPostAjax】ajaxOpt配置：'+JSON.stringify(ajaxOpt));
		
	uni.request({
		url:servicesPath,
		method:ajaxOpt.type,
		timeout:ajaxOpt.timeout,
		dataType: ajaxOpt.dataType,
		withCredentials:ajaxOpt.withCredentials,
		data: data,
		header,
		success: (res) => {
			if (res.statusCode === 200){
				console.log("接口返回了：" + JSON.stringify(res));
				if (res.data.err_code != 0) { //返回码不为0则表示失败
				  console.log("接口返回失败了，原因：" + res.data.error);
				  defaultError(res.data.code, res.data.error, parameters);
				  return;
				}
				defaultSuccess(res, parameters);
			}else{
				console.log('header值',header)
				console.log('data值',data)
				defaultError("", "请求失败，请联系管理员，状态码：【"+res.statusCode+"】", parameters);
			}
		},
		fail: (err) => {
			defaultError("", error.message, parameters);
		},
		complete: (e) => {
			if(parameters.isShowLoading){
				uni.hideLoading();
			}
			if(parameters.complete != null) {
				parameters.complete(e);
				return;
			} 
		}
	});	
};


const appendUrlParameter = function(url,key,value){
	let splitSymbol = "?";
	if(url.indexOf("?")>=0){
		splitSymbol = "&";
	}
	url = url+splitSymbol+key+"="+encodeURIComponent(value);
	return url;
};

const defaultSuccess = function(data, parameters) {
  if (parameters.success != null) {
    console.log('接口调用成功，返回正确结果,开始回调success');
	try {
		parameters.success(data, parameters);
	}catch(err){
	     console.error("执行success回调时:"+JSON.stringify(err));
	}
    console.log('接口调用成功，返回正确结果,回调success结束');
    return;
  }
  console.log('接口调用成功，返回正确结果,执行默认defaultSuccess');
  uni.showToast({title:"操作成功",icon:"none"});
};

const defaultError = function(data,message,parameters){
	if(parameters.error != null) {
		console.log('接口调用失败,开始回调error');
		parameters.error(data,message,parameters);
		console.log('接口调用失败,回调error结束');
		return;
	} 
	uni.showToast({
		icon: 'none',
		title: '程序执行异常，请与管理员联系!\n'+message,
		duration:2000
	});
};




export default{
	request,
	appendUrlParameter,	
}