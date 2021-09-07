import appConfig from '../js/config.js';
import app from '../js/app.js';


/**
 * ajax的操作
 * @param {Object} parameters  参数
* 	waitingtip 等待提示框提示语
*	url ajax请求url
*	datas ajax请求参数{}
*	sucess 操作成功后的回调函数参数，没有指定则用默认的   
*	error  操作失败后的回调函数参数，没有指定则用默认的 
 */
const isExpire = false;
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
			timeout: 100000 //超时时间设置为100秒
		},
		afterSuccess:function(){
			
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
	// 固定token
	// let _token = appConfig.restToken;
	 
	let _token = uni.getStorageSync('token')
	for(let key in urlParams){
		servicesPath = appendUrlParameter(servicesPath,key,urlParams[key]);
	}
	
	console.log('header token',_token)
	let header  = {//设置请求的 header，header 中不能设置 Referer。
		"Content-Type":"application/json",
		"token":  _token
	};
	if(parameters.appendToken && _token){
		// const token  = uni.getStorage({
		// 	key:'token',
		// 	success:function(res) {
		// 		console.log('res值：',res)
		// 		// header.token = res.data;
		// 	}
		// })
		 
		header.token =  _token;	 
		// servicesPath = appendUrlParameter(servicesPath,"token",_token);
		console.log("【rootPostAjax】header.token值："+header.token);
		console.log("【rootPostAjax】servicesPath："+servicesPath);
	}
	
	if(ajaxOpt.type=="POST"){//如果是POST需要设置参数
		header["content-type"] = "application/json";
	}

	// console.log("【rootPostAjax】请求地址："+servicesPath);
	// console.log('【rootPostAjax】请求参数：'+JSON.stringify(data));
	// console.log('【rootPostAjax】ajaxOpt配置：'+JSON.stringify(ajaxOpt));
	
	console.log('header的值：', header)
	// console.log('参数：',data)
	
	uni.request({
		url:servicesPath,
		method:ajaxOpt.type,
		timeout:ajaxOpt.timeout,
		dataType: ajaxOpt.dataType,
		withCredentials:ajaxOpt.withCredentials,
		data: data,
		header,
		success: (res) => {
			 console.log('封装接口返回的res',res)
			if (res.statusCode === 200){
				
				if (res.data.err_code !== 0) { //返回码不为0则表示失败
				  console.log("接口返回失败了，原因：" + res.data.error);
				  defaultError(res.data.code, res.data.error, parameters);
				  return;
				}
				uni.setStorage({
					key:'expire',
					data: 'none'
				})
				defaultSuccess(res, parameters);
				
			}
			else if(res.statusCode==401&&res.data.error=='Token expire'){
				uni.setStorage({
					key:'expire',
					data: 'Token expire'
				})
				// defaultError("", "你的试用已到期，请联系客户经理开通继续试用【"+res.data.error+"】", parameters);
			} else if(res.statusCode==401&&res.data.error=='Unauthorized') {
				uni.setStorage({
					key:'expire',
					data: 'Unauthorized'
				})
				// defaultError("", "无效的token，请联系客户经理【"+res.data.error+"】", parameters);
			} else {
				defaultError("", "请求失败，请联系管理员，状态码：【"+res.statusCode+"】,错误提示：【"+res.data.error+"】", parameters);
			}
				
			 
		},
		fail: (err) => {
			console.log('err',err)
			defaultError("", err.errMsg, parameters);
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


/**
 * 加载服务器配置的code，多个code用,分隔
 * @param {Object} codes
 */
const loadCodes = function(parameters){
  let multipleCodeStr = parameters.multipleCodeStr;//多个用,号分隔
  let success = parameters.success;
  let error = parameters.error;
  let context = parameters.context;
  let isInitPageData = parameters.isInitPageData;//【暂未实现】是否需要直接帮初始化到pageData中

  let url = appConfig.getServicePath() + "codeitems/codes";
  request({
    context,
    url: url,
    data:{
      codes:multipleCodeStr
    },
	ajaxOpt:{
		type:"POST"
	},
    success(response, parameters) {
      let data = response.data.data;
      //console.log("data:"+ JSON.stringify(data));
      context.originalPageData = data;
      //console.log("context.originalPageData"+ JSON.stringify(context.originalPageData));
      if(success){
        success(data);
      }
    },
    error(error, message, parameters) {
      console.log("error:"+error);
      if(error){
        error();
      }
    }
  });
};

/**对多个编码数据对象（格式如下）进行遍历，返回item
 * @param {Object} codes 多个编码配置，一次性返回
  {
    yes_no:[{fd_name:"是",fd_value:"1"},{fd_name:"否",fd_value:"2"}],
    sex:[]
  }
 * @param {Object} codeKey 编码例如：yes_no
 * @param {Object} value  返回编码明细对象。例如：传入yes_no,1则返回是
 */
const getCodeItemByKeyForCodes = function(codesResult,codeKey,value){
  //console.log("getCodeItemByKeyForCodes");
  let defaultIteme = {fd_name:"",fd_value:""};
  if(!value||value==0){
    return defaultIteme;
  }
  let foundCodeItems = codesResult[codeKey];
  if(!foundCodeItems || foundCodeItems.length==0){
    return defaultIteme;
  }

  let valueType = "s";//s(单选)/m(多选)
  let values = [value];
  if(typeof value =="string" && value.indexOf(",")>0){
    valueType = "m";
    values = value.split(",");
  }


  let foundCodes = [];
  for(let i=0;i<values.length;i++){
    for(let j=0;j<foundCodeItems.length;j++){
      if((foundCodeItems[j].fd_value+"")==(values[i]+"")){
        foundCodes.push(foundCodeItems[j]);
        continue;
      }
    }
  }
  if(valueType=="s"){
    return foundCodes[0];
  }
  return foundCodes;
};

/**
 * @param {Object} pageData
 * @param {Object} codesJson
 * @param {Object} codeKey
 * @param {Object} parseValueToInt value是否转为int类型
 */
const initPageDataItem = function(target,codesJson,codeKey,parseValueToInt){
  if(!codesJson[codeKey]){
    return;
  }
  let codeItems = codesJson[codeKey];
  for(let i=0;i<codeItems.length;i++){
    let value = codeItems[i].fd_value;
    if(parseValueToInt){
      value = value-0;
    }
    target.push({
      label:codeItems[i].fd_name,
      value:value
    });
  }
};

/**
 * 下载图片
 * @param {Object} path
 * @param {Object} success
 */
const downloadImg = function(opt){
	let parentData = opt.parentData;
	let path = opt.path;
	let success = opt.success;
	
	let downloadHost = appConfig.static_file_download_root_path;
	let token = appConfig.restToken;
	
	
	let downloadTask = uni.downloadFile({
		url: downloadHost+"?path="+path, //仅为示例，并非真实的资源
		header:{
			token:token
		},
		success: (res) => {
			if (res.statusCode === 200) {
				success(parentData,res.tempFilePath);
			}						
		}
	});
};



export default{
	request,
	appendUrlParameter,
	
	loadCodes,
	getCodeItemByKeyForCodes,
	initPageDataItem,
	downloadImg,
	isExpire
}