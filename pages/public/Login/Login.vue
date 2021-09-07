<template>
	<view class="loginWrap" :style="{'height':windowHeight}"  >
		<view class="headerBg">
			<view class="largeWord">欢迎登陆</view>
			<view class="blackWord">请使用DMAI-AI开放平台的账号登录</view>
			<view class="grayWord">
				<text>还没有账号请点击</text>
				<text @click="openUrl" class="plat">AI开发平台</text>
				<image src="../../../static/icon_login_jump.svg" mode=""></image>
				<text>跳转注册</text>
			</view>
			<view class="formWrap">
				<view class="flexStyle">
					<input v-model="name"  name="input" placeholder-style="color:rgba(0,0,0,0.25)" placeholder="请输入用户名/邮箱/手机号" />
				</view>
				<view class="flexStyle">
					<input v-model="password" type="password" placeholder-style="color:rgba(0,0,0,0.25)" placeholder="请输入登录密码" />
				</view>			
			</view>
			<button :class="name==''||password==''?'submit':'colorBg'" @click="submitBtn">
				<uni-icons type="arrowthinright" size="26" color="#fff"></uni-icons>
			</button>
			
		</view>
		
		<view v-if="showModal" class="popup" :style="{'height':windowHeight, 'width': windowWidth}" >
			<view class="popContent">
				<view class="firstLine">{{firstWord}}</view>
				<view class="text2" v-if="!noExist">{{secondtWord}}</view>
				<view class="text2" v-if="noExist">
					<text>请到</text>
					<a href="https://daip-frontend.dm-ai.cn/Register" target="_blank">https://daip-frontend.dm-ai.cn/Register</a>
					<text>注册</text>
				</view>
				<button @click="closeModal">我知道了</button>
			</view>
		</view>
		
	</view>
</template>

<script>
	import uniPop from '@/components/uni-popup/uni-popup.vue';  
	import tokenPort from '../../../js/getTokenValue.js';
	import uniIcons from "@/components/uni-icons/uni-icons.vue";
	export default {
		components: {uniIcons, uniPop},
		data() {
			return {
				windowHeight: "200px",
				windowWidth: "375px",
				name: '',
				password: '',
				firstWord: '',
				secondtWord: '',
				failA: false,
				showModal: false,
				noExist: false,
				userId: null,
				firstToken: ''
			}
		},
		
		onLoad() {
			setTimeout(() => {
				uni.getSystemInfo({
				    success: (res) => {
				        this.windowHeight = res.windowHeight+"px";
						this.windowWidth = res.windowWidth + "px";
				} })
			})
			
		
		},
		methods: {
			openUrl() {
				plus.runtime.openURL('http://daip-frontend-internal.dm-ai.cn/Register', function(res) {  
					console.log(res);  
				});  
			},
			pageTo(){
				uni.showToast({
					title: '登陆成功',
				}); 
			},
			submitBtn() {
				this.noExist = false;
				console.log('点击了登录btn')
				const param = {
					"username": this.name,
					"password": this.password
				}
				
				
				if(this.name =='') {
					uni.showToast({
						 title: '请输入账号',
						 duration: 2000,
						 icon:'none'
					});	
					return;
				}
				if(this.password =='') {
					uni.showToast({
						 title: '请输入密码',
						 duration: 2000,
						 icon:'none'
					});	
					return;
				}
				 
				uni.request({
					method:'POST',
					// url:'https://daip-frontend.dm-ai.cn/v1/user-manager/user/login/no-verify',
					url:'https://user-manager-mip.test.dm-ai.cn/v1/user-manager/user/login/no-verify',
					data: param,
					 	
					isShowLoading:false,
					success: (res) => {
					
					
						console.log('登陆接口返回的数据', res);
						if(res.data.data) {
							this.userId =res.data.data.id;
							this.firstToken = res.data.data.token
							
							// const url = `https://daip-frontend.dm-ai.cn/v1/user-manager/oauth/${this.userId}/token`;
							const url = `https://user-manager-mip.test.dm-ai.cn/v1/user-manager/oauth/${this.userId}/token`;
							console.log('第二个接口的url', url);
							const datas ={
								"userid": this.userId,
								"resource_id": 'calligraphy_assessment'
							}
							const header = {
								'token': this.firstToken
							}
							
							uni.request({
								method:'GET',
								// url:`https://daip-frontend.dm-ai.cn/v1/user-manager/oauth/${this.userId}/token`,
								url:`https://user-manager-mip.test.dm-ai.cn/v1/user-manager/oauth/${this.userId}/token`,
								data: datas,
								header:{
									"token": this.firstToken
								},
								isShowLoading:false,
								success: (response) => {
									console.log('第二个接口返回的数据', response);
									// if(response.data.status === 401) {
									// 	uni.showToast({
									// 		 title: response.data.error+',状态码:'+response.data.status,
									// 		 duration: 2000,
									// 		 icon:'none'
									// 	});	
									// }
									// if(response.data.status === 403) {
									// 	uni.showToast({
									// 		 title: response.data.error+',状态码:'+response.data.status,
									// 		 duration: 2000,
									// 		 icon:'none'
									// 	});	
									// }
									
									this.pageTo();
									setTimeout(() => {
										uni.navigateTo({
											url: '../index_home'
										});
									},2000)
									if(response.data.code ===0) {
										tokenPort.getTokenVal();
										// uni.setStorage({
										// 	key:'token',
										// 	data: response.data.data[0]
										// })
									} else {
									   uni.removeStorage({
									       key: 'token',
									       success: function (res) {
									           console.log('success');
									       }
									   });
									}
								}
							})
						}
						if(res.data.code >= 400) {
							this.showModal = true;
						    
							if(res.data.code == 401) {
								if(res.data.error == '密码错误') {
									this.firstWord = '密码错误';
									this.secondtWord = '账号与密码不匹配，请重试';
								} else if(res.data.error=='该账号被禁用,请联系管理员') {
									this.firstWord = '无法登录';
									this.secondtWord = '您的账号已被冻结，请联系客户经理';
								} else if(res.data.error=='密码错误次数过多,请明天再登录') {
									this.firstWord = '密码错误';
									this.secondtWord = '密码错误次数过多,请明天再登录';
								} 
								 // uni.showToast({
									//  title: '账号与密码不匹配，请重试',
									//  duration: 2000,
									//  icon:'none'
								 // });						
							}
							if(res.data.code==404||res.data.error == '用户不存在') {
								this.firstWord = '账号不存在';
								this.noExist = true;
								// console.log('')
							}
						}
						if(res.data.code>=500) {
							this.firstWord = res.data.error;
							this.noExist = true;
						}
						// if(res.data.code ===0) {
						// 	this.pageTo(); 
						// 	tokenPort.getTokenVal();
							
						// 	setTimeout(() => {
						// 		uni.navigateTo({
						// 			url: '../index_home'
						// 		});
						// 	},2000)
							
						// }
						
					},
					fail: (error) => {
						console.log('登陆接口返回的error信息',error);
					},
					complete(){
						
					}
				})
				
			},
			
			closeModal() {
				this.showModal = false;
			}
			
		}
	}
</script>

<style >
	.loginWrap {
		background:rgba(255,255,255,1);
	}
	.headerBg {
		position: absolute;
		top: 0;
		left: 0;
		height: 300px;
		width: 100%;
		padding: 43px 60px;
		background-image: url(../../../static/login_header_bg.svg);
		background-size: cover;
	}

	.largeWord {
		height:56px;
		font-family:PingFangSC-Regular,PingFang SC;
		font-weight:400;
		color:rgba(0,0,0,0.85);
		line-height:56px;
		font-size: 40px;
		color:rgba(0,0,0,.85);
		margin-bottom: 21px;
	}
	.blackWord {
		font-size: 16px;
		font-family:PingFangSC-Regular,PingFang SC;
		line-height:22px;
		margin-bottom: 12rpx;
		color:rgba(51,51,51,1);
	}
	
	.grayWord {
		font-size:16px;
		margin-bottom: 39px;
		line-height: 22px;
		color:rgba(0,0,0,0.25);
	}
	.grayWord a, .grayWord .plat {
		margin-left: 13px;
		color: #DC0816;
		text-decoration: none;
	}
	.grayWord image {
		max-width: 22px;
		max-height: 22px;
		margin-right: 10px;
		vertical-align: middle;
	}
		
	.grayWord .image {
		border: 1px solid gray;
		width: 30px;
		height: 30px;
		display: inline-block;
		background-image: url(../../../static/icon_login_jump.svg);
		background-size: cover;
	}
	/* .grayWord a {
		color:rgba(0,0,0,0.25);
		text-decoration: none;
		cursor: pointer;
	} */
	.formWrap {
		height: 128px;
		box-shadow: 0 12px 48px 16px rgba(0,0,0,0.03),0 9px 28px 0 rgba(0,0,0,0.05),0 6px 16px -8px rgba(0,0,0,0.08);
		border-radius:9px;
		margin-bottom: 42px;
		padding-left: 24px;	
		background:rgba(255,255,255,1);
	}
	.flexStyle {
		display: flex;
		height: 64px;
		line-height: 64px;
		
	}
	.flexStyle input {
		height: 64px;
		line-height: 64px;
		font-size: 20px;
		
	}
	.submit,.colorBg {
		height: 64px;
		line-height: 64px;
		border-radius: 40px;
		background:rgba(0,0,0,0.15);
		border: none;
		outline: none;
		color: #fff;
	}
	.submit .uni-icons {
		color: #000;
	}
	
	.colorBg{
		background:linear-gradient(193deg,rgba(255,56,95,1) 0%,rgba(219,11,23,1) 100%);
	}
	.popup {
		position: absolute;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, .65);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.popup .popContent {
		width: 320px;
		height: 288px;
		background-color: #fff;
		padding: 55px 40px 40px 40px;
		border-radius:8px;
		text-align: center;
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
