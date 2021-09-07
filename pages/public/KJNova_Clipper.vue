<template>
	<view>
		<view class="content">
			 <image-cropper :src="tempFilePath" @confirm="confirm" @cancel="cancel"></image-cropper>
			 <image class="img-result" :src="cropFilePath" mode="aspectFit" style="width: 100%;"></image>
		</view>
		
		<view v-show="hideModel" class="popup" >
			<view class="popContent">
				<view class="firstLine">试用已到期</view>
				<view class="text2">请联系你的客户经理开通继续使用</view>
				<button @click="closeModal">我知道了</button>
			</view>
		</view>
			
	</view>
</template>

<script>
	import appConfig  from '../../js/config.js';
	import basicRequest  from '../../js/basicRequest.js';
	import localData  from '../../js/local_data.js';
	
	import ImageCropper from "../../components/ling-imgcropper/ling-imgcropper.vue";
	
	const REST_URL = "v1/copybook/analyze";
	const TOKEN_VAL = uni.getStorageSync('token');
	
	
	export default {
		components: {
			ImageCropper
		},
		data(){
			return {	
				tempFilePath: '',//上一个页面传过来的
				cropFilePath: '', 
				hideModel: false, // 过期的弹窗
			}	
		},
		
		onLoad() {
			 // this.getToken();
		   // const token = appConfig.tss();
			if(uni.getStorageSync('token') ==''|| uni.getStorageSync('token') == undefined) {
				// appConfig.getTokenVal()
				tokenVal.getTokenVal()
			}
		    console.log('详情页调用', uni.getStorageSync('token'))
		},
		
		methods:{
			closeModal() {
				this.hideModel = false;
			},
			showModals() {
				this.hideModel = true;
			},
			confirm(e) {
				let me = this;
				
				this.tempFilePath = '';
				this.cropFilePath = e.detail.tempFilePath;
				//console.log("this.cropFilePath:"+this.cropFilePath);
				
				
				uni.showLoading({
					title:"图片裁剪压缩中……",
					success:function(){
						//如果在APP模式下，需要得到base64编码
						//#ifdef APP-PLUS 
						console.log("当前为app模式,将本地图径转为base64");
						plus.io.resolveLocalFileSystemURL( me.cropFilePath, function( entry ) {
							//console.log("=====:resolveLocalFileSystemURL");
							entry.file( function(file){
								var fileReader = new plus.io.FileReader();
								//fileReader.readAsText(file, 'utf-8');
								fileReader.readAsDataURL(file, 'utf-8');
								fileReader.onloadend = function(evt) {
								
									me.analysisImg(evt.target.result);
								}
							} );
						}, function ( e ) {
							console.error( "Resolve file URL failed: " + e.message );
						} );
						//#endif
						
						//#ifdef H5
						  // const rs = appConfig.getTokenVal();
						
						// 动态获取token
						setTimeout( () => {
							me.analysisImg(me.cropFilePath);
						},2000) 
						 
						// me.analysisImg(me.cropFilePath);
						//#endif
					}
				});
			},
			analysisImg(imgBase64){
				 let me = this;
				// uni.hideLoading();
				/* if(uni.getStorageSync('token') ==''|| uni.getStorageSync('token') == undefined) {
					// appConfig.getTokenVal()
					tokenVal.getTokenVal()
				}
				setTimeout(() =>{
					console.log('查看token',uni.getStorageSync('token'))
				}) */
				uni.showLoading({
					title:"正在分析中，请稍等…",
					success:function(){
						//替换文件类型的前缀
						//console.log("imgBase64:"+imgBase64);
						//let newImgBase64 = imgBase64.replace(/data:\S+\/\S+base64,/,"");
						
						console.log("开始替换data:image/png;base64,");
						let newImgBase64 = imgBase64.replace("data:image/png;base64,","");
						let postUrl =  appConfig.getServicePath()+REST_URL;
						// console.log('newImgBase64',newImgBase64)
						console.log('postUrl',postUrl)
						console.log('调用了接口getServicePath:',postUrl)
						console.log('查看是否过期了',uni.getStorageSync('expire'))
						// setTimeout(() =>{
						// 	console.log('查看是否过期了',me.hideModel,uni.getStorageSync('expire')=='Unauthorized')
						// 	if(uni.getStorageSync('expire')=='token expire') {
						// 		me.hideModel = true;
						// 	} 
						// 	if(uni.getStorageSync('expire')=='Unauthorized') {
						// 		me.hideModel = true;
						// 	}
						// },100)
						
						basicRequest.request({
							url:postUrl,
							data:{
								image:newImgBase64
							},
							
							isShowLoading:false,
							success(data, parameters){
								// console.log('页面data',data)
								uni.$emit('clippered',{analysisResult:data.data,originalImgBase64:imgBase64});	
								
								uni.setStorage({key:appConfig.appAlias+"_analyse_result",data:data.data});
								uni.setStorage({key:appConfig.appAlias+"_originalImgBase64",data:imgBase64});
								
								setTimeout(function(){
									uni.navigateTo({
										url: 'word_detail',
									});
								},200);
							},
							
							complete(){
								uni.hideLoading();
							}
						});
						
						if(uni.getStorageSync('expire')=='token expire') {
							me.hideModel = true;
						} 
						if(uni.getStorageSync('expire')=='Unauthorized') {
							me.hideModel = true;
						} else {
							me.hideModel = false;
						}
					},
					
				});
			},
			cancel() {
				console.log('canceled');
				uni.navigateBack();
			}
		},
		onLoad(opt){
			let me = this;
			setTimeout(function(){
				me.tempFilePath = opt.tempFilePath;
				//console.log("me.tempFilePath:"+me.tempFilePath);
			},200);
		},
		created() {
			
	
		},
		mounted(){
			
		}
	};
</script>

<style>
	page{
		background-color: #000000;
		padding-top:20rpx;
	}
	.content{
		background-color: #000000;
	}	
	.img-result{
		margin-top:20rpx;
	}
	
	.popup {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		background: rgba(0, 0, 0, .65);
		z-index: 9999;
		background-color: gray;
	}
	.popup .popContent {
		width: 320px;
		height: 288px;
		background-color: #fff;
		padding: 55px 40px 40px 40px;
		border-radius:8px;
		text-align: center;
		margin: auto;
	}
	.popup .popContent .firstLine {
		font-size: 24px;
		height:33px;
		color:rgba(0,0,0,0.85);
		font-weight: 600;
	}
	.popup .popContent .text2 {
		width: 100%;
		height:44px;
		font-size: 16px;
		margin-top: 34px;
		color:rgba(0,0,0,.65);
		line-height: 22px;
	}
	.popup .popContent button {
		width:240px;
		height:56px;
		line-height: 56px;
		background:linear-gradient(193deg,rgba(255,56,95,1) 0%,rgba(219,11,23,1) 100%);
		border-radius:40px;
		margin-top: 26px;
		font-size: 16px;
		color: #fff;
	}
	
</style>
