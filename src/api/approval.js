import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/lease/approval/list',
    method: 'get',
    params: params
  })
}

export function pass(params) {
  return request({
    url: '/lv/lease/approval/pass',
    method: 'post',
    data: params
  })
}

export function fail(params) {
  return request({
    url: '/lv/lease/approval/fail',
    method: 'post',
    data: params
  })
}
