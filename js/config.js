const isDebug = false;//注意：正式发布前请修改此值为false

//基础路径服务器的基础路径(最后面不要带斜线),如果带/可能导致无法保持 JSESSIONID
 // const ServicesBasePath = 'http://42.194.144.72:80';
 // const ServicesBasePath = 'http://daipops-copybook-service.daipops.test.dm-ai.cn';
 const ServicesBasePath = 'http://cs-daipops.test.dm-ai.cn';

 // const downloadPath = 'http://calligraphy-manager.daipops.test.dm-ai.cn'
  const downloadPath = 'http://42.194.144.72:80'

 const ContextPath =  'api';

 const tokenServicePath = 'https://user-manager-mip.test.dm-ai.cn/';

 // const ServicesBasePath = 'https://aixh.dm-ai.cn';
 // const ContextPath =  'api';

 const static_file_download_root_path = downloadPath+"/download";//静态资源获取

//APP别名，解决多APP情况下本地存储、更新冲突的问题
const appAlias = 'aixh';

const stateKeyName = "$state_"+appAlias;

const  tokenKeyName = "$tokenKeyName_"+appAlias;

// 固定获取token
// const restToken = "bdab1e1f-b4a4-4756-b8ea-429bb7536815";


const childKeyName = "$child_"+appAlias;

//对应后台角色管理中:允许登录应用范围,21:代表会员移动
const use = 21;

const getServicePath = function(){
	//例如：http://www.xxx.com/mandian/
	//var servicePath = this.ServicesBasePath+this.ContextPath+"/";
	//网址+项目名称,注:如果网址和项目名称之间有两个斜杠会出现无法保留session的问题
	var baseServicesBasePath = this.ServicesBasePath;
	baseServicesBasePath = baseServicesBasePath+"/";
	//console.log("baseServicesBasePath1:"+baseServicesBasePath);
	//替换字符串最后字符,将双斜杠转换为单斜杠
	baseServicesBasePath = baseServicesBasePath.replace(/\/{2}$/g,"/");
	//console.log("baseServicesBasePath2:"+baseServicesBasePath);
	if(this.ContextPath&&this.ContextPath!=""){//有工程名时
		return baseServicesBasePath+this.ContextPath+"/";
	}
	return baseServicesBasePath;
};

const getTokenServicePath = function(){
	var tokenServiceBasePath = this.tokenServicePath;
	tokenServiceBasePath = tokenServiceBasePath+"/";
	tokenServiceBasePath = tokenServiceBasePath.replace(/\/{2}$/g,"/")
	 console.log("baseServicesBasePath1:"+tokenServiceBasePath);
	return tokenServiceBasePath;
};
const getTokenVal = function() {
	if(uni.getStorageSync('token') !==''|| uni.getStorageSync('token') !== undefined){
		return
	}
	const TOKEN_URL = "v1/user-manager/oauth/android/register";
	console.log('触发注册接口(token)')
	let storage = '';
	const header = {
		'Cache-Control': 'no-cache, no-store, must-revalidate'
	}
	uni.request({
		method:'POST',
		url:tokenServicePath + TOKEN_URL,
		data:{
			resource_ids:'token-manager',
			access_token_validity:'3600',
			residue_degree:'10'
		},
		header,
		isShowLoading:false,
		success(data, parameters){
			// console.log(plus.device.uuid)
			// plus.device.getInfo({
			// 	success: (e) => {
			// 		console.log('成功e.uuid',e.uuid)
			// 	},
			// 	fail: function(e) {
			// 		console.log(e)
			// 	}
			// });
			uni.removeStorage({
				key:'token',
			})
			const token = data.data.data;
 			uni.setStorage({
				key:'token',
				data: token
			})
			storage = uni.getStorageSync('token');
			console.log('本地存储的token',storage);
			return storage;
		},
		complete(){
			uni.hideLoading();
		}
	})
	return storage
}
// 动态获取token
const restToken =  uni.getStorageSync('token');



export default{
	isDebug,
	ServicesBasePath,
	ContextPath,
	appAlias,
	stateKeyName,
	tokenKeyName,
	restToken,
	use,
	getTokenVal,
	childKeyName,
	getServicePath,
	static_file_download_root_path,
	getTokenServicePath,
	tokenServicePath,

}
