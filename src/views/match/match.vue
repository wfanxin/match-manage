<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <!-- <el-form-item>
            <el-select v-model="filters.pid" filterable clearable placeholder="请选择标签大类" @change="changePid">
              <el-option
                v-for="item in tag_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select
              style="width: 250px;"
              v-model="filters.ids"
              multiple
              collapse-tags
              placeholder="请选择子类">
              <el-option
                v-for="item in tag_sub_list.filter(item => { return item.pid === filters.pid })"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-cascader v-model="filters.ids" :options="options" :props="props" collapse-tags clearable placeholder="请选择标签" style="width: 300px;"></el-cascader>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">添加</el-button>
          </el-form-item>
          <el-form-item style="float: right;">
            <el-button type="primary" @click="handleTogether">选中比赛展示</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-infinite-scroll="load" infinite-scroll-disabled="disabled" infinite-scroll-distance="20" style="height: calc(100vh - 200px); overflow: auto;">
      <el-col :span="12" v-for="item in data" :key="item.id" style="height: 665px;">
        <div class="table-header">
          <span v-if="checkShow"><el-checkbox v-model="item.checked" :label="getSubTagName(item.tag_id)"></el-checkbox><span style="font-size: 12px; color: #909399;"></span></span>
          <span style="float: right; padding: 3px 0; color: #F56C6C; cursor: pointer;" type="text" @click="handleDel(item)">删除</span>
          <div style="float: right; padding: 3px 5px; color: #DCDFE6;">|</div>
          <span style="float: right; padding: 3px 0; color: #21BAA9; cursor: pointer;" type="text" @click="handleEdit(item)">修改</span>
          <div style="float: right; padding: 3px 5px; color: #DCDFE6;">|</div>
          <span style="float: right; padding: 3px 0; color: #409EFF; cursor: pointer;" type="text" @click="handleMirror(item)">镜像</span>
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
      <el-col :span="24" v-if="loading && data.length > 0" style="text-align: center; color: #909399;">加载中...</el-col>
      <el-col :span="24" v-if="!loading && data.length > 0 && noMore" style="text-align: center; color: #909399;">没有更多了</el-col>
      <el-col :span="24" v-if="!loading && data.length === 0" style="text-align: center; line-height: 50px; color: #909399;">暂无数据</el-col>
    </el-row>

    <!--编辑界面-->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :show-close="false" width="1000px">
      <el-form :model="editForm" label-width="80px" ref="form" style="width: 100%">
        <el-row :gutter="10">
          <!-- <el-col :span="4">
            <el-select v-model="editForm.ptag_id" filterable placeholder="请选择标签大类" size="mini" @change="changePtagId">
              <el-option
                v-for="item in tag_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select v-model="editForm.tag_id" multiple collapse-tags placeholder="请选择标签子类" size="mini" style="width: 100%;">
              <el-option
                v-for="item in tag_sub_list.filter(item => { return item.pid === editForm.ptag_id })"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-col> -->
          <el-col :span="9">
            <el-cascader size="mini" v-model="editForm.tag_id" :options="options" :props="props" collapse-tags clearable placeholder="请选择标签" style="width: 100%;"></el-cascader>
          </el-col>
          <el-col :span="5">
            是否置顶&nbsp;
            <el-switch
              v-model="editForm.is_top"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-col>
        </el-row>

        <el-row :gutter="10" style="margin-top: 10px;">
          <el-col :span="4">
            <el-input v-model="editForm.match_play" placeholder="请输入比赛场次" size="mini"></el-input>
          </el-col>
          <el-col :span="5">
            <el-input v-model="editForm.match_score" placeholder="请输入比分" size="mini"></el-input>
          </el-col>
          <el-col :span="5">
            <el-input v-model="editForm.match_result" placeholder="请输入比赛结果" size="mini"></el-input>
          </el-col>
          <el-col :span="5">
            <el-input v-model="editForm.match_half_audience" placeholder="请输入半全场" size="mini"></el-input>
          </el-col>
          <el-col :span="5">
            <el-input v-model="editForm.match_type" placeholder="请输入比赛类型" size="mini"></el-input>
          </el-col>
        </el-row>

        <el-row :gutter="10" v-for="(item, index) in editForm.match_data" :key="index">
          <el-col :span="4" style="position: relative; top: 10px;">
            <div style="border: 1px solid #dcdfe6; line-height: 65px; text-align: center; border-radius: 5px;">
              <el-input v-model="item.name" placeholder="" size="mini" style="width: 80px;"></el-input>
              <i class="el-icon-delete" style="cursor: pointer;" @click="deleteMatch(item.value, item.name)"></i>
            </div>
          </el-col>
          <el-col :span="20">
            <el-row :gutter="10" v-for="(subItem, subIndex) in item.list" :key="subIndex" style="margin-top: 10px;">
              <el-col :span="6">
                <el-input v-model="subItem.value1" placeholder="请输入" size="mini"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="subItem.value2" placeholder="请输入" size="mini"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="subItem.value3" placeholder="请输入" size="mini"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="subItem.value4" placeholder="请输入" size="mini"><template slot="append">%</template></el-input>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="resetForm()">取消</el-button>
        <el-button v-if="dialogStatus == 'create'" type="primary" @click="createData" :loading="addIsLoading">添加</el-button>
        <el-button v-else type="primary" @click="updateData" :loading="editIsLoading">修改</el-button>
      </div>
    </el-dialog>

    <!-- 对比界面 -->
    <el-dialog title="选中比赛展示" :visible.sync="dialogTableVisible" :close-on-click-modal="false" width="90%" top="20px">
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
	</section>
</template>

<script>
import {
  list,
  add,
  edit,
  del
} from '@/api/match'
import {
  fun_getRole
} from '@/utils/common'

export default {
  data() {
    return {
      roleKey: '',
      filters: {
        pid: '',
        ids: []
      },
      props: { multiple: true },
      options: [],
      addIsLoading: false,
      editIsLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      editForm: {},
      checkShow: false,
      dialogTableVisible: false,
      loading: false,
      id: '',
      data: [],
      tag_list: [],
      tag_sub_list: [],
      platform_list: [],
      together_list: [],
      total: 0
    }
  },
  methods: {
    // 搜索方法
    handleSearch() {
      this.id = ''
      this.getList()
      this.checkShow = false
      this.$nextTick(() => {
        this.checkShow = true
      })
    },
    changePid() {
      this.filters.ids = []
    },
    changePtagId() {
      this.editForm.tag_id = ''
    },
    getTagName(id) {
      for (const item of this.tag_list) {
        if (item.value === id) {
          return item.label
        }
      }

      return ''
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
    createData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.editForm)
          add(params).then(res => {
            this.addIsLoading = false
            if (res.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogFormVisible = false
              this.handleSearch()
            }
          }).catch(() => { this.addIsLoading = false })
        }
      })
    },
    updateData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = Object.assign({}, this.editForm)
          edit(params).then(res => {
            this.editIsLoading = false
            if (res.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogFormVisible = false
              for (const index in this.data) {
                if (this.data[index].id === this.editForm.id) {
                  this.data[index] = Object.assign(this.data[index], this.editForm)
                  break
                }
              }
            }
          }).catch(() => { this.editIsLoading = false })
        }
      })
    },
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogTitle = '添加'
      const match_data = []
      for (const item of this.platform_list) {
        match_data.push({
          value: item.value,
          name: item.label,
          list: [{
            value1: '',
            value2: '',
            value3: '',
            value4: ''
          }, {
            value1: '',
            value2: '',
            value3: '',
            value4: ''
          }]
        })
      }
      this.editForm = {
        ptag_id: '',
        tag_id: [],
        is_top: 0,
        match_play: '',
        match_score: '',
        match_result: '',
        match_half_audience: '',
        match_type: '',
        match_data: match_data
      }
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogTitle = '修改'
      this.editForm = {
        id: row.id,
        ptag_id: row.ptag_id,
        tag_id: row.tag_id,
        is_top: row.is_top,
        match_play: row.match_play,
        match_score: row.match_score,
        match_result: row.match_result,
        match_half_audience: row.match_half_audience,
        match_type: row.match_type,
        match_data: row.match_data
      }
      this.dialogFormVisible = true
    },
    handleDel(row) {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del({ id: row.id }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            // 删除
            for (const index in this.data) {
              if (this.data[index].id === row.id) {
                this.data.splice(index, 1)
                break
              }
            }
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    deleteMatch(value, name) {
      this.$confirm('确认删除【' + name + '】吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const match_data = []
        for (const item of this.editForm.match_data) {
          if (item.value !== value) {
            match_data.push(item)
          }
        }
        this.editForm.match_data = match_data
      }).catch(() => {})
    },
    handleMirror(row) {
      this.$confirm('确认镜像吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (const item of row.match_data) {
          const value01 = item.list[0].value1
          const value11 = item.list[1].value1
          item.list[0].value1 = item.list[0].value3
          item.list[1].value1 = item.list[1].value3
          item.list[0].value3 = value01
          item.list[1].value3 = value11
        }
      }).catch(() => {})
    },
    handleTogether() {
      this.together_list = []
      for (const item of this.data) {
        if (item.checked === true) {
          this.together_list.push(item)
        }
      }
      if (this.together_list.length === 0) {
        this.$message.error('请先选择比赛')
        return false
      }
      this.dialogTableVisible = true
    },
    setOptions() {
      this.options = []
      for (const tag of this.tag_list) {
        const children = []
        for (const tag_sub of this.tag_sub_list) {
          if (tag.value === tag_sub.pid) {
            children.push({
              value: tag_sub.id,
              label: tag_sub.name
            })
          }
        }
        this.options.push({
          value: tag.value,
          label: tag.label,
          children: children
        })
      }
    },
    resetForm() {
      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
    },
    load() {
      if (this.data.length === 0) {
        this.id = ''
      } else {
        this.id = this.data[this.data.length - 1].id
      }
      this.getList()
    },
    getList() {
      const params = Object.assign({}, this.filters)
      params.id = this.id
      this.loading = true
      list(params).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.total = res.total
          this.tag_list = res.tag_list
          this.tag_sub_list = res.tag_sub_list
          this.platform_list = res.platform_list
          this.setOptions()
          if (params.id === '') {
            this.data = res.data
          } else {
            for (const item of res.data) {
              this.data.push(item)
            }
          }
        }
      }).catch(() => { this.loading = false })
    }
  },
  computed: {
    noMore() {
      return this.data.length >= this.total
    },
    disabled() {
      return this.loading || this.noMore
    }
  },
  mounted() {
    this.roleKey = fun_getRole()
    this.handleSearch()
  }
}
</script>

<style>
.table-header {
  border: 1px solid #dcdfe6;
  line-height: 50px;
  padding: 0 10px;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.table-box {
  position: relative;
  top: -3px;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-top: none;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  margin-bottom: 20px;
}
.table-box tr {
  line-height: 30px;
}
.table-box tr td {
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  width: 20%;
  text-align: center;
  font-size: 14px;
}
.table-box tr td:last-child {
  border-right: none;
}
.td-green {
  background-color: #67C23A;
  padding: 2px 5px;
}
.td-orange {
  background-color: orange;
  padding: 2px 5px;
}
.td-black {
  color: black;
}
.td-gray {
  color: gray;
}
.td-bold {
  color: #606266;
  font-weight: bold;
}
.normal-red {
  background-color: #F56C6C;
  padding: 2px 5px;
}
.normal-green {
  background-color: #1a9f1a;
  padding: 2px 5px;
}
.el-cascader-menu {
  overflow: hidden;
  height: 400px;
}
</style>
