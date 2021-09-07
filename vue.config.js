module.exports = {
	"devServer" : {
	    "port" : 8096,
	    "historyApiFallback" : true,
	    "host" : "0.0.0.0",
	    "disableHostCheck" : true,
	    "noInfo" : true,
		// 可以在mainifest.json中配置跨域,但是只能配一处
	    "proxy" : { 
	        "/h5api" : {
	            // 需要被代理的后台地址
	            "target" : "http://192.168.2.4:8096",
	            "changeOrigin" : true,
	            "secure" : false,
	            "pathRewrite" : {
	                "^/h5api" : "/"
	            }
	        }
	        
	    }
	}
}