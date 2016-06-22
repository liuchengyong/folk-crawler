var request = require('request');
var objectAssign = require('object-assign');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');



/**
 * [pushNoReapet description]  添加数组的不重复添加 
 * @param  {[type]} item [description]
 * @return {[type]}      [description]
 */
Array.prototype.pushNoReapet = function(item){
	if(this.join(',').search(item) == -1) this.push(item);
};

/**
 * [Format description] 日期格式化
 * @param {[type]} fmt [description]
 */
Date.prototype.Format = function(fmt) {
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }	
    for (var k in o){
		if (new RegExp('(' + k + ')').test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
		}
    }      
    return fmt;
};

/**
 * [requestGloble description] 封装请求数据
 * @param  {[type]}   option   [ 请求参数 ] 
 * @param  {Function} callback [ 回调函数 ]
 * @return {[type]}            [description] 
 */
module.exports.requestGloble = function(option,callback){
	option = objectAssign({
		encoding:null,
		headers:{
			"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
		}
	},option);
	request(option,callback);
};

module.exports.getInitEntity = function(option){
	return objectAssign({
		title:"",
		content:"", //内容
		channel:"", //渠道
		summary:"", //文章摘要
		author:"", 

		cover:"",//封面URI
		topCover:"",//置顶封面（移动端首次启动展示时的封面）
		sharedCover:"",

		tag:[],
		initialURL:""
	},option);
};

/**
 * [saveFile description] 保存数据文件
 * @param  {[type]} name [description]
 * @param  {[type]} msg  [description]
 * @return {[type]}      [description]
 */
module.exports.saveFile = function(name,msg){
	var fileName = name + (new Date().Format("yyyyMMdd"))+'.json',
		filePath = path.join(__dirname,'../data',new Date().Format("yyyyMMdd"),fileName);
	var fd = fs.openSync(filePath,'a+');
	fs.closeSync(fd);
	var arr = JSON.parse(fs.readFileSync(filePath,'utf8') || '[]');
	arr.push(msg);
	fs.writeFileSync(filePath, JSON.stringify(arr));
};

/**
 * [decodeHtml description]  对html ascall 进行转换
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
module.exports.decodeHtml = function(str){
	return str.replace(/&#34;/g,'"');
};

/**
 * [filterHtml description] 对新闻主体进行过滤
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
module.exports.filterHtml = function(html){
	html.find('[style]').removeAttr("style");// 去掉所有的 style 属性
	html.find('[align]').removeAttr("align");// 去掉所有的 align 属性
	html.find('[color]').removeAttr("color");// 去掉所有的 align 属性
	html.find('iframe').remove();
	html.find('script').remove();
	html.find('style').remove();
	html.find('[href]').removeAttr("href");// 去掉所有的 href  属性
	html.find('[target]').removeAttr("target");// 去掉所有的 class 属性
	html.find('[class]').removeAttr("class");// 去掉所有的 class 属性
	return html.html()
			.replace(/<!--[\w\W\r\n]*?-->/g,'')
			.replace(/<!-[\w\W\r\n]*?->/g,'')
			.replace(/  /g,'')
			.replace(/[\r\n\t]/g,'')
			.replace(/<p>[\s]?<\/p>/g,'');
};

var names = ['cedu_','china_','sohu_','qq_'];
module.exports.findFile = function(index,callback){
	if(index >= names.length){
		console.log('\n-------------文件遍历结束-------------\n');
		callback(exports.tongji);
		return;
	}
	var fileName = names[index] + "new_" + (new Date().Format("yyyyMMdd"))+'.json',
		filePath = path.join(__dirname,'../data',new Date().Format("yyyyMMdd"),fileName);
	
	if(fs.existsSync(filePath)){
		var data = JSON.parse(fs.readFileSync(filePath,'utf8') || '[]');
		console.log(`\n-------------${fileName},数据大小为${data.length}-------------`);
		exports.tongji.num += data.length;
		uploadDate(fileName,data,0,index,callback);
	}else{
		console.log(`\n-------------${fileName}文件不存在-------------\n`);
	}
};
module.exports.tongji = {
	num : 0, //总数
	upload_success : 0, //上传成功
	upload_err : 0, //上传失败
	upload_exixts:0 //重复上传
};

// /api/v1/article
// POST

	 // @HeaderParam("code") int code,
  //    @HeaderParam("osType") OSType osType,
  //    @FormParam("title") String title,
  //    @FormParam("content") String content,
  //    @FormParam("channel") String channel,
  //    @FormParam("summary") String summary,
  //    @FormParam("author") String author,
 
  //    @FormParam("cover") String cover,
  //    @FormParam("topCover") String topCover,
  //    @FormParam("tag") String topCover,
  //    @FormParam("initialURL") String topCover,
  //    @FormParam("sharedCover") String sharedCover
  //    initialURL
  //    
    // TRENDS("动态", true, 0),
    // EVERYBODY_SAYS("大家说", true, 1),
    // COLUMNS("专栏", true, 2),
    // RECOMMENDED("推荐", true, 3),
    // HOTSHOT("热门", true, 4),
    // LATEST("最新", true, 5),
    // FOREIGN("国外", true, 6),
    // DOMESTIC("国内", true, 7),
    // STUDY_ABROAD("留学", true, 8),
    // ADVANCED_STUDY("考研", true, 9),
    // IVORY_TOWER("象牙塔", true, 10),
    // COLLEGE_ENTRANCE_EXAMINATION("高考", true, 11),
    // MIDDLE_EXAMINATION("中考", true, 12),
    // PRESCHOOL("幼教", true, 13),
    // HOMEPAGE("首页", true, 14),
    // HOMEPAGE_FEATURE("首页专题", true, 15),
  //  
  //    

function uploadDate(name,datas,index,pindex,callback){
	if(index >= datas.length){
		console.log(`-------------${name},的数据上传完毕-------------\n`);
		module.exports.findFile(++pindex,callback);
		return;
	}
	var item = datas[index];
	item.topCover = item.sharedCover = item.cover;
	var res = request({
		method: 'POST',
		uri:"http://test.zhid58.com:8080/api/v1/article",
		form:querystring.stringify(item),
		headers:{
			code:"22",
			osType:"WEB"
		}
	},function(error,response,body){
		//  {"code":0,"msg":"成功","param":"57AA8E16-2C95-448C-A282-E88558795C19","success":true}
		//  {"code":1900,"msg":"文章已经存在","param":null,"success":false}
		// console.log(response);
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);

			if(data.code == 0){
				console.log(`${index+1}/${datas.length}\t标题为：${item.title},地址为：${item.initialURL}:上传成功`);
				exports.tongji.upload_success++;
			}else if(data.code == 1900){
				exports.tongji.upload_exixts++;
				console.log(`${index+1}/${datas.length}\t标题为：${item.title},地址为：${item.initialURL}:已经上传`);
			}else{
				exports.tongji.upload_err++;
				console.log(`${index+1}/${datas.length}\t标题为：${item.title},地址为：${item.initialURL}:上传失败`);
			}
		}else{
			exports.tongji.upload_err++;
		}
		uploadDate(name,datas,++index,pindex,callback);
	});
	// console.log(res.body);
}

