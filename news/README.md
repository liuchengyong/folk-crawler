###request 的方法测试

	function(error,response,body){
		console.log(response.headers);
		console.log(response.httpVersion);
		console.log(response.rawHeaders);
		console.log(response.rawTrailers);
		console.log(response.statusCode);
		console.log(response.statusMessage);
		console.log(response.socket);
		console.log(response.trailers);
		console.log(response.url);
		console.log(response.body);
	};	