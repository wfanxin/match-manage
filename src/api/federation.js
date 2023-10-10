import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/lease/federation/list',
    method: 'get',
    params: params
  })
}

export function add(params) {
  return request({
    url: '/lv/lease/federation/add',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: '/lv/lease/federation/edit',
    method: 'post',
    data: params
  })
}

export function del(params) {
  return request({
    url: '/lv/lease/federation/del',
    method: 'post',
    data: params
  })
}
