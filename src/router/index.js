import Vue from 'vue'
import Router from 'vue-router'

// const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  {
    path: '',
    redirect: '/welcome/welcome'
  },
  {
    path: '/welcome',
    component: Layout,
    name: '首页',
    meta: { title: '首页', icon: 'dashboard' },
    children: [
      {
        path: 'welcome',
        name: '年统计',
        component: () => import('@/views/common/welcome'),
        meta: { title: '年统计', icon: 'documentation' }
      }
    ]
  },
  { path: '/login', component: () => import('@/views/login'), name: '登录', hidden: true },
  { path: '/401', component: () => import('@/views/error-page/401'), name: 'page401', hidden: true, meta: { title: 'page401', noCache: true }},
  { path: '/404', component: () => import('@/views/error-page/404'), name: 'page404', hidden: true, meta: { title: 'page404', noCache: true }},
  // 锁屏
  {
    path: '/lock',
    hidden: true,
    name: '锁屏页',
    component: () => import('@/views/common/lock')
  }
]

export default new Router({
  mode: 'history', // 后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
export const asyncRouterMap = [
  {
    path: '/lease',
    component: Layout,
    redirect: 'noredirect',
    name: '租赁管理',
    key: 'Lease',
    meta: {
      title: '租赁管理',
      icon: 'chart'
    },
    children: [{
      path: 'federation',
      component: () => import('@/views/lease/federation'),
      name: '公司联盟',
      key: '@Get:lv_lease_federation_list',
      meta: {
        title: '公司联盟',
        icon: 'documentation'
      }
    }, {
      path: 'company',
      component: () => import('@/views/lease/company'),
      name: '租赁公司',
      key: '@Get:lv_lease_company_list',
      meta: {
        title: '租赁公司',
        icon: 'documentation'
      }
    }, {
      path: 'house',
      component: () => import('@/views/lease/house'),
      name: '租赁合同',
      key: '@Get:lv_lease_house_list',
      meta: {
        title: '租赁合同',
        icon: 'documentation'
      }
    }, {
      path: 'approval',
      component: () => import('@/views/lease/approval'),
      name: '合同审批',
      key: '@Get:lv_lease_approval_list',
      meta: {
        title: '合同审批',
        icon: 'documentation'
      }
    }, {
      path: 'notice',
      component: () => import('@/views/lease/notice'),
      name: '公告信息',
      key: '@Get:lv_lease_notice_list',
      meta: {
        title: '公告信息',
        icon: 'documentation'
      }
    }]
  }, {
    path: '/system',
    component: Layout,
    redirect: 'noredirect',
    name: '系统管理',
    key: 'System', // 权限判断使用
    meta: {
      title: '系统管理',
      icon: 'system'
    },
    children: [{
      path: 'permission',
      component: () => import('@/views/system/permission'),
      name: '权限列表',
      key: '@Get:lv_permissions',
      // hidden: true,
      meta: {
        title: '权限列表',
        icon: 'lock'
      }
    }, {
      path: 'role',
      // component: () => import('@/views/system/role-tree'), // 树形
      component: () => import('@/views/system/role-table'), // 表格
      name: '角色列表',
      key: '@Get:lv_roles',
      // hidden: true,
      meta: {
        title: '角色列表',
        icon: 'table'
      }
    }, {
      path: 'user',
      component: () => import('@/views/system/user'),
      name: '用户列表',
      key: '@Get:lv_users',
      meta: {
        title: '用户列表',
        icon: 'peoples'
      }
    }, {
      path: 'log',
      component: () => import('@/views/system/log'),
      name: '操作日志',
      key: '@Get:lv_logs',
      // hidden: true,
      meta: {
        title: '操作日志',
        icon: 'form'
      }
    }]
  },
  { path: '*', redirect: '/404', hidden: true }
]
