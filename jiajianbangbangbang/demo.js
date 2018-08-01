var WXBizDataCrypt = require('./WXBizDataCrypt')

var appId = ''
var sessionKey = 'erwrwe'
var encryptedData = 'JVhedyRbWNk3W23sNKpf6ohixe0TTuOThvXNWny2iANJg3Zyc+Cu9j/2jJTVWYQTT73vwbuHgfXSDVNPvIorC7Bk73v7WjUTPdNwW+J0W57N27KuhcZOd8ArujmfEQOxA1DQufChAoDOaMXe8r2fyQ=='
	
var iv = 'mrNcaorBhRWyye9YgXSTBQ=='

var pc = new WXBizDataCrypt(appId, sessionKey)

var data = pc.decryptData(encryptedData , iv)

console.log('解密后 data: ', data)
// 解密后的数据为
//
// data = {
//   "nickName": "Band",
//   "gender": 1,
//   "language": "zh_CN",
//   "city": "Guangzhou",
//   "province": "Guangdong",
//   "country": "CN",
//   "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
//   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
//   "watermark": {
//     "timestamp": 1477314187,
//     "appid": "wx4f4bc4dec97d474b"
//   }
// }
