import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/lease/company/list',
    method: 'get',
    params: params
  })
}

export function add(params) {
  return request({
    url: '/lv/lease/company/add',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: '/lv/lease/company/edit',
    method: 'post',
    data: params
  })
}

export function del(params) {
  return request({
    url: '/lv/lease/company/del',
    method: 'post',
    data: params
  })
}
