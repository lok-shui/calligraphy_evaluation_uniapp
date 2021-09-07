import appConfig from './config.js';


/**
 * 设置当前状态
 **/
const setState = function(state) {
	state = state || {};
	console.log("setState:"+JSON.stringify(state));
	uni.setStorage({key:appConfig.stateKeyName,data:state});
};
/**
 * .userId
 * 获取当前状态
 **/
const getState = function() {
  console.log("getState-appConfig.stateKeyName:"+appConfig.stateKeyName);
  let value =  uni.getStorageSync(appConfig.stateKeyName);
  return value;
};
/**
 * 设置当前状态
 **/
const clearState = function() {
	uni.removeStorageSync(appConfig.stateKeyName);
};

/**
 * 设置数据
 **/
const setData = function(key,item) {
	item = item || "{}";
	console.log("setDate-key:"+key);
	console.log("setDate-item:"+JSON.stringify(item));
	uni.setStorage({
		key:key,
		data:item
	})
};
/**
 * 获取数据
 **/
const getData = function(key) {
  let value =  uni.getStorageSync(key);
  return value;
};
/**
 * 清空数据
 **/
const clearData = function(key) {
	uni.removeStorageSync(key);
};


const whetherLand = function(){
	var state = getState();
	if(state.fd_account==undefined){
		return false;
	}
	return true;
};


/**
 * 设置token到本地
 * @param {Object} token
 */
const setToken = function(token){
  uni.setStorage({key:appConfig.tokenKeyName, data:token});
}
/**
 * 从本地得到token对象
 */
const getToken = function(){
  const value = uni.getStorageSync(appConfig.tokenKeyName);
  return value;
}
/**
 * 清除token对象
 */
const clearToken = function(){
  uni.removeStorageSync(appConfig.tokenKeyName);
}


export default {
	setState,
	getState,
	clearState,
	
	setData,
	getData,
	clearData,
	
	
	whetherLand,

	setToken,
	getToken,
	clearToken
};
