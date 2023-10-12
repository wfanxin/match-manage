import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/match/tag/list',
    method: 'get',
    params: params
  })
}

export function add(params) {
  return request({
    url: '/lv/match/tag/add',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: '/lv/match/tag/edit',
    method: 'post',
    data: params
  })
}

export function del(params) {
  return request({
    url: '/lv/match/tag/del',
    method: 'post',
    data: params
  })
}
