
function start(callback){
	console.log('=========================  抓取数据模块开始  =========================\n\n');
	callback();
}


/**
 *
 * ============  腾讯教育模块  ========================
 *
 */
function tencentF(){
	var tencent = require("./entity/tencent.js");
	tencent.getTencentEduAddress(sohuF);  // start tencent
	// tencent._getTencentEduAddress('http://edu.qq.com/a/20160615/021947.htm',sohuF);  // test url
}



/**
 *
 * ============  搜狐教育模块  ========================
 *
 */
function sohuF(){
	var sohu = require("./entity/sohu.js");
	sohu.getSoHuEduAddress(chinaF);  // start sohu
	// sohu._getSoHuEduAddress('http://learning.sohu.com/20160615/n454470417.shtml',chinaF);  // test url
}



/**
 *
 * ============  中华网教育模块  ========================
 *
 */
function chinaF(){
	var china = require("./entity/china.js");
	china.getChinaEduAddress(eduF);  // start china
	// china._getChinaEduAddress('http://edu.china.com/new/edunews/jy/11076178/20160612/22854140.html',eduF);  // test url
}



/**
 *
 * ============  中国教育新闻网  ========================
 *
 */

function eduF(){
	var edu = require('./entity/cedu.js');
	edu.getCEduAddress(end);  // start cedu
	// edu._getCEduAddress('http://www.jyb.cn/info/jyzck/201606/t20160615_662747.html',end);  // test url
}

function end(){
	console.log('=========================  抓取数据模块结束  =========================\n\n');
}

start(tencentF);
// start(eduF);
