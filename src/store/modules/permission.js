import { asyncRouterMap, constantRouterMap } from '@/router'
import {
  getRoles,
  getNav
} from '@/utils/auth' // 验权
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(navs, route) {
  if (navs !== undefined) {
    if (route.meta && route.key) {
      return navs.indexOf(route.key) >= 0
    } else {
      return false
    }
  } else {
    return false
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param navs
 */
function filterAsyncRouter(asyncRouterMap, navs) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, navs)

      if (route.children.length > 0) {
        return true
      }
      return false
    } else {
      if (hasPermission(navs, route)) {
        return true
      }
      return false
    }
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        var roles = []
        var navs = []
        if (data.data === null) {
          roles = getRoles()
          navs = getNav()
        } else {
          roles = data.data.roles
          navs = data.data.nav
        }

        let accessedRouters
        if (roles.indexOf('admin') >= 0) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, navs)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
