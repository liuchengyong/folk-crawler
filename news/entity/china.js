
console.log("---------start china edu");
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
module.exports.getChinaEduAddress = function(callback){
	var array = [];
	console.log("==================== 中华网教育模块 开始 ====================\n");
	console.log("-------------- 中华网教育模块 抓取所有的新闻地址 开始---------------------");
	util.requestGloble(
		{
			uri:'http://edu.china.com/new/edunews/index.html'
		},
		function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'gb2312'));
				$('a[href]')
					.filter(function(i,item){
						var href = item.attribs.href;
						if(href.search(/^((http|https)?:\/\/)|(javascript:)|#/) == -1 ){
							href = item.attribs.href = 'http://edu.china.com' + item.attribs.href;
						}
						if(href.search(/http:\/\/edu\.china\.com\/new\/edunews\/jy\/[\w\W\r\n]*?(.html|.shtml|.htm)$/) != -1){
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
					console.log("-------------- 中华网教育模块 抓取所有的新闻地址 结束---------------------\n\n");
					console.log("-------------- 中华网教育模块 抓取内容开始---------------------");
					getNewsData(array,0,callback);
			}else{
				console.log(error);
			}
		});
}

module.exports._getChinaEduAddress = function(url,callback){
	util.requestGloble(
		{
			uri:url
		},function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'utf8'),{decodeEntities: false});
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
		console.log("-------------- 中华网教育模块 抓取内容结束---------------------\n\n");
		console.log("==================== 中华网教育模块 结束 ====================\n\n");
		callback();
		return;
	}
	console.log(`${index+1}/${array.length} \t 地址为：${array[index]}`);
	util.requestGloble(
		{
			uri:array[index]
		},function(error,response,body){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(iconv.decode(body, 'utf8'),{decodeEntities: false});
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
	var article = $('#chan_newsBlk');
	news.title = article.find('#chan_newsTitle').text();

	var $content = article.find('#chan_newsDetail');
	$content.find('.artiLogo').remove();
	news.content = util.filterHtml($content);
	if(news.content == ""){
		console.log(`${news.initialURL}抓取的内容为空`);
		return;
	}

	article.find("#chan_newsInfo").find('.chan_newsInfo_link').remove();
	article.find("#chan_newsInfo").find('.chan_newsInfo_comment').remove();
	var temp = article.find("#chan_newsInfo").text().replace(/&nbsp;/g,',').split(',');
	news.channel = temp.length >= 2 ? temp[1] :'中华网教育';
	news.summary =  $content.text().replace(/\s/g,"").substr(0,60);
	news.author = '';
	news.cover =  $content.find('img[src]').eq(0).attr('src') || "";
	
	news.tag = ['TRENDS','LATEST'];
	util.saveFile('china_new_',util.getInitEntity(news));
	console.log(news.initialURL + "抓取完成");
}

