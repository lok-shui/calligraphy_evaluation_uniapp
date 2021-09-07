import basicRequest from "@/js/basicRequest.js";

/**
 * 作者：刘冰清
 * 翻页
 * @param empty {function} 如果本次查询为空时返回
 * @param success {function} 如果查询有值时返回
 * @param error {function} 如果查询失败时返回
 * 说明：
 */
const request = options => {
	var me = this;
	var defaults = {
		waitingtip: "加载中…", //遮罩层的提示语
		//默认未登录时也能加载列表,注:如果使用权限必须在调用时设为true
		needLogin: false,
		pager:undefined,
		data: { //请求的数据源
			page:1,//当前页
			per_page:10,//每页显示10条
			
			order: '', //排序字段 ，目前只支持按一个排序，默认按ID排序
			sortBy: 'ID'//排序方式asc desc 
		},
		urlParams:{
			
		},
		ajaxOpt: { //ajax的参数配置
			dataType: 'json', //传输数据的数据类型
			type: 'POST', //HTTP请求类型	
			timeout: 10000 //超时时间设置为10秒
		},
		afterDefaultSuccess:function(data,rows,parameters,hasMore){//执行默认成功函数后的的回调
			
		}
	}
	let opt = {...defaults, ...options};
	let pager = opt.pager;
	let pageData = opt.data;
	let REST_URL = opt.url;
	let urlParams = opt.urlParams;
	
	//将pager.page的值塞给pageData.page,因为fisher的查询需要这样
	if(pager){
		pageData.page = pager.page;
	}else{
		pager ={};
	}
	
	if(urlParams){
		for(let key in urlParams){
			REST_URL = basicRequest.appendUrlParameter(REST_URL,key,urlParams[key]);
		}
	}

	console.log("开始向服务器请求数据，请求地址：" + REST_URL);
	console.log("当前加载第【" + pager.page + "】页的数据。");
	console.log("请求参数" + JSON.stringify(pageData));
	console.log("ajax的配置参数：" + JSON.stringify(opt.ajaxOpt));
	
	
	basicRequest.request({
		url: REST_URL,
		ajaxOpt:opt.ajaxOpt,
		needLogin: opt.needLogin || false,
		data: pageData,
		waitingtip: opt.waitingtip,
		success: function(data, parameters) {
			let hasMore = true;
			if(data.data.count/data.data.per_page<=data.data.page){
				hasMore = false;
			}
			defaultSuccess(data,opt,hasMore);
		},
		error: function(data,message) {
			defaultError(data,message,opt);
		}
	});	
};
/**
 * 去除<span></span>双标签类型的html标签
 * @param {Object} data
 */
const removeHtmlLabel = function(data){
	var str=""
	if(data!=undefined && data!=null && data!=""){
		if(data.indexOf('>')>=0){
			var temp1 = data.split('>')
			var temp2 = temp1[1].split('<')
			str = temp2[0]
		}else{
			str = data
		}
	}
	return str
}
const defaultSuccess = (data,parameters,hasMore)=>{
	let pager = parameters.pager;
	if(parameters.success){
		parameters.success(data,parameters,hasMore);
		return;
	}
	
	let rows = data.data.data.data;
	if(rows.length>0){
		pager.page+=1;
	}
	
	for(let i=0;i<rows.length;i++){
		pager.rows.push(rows[i]);
	}
	if(hasMore){
		pager.status = "more";
	}else{
		pager.status = "noMore";
	}
	
	if(parameters.afterDefaultSuccess){
		parameters.afterDefaultSuccess(data,rows,parameters,hasMore);
	}
	console.log("fisherResuest-defaultSuccess:查询时返回成功!");
};
const defaultError = (data,message,parameters)=>{
	let pager = parameters.pager;
	pager.status = "noMore";
	
	if(parameters.error){
		parameters.error(data,message,parameters);
		return;
	}
	console.log("fisherResuest-defaultError:查询时返回成功,但是数据为空!");
};

const rp = 10;  //列表页面统一10条每页
export default {request,removeHtmlLabel,rp};