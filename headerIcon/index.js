var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');

var log4js = require("log4js");
var log4js_config = require("./log4js.json");
log4js.configure(log4js_config);

var LogFile = log4js.getLogger('log_file');

var count = 17399;

// var requrl = 'http://www.qqdawang.com/zhuanti/keai/index_4.html';
var page = {
	url:{
		firstUrl:"http://www.qqdawang.com/Special/",
		secondUrl:"",
		thirdUrl:""
	},
	firstIndex:7,
	secondIndex:11,
	secondPage:10,
	thirdIndex:12
};
getFristPage();
//获取第一层的图片
function getFristPage(){
	request(page.url.firstUrl,function(error, response, body){
		if (!error && response.statusCode == 200) {
		    console.log("first:"+page.url.firstUrl);    //返回请求页面的HTML
		    //返回请求页面的HTML
		    parseFirstPage(body);
		}else{
		  	console.log("fristerror");
		}
	});
}
function parseFirstPage(data){
	var $ = cheerio.load(data);
	var urls = $(".cBrown").toArray();
	page.firstData = urls;
	console.log("第一层页面的个数："+urls.length);
	queryFirstlist(page.firstData);
}


function queryFirstlist(data){
	if(data.length <= page.firstIndex) return;
	var url = data[page.firstIndex].attribs.href;
	LogFile.info("first-Index:"+(page.firstIndex+1)+" url: "+ url +" 图片数量：" + count);
	page.url.secondUrl = url;
	getSeconfPage();
	//queryFirstlist(data,++index);
}

//进入第二层
function getSeconfPage(){
	var url = page.url.secondUrl + (page.secondPage == 1?"":("index_" + page.secondPage + ".html"));
	request(url,function(error, response, body){
		if (!error && response.statusCode == 200) {
			console.log("secondPage:"+page.secondPage+" " + url +" 图片数量：" + count);
		    parseSecondPage(body);
		}else{
			page.firstIndex ++;
			page.secondPage = 1; 
		  	queryFirstlist(page.firstData);
		}
	});
}
//解析第二层
function parseSecondPage(data){
	var $ = cheerio.load(data);
	var urls = $(".img").toArray();
	page.secondData = urls;
	console.log("第二层页面，第"+page.secondPage +"页的个数:"+urls.length);
	querySecondlist(page.secondData);
}
function querySecondlist(){
	var data = page.secondData;
	if(data.length <= page.secondIndex) {
		page.secondIndex = 0;
		page.secondPage ++;
		getSeconfPage();
	}else{
		var url = data[page.secondIndex].attribs.href;
		page.url.thirdUrl = url;
		LogFile.info("first-Index:" + (page.firstIndex+1) + "secondIndex:"+ (page.secondIndex+1) +" url: "+ url +" 图片数量：" + count);
		getThirdPage();
	}
	
}


//解析第三层
function getThirdPage(){
	var url = "http://www.qqdawang.com"+page.url.thirdUrl;
	request(url,function(error, response, body){
		if (!error && response.statusCode == 200) {
			console.log("第三层页面地址" + url);
		    parseThirdPage(body);
		}else{
			page.secondIndex++;
			querySecondlist(page.secondData);
		}
	});
}
function parseThirdPage(data){
	var $ = cheerio.load(data);
	var imgs = $(".artCon img").toArray();
	console.log("第三层的个数:"+imgs.length+",图片总数量："+count);
	queryThirdlist(imgs);
}
function queryThirdlist(data){
	if(data.length <= page.thirdIndex){
		page.thirdIndex = 0;
		page.secondIndex++;
		querySecondlist(page.secondData);
	}else{
		try{
			var src = data[page.thirdIndex].attribs.src;
			var name = parseUrlForFileName(src);
			name = name.substring(name.indexOf("."),name.length);
			name = "zhidianavtar"+count+name;
			LogFile.info("first-Index:" + (page.firstIndex+1) + "secondIndex:"+ (page.secondIndex+1) +" name: "+ name +" 图片数量：" + count);
			// console.log(name);
			// console.log(src+","+name);
			downloadImg(src,name,function(){
				if(count > 20000) return;
				count++;
				page.thirdIndex++;
				queryThirdlist(data);
			});
		}catch(e){
			page.thirdIndex++;
			queryThirdlist(data);
		}
		
	}
}



// request(requrl, function (error, response, body) {	
//   if (!error && response.statusCode == 200) {
//     console.log(requrl);    //返回请求页面的HTML
//     // console.log(body);    //返回请求页面的HTML
//     acquireData(body);
//   }else{
//   	console.log(JSON.stringify(error));
//   }
// })
var imgs = [];

function acquireData(data) {
    var $ = cheerio.load(data);  //cheerio解析data
    // console.log($('.f_lifl').html());

    imgs = $('.f_lifl img').toArray();  //将所有的img放到一个数组中
    

    console.log(imgs.length);
    queryImgs(0);

  //   var len = meizi.length;
  //   for (var i=0; i < len; i++) {
  //       var imgsrc = meizi[i].attribs.src;  //用循环读出数组中每个src地址
  //       var name = parseUrlForFileName(imgsrc);
		// downloadImg(imgsrc,name,)

  //       console.log(imgsrc);                //输出地址
  //   }
}
function queryImgs(index){
	if(imgs.length <= index) return;

	var src = imgs[index].attribs.src;
	var name = parseUrlForFileName(src);
	console.log("["+(index+1 )+ "]," +src + "," + name );
	downloadImg(src,name,function(){
		queryImgs(++index);
	});
}

function parseUrlForFileName(address) {
    var filename = path.basename(address);
    return filename;
}

function downloadImg(uri, filename, callback){
    request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
    // console.log('content-length:', res.headers['content-length']);  //图片大小
    if (err) {
        console.log('err: '+ err);
        return false;
    }
    //console.log('res: '+ JSON.stringify(res));
    request(uri).pipe(fs.createWriteStream('./img/'+filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
    });
};


