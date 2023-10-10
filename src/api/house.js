import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/lv/lease/house/list',
    method: 'get',
    params: params
  })
}

export function add(params) {
  return request({
    url: '/lv/lease/house/add',
    method: 'post',
    data: params
  })
}

export function edit(params) {
  return request({
    url: '/lv/lease/house/edit',
    method: 'post',
    data: params
  })
}

export function submitReview(params) {
  return request({
    url: '/lv/lease/house/submitReview',
    method: 'post',
    data: params
  })
}

export function del(params) {
  return request({
    url: '/lv/lease/house/del',
    method: 'post',
    data: params
  })
}

export function exportExcel(params) {
  return request({
    url: '/lv/lease/house/exportExcel',
    method: 'post',
    data: params
  })
}

export function detail(params) {
  return request({
    url: '/lv/lease/house/detail',
    method: 'get',
    params: params
  })
}

export function preview(params) {
  return request({
    url: '/lv/lease/house/preview',
    method: 'post',
    data: params
  })
}
