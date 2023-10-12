import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/match/match/list',
    method: 'get',
    params: params
  })
}

export function add(params) {
  return request({
    url: '/lv/match/match/add',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: '/lv/match/match/edit',
    method: 'post',
    data: params
  })
}

export function del(params) {
  return request({
    url: '/lv/match/match/del',
    method: 'post',
    data: params
  })
}
