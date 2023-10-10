<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="filters.federation_name" clearable placeholder="联盟名称"></el-input>
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
      <el-table-column prop="federation_name" label="联盟名称">
      </el-table-column>
      <el-table-column prop="contact_name" label="联系人">
      </el-table-column>
      <el-table-column prop="contact_mobile" label="联系电话">
      </el-table-column>
      <el-table-column prop="user_name" label="创建人" v-if="this.roleKey === 'admin'">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :show-close="false" width="50%">
      <el-form :model="editForm" label-width="110px" :rules="formRules" ref="form" style="width: 80%">
        <el-form-item label="联盟名称" prop="federation_name">
          <el-input v-model="editForm.federation_name" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="editForm.contact_name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_mobile">
          <el-input v-model="editForm.contact_mobile" auto-complete="off"></el-input>
        </el-form-item>
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
} from '@/api/federation'
import {
  fun_getRole
} from '@/utils/common'

export default {
  data() {
    return {
      roleKey: '',
      filters: {
        federation_name: ''
      },
      addIsLoading: false,
      editIsLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      editForm: {},
      formRules: {
        federation_name: [{ required: true, message: '请输入联盟名称', trigger: 'blur' }]
      },
      loading: false,
      data: [],
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
      this.editForm = {
        federation_name: '',
        contact_name: '',
        contact_mobile: ''
      }
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑'
      this.editForm = {
        id: row.id,
        federation_name: row.federation_name,
        contact_name: row.contact_name,
        contact_mobile: row.contact_mobile
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
