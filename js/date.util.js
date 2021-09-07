const getDuration = function(cDuration){
	var duration = cDuration;
	duration = duration-0;
	var minute = duration<60?0:(duration/60).toFixed(0);
	var second = duration%60;
	second = second.toFixed(0);
	
	var minuteStr = minute==0?"00":minute+"";
	minuteStr = minuteStr.length<2?"0"+minuteStr:minuteStr;
	
	var secondStr = second==0?"00":second+"";
	secondStr = secondStr.length<2?"0"+secondStr:secondStr;
	
	var durationStr = minuteStr +":"+secondStr;
	return durationStr;
};
/**
 * 返回日期字符串,只包括年月日,不包括时分秒
 * @param {Object} date 日期对象/或时间字符串
 * @param {Object} separator 分隔符  默认为"-"
 */
const getDateStr = function(date,separator){
	if(date===""||date===undefined){
		return "";
	}
	if(typeof date=="string"){
		date = stringToDate(date,separator);
	}
	separator = separator?separator:"-";
	
	let year = date.getFullYear();
	let month = date.getMonth()+1<10?'0'+(date.getMonth()+1):date.getMonth()+1;
	let day = date.getDate()<10?'0'+date.getDate():date.getDate();
	
	var strDate = year+separator+month+separator+day;  
	return strDate;
};
/**
 * 返回时间字符串,包括时分秒
 *  @param {Object} date 日期对象/或时间字符串
 * @param {Object} separator 日期的分隔符 默认为"-"
 */
const getDateTimeStr = function(date,separator,isContainSecond){
	if(date===""||date===undefined){
		return "";
	}
	if(typeof date=="string"){
		date = stringToDate(date,separator);
	}
	separator = separator?separator:"-";
	let strDate = getDateStr(date,separator);
	strDate += " "+getTimeStr(date,separator,isContainSecond);      
	return strDate;
};
/**
 * @param {Object} date
 * @param {Object} isContainSecond 是否包含秒(默认包含)
 */
const getTimeStr = function(date,separator,isContainSecond){
	if(date===""||date===undefined){
		return "";
	}
	if(typeof date=="string"){
		date = stringToDate(date,separator);
	}
	if(isContainSecond===undefined){
		isContainSecond = true;
	}
	let hour = date.getHours();
	hour = hour<10?"0"+hour:hour;
	let minute = date.getMinutes();
	minute = minute<10?"0"+minute:minute;
	let second = date.getSeconds();
	second = second<10?"0"+second:second;
	
	let timeStr = hour+":"+minute;
	if(isContainSecond){
		timeStr+=":"+second;
	}
	return timeStr;
};

//[不建议使用]返回日期yyyy/MM/dd
const getDate = function(cdate){
	if(cdate==undefined){
		return
	}
	if(typeof cdate=="string"){
		cdate = cdate.replace(/-/g,"/");
		cdate = cdate.substr(0,10);
		return cdate;
	}
	return getDateStr(cdate,"/");
};
//[不建议使用]返回日期yyyy-MM-dd
const getDate2 = function(cdate){
	if(typeof cdate=="string"){
		cdate = cdate.replace(/\//g,"-");
		cdate = cdate.substr(0,10);
		return cdate;
	}
	return getDateStr(cdate);
};
//[不建议使用]返回时间hh:mm
const getTime = function(cdate){
	if(cdate==undefined){
		return
	}
	// console.log("原时间:",cdate);
	let date = JSON.stringify(cdate)
	let d = JSON.parse(date)
	// console.log("格式化后时间:",d.slice(11,16));
	return d.slice(11,16);
};
//[不建议使用]返回时间hh:mm:ss
const getTime2 = function(cdate){
	if(cdate==undefined){
		return
	}
	// console.log("原时间:",cdate);
	let date = JSON.stringify(cdate)
	let d = JSON.parse(date)
	// console.log("格式化后时间:",d.slice(11,19));
	return d.slice(11,19);
};


//返回时间范围hh:mm~hh:mm
const getTimeScope = function(sdate,edate){
	let strTime1 = getTimeStr(sdate,"-",false)
	let strTime2 = getTimeStr(edate,"-",false)
	return strTime1+"~"+strTime2;
};

//返回'星期几'
const getWeek = function(date){
	let weeks = new Array("日", "一", "二", "三", "四", "五", "六");  
	let week = date.getDay();  
	let str = "星期"+ weeks[week];
	return str;
};

const parse = function(dateStr){
	//var s ='2018-10-09 10:23:12';
	dateStr = dateStr.replace(/-/g,"/");
	var date = new Date(dateStr);
	return date;
}

/**
 * @param {Object} dateStr 日期字符串
 * @param {Object} separator 年月日的分隔符
 */
const stringToDate = function(dateStr,separator){
	if(dateStr==""){
		return undefined;
	}
     if(!separator){
            separator="-";
     }
	 
	 let year,month,day,hour,minute,second;
	 
	 var dateParts = dateStr.split(" ");
	 
	 let dateArr = dateParts[0].split(separator);
	 year = parseInt(dateArr[0]);
	 month = parseInt(dateArr[1]);
	 day = parseInt(dateArr[2]);
	 if(dateParts.length==1){
		 return new Date(year,month -1,day);
	 }else{
		 let timeArr = dateParts[1].split(":");
		 hour = parseInt(timeArr[0]);
		 minute = parseInt(timeArr[1]);
		 second = parseInt(timeArr[2]);
		 return new Date(year,month -1,day,hour,minute,second);
	 }
 };

const getDiffTimeStr = function(startData,endDate){
    //相差的总秒数
    let totalSeconds = parseInt((endDate - startData) / 1000);
    //天数
    let days = Math.floor(totalSeconds / (60 * 60 * 24));
    //取模（余数）
    let modulo = totalSeconds % (60 * 60 * 24);
    //小时数
    let hours = Math.floor(modulo / (60 * 60));
    modulo = modulo % (60 * 60);
    //分钟
    let minutes = Math.floor(modulo / 60);
    //秒
    let seconds = modulo % 60;
    //输出到页面
    console.log("date.util-getDiffTimeStr:"+"剩余抢购:" + days + "天" + hours + "：" + minutes + "：" + seconds);
	let diffTimeStr = "";
    if(days>0){
		diffTimeStr = days + "天"+ hours + "小时" + minutes+"分钟";
	}else{
		if(hours>0){
			diffTimeStr = hours + "小时" + minutes+"分钟";
		}else{
			diffTimeStr = minutes+"分钟";
		}
	}
	return diffTimeStr;
};

const getDiffDays = function(startData,endDate){
    //相差的总秒数
    let totalSeconds = parseInt((endDate - startData) / 1000);
    //天数
    let days = Math.floor(totalSeconds / (60 * 60 * 24));
    //取模（余数）
    let modulo = totalSeconds % (60 * 60 * 24);
    //小时数
    let hours = Math.floor(modulo / (60 * 60));
    modulo = modulo % (60 * 60);
    //分钟
    let minutes = Math.floor(modulo / 60);
    //秒
    let seconds = modulo % 60;
    //输出到页面
    console.log("date.util-getDiffTimeStr:"+"剩余抢购:" + days + "天" + hours + "：" + minutes + "：" + seconds);
	return days;
};

const getFormatDate = function(arg) {
    if (arg == undefined || arg == '') {
        return '';
    }
    var re = arg + '';
    if (re.length < 2) {
        re = '0' + re;
    }
    return re;
}

const addDate = function(date, days) {
    if (days == undefined) {
        days = 1;
    }else{
    	days = days-0;
    }
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return date.getFullYear() + '-' + getFormatDate(month) + '-' + getFormatDate(day);
};

//时间格式化函数
const format = function(format,date){ 
	var o = { 
	"M+" : date.getMonth()+1, //month 
	"d+" : date.getDate(), //day 		
	"h+" : date.getHours(), //hour 		
	"m+" : date.getMinutes(), //minute 		
	"s+" : date.getSeconds(), //second 		
	"q+" : Math.floor((date.getMonth()+3)/3), //quarter 		
	"S" : date.getMilliseconds() //millisecond 
	}
	if(/(y+)/.test(format)) { 
		format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	}
	for(var k in o) { 
		if(new RegExp("("+ k +")").test(format)) { 
		format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
	 	} 
	} 
	return format;
}

export default {
	getDateStr,
	getDateTimeStr,
	getTimeStr,
    getDuration,
	getDate,
	getDate2,
	getTime,
	getTime2,
	getTimeScope,
	getWeek,
	format,
	parse,
	stringToDate,
	getDiffTimeStr,
	getDiffDays,
	addDate
}
