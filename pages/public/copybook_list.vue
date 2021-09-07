<template>
	<view class="content">
		
		<view class="no-found-panel" v-if="false">
			<image class="no-found" src="../../static/no-found.png"></image>
			<text>没有找到出处</text>
		</view>
		<block v-else>
			<view>
				<view class="serach">
					<view class="search-content">
						<input @confirm="loadList(true)" confirm-type="search" placeholder="请输入需要搜索的字" name="input" maxlength="1" v-model="word"></input>
					</view>
					<view class="btn-query" @click="loadList(true)">查询</view>
				</view>
				<view class="flex">
					<view class="word-list"  v-for="(item,index) in pager.posterPager.rows" :key="index">
						<view class="img" @tap="openPreviewImg(item)">
							<image class="" :src="item.localTempPaths[0]"></image>
						</view> 
						<view class="word-detail">
							<view class="title">{{item.provenance}}</view>
							<view class="word-content">
								<view class="word-type">{{item.font}}</view>
							</view>
						</view>
					</view>
		
				</view>
			</view>
			
			
			<view class="cu-modal show"  v-if="showModal" @tap="closePreviewImg">
				<view class="images-preview">
					<view class="head">
						查看大图(共{{cLocalTempPaths.length}}张)
						<text class="close" @tap="closePreviewImg">X</text>
					</view>
					<view class="img-list">
						<swiper class="screen-swiper" :class="dotStyle?'square-dot':'round-dot'" :indicator-dots="true" :circular="true">
							<swiper-item v-for="(localTempPath,index) in cLocalTempPaths" :key="index">
								<image :src="localTempPath"></image>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>
			
			<block v-if="hasQuery">
				<!--下载加载更多的组件引用，已注册为全局样式 uni-load-more.vue-->
				<uni-load-more  ref="ulm1"  iconType="circle" :status="pager.posterPager.status"  @loadMore="loadMore"></uni-load-more>
			</block>
			<block v-else>
				<view class="tipText">请在上方输入汉字进行搜索</view>
			</block>
		</block>
	</view>
</template>

<script>
 import appConfig  from '../../js/config.js';
 import localData  from '../../js/local_data.js';
 import basicRequest  from '../../js/basicRequest.js';
 import loadMore  from '../../js/loadMore.js';
 import tokenRequest  from '../../js/tokenRequest.js';
 
 
 const REST_URL = "calligraphy/word";//post
 const TOKEN_URL = "v1/user-manager/oauth/android/register";
 
 export default {

	components:{
		
	},
	data() {
		return {
			hasQuery:false,
			word:"",
			pager:{
				posterPager:{
					page:1,
					rows:[],
					status: 'more'
				},
				page:1,
				rows:[]
			},
			showModal:false,
			dotStyle:true,
			cLocalTempPaths:[],
			swiperList: []
		};
	},
	methods: {
		closePreviewImg(){
			this.showModal = false;
		},
		openPreviewImg(item){
			this.showModal = true;
			this.cLocalTempPaths = item.localTempPaths;
		},
		loadList(isReload){
			let me = this;
			if(this.word==""){
				uni.showToast({
					icon:"none",
					title:"请输入字名"
				});
				return;
			}
			
			me.hasQuery = true;
			
			let pager = this.pager.posterPager;
			pager.status = "loading";
			if(isReload){
				pager.rows = [];
				pager.page = 1;
			}
			let postUrl =  appConfig.getServicePath()+REST_URL;
			loadMore.request({
				url:postUrl,
				pager:pager,
				urlParams:{
					word:this.word
				},
				ajaxOpt:{
					type:"GET"
				},
				success(data,parameters,hasMore){
					console.log('查询接口返回的data:',data)
					let rows = data.data.data.data;
					if(rows.length>0){
						pager.page+=1;
					}
					if(hasMore){
						pager.status = "more";
					}else{
						pager.status = "noMore";
					}
					
					
					let downCount = 0;
					let maxCount = 0;
					for(let i=0;i<rows.length;i++){//总共需要下载的数量，防止有个别记录无图片的
						if(rows[i].originalDatas.length>0){
							maxCount++;
						}
					}
					
					
					//先查一个作为封面
					for(let i=0;i<rows.length;i++){
						let row = rows[i];
						let path = row.originalDatas[0].original_data;
						row.localTempPaths = [];
						if(row.originalDatas.length==0){
							continue;
						}
						
						basicRequest.downloadImg({
							parentData:row,
							path,
							success(parentRow,tempFilePath){
								downCount++;
								parentRow.localTempPaths.push(tempFilePath);
								
								console.log(parentRow.provenance+"的首张封面下载完成:"+tempFilePath);
								//说明四张封面都查完了，则追加到pager的rows中
								if(downCount>=maxCount){
									setTimeout(function(){
										pager.rows = pager.rows.concat(rows);
										me.downMoreImg(pager.rows,hasMore);
									},200);
								}
							}
						});
					}
					
				}
			});
		},
		downMoreImg:function(rows,hasMore){
			for(let i=0;i<rows.length;i++){
				let row = rows[i];
				
				if(row.localTempPaths==row.originalDatas.length){
					continue;
				}
				
				for(let j=1;j<row.originalDatas.length;j++){
					let path = row.originalDatas[j].original_data;
					basicRequest.downloadImg({
						parentData:row,
						path,
						success(data,tempFilePath){
							data.localTempPaths.push(tempFilePath);
						}
					});
				}
			}
		},
		loadMore(){
			console.log("加载更多……");
			this.loadList();
		},
		getRemoteImgPath(item){
			let fileName = "";
			if(item.provenance=="三门记"){
				fileName = "smj.jpg";
			}else if(item.provenance=="玄秘塔碑"){
				fileName = "xmtb.jpg";
			}else if(item.provenance=="颜勤礼碑"){
				fileName = "yqlb.jpeg";
			}else if(item.provenance=="九成宫"){
				fileName = "jcg.jpg";
			}else{
				fileName = "default.jpg";
			}
			return "../../static/cover/"+fileName;
		},
		
		
	},
	onLoad() {
		
	},
	mounted(){
		
	}
 }
</script>

<style>
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
	
	.content .serach{
		display: flex;
		padding: 20rpx 10rpx;
	}
	
	.content .serach .search-content{
		margin:0rpx 10rpx;
		width: 75%;
	}
	.content .serach .search-content input{
		height: 100%;
		font-size: 32rpx;
		background-color: #E4E7ED;
		border-radius: 20rpx;
		padding:0 16rpx;
	}
	.content .serach .btn-query{
		border: 1px solid #148ED8;
		padding: 10rpx 40rpx;
		border-radius: 14rpx;
		font-size:30rpx;
		background-color:#148ED8 ;
		color: #FFFFFF;
	}
	.content .flex{
		flex-direction: row;
		    flex-wrap: wrap;
	}	
	.content .word-list{
		padding: 20rpx 10rpx;
		width: 50%;
		flex-direction:row;
		flex-wrap:wrap;
		
	}
	.content .word-list .img{
		margin:0 20rpx;
		text-align: center;
	}
	.content .word-list .img image{
		width: 200rpx;
		height:200rpx;
		margin: auto;
		border:solid 2px #e48696;
	}
	.content .word-list .img image::before{
		content: '查看大图';
		color: #fff;
		right: 0rpx;
		position: absolute;
		font-size: 20rpx;
		font-family: "黑体";
		background-color: #6AA3CE;
		padding: 6rpx;
		border-radius:0 0 0 10rpx;
	}
	.content .word-list .word-detail .title{
		font-weight: bold;
		line-height: 50rpx;
		font-size: 30rpx;
		text-align: center;
	}
	.content .word-list .word-detail .word-content{
		text-align: center;
	}
	.content .word-list .word-detail .word-type{
		line-height: 40rpx;
		font-size: 24rpx;
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
		.screen-swiper {
			min-height: 300px;
		}
		.cu-modal uni-swiper{
			width:300px;
			height:300px;
			padding:10px;
		}
	}
	@media (min-width: 600px) {
		.screen-swiper {
			min-height: 500px;
		}
		.cu-modal uni-swiper{
			width:500px;
			height:500px;
			padding:10px;
		}
	}
	@media (min-width: 750px) {
		.screen-swiper {
			min-height: 600px;
		}
		.cu-modal uni-swiper{
			width:600px;
			height:600px;
			padding:10px;
		}
	}
	@media (min-width: 900px) {
		.screen-swiper {
			min-height: 800px;
		}
		.cu-modal uni-swiper{
			width:800px;
			height:800px;
			padding:10px;
		}
	}
	@media (min-width: 1200px) {
		.screen-swiper {
			min-height: 1000px;
		}
		.cu-modal uni-swiper{
			width:1000px;
			height:1000px;
			padding:10px;
		}
	}
	@media (min-width: 1500px) {
		.screen-swiper {
			min-height: 1000px;
		}
		.cu-modal uni-swiper{
			width:1000px;
			height:1000px;
			padding:10px;
		}
	}
	
	
	.tipText{
		text-align: center;
		color: #CCCCCC;
	}
</style>