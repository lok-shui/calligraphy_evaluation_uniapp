// const tokenServicePath = 'https://aiep-user-v2.dm-ai.cn/';

// const tokenServicePath = 'https://am-daip.dev.dm-ai.cn/';

 // const tokenServicePath = 'https://daip-frontend.dm-ai.cn/';
 const tokenServicePath = 'https://user-manager-mip.test.dm-ai.cn/';
  
const getTokenVal = function() {
	console.log('获取设备id',plus.device.uuid)
	// if(uni.getStorageSync('token') !==''|| uni.getStorageSync('token') !== undefined){
	// 	return
	// }
	// 打包时userId: 131
	const TOKEN_URL = "v1/user-manager/oauth/app-id"; 
 
	let storage = '';
	const header = {
		'Cache-Control': 'no-cache, no-store, must-revalidate'
	}
	// const data = {
	// 	userId: 120,
	// 	resource_ids: '字迹分析',
	// 	access_token_validity:604800,
	// 	residue_degree: 10,
	// 	client_name: '书法评测',
	// 	client_id: plus.device.uuid
	// }
	
	// pre: 1379750724476895232
	const param = {
		"app_id":"1379751524095787008",
		"client_id": plus.device.uuid
	}
	console.log('参数数据：', param)
	console.log('接口url', tokenServicePath + TOKEN_URL)
	uni.request({
		method:'POST',
		url:tokenServicePath+TOKEN_URL,
		data: param,
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
			console.log('token接口返回的数据',data);
			
			uni.removeStorage({
			    key: 'token',
			    success: function (res) {
			        console.log('success');
			    }
			});
			const token = data.data.data;
 			uni.setStorage({
				key:'token',
				data: token
			})
			setTimeout(() => {
				console.log('更新本地存储的token',uni.getStorageSync('token'));
			},100)
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
export default {
	getTokenVal
}
