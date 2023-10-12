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

    <!--列表-->
    <el-table v-loading="loading" :data="data" highlight-current-row style="width: 100%;">
      <el-table-column prop="name" label="子类名称">
      </el-table-column>
      <el-table-column prop="pname" label="标签大类">
      </el-table-column>
      <el-table-column prop="created_at" label="添加时间">
      </el-table-column>
      <el-table-column prop="updated_at" label="修改时间">
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

	  <!--页码-->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page" :page-size="pageSize" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

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
      data: [],
      tag_list: [],
      tag_sub_list: [],
      platform_list: [],
      page: 1,
      pageSize: 20,
      total: 0
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getList()
    },
    // 搜索方法
    handleSearch() {
      this.page = 1
      this.getList()
    },
    changePid() {
      this.filters.ids = []
    },
    changePtagId() {
      this.editForm.tag_id = ''
    },
    getName(value) {
      for (const item of this.platform_list) {
        if (item.value === value) {
          return item.label
        }
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
              this.getList()
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
              this.getList()
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
            this.getList()
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    resetForm() {
      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
    },
    getList() {
      const params = Object.assign({}, this.filters)
      params.page = this.page
      params.pageSize = this.pageSize
      this.loading = true
      list(params).then(res => {
        this.loading = false
        if (res.code === 0) {
          this.total = res.total
          this.data = res.data
          this.tag_list = res.tag_list
          this.tag_sub_list = res.tag_sub_list
          this.platform_list = res.platform_list
        }
      }).catch(() => { this.loading = false })
    }
  },
  mounted() {
    this.roleKey = fun_getRole()
    this.getList()
  }
}
</script>
