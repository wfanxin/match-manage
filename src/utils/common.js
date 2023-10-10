import Cookies from 'js-cookie'

export const formatMoney = function(money, decimalLength = 2) {
  var formatMoney = String(Math.ceil(money * 100) / 100)
  return formatMoney
}

// 7天后的日期 fun_date(7);
// 7天前的日 fun_date(-7);
export const fun_date = function(aa) {
  var date1 = new Date()
  var month1 = (date1.getMonth() + 1)
  if (month1 < 10) {
    month1 = '0' + month1
  }
  var day1 = date1.getDate()
  if (day1 < 10) {
    day1 = '0' + day1
  }
  var time1 = date1.getFullYear() + '-' + month1 + '-' + day1// time1表示当前时间
  if (aa === undefined || aa === '') {
    return time1
  }
  var date2 = new Date(time1)
  date2.setDate(date1.getDate() + aa)
  var month2 = (date2.getMonth() + 1)
  if (month2 < 10) {
    month2 = '0' + month2
  }
  var day2 = date2.getDate()
  if (day2 < 10) {
    day2 = '0' + day2
  }
  var time2 = date2.getFullYear() + '-' + month2 + '-' + day2

  return time2
}

export const fun_getRole = function() {
  var roles = JSON.parse(Cookies.get('roles'))
  return roles[0]
}

export const fun_formatDate = function() {
  const date = new Date()
  const year = date.getFullYear() // 年
  const month = date.getMonth() + 1 // 月
  const day = date.getDate() // 日
  const week = date.getDay() // 星期
  const weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  let hour = date.getHours() // 时
  hour = hour < 10 ? '0' + hour : hour // 如果只有一位，则前面补零
  let minute = date.getMinutes() // 分
  minute = minute < 10 ? '0' + minute : minute // 如果只有一位，则前面补零
  let second = date.getSeconds() // 秒
  second = second < 10 ? '0' + second : second // 如果只有一位，则前面补零
  return `${year}/${month}/${day} ${hour}:${minute}:${second} ${weekArr[week]}`
}

export const fun_getDay = function(num, str) {
  var today = new Date()
  var nowTime = today.getTime()
  var ms = 24 * 3600 * 1000 * num
  today.setTime(parseInt(nowTime + ms))
  var oYear = today.getFullYear()
  var oMoth = (today.getMonth() + 1).toString()
  if (oMoth.length <= 1) oMoth = '0' + oMoth
  var oDay = today.getDate().toString()
  if (oDay.length <= 1) oDay = '0' + oDay
  return oYear + str + oMoth + str + oDay
}
