
console.log("---------start sohu");
var util = require('./common.js');


var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// 日志信息
var log4js = require("log4js");
var log4js_config = require("../log4js.json");
log4js.configure(log4js_config);
var LogFile = log4js.getLogger('log_file');


/**
 * [getTencentEduAddress description] 获取搜狐教育的所有的url
 * @return {[type]} [description]
 */
module.exports.getSoHuEduAddress = function(callback){
	var array = [];
	console.log("==================== 搜狐教育模块 开始 ====================\n");
	console.log("-------------- 搜狐教育模块 抓取所有的新闻地址 开始---------------------");
	util.requestGloble(
		{
			uri:'http://learning.sohu.com/'
		},
		function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'));
				$('a[href]')
					.filter(function(i,item){
						var href = item.attribs.href;
						if(href.search(/^((http|https)?:\/\/)|(javascript:)|#/) == -1 ){
							href = item.attribs.href = 'http://edu.qq.com' + item.attribs.href;
						}
						if(href.search(/http:\/\/learning\.sohu\.com\/\d{8}\/[\w\W\r\n]*?(.html|.shtml|.htm)$/) != -1){
							return true;
						}
						return false;
					})
					.each(function(i,item){
						var title = item.attribs.title;
						array.pushNoReapet(item.attribs.href);
					});
					for(var i = 0; i < array.length;i++){
						console.log(`${i}/${array.length} \t 地址为：${array[i]}`)
					}
					console.log("-------------- 搜狐教育模块 抓取所有的新闻地址 结束---------------------\n\n");
					console.log("-------------- 搜狐教育模块 抓取内容开始---------------------");
					getNewsData(array,0,callback);
			}else{
				console.log(error);
			}
		});
}

module.exports._getSoHuEduAddress = function(url,callback){
	util.requestGloble(
		{
			uri:url
		},function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'),{decodeEntities: false});
				var data = {initialURL:url};
				parseHtml(data,$);
				callback();
			}else{
				console.log(error);
			}
		});
}

/**
 * [getNewsData description]   获取新闻详情页的数据
 * @param  {[type]} index [description]
 * @return {[type]}       [description]
 */
function getNewsData(array,index,callback){
	if(array.length <= index){
		console.log("-------------- 搜狐教育模块 抓取内容结束---------------------\n\n");
		console.log("==================== 搜狐教育模块 结束 ====================\n\n");
		callback();
		return;
	}
	console.log(`${index+1}/${array.length} \t 地址为：${array[index]}`);
	util.requestGloble(
		{
			uri:array[index]
			// uri:'http://edu.qq.com/a/20160606/008022.htm'
		},function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'),{decodeEntities: false});
				var data = {initialURL:array[index]};
				// var data = { crawler_url:'http://edu.qq.com/a/20160606/008022.htm' };
				parseHtml(data,$);
			}else{
				console.log(error);
			}
			index++;
			getNewsData(array,index,callback);
		});
}


/**
 * [parseHtml description] 解析html
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
function parseHtml(news,$){
	var article = $('#container .content-wrapper');
	news.title = util.decodeHtml(article.find('.news-title h1').text());

	var $content = article.find('.text');
	news.content = util.filterHtml($content);
	if(news.content == ""){
		console.log(`${news.initialURL}抓取的内容为空`);
		return;
	}

	news.channel = article.find('.writer').text();
	news.summary =  $content.text().replace(/\s/g,"").substr(0,60);
	news.author = '';
	news.cover =  $content.find('img[src]').eq(0).attr('src') || "";

	news.tag = createTag(article.find('.location').find('a').eq(1).text());
	console.log(article.find('.location').find('a').eq(1).text());
	util.saveFile('sohu_new_',util.getInitEntity(news));
	console.log(news.initialURL + "抓取完成");
}

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
function createTag(name){
	var tag = []; 
	if(name == '新闻'){ // 高考
		tag.push('TRENDS');
	}else if(name == '小学'){ // 考研
		tag.push('PRESCHOOL');
	}else if(name == '中学'){ // 公务员
		tag.push('MIDDLE_EXAMINATION');
	}else if(name == '高考'){ // 校园
		tag.push('COLLEGE_ENTRANCE_EXAMINATION');
	}else if(name == '出国'){ // 校园
		tag.push('STUDY_ABROAD');
		tag.push('FOREIGN');
	}else if(name == '外语'){ // 留学
		tag.push('FOREIGN');
		tag.push('EVERYBODY_SAYS');
	}else if(name == '考研'){ // 外语
		tag.push('ADVANCED_STUDY');
		tag.push('IVORY_TOWER');
	}else if(name == '公务员'){ // 中小学
		tag.push('IVORY_TOWER');
	}else if(name == '产业'){ // 商学院
		tag.push('TRENDS');
	}else{ // 其它
		tag.push('TRENDS');
	}
	return tag;
}
