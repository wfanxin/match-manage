import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/lease/notice/list',
    method: 'get',
    params: params
  })
}

export function getNotice(params) {
  return request({
    url: '/lv/lease/notice/getNotice',
    method: 'get',
    params: params
  })
}

export function read(params) {
  return request({
    url: '/lv/lease/notice/read',
    method: 'post',
    data: params
  })
}
