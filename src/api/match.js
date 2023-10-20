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

export function saveTogether(params) {
  return request({
    url: '/lv/match/match/saveTogether',
    method: 'post',
    data: params
  })
}

export function stat(params) {
  return request({
    url: '/lv/match/match/stat',
    method: 'get',
    params: params
  })
}

export function getTogether(params) {
  return request({
    url: '/lv/match/match/getTogether',
    method: 'get',
    params: params
  })
}

export function editTogether(params) {
  return request({
    url: '/lv/match/match/editTogether',
    method: 'post',
    data: params
  })
}

export function delTogether(params) {
  return request({
    url: '/lv/match/match/delTogether',
    method: 'post',
    data: params
  })
}
