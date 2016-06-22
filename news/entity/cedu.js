
console.log("---------start cedu ");
var util = require('./common.js');
var path = require('path');

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
module.exports.getCEduAddress = function(callback){
	var array = [];
	console.log("==================== 中国教育新闻网 开始 ====================\n");
	console.log("-------------- 中国教育新闻网 抓取所有的新闻地址 开始---------------------");
	util.requestGloble(
		{
			uri:'http://www.jyb.cn/'
		},
		function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'));
				$('a[href]')
					.filter(function(i,item){
						var href = item.attribs.href;
						if(href.search(/^((http|https)?:\/\/)|(javascript:)|#/) == -1 ){
							href = item.attribs.href = ('http://www.jyb.cn/'+ item.attribs.href).replace(/\/\.\//,"/");
						}
						if(href.search(/http:\/\/www\.jyb\.cn\/[\w\W\r\n]*?(.html|.shtml|.htm)$/) != -1
							&& href.search(new Date().Format('yyyyMM')) != -1 
							&& href.search('t'+(new Date().Format('yyyyMMdd'))) != -1
							){
							// console.log(href+","+$(this).text());
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
					console.log("-------------- 中国教育新闻网 抓取所有的新闻地址 结束---------------------\n\n");
					console.log("-------------- 中国教育新闻网 抓取内容开始---------------------");
					getNewsData(array,0,callback);
					
			}else{
				console.log(error);
			}
		});
}

module.exports._getCEduAddress = function(url,callback){
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
		console.log("-------------- 中国教育新闻网 抓取内容结束---------------------\n\n");
		console.log("==================== 中国教育新闻网 结束 ====================\n\n");
		callback();
		return;
	}
	console.log(`${index+1}/${array.length} \t 地址为：${array[index]}`);
	util.requestGloble(
		{
			uri:array[index]
		},function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'),{decodeEntities: false});
				var data = {initialURL:array[index]};
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
	if($('#body').text()){
		var article = $('#body');
		news.title = article.find('h1').eq(0).text();
		var temp = article.find("h2").eq(0).text();
		news.channel = temp.indexOf('来源：')== -1? '中国教育新闻网' : temp.substr((temp.indexOf('来源：')+3));
		news.author = temp.substr(temp.indexOf("作者：")+3,temp.indexOf("')")-temp.indexOf("作者：")-3);

	}else if($('#ziliao').text()){
		var article = $('#ziliao .zl-r2');
		news.title = article.find('.bg h2').eq(0).text();
		var temp = article.find(".bg h5").eq(0).text();
		news.channel = temp.indexOf('来源：')== -1? '中国教育新闻网' : temp.substr((temp.indexOf('来源：')+3));
		news.author = temp.substr(temp.indexOf("作者：")+3,temp.indexOf("')")-temp.indexOf("作者：")-3);
	}
	 
	

	var $content = $("#Content1").find('p').eq(0).parent();
	$content.find('img')
		.filter(function(i,item){
			if(item.attribs.src.search(/^((http|https)?:\/\/)/) == -1 ){
				return true;	
			}
			return false;
		})
		.each(function(i,item){
			item.attribs.src = (path.dirname(news.initialURL) + '/'+ item.attribs.src).replace(/\/\.\//,"/");
		});
	news.content = util.filterHtml($content);
	
	if(news.content == ""){
		console.log(`${news.initialURL}抓取的内容为空`);
		return;
	}	

	news.summary =  $content.text().replace(/\s/g,"").substr(0,60);
	news.cover =  $content.find('img[src]').eq(0).attr('src') || "";
	news.tag = createTag(news.initialURL);

	util.saveFile('cedu_new_',util.getInitEntity(news));
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
	if(name.search('/basc/') != -1){ // 基础教育
		tag.push('MIDDLE_EXAMINATION');

	}else if(name.search('/world/') != -1){ // 国际
		tag.push('FOREIGN');

	}else if(name.search('/china/') != -1){ // 国内
		tag.push('DOMESTIC');

	}else if(name.search('/high/') != -1){ // 高等教育
		tag.push('IVORY_TOWER');

	}else if(name.search('/info/') != -1){ // 资料中心
		tag.push('EVERYBODY_SAYS')

	}else if(name.search('/job/') != -1){ // 就业
		tag.push('HOTSHOT');
		tag.push('LATEST');

	}else if(name.search('/opinion/') != -1){ // 教育时评
		tag.push('EVERYBODY_SAYS');
	}else if(name.search('/gk/') != -1){ // 高考
		tag.push('COLLEGE_ENTRANCE_EXAMINATION');

	}else if(name.search('/ky/') != -1){ // 考研
		tag.push('ADVANCED_STUDY');

	}else{ // 其它
		tag.push('TRENDS');
	}
	return tag;
}
