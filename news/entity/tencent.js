

var util = require('./common.js');


var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// 日志信息
var log4js = require("log4js");
var log4js_config = require("../log4js.json");
log4js.configure(log4js_config);
var LogFile = log4js.getLogger('log_file');


/**
 * [getTencentEduAddress description] 获取腾讯新闻的所有的url
 * @return {[type]} [description]
 */
module.exports.getTencentEduAddress = function(callback){
	var array = [];
	console.log("==================== 腾讯教育模块 开始 ====================\n");
	console.log("-------------- 腾讯教育模块 抓取所有的新闻地址 开始---------------------");
	util.requestGloble(
		{
			uri:'http://edu.qq.com/'
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
						if(href.search(/edu\.qq\.com\/a\//) != -1){
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
					console.log("-------------- 腾讯教育模块 抓取所有的新闻地址 结束---------------------\n\n");
					console.log("-------------- 腾讯教育模块 抓取内容开始---------------------");
					getNewsData(array,0,callback);
			}else{
				console.log(error);
			}
		});
}

module.exports._getTencentEduAddress = function(url,callback){
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
	if(index >= array.length){
		console.log("-------------- 腾讯教育模块 抓取内容结束---------------------\n\n");
		console.log("==================== 腾讯教育模块 结束 ====================\n\n");
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
	var article = $('#C-Main-Article-QQ');
	news.title = article.find('.hd h1').text(); //标题

	var $content = article.find('#Cnt-Main-Article-QQ');
	$content.find('.rv-js-root').remove();
	$content.find('div').remove();
	news.content = util.filterHtml($content);
	if(news.content == ""){
		console.log(`${news.initialURL}抓取的内容为空`);
		return;
	}

	news.channel = article.find('.color-a-1').text();
	news.summary =  $content.text().replace(/\s/g,"").substr(0,60);
	news.author = article.find('.color-a-3').text();
	news.cover =  $content.find('img[src]').eq(0).attr('src') || "";
	//获取分类标签
	news.tag = ['TRENDS'];

	util.saveFile('qq_new_',util.getInitEntity(news));
	console.log(news.initialURL + "抓取完成");
}

