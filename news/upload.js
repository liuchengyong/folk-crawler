
var upload = require("./entity/common.js");
console.log('\n=========================  上传数据模块开始  =========================');
console.log('\n-------------文件遍历开始-------------');
upload.findFile(0,function(tongji){
	console.log('=========================  上传数据模块结束  =========================\n');
	console.log("************ 统计结果 ************");
	console.log("*********************************");
	console.log(`\t抓取数据总数：${tongji.num}\t`);
	console.log(`\t上传成功数量：${tongji.upload_success}\t`);
	console.log(`\t上传失败数量：${tongji.upload_err}\t`);
	console.log(`\t重复上传数量：${tongji.upload_exixts}\t`);
});


