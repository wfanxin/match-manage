/**
 * 设置唯一标识
 */

export const setDeviceId = function() {
  var deviceId = localStorage.getItem('Device-Id')
  if (deviceId !== null && deviceId !== undefined) {
    return deviceId
  }

  var len = 32
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678' /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length
  var pwd = ''
  for (var i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }

  var timestamp = new Date().getTime()
  var randomStr = String(Math.random() * timestamp).replace(/\./g, '')
  deviceId = pwd + randomStr
  localStorage.setItem('Device-Id', deviceId)
  return deviceId
}
