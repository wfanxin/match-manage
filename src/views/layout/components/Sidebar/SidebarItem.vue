<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <router-link v-if="hasOneShowingChildren(item.children) && !item.children[0].children&&!item.alwaysShow" :to="item.path+'/'+item.children[0].path"
        :key="item.children[0].name">
        <el-menu-item :index="item.path+'/'+item.children[0].path" :class="{'submenu-title-noDropdown':!isNest}">
          <svg-icon v-if="item.children[0].meta&&item.children[0].meta.icon" :icon-class="item.children[0].meta.icon"></svg-icon>
          <span v-if="item.children[0].meta&&item.children[0].meta.title" slot="title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
          <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.is_show_children" :routes="[child]" :key="child.path"></sidebar-item>

          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path">
              <svg-icon v-if="child.meta&&child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
              <span slot="title">{{child.name}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
    <div style="font-size: 14px; width: 100%; height: 320px; overflow-y: auto; margin-top: 1px; background-color: #473C8B;">
      <div style="text-align: center; line-height: 40px; color: white;">标签列表</div>
      <div style="line-height: 20px; color: white; font-size: 12px; padding-left: 10px; cursor: pointer;" v-for="item in all_together_list" :key="item.id" @click="handleTogether(item)">{{ item.name }}</div>
    </div>
    <div style="font-size: 14px; width: 100%; height: 320px; overflow-y: auto; margin-top: 1px; background-color: #473C8B;">
      <div style="text-align: center; line-height: 30px; color: white;">数据统计</div>
      <div style="line-height: 20px; color: white; font-size: 12px; padding-left: 10px;" v-for="item in stat_list" :key="item">{{ item }}</div>
    </div>

    <!-- 对比界面 -->
    <el-dialog title="选中比赛展示" :visible.sync="dialogTableVisible" :append-to-body="true" :close-on-click-modal="false" width="90%" top="20px">
      <div style="position: absolute; top: 15px; left: 150px; display: flex;">
        <el-input v-model="together_name" placeholder="请输入标签名" style="margin-right: 10px;"></el-input>
        <el-button type="primary" @click="editTogether()">修改</el-button>
        <el-button type="danger" @click="delTogether()">删除</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="8" v-for="item in together_list" :key="item.id" style="height: 665px;">
          <div class="table-header">
            <span>{{ getSubTagName(item.tag_id) }}<span style="font-size: 12px; color: #909399;"></span></span>
          </div>
          <table border="0" cellspacing="0" class="table-box">
            <tr>
              <td class="td-black td-bold">比赛场次</td>
              <td class="td-black td-bold">比分</td>
              <td class="td-black td-bold">比赛结果</td>
              <td class="td-black td-bold">半全场</td>
              <td class="td-black td-bold">比赛类型</td>
            </tr>
            <tr v-if="item.match_result.indexOf('让') !== -1">
              <td class="td-black">{{ item.match_play }}</td>
              <td class="td-black">{{ item.match_score }}</td>
              <td class="td-black">{{ item.match_result }}</td>
              <td class="td-black">{{ item.match_half_audience }}</td>
              <td class="td-black">{{ item.match_type }}</td>
            </tr>
            <tr v-else>
              <td class="td-gray">{{ item.match_play }}</td>
              <td class="td-gray">{{ item.match_score }}</td>
              <td class="td-gray">{{ item.match_result }}</td>
              <td class="td-gray">{{ item.match_half_audience }}</td>
              <td class="td-gray">{{ item.match_type }}</td>
            </tr>
            <tr>
              <td class="td-black td-bold">公司</td>
              <td class="td-black td-bold">胜</td>
              <td class="td-black td-bold">平</td>
              <td class="td-black td-bold">负</td>
              <td class="td-black td-bold">赔付率</td>
            </tr>
            <template v-for="(childItem, childIndex) in item.match_data">
              <tr :key="childIndex + '-1'">
                <td rowspan="3">{{ childItem.name }}</td>
                <td>{{ childItem.list[0].value1 }}</td>
                <td>{{ childItem.list[0].value2 }}</td>
                <td>{{ childItem.list[0].value3 }}</td>
                <td>{{ childItem.list[0].value4 }}%</td>
              </tr>
              <tr :key="childIndex + '-2'">
                <td><span :class="getClass(childItem.list[0].value1, childItem.list[1].value1)">{{ childItem.list[1].value1 }}</span></td>
                <td><span :class="getClass(childItem.list[0].value2, childItem.list[1].value2)">{{ childItem.list[1].value2 }}</span></td>
                <td><span :class="getClass(childItem.list[0].value3, childItem.list[1].value3)">{{ childItem.list[1].value3 }}</span></td>
                <td><span :class="getClassP(childItem.list[0].value4, childItem.list[1].value4)">{{ childItem.list[1].value4 }}%</span></td>
              </tr>
              <tr :key="childIndex + '-3'">
                <td><span :class="getSubtractClass(childItem.list[0].value1, childItem.list[1].value1)">{{ subtract(childItem.list[0].value1, childItem.list[1].value1) }}</span></td>
                <td><span :class="getSubtractClass(childItem.list[0].value2, childItem.list[1].value2)">{{ subtract(childItem.list[0].value2, childItem.list[1].value2) }}</span></td>
                <td><span :class="getSubtractClass(childItem.list[0].value3, childItem.list[1].value3)">{{ subtract(childItem.list[0].value3, childItem.list[1].value3) }}</span></td>
                <td><span>{{ subtract(childItem.list[0].value4, childItem.list[1].value4) }}%</span></td>
              </tr>
            </template>
          </table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { generateTitle } from '@/utils/i18n'
import {
  stat,
  getTogether,
  editTogether,
  delTogether
} from '@/api/match'
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogTableVisible: false,
      stat_list: [],
      all_together_list: [],
      together_list: [],
      together_name: '',
      together_id: 0,
      tag_sub_list: []
    }
  },
  methods: {
    generateTitle,
    hasOneShowingChildren(children) {
      return false
      // const showingChildren = children.filter(item => {
      //   return !item.hidden
      // })
      // if (showingChildren.length === 1) {
      //   return true
      // }
      // return false
    },
    getSubTagName(id) {
      const name = []
      for (const item of this.tag_sub_list) {
        for (const id_arr of id) {
          if (id_arr.length === 2 && id_arr[1] === item.id) {
            name.push(item.name)
          }
        }
      }

      return name.join('、')
    },
    getClass(value1, value2) {
      if (parseFloat(value1) > parseFloat(value2)) {
        return 'td-green'
      }
      if (parseFloat(value1) < parseFloat(value2)) {
        return 'td-orange'
      }
      return ''
    },
    getClassP(value1, value2) {
      if (parseFloat(value1) > parseFloat(value2)) {
        return 'td-green'
      }
      if (parseFloat(value1) < parseFloat(value2)) {
        return 'td-orange'
      }
      return ''
    },
    subtract(value1, value2) {
      const value = parseFloat(value2) - parseFloat(value1)
      return value.toFixed(2)
    },
    getSubtractClass(value1, value2) {
      if (this.subtract(value1, value2) > 0) {
        return 'normal-red'
      }
      if (this.subtract(value1, value2) < 0) {
        return 'normal-green'
      }
      return ''
    },
    editTogether() {
      if (this.together_name === '') {
        this.$message.error('标签名不能为空')
        return false
      }
      editTogether({ id: this.together_id, name: this.together_name }).then(res => {
        if (res.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.dialogTableVisible = false
        }
      }).catch(() => {})
    },
    delTogether() {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTogether({ id: this.together_id }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.dialogTableVisible = false
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    handleTogether(item) {
      this.together_list = []
      this.together_id = item.id
      this.together_name = item.name
      getTogether({ match_ids: item.match_ids }).then(res => {
        if (res.code === 0) {
          this.dialogTableVisible = true
          this.together_list = res.data
          this.tag_sub_list = res.tag_sub_list
        }
      }).catch(() => {})
    },
    getStat() {
      stat({}).then(res => {
        if (res.code === 0) {
          this.stat_list = res.stat_list
          this.all_together_list = res.together_list
        }
      }).catch(() => {})
    }
  },
  created() {
    for (const o in this.routes) {
      const obj = this.routes[o]
      if (obj.path.indexOf('myiframe') >= 0) {
        obj.children[0].path = 'urlPath?src=https://www.baidu.com'
      }
    }
    this.getStat()
    setInterval(() => { this.getStat() }, 3000)
  }
}
</script>
