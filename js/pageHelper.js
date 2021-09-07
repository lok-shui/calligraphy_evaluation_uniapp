import appConfig from '../js/config.js';
import basicRequest from '../js/basicRequest.js';

const loadCodeItemUrl = appConfig.getServicePath()+"/app/json/getCodeItemList.action";

const initWidgets = function(arg,rules,initComplate){
	let pageData = {};
	let vueData = {};
	let isOptParam = false;
	if(arg.pageData&&!rules){//说明传入的是一个opt那么则重新设置参数
		isOptParam = true;
		pageData = arg.pageData;
		rules = arg.rules;
		vueData = arg.vueData;
		initComplate = arg.initComplate;
	}else{
		pageData = arg;
	}
	//添加计数器，用于判断
	var me = this;
	let unLoadedCount = rules.length;
	if(unLoadedCount<=0){
		_defaultInitComplate(pageData,rules,arg,initComplate);
		return;
	}
	if(me.unLoadedCount==0){//如果没有需要初始化的控件，立即回调
		_defaultInitComplate(pageData,rules,arg,initComplate);
		return;
	}	
	for(let i=0;i<rules.length;i++){
		_initWidget(pageData,rules[i],function(){
			unLoadedCount--;
			if(unLoadedCount==0){
				_defaultInitComplate(pageData,rules,arg,initComplate);
			}
		},arg);
	}
};

const _defaultInitComplate = function(pageData,rules,arg,initComplate){
	if(typeof initComplate=="function"){
		initComplate(pageData,rules,arg);
	}
	else{
		console.log("initWidgets未设置initComplate");
	}
};
const prepareInit = function(option){	
	let prepareInitUrl = option.prepareInitUrl;
	let includeProperties = option.includeProperties||"";
	if(typeof includeProperties=="object"){
		includeProperties = JSON.stringify(includeProperties);
		console.log("传递的includeProperties参数为JSON格式对象,转换为字符串……:"+includeProperties);
	}
	let needLogin = option.needLogin===undefined?true:option.needLogin;
	var me = this;
	basicRequest.request({   
		data:{
			includeProperties:includeProperties
		},
		isShowLoading:false,
		needLogin:needLogin,
		url:prepareInitUrl,
		success:function(data,message){ 
			if(typeof option.success=="function"){
				option.success(data);
			}
		},
		error:function(data,message,parameters){
			if(typeof option.error=="function"){
				option.error(data,message);
			}
		}
	}); 	
};


/**
 * @param {Object} $data
 * @param {Object} rule 规则,详见如下:
 * 		codeItemKey:使用公共的编码表查询
 * 		loadDataUrl【优先】自定义初始化的数据，无需带域名端口，会自动加上(注：不能带参数?)
		params:只能是简单的对象(不支持二级),会自动做会查询的参数,只对loadDataUrl有效
		defaultItems 增加本地数据,请与查询预期返回的数据格式一致
 * 		excludeValues 排除选项不显示
		dataLoadSuccess(pageData,rule,data) 数据加载完成后自定义处理方法,自己决定数据如何处理 data为查询后的数据
			注:dataLoadSuccess设置后excludeValues和defaultItems将无qt
 * @param {Object} initComplate 
 */
const _initWidget = function(pageData,rule,initComplate,arg){
	//let needLogin = !opt||!opt.params?false:true;
	let needLogin = !rule.needLogin?false:true;
	let postUrl = "";
	if(!rule.codeItemKey&&!rule.loadDataUrl){
		if(typeof initComplate=='function'){
			console.error(rule.name+"未设置codeItemKey和loadDataUrl,规则异常");
			initComplate();
		}
		return;
	}
	if(rule.loadDataUrl){//自定义加载数据
		postUrl = appConfig.getServicePath()+rule.loadDataUrl;
		if(postUrl.indexOf("?")<0){
			postUrl+="?t=1";
		}
		if(rule.params&&typeof rule.params=="object"){
			for(let p in rule.params){
				postUrl+="&"+p+"="+rule.params[p];
			}
		}
	}else{
		if(!rule.codeItemKey){
			console.error(rule.name+"未设置codeItemKey");
		}
		postUrl = loadCodeItemUrl+"?code="+rule.codeItemKey;
	}
	console.log(rule.name+"初始化数据,地址:"+postUrl);
	if(rule.defaultItems instanceof Array){
		pageData[rule.name] = [...rule.defaultItems];
	}
	basicRequest.request({
		url:postUrl,
		isShowLoading:false,
		needLogin:needLogin,
		success:function(data,message,parameters){
			if(typeof rule.dataLoadSuccess=="function"){
				rule.dataLoadSuccess(pageData,rule,data,arg);
			}else{
				if(rule.loadDataUrl){//自定义加载器则直接赋值
					pageData[rule.name] = data.content;
				}else{//公共的编码加载器,则初始化
					for(let i=0;i<data.content.length;i++){
						if(_isExist(data.content[i].value,rule.excludeValues)){
							continue;
						}
						pageData[rule.name].push({
							name:data.content[i].name,
							value:data.content[i].value
						});
					}
				}
			}
			if(typeof initComplate=='function'){
				initComplate();
			}
		}
	});
};

const _isExist = function(value,excludeValues){
	if(excludeValues==undefined){
		return false;
	}
	for(let i=0;i<excludeValues.length;i++){
		if(value==excludeValues[i]){
			return true;
		}
	}
	return false;
};


/**
 * 公共的方法:依赖编码表的picker或者"name,value"键值对的picker可以通过该方法完成事件的逻辑处理
 * 	picker改变时把最新的值"value"赋值到formdata中
 * @param {Object} e
 * @param {Object} key 赋值给哪个属性(例如formData的属性名)
 * @param {Object} list
 * @param {Object} data
 */
const PickerChange = function(e,key,list,item){
	if(e.detail.value>=0){
		let currencyIndex =  e.detail.value;
		for(let i=0;i<list.length;i++){
			if(i==currencyIndex){
				item[key] = list[i].fd_value;
				continue;
			}
		}
	}
};

/**
 * 公共的方法:选中时将名字显示出来
 * @param {Object} key 赋值给哪个属性(例如formData的属性名)
 * @param {Object} defaultTips
 * @param {Object} list  pageData中的list
 * @param {Object} formData
 */
const getPickerText = function(key,defaultTips,list,si){
	let value = si[key];
	for(let i=0;i<list.length;i++){
		let item = list[i];
		if(item.fd_value==value){
			return item.fd_name;
		}
	}
	return defaultTips;
};

/**
 * @param {Object} list 数据集合
 * @param {Object} defaultTips 默认的tips
 * @param {Object} selectedValue 选中的值
 */
const getSimplePickerText = function(list,selectedValue,defaultTips){
	if(selectedValue===undefined||selectedValue===""){
		return defaultTips;
	}
	for(let i=0;i<list.length;i++){
		let item = list[i];
		if(item.value==selectedValue){
			return item.name;
		}
	}
	return defaultTips;
};

const delItem = function(thisObj,index,delSuccess){
	uni.showModal({
		title: '提示',
		content: '确定删除该明细吗？',
		success: function (res) {
			if (res.confirm) {
				console.log('用户点击确定');
				thisObj.$data.childList.splice(index, 1);
				if(typeof delSuccess=="function"){
					delSuccess(thisObj,index);
				}
			} else if (res.cancel) {
				console.log('用户点击取消');
			}
		}
	});
};

/**
 * 公共的提示语
 * @param {Object} param 字符串/JSON对象
 */
const showToast = function(param){
	if(typeof param=="object"){
		uni.showToast(param);
	}else{
		let tips = param;
		uni.showToast({
			icon: 'none',
			title: tips,
			duration:3000
		});
	}
};

/**
 *  正则表达式对富文本编辑器中的内容进行处理，将图片替换成全路径
 * 	embed:同样的处理
 * @param {Object} html
 */
const modifyContentImgSrc = function(html){
	if(!html){
		return "";
	}		
	let me = this;
	//使用正 则表达式进行替换
	html = html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match) {
		//处理工程名为空时双斜械的问题
		console.log("找到图片的src["+match+"],开始替换……");
		console.log("替换将src部分:["+appConfig.ContextPath+"/attached/image]");
		console.log("替换为：["+appConfig.getServicePath()+"]/attached/image");
		let contextPath = appConfig.ContextPath==""?appConfig.ContextPath:"/"+appConfig.ContextPath;
		return match.replace(contextPath+"/attached/image",appConfig.getServicePath()+"/attached/image");
	});
	return html;
};


const parseInfoContent = function(html,opt){
	
};

/**
 * @return {platform} 
 * 参考:https://uniapp.dcloud.io/platform
 */
const getPlatform = function(){
	//#ifdef APP-PLUS
	return "5+App";
	//#endif
	
	//#ifdef APP-PLUS-NVUE	
	return "APP-PLUS-NVUE";
	//#endif
	
	//#ifdef H5
	return "H5";//h5的环境
	//#endif
	
	//#ifdef MP-WEIXIN
	return "MP-WEIXIN";
	//#endif
	
	//#ifdef MP-ALIPAY	
	return "MP-ALIPAY";
	//#endif
	
	//#ifdef MP-BAIDU
	return "MP-BAIDU";
	//#endif
	
	//#ifdef MP-TOUTIAO
	return "MP-TOUTIAO";
	//#endif
	
	//#ifdef MP-QQ	
	return "MP-QQ";
	//#endif
	
	//#ifdef MP
	return "MP";
	//#endif
};

export default {
	prepareInit,
	initWidgets,
	PickerChange,
	getPickerText,
	getSimplePickerText,
	getPlatform,
	showToast,
	delItem,
	modifyContentImgSrc
}