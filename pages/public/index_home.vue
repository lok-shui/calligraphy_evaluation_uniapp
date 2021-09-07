<template>
	<view class="content" >
		
		<!-- <image class="page-bg" src="../../static/index_bg.jpg" @click="showSelectOperateType = false"></image> -->
		<view class="page-btn-area" @click="operateType">
			<image class="index-btn-1" src="../../static/index-btn-1.png"></image>
			<image class="index-btn-2" src="../../static/index-btn-2.png"></image>
		</view>
		
		<image class="icon-query" src="../../static/icon-query.png" @click="queryWord"></image>
		
		
		<view class="btn-operate-select" v-show="showSelectOperateType">
			<view class="btn-list">
				<view class="btn-item" @click="camera('camera')">
					<text class="iconfont icon-camera"></text>
					<text class="label-text">拍照</text>
				</view>
				<view class="btn-item" @click="camera('album')">
					<text class="iconfont icon-album"></text>
					<text class="label-text">从相册选择</text>
				</view>
			</view>
			<view class="btn-cancel" @click="cancelSelect">
				取消
			</view>
		</view>
		<div @click="getToken" v-show="showProt">调用注册接口</div>
	</view>
</template>

<script>
	import appConfig  from '../../js/config.js';
	import basicRequest  from '../../js/basicRequest.js';
	import app  from '../../js/app.js';
	
	import localData  from '../../js/local_data.js';
	import tokenRequest  from '../../js/tokenRequest.js';
	import tokenPort  from '../../js/getTokenValue.js';
	
	const TOKEN_URL = "v1/user-manager/oauth/android/register";
	const TOKEN_VAL = uni.getStorageSync('token');
	
	export default {
		components: {
		},
		data(){
			return {
				showSelectOperateType:false,
				pageData:{
				},
				selectedValue:-1,
				pictureAnalysisResult:"",
				showProt: false
			}	
		},
		onLoad() {
			
			if(uni.getStorageSync('token') ==''|| uni.getStorageSync('token') == undefined) {
				
				 console.log('onload存儲的有token', uni.getStorageSync('token') )
			}
			// this.getToken();
			 
		},
		onShow: function() {
			// tokenPort.getTokenVal()
			if(uni.getStorageSync('token') ==''|| uni.getStorageSync('token') == undefined) {
				// this.getToken();
			} else {
				// console.log('onShow存儲的有token',  uni.getStorageSync('token'))
			}
		},
		
		
		
		methods:{
			getToken() {
				// console.log('存儲的有token',tokenVal.getTokenVal())
				const tokenServicePath = 'https://user-manager-mip.test.dm-ai.cn/';
				const TOKEN_URL = "v1/user-manager/oauth";
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
						
						const token = data.data.data;
						uni.setStorage({
							key:'token',
							data: token
						})
						storage = uni.getStorageSync('token');
						console.log('存储接口返回的token',token,storage);
						return storage;
					},
					complete(){
						uni.hideLoading();
					}
				})
			},
			
			
			operateType() {
				//#ifdef H5
				this.camera('album');
				//#endif
				//#ifdef APP-PLUS
				this.showSelectOperateType = true;
				//#endif
			},
			cancelSelect(){
				this.showSelectOperateType = false;
			},
			camera(type){
				let me = this;
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['compressed'],//['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: [type], //'album':从相册选择,'camera':拍照
					success: (res) => {
						me.showSelectOperateType = false;
						if(type=='camera'){
							let tempRes = res;
							uni.saveImageToPhotosAlbum({
							    filePath: res.tempFilePaths[0],
							    success: function(e) {
							        console.log('保存图片成功……');   
									
									uni.navigateTo({
										url: 'KJNova_Clipper?tempFilePath='+res.tempFilePaths[0]
									});
							    }
							});
						}else{
							let tempFilePath = res.tempFilePaths.shift();
							uni.navigateTo({
								url: 'KJNova_Clipper?tempFilePath='+tempFilePath
							});
						}
					}
				});
			},	
			queryWord(){
				this.showSelectOperateType = false;
				uni.navigateTo({
					url: 'copybook_list'
				});
			},
		},
		created() {
			
		},
		mounted(){
			//#ifdef APP-PLUS
			// plus.screen.lockOrientation( 'landscape-secondary');
			// plus.screen.lockOrientation( 'landscape-primary');
			//#endif
			
			let me = this;
			uni.$on("clippered",function(data){
				console.log("index_home-clippered触发");
				
				//console.log("clippered-analysisResult:"+ JSON.stringify(data.analysisResult));
				//console.log("clippered-originalImgBase64:"+data.originalImgBase64);
			});
		}
	};
</script>

<style>
	page{
		padding:0px;
	}
	.page-bg{
		position: absolute;
		left:0px;
		top:0px;
		width:calc(100vw);
		height:calc(95vh);
		
	}
	
	
	.page-btn-area{
		width:500rpx;
		position: absolute;
		top:50%;
		left:50%;
		
		-webkit-transform: translate(-50%, -50%);
		-moz-transform: translate(-50%, -50%);
		-ms-transform: translate(-50%, -50%);
		-o-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}
	.page-btn-area .index-btn-1{
		width:500rpx;
		height: 500rpx;
		margin:auto;
	}
	.page-btn-area .index-btn-2{
		width:500rpx;
		height: 120rpx;
		margin:auto;
	}
	
	
	
	
	.content {
	}
	.btn-operate-select{
		width:100%;
		position: fixed;
		background-color: #FFFFFF;
		left:0rpx;
		bottom: 0px;
	}
	.btn-list{
		display: flex;
		flex-direction: row;
		padding:20rpx;
	}
	.btn-list .btn-item{
		width:50%;
		heigh:80px;
		text-align: center;
	}
	.btn-list .btn-item .iconfont{
		display: block;
		width:100rpx;
		height:100rpx;
		border-radius: 100%;
		line-height: 100rpx;
		font-size: 50rpx;
		color:#FFFFFF;
		text-align: center;
		margin: auto;
	}
	.btn-list .icon-camera{
		background-color: #fdb163;
	}
	.btn-list .icon-album{
		background-color: #fb6e65;
	}
	.btn-list .icon-camera::after{
		content: '\e683';
	}
	.btn-list .icon-album::after{
		content: '\e612';
	}
	.btn-list .btn-item .label-text{
		display: block;
		margin-top:10rpx;
	}
	
	.btn-operate-select .btn-cancel{
		border-top:solid 1px #cccccc;
		width:100%;
		text-align: center;
		padding:20rpx;
		line-height: 50rpx;
		font-size: 35rpx;
		font-family: '微软雅黑';
	}
	
	
	.icon-query{
		position: absolute;
		right:60rpx;
		top:60rpx;
		width:100rpx;
		height:100rpx;
	}
</style>
