<template>
	<view class="content">
		<view class="no-found-panel" v-if="analysisResult.err_code!=0">
			<image class="no-found" src="../../static/no-found.png"></image>
			<text>没有找到出处</text>
		</view>
		<block v-else>
			<view class="identify-result">
				<view class="identify-item">
					<view class="word">
						<image class="img-comm-border" :src="originalImgBase64" @click="showPreviewImg(originalImgBase64)"></image>
					</view>
					<view class="information">
						<view class="result">
							<image class="" src="../../static/identify-result.png"></image>
						</view>
						<view class="icon">字名：<text>{{analysisResult.data.word}}</text></view>
						<view class="icon">
							置信度：<text :class="{'warning':analysisResult.data.class_score<70}">
								{{analysisResult.data.class_score.toFixed(2)}}%
								<view class="tips" v-if="analysisResult.data.class_score<70">
									可信度较低，建议重写或调整照片再试
								</view>
							</text>
						</view>
					</view>
				</view>
			</view>
			<image class="spilt-img" src="../../static/split-bg.png"></image>
			
			<view class="compare-list">
				<view class="result">
					<image class="" src="../../static/compare-result.png"></image>
				</view>
				<view class="compare-item" v-for="(item,index) in analysisResult.data.provenance">
					<view class="word">
						<view class="word-img">
							<image class="img-comm-border" :src="origImgTempPathList['index_'+index]"  @click="showPreviewImg(origImgTempPathList['index_'+index])"></image>
						</view>
						<view class="word-item">标准字</view>
					</view>
					<view class="word">
						<view class="word-img">
							<image class="img-comm-border" :src="analysisResult.data.image[index]"  @click="showPreviewImg(analysisResult.data.image[index],'base64')"></image>
						</view>
						<view class="word-item">
							重影字
						</view>
					</view>
					<view class="information">
						<view class="icon">字名：<text>{{analysisResult.data.word}}</text></view>
						<!--写一个for循环，放数据，数据放进一个数组中，，再循环这个数组-->
						<view class="icon">相似度：<text>{{analysisResult.data.score_match[index].toFixed(2)}}%</text></view>
						<view class="icon">字体：<text>{{analysisResult.data.font[index]}}</text></view>
						<view class="icon">出处：<text>{{item}}</text></view>
					</view>
				</view>
			</view>
		</block>
		
		<view class="cu-modal show"  v-if="showModal" @click="closePreviewImg">
			<view class="images-preview">
				<view class="head">
					查看大图
					<text class="close" @tap="closePreviewImg">X</text>
				</view>
				<image class="preview-img-panel" :src="currentViewImgSource"></image>
			</view>
		</view>
	</view>
</template>

<script>
	import appConfig from '../../js/config.js';
	import basicRequest from '../../js/basicRequest.js';
	import localData from '../../js/local_data.js';
	

	export default {
		components: {},
		data() {
			return {
				analysisResult: {
					"err_code":0,
					"data": {
						"word": "",
						"class_score": 0,
						"font": [],//标准字图片的字体
						"originalData": [],//标准字图片的路径
						"score_match": [],//标准字图片的匹配分数
						"provenance": [],//标准字图片的字帖出处
						"image": []//标准字图重影图的image base64编码
					},
					"error": " 没有该字信息，请重新选择测试图片"
				},
				origImgTempPathList:{},//标准字的图片，准备的二次查询
				imgTempPathList:{},//重影的图片，准备的二次查询
				originalImgBase64:"",
				
				showModal:false,
				currentViewImgSource:""
			};
		},
		onLoad() {
		   // const token = appConfig.tss();
		   // this.tss();
		   // console.log('token首页调用', uni.getStorageSync('token'))
		},
		methods: {
			getRemoteImgPath(path){
				let srcUrl = appConfig.static_file_download_root_path;
				srcUrl+="?token="+uni.getStorageSync('token');
				srcUrl+="&path="+path;
				return srcUrl;
			},
			showPreviewImg(imgSource,type){
				this.showModal = true;
				this.currentViewImgSource = imgSource;
			},
			closePreviewImg(){
				this.showModal = false;
			}
		},
		onLoad() {

		},
		mounted() {
			uni.showLoading({
				title:"加载中……"
			});
			
			let me = this;
			let _analysisResult = uni.getStorageSync(appConfig.appAlias + "_analyse_result");
			let _originalImgBase64 = uni.getStorageSync(appConfig.appAlias + "_originalImgBase64");			
			
			//console.log("_analysisResult:"+ JSON.stringify(_analysisResult));
			//console.log("this.originalImgBase64:"+this.originalImgBase64);
			
			let _token = appConfig.restToken;
			let downloadHost = appConfig.static_file_download_root_path;
			
			for(let i=0;i<_analysisResult.data.originalData.length;i++){
				this.imgTempPathList["index_"+i] = "../../static/img-loading.gif"; 
			}
			
			let downCount = 0;
			//let maxCount = _analysisResult.data.originalData.length+_analysisResult.data.image.length;
			let maxCount = _analysisResult.data.originalData.length;
			
			for(let i=0;i<_analysisResult.data.image.length;i++){
				let _image = _analysisResult.data.image[i];
				_image = "data:image/png;base64,"+_image;				
				_analysisResult.data.image[i] = _image;
			}
			// console.log("_analysisResult:"+ JSON.stringify(_analysisResult));
			
			
			//标准字
			for(let i=0;i<_analysisResult.data.originalData.length;i++){
				let _originalData = _analysisResult.data.originalData[i];
				console.log('*i---:'+i);
				
				let downloadTask = uni.downloadFile({
				    url: downloadHost+"?path="+_originalData, //仅为示例，并非真实的资源
					header:{
						token:_token
					},
				    success: (res) => {
						downCount++;
				        if (res.statusCode === 200) {
				            //console.log('下载成功---:'+res.tempFilePath);
							//console.log('i---:'+i);
							
							me.origImgTempPathList["index_"+i] = res.tempFilePath; 
							// console.log('下载成功=====:'+me.imgTempPathList["index_"+i]);
							
							if(downCount>=maxCount){
								//console.log('i-i-i-:'+i);
								setTimeout(function(){
									me.analysisResult = _analysisResult;
									me.originalImgBase64 = _originalImgBase64;
									
									uni.hideLoading();
									me.$nextTick();
								},500);
							}
				        }						
				    }
				});
			}
		},
		onBackPress() {
			uni.reLaunch({
				url:"index_home"
			});
			return true;
		}
	}
</script>

<style>
	page {
		
	}

	.content {
		min-height: calc(100vh - 88rpx);
	}
	.content::before{
		background-image: url('../../static/child_page_bg.png');
		background-repeat: no-repeat;
		min-height: calc(100vh - 88rpx);
		background-attachment:fixed;
		background-size:calc(100vw) calc(100vh);
		
		content: ' ';
		position: fixed;
		z-index: -1;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.identify-result {
		padding: 20rpx;
		padding-top: 40rpx;
	}

	.spilt-img {
		width: 100%;
		height: calc(5vh);
	}

	.identify-result .identify-item {
		display: flex;
	}

	.identify-result .identify-item .word {
		margin-right: 50rpx;
	}

	.identify-result .identify-item .word image {
		width: 200rpx;
		height: 200rpx;
		margin: 0rpx 20rpx;
	}

	.identify-result .identify-item .information {
		line-height: 50rpx;
		font-size: 30rpx;
		font-family: '微软雅黑';
	}

	.identify-result .identify-item .information .result image {
		width: 250rpx;
		height: 70rpx;
	}

	.identify-result .identify-item .information .icon {}

	.identify-result .identify-item .information .icon text {}

	.identify-result .identify-item .information .icon::before {
		content: ' ';
		display: inline-block;
		width: 12rpx;
		height: 12rpx;
		margin-right: 16rpx;
		background-color: #6AA3CE;
		transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		/* Internet Explorer */
		-moz-transform: rotate(45deg);
		/* Firefox */
		-webkit-transform: rotate(45deg);
		/* Safari 和 Chrome */
		-o-transform: rotate(45deg);
		/* Opera */
	}

	.compare-list {
		padding: 40rpx;
	}

	.compare-list .compare-item {
		display: flex;
		margin: 30rpx 0rpx;
	}

	.compare-list .result image {
		width: 250rpx;
		height: 70rpx;
	}

	.compare-list .compare-item .word .word-img {
		margin-right: 16rpx;
	}

	.compare-list .compare-item .word .word-img image {
		width: 180rpx;
		height: 180rpx;
		border:solid 2px #e48696;
	}

	.compare-list .compare-item .word .word-item {
		text-align: center;
		margin-right: 16rpx;
		font-size: 14rpx;
		font-weight: bold;
	}

	.compare-list .compare-item .information {
		font-size: 20rpx;
		line-height: 40rpx;
	}

	.compare-list .compare-item .information .icon {}

	.compare-list .compare-item .information .icon text {}

	.compare-list .compare-item .information .icon::before {
		content: ' ';
		display: inline-block;
		width: 12rpx;
		height: 12rpx;
		margin-right: 16rpx;
		background-color: #6AA3CE;
		transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		/* Internet Explorer */
		-moz-transform: rotate(45deg);
		/* Firefox */
		-webkit-transform: rotate(45deg);
		/* Safari 和 Chrome */
		-o-transform: rotate(45deg);
		/* Opera */
	}

	.img-comm-border{
		border:solid 2px #e48d9c;
	}

	.no-found-panel {
		text-align: center;
		width: 80%;
		position: absolute;
		top: 40%;
		left: 50%;
		
		-webkit-transform: translate(-50%, -50%);
		-moz-transform: translate(-50%, -50%);
		-ms-transform: translate(-50%, -50%);
		-o-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}


	.warning{
		color:red;
	}
	.warning .tips{
		font-size: 22rpx;
	}
	.no-found-panel .no-found {
		width: 100%;
	}
	
	
	.cu-modal{
		z-index: 999999999;
	}
	.cu-modal .images-preview{
		background-color: #FFFFFF;
		border-radius: 10px;
		border-top: solid 1px #cccccc;
		
		position: absolute;
		top: 50%;
		left: 50%;
		
		-webkit-transform: translate(-50%, -50%);
		-moz-transform: translate(-50%, -50%);
		-ms-transform: translate(-50%, -50%);
		-o-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
	}
	.cu-modal .images-preview .head{
		border-bottom: solid 1px #CCCCCC;
		height:60rpx;
		line-height: 60rpx;
		font-weight: bold;
		font-family: '微软雅黑';
		font-size: 34rpx;
	}
	.cu-modal .images-preview .head .close{
		position: absolute;
		right:0rpx;
		width:60rpx;
		text-align: center;
	}
	
	
	
	@media (min-width: 300px) {
		.preview-img-panel {
			min-height: 300px;
			width:300px;
			height:300px;
			padding:10px;
		}
	}
	@media (min-width: 600px) {
		.preview-img-panel {
			min-height: 500px;
			width:500px;
			height:500px;
			padding:10px;
		}
	}
	@media (min-width: 750px) {
		.preview-img-panel {
			min-height: 600px;
			width:600px;
			height:600px;
			padding:10px;
		}
	}
	@media (min-width: 900px) {
		.preview-img-panel {
			min-height: 800px;
			width:800px;
			height:800px;
			padding:10px;
		}
	}
	@media (min-width: 1200px) {
		.preview-img-panel {
			min-height: 1000px;
			width:1000px;
			height:1000px;
			padding:10px;
		}
	}
	@media (min-width: 1500px) {
		.preview-img-panel {
			min-height: 1000px;
			width:1000px;
			height:1000px;
			padding:10px;
		}
	}
</style>
