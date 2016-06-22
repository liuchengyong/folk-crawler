var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');



var log4js = require("log4js");
var log4js_config = require("./log4js.json");
log4js.configure(log4js_config);

var LogFile = log4js.getLogger('log_file');

var list = []; //数组列表
var page = 0;
var count = 0;

/**
 * [getSchollJson description] 获取学校数据
 * @return {[type]} [description]
 * 
 */
function getSchollJson() {
    var postData = {
        limit: 30,
        timeout: 3000,
        filterTags: [0, 0, 0, 0, 0, 0, 0],
        tagId: 60829,
        fromLemma: false,
        contentLength: 40,
        page: page
    };
    request.post('http://baike.baidu.com/wikitag/api/getlemmas', {
            form: postData
        },
        function(err, httpResponse, body) {
            var data = JSON.parse(body);
            // console.log(data.lemmaList.length);
            // console.log(data.total);
            // console.log(data.totalPage);
         	LogFile.info("当前第" + page + "页，数量为:"+data.lemmaList.length +',总数量:'+ count);
            list = data.lemmaList;
            if (list.length != 0) {
                saveImg(list[0], 0);
            }
        });
}

function saveImg(item, index) {
    if (item == undefined) {
        page++;
        getSchollJson();
        return;
    }
    if(item.lemmaPic.url == undefined || item.lemmaPic.url == ''){
    	count++;
        index++;
        saveImg(list[index], index);
        console.log('跳过' + " 第" + page + "页:第" + index + " 张,url为：" + item.lemmaPic.url + "学校名字为：" + item.lemmaTitle);
        LogFile.info('跳过' + " 第" + page + "页:第" + index + " 张,url为：" + item.lemmaPic.url + "学校名字为：" + item.lemmaTitle);
        return;
    }
    var sname = path.basename(item.lemmaPic.url);
    var name = item.lemmaTitle + sname.substring(sname.indexOf("."), sname.length);
    downloadImg(item.lemmaPic.url, name, index, function() {
        count++;
        index++;
        saveImg(list[index], index);
        console.log(" 第" + page + "页:第" + index + " 张,总数量：" + count + '文件名：' + name);
        // LogFile.info(" 第" + page + "页:第" + index + " 张,总数量：" + count + '文件名：' + name+ ',url:' + item.lemmaPic.url);
    });
}

getSchollJson();
// downloadImg('http://a.hiphotos.baidu.com/baike/w%3D168/sign=7918569739dbb6fd255be1203125aba6/eac4b74543a98226e73ec94b8a82b9014b90ebdb.jpg', 
	// 'eee.jpg', 1, function(){});

function downloadImg(url, filename, index, callback) {
	var options = {
		'method':'get',
        'url': url,
        'headers': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
            'Cache-Control':'no-cache',
            'Connection': 'keep-alive',
            'Cookie': 'BIDUPSID=FB9F6C26DD7182CC41EC6A4C269FE038; BAIDUID=E4B51F7DC1F7BA63E8FC672C86FDCA59:FG=1; PSTM=1457344780; plus_cv=0::m:1-nav:250e8bac-hotword:69650bc5; BDSFRCVID=pgFsJeC629m5Y_nRMiyK5PP0zvxcIq3TH6aI6-YSEdeUTicOOqoMEG0PJ7lQpYD-Nb29ogKK0mOTHUvP; H_BDCLCKID_SF=tR4t_K0-fC03fP36q45H24k0-qrtetJyaR3j0hQbWJ5TMC_whjoZBPCwXfr8B5QTLnRELtnJW4D5ShPC-fu-qqF9QfO-Ll30K2O9QR7z3l02VhF6hhQ2Wf3DXxKHq4RMW20jWl7mWU5-VKcnK4-Xjjo0DG3P; H_PS_PSSID=20049_1448_18203_19838_18282_19570_19559_19842_17001_15487_11585',
            'Pragma':'no-cache',
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
        }
    };
    // request(, function(err, res, body) {
    //     if (err) {
           
    //     }
    //     res.pipe(fs.createWriteStream('./school/' + filename)).on('close', callback); //调用request的管道来下载到 images文件夹下
    // });

    request(options)
    // .on('response',function(res){
    // 		// console.log('content-type:', res.headers);
    // })
    .on('error',function(err){
    	 console.log('err: ' + err + '跳过' + " 第" + page + "页:第" + index + " 张,文件名：" + filename + ',url:' + url);
         LogFile.info('跳过' + " 第" + page + "页:第" + index + " 张,文件名：" + filename + ',url:' + url);
         callback();
    })
    .pipe(fs.createWriteStream('./school/' + filename))
    .on('close', callback);
};
