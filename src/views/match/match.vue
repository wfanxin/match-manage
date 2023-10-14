<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
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
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">添加</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-infinite-scroll="load" infinite-scroll-disabled="disabled" infinite-scroll-distance="20" style="height: calc(100vh - 200px); overflow: auto;">
      <el-col :span="12" v-for="item in data" :key="item.id">
        <el-card class="box-card" style="margin-bottom: 20px;">
          <div slot="header" class="clearfix">
            <span>{{ getSubTagName(item.tag_id) }}<span style="font-size: 12px; color: #909399;">({{ getTagName(item.ptag_id) }})</span></span>
            <el-button style="float: right; padding: 3px 0; color: #F56C6C;" type="text" @click="handleDel(item)">删除</el-button>
            <div style="float: right; padding: 3px 5px; color: #DCDFE6;">|</div>
            <el-button style="float: right; padding: 3px 0;" type="text" @click="handleEdit(item)">修改</el-button>
          </div>
          <table border="0" cellspacing="0" class="table-box">
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
            <template v-for="(childItem, childIndex) in item.match_data">
              <tr :key="childIndex + '-1'">
                <td rowspan="3">{{ getName(childItem.value) }}</td>
                <td>{{ childItem.list[0].value1 }}</td>
                <td>{{ childItem.list[0].value2 }}</td>
                <td>{{ childItem.list[0].value3 }}</td>
                <td>{{ childItem.list[0].value4 }}</td>
              </tr>
              <tr :key="childIndex + '-2'">
                <td><span :class="getClass(childItem.list[0].value1, childItem.list[1].value1)">{{ childItem.list[1].value1 }}</span></td>
                <td><span :class="getClass(childItem.list[0].value2, childItem.list[1].value2)">{{ childItem.list[1].value2 }}</span></td>
                <td><span :class="getClass(childItem.list[0].value3, childItem.list[1].value3)">{{ childItem.list[1].value3 }}</span></td>
                <td>{{ childItem.list[1].value4 }}</td>
              </tr>
              <tr :key="childIndex + '-3'">
                <td>{{ subtract(childItem.list[0].value1, childItem.list[1].value1) }}</td>
                <td>{{ subtract(childItem.list[0].value2, childItem.list[1].value2) }}</td>
                <td>{{ subtract(childItem.list[0].value3, childItem.list[1].value3) }}</td>
                <td>{{ subtract(childItem.list[0].value4, childItem.list[1].value4) }}%</td>
              </tr>
            </template>
          </table>
        </el-card>
      </el-col>
      <el-col :span="24" v-if="loading && data.length > 0" style="text-align: center; color: #909399;">加载中...</el-col>
      <el-col :span="24" v-if="!loading && data.length > 0 && noMore" style="text-align: center; color: #909399;">没有更多了</el-col>
      <el-col :span="24" v-if="!loading && data.length === 0" style="text-align: center; line-height: 50px; color: #909399;">暂无数据</el-col>
    </el-row>

    <!--编辑界面-->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :show-close="false" width="1000px">
      <el-form :model="editForm" label-width="80px" ref="form" style="width: 100%">
        <el-row :gutter="10">
          <el-col :span="4">
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
            <el-select v-model="editForm.tag_id" filterable placeholder="请选择标签子类" size="mini" style="width: 100%;">
              <el-option
                v-for="item in tag_sub_list.filter(item => { return item.pid === editForm.ptag_id })"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
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
            <div style="border: 1px solid #dcdfe6; line-height: 65px; text-align: center; border-radius: 5px;">{{ getName(item.value) }}</div>
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
                <el-input v-model="subItem.value4" placeholder="请输入" size="mini"></el-input>
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
      addIsLoading: false,
      editIsLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      editForm: {},
      loading: false,
      id: '',
      data: [],
      tag_list: [],
      tag_sub_list: [],
      platform_list: [],
      total: 0
    }
  },
  methods: {
    // 搜索方法
    handleSearch() {
      this.id = ''
      this.getList()
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
      for (const item of this.tag_sub_list) {
        if (item.id === id) {
          return item.name
        }
      }

      return ''
    },
    getName(value) {
      for (const item of this.platform_list) {
        if (item.value === value) {
          return item.label
        }
      }

      return ''
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
    subtract(value1, value2) {
      const value = parseFloat(value1) - parseFloat(value2)
      return value.toFixed(2)
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
        tag_id: '',
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
.table-box {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-radius: 3px;
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
</style>
