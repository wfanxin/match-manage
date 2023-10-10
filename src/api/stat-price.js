import request from '@/utils/request'

export function getData(params) {
  return request({
    url: '/lv/lease/statPrice/getData',
    method: 'get',
    params: params
  })
}
