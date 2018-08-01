
var request = require('request');

var phpsessid = "480d61vumqss5gd2bnskhhoi52";
// request.post({
// 	url:'https://speedbbb.2960.net/v1.1/api/User/getUserInfo.html',
// 	headers:{
// 		'content-type':'application/json'
// 	},
// 	json:true,
// 	form:{
// 		v:1.1,
// 		phpsessid:phpsessid
// 		},
// 	},function(err, httpResponse, body) {
//         console.log(body)
//     });

function addActivity(callback){
	request.post({
		url:'https://speedbbb.2960.net/v1.1/api/Activity/addActivity.html',
		headers:{
			'content-type':'application/json'
		},
		json:true,
		form:{
			phpsessid:phpsessid
			},
		},function(err, httpResponse, body) {
			callback(body.Result.ActivityId);
	        console.log(JSON.stringify(body));
	    });
}


function getMoney(aid,callback){
	request.post({
		url:'https://speedbbb.2960.net/v1.1//api/Activity/saveResult.html',
		headers:{
			'content-type':'application/json'
		},
		json:true,
		form:{
			phpsessid:phpsessid,
			aid:aid,
			iswin:1,
			level:5,
			sign:''
			},
		},function(err, httpResponse, body) {
			callback(aid)
	        console.log(body)
	    });

}

function openRed(aid){
	request.post({
		url:'https://speedbbb.2960.net/v1.1/api/Activity/OpenRed.html',
		headers:{
			'content-type':'application/json'
		},
		json:true,
		form:{
			phpsessid:phpsessid,
			aid:aid,
			},
		},function(err, httpResponse, body) {
	        console.log(body)
	    });
} 

function shareSuccess(callback){
	request.post({
		url:'https://speedbbb.2960.net/v1.1//api/Activity/shareSuccess.html',
		headers:{
			'content-type':'application/json'
		},
		json:true,
		form:{
			phpsessid:phpsessid,
			iv:'n/4bfJZmz/kHPjh/dFdmmg==',
			data:'LPMOqt67DK0vtcW+j1r6uebQ3azEmFECgdqUQ3uTNG4Zww5AvlsdmJfm+FiYgIkSpMZbZsXeOyj1jNcKPhKzQRhcI0Wd1wS5fTF/b99bGolOwkIcsA2kdW4wMwnEL93OLVp/ZZ0tZETmAhotPe6Rqg=='
			},
		},function(err, httpResponse, body) {
	        console.log(JSON.stringify(body));
	        callback();
	    });
} 
shareSuccess(function(){

})
// addActivity(function(){

// })

// shareSuccess(function(){
// 	addActivity(function(aid){
// 		getMoney(aid,function(aid){
// 			openRed(aid)
// 		})
// 	})
// })
// 
	// addActivity(function(aid){
	// 	getMoney(aid,function(aid){
	// 		openRed(aid)
	// 	})
	// })
