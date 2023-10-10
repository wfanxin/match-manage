<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-select v-model="filters.federation_id" filterable clearable placeholder="请选择">
              <el-option
                v-for="item in federation_list"
                :key="item.id"
                :label="item.federation_name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.company_name" clearable placeholder="公司名称"></el-input>
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
      <el-table-column prop="company_name" label="公司名称">
      </el-table-column>
      <el-table-column prop="federation_name" label="所属联盟">
      </el-table-column>
      <el-table-column prop="company_address" label="公司地址">
      </el-table-column>
      <el-table-column prop="contact_name" label="联系人" width="120">
      </el-table-column>
      <el-table-column prop="contact_mobile" label="联系电话" width="160">
      </el-table-column>
      <el-table-column prop="remark" label="备注">
      </el-table-column>
      <el-table-column prop="user_name" label="创建人" width="120" v-if="this.roleKey === 'admin'">
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
        <el-form-item label="公司名称" prop="company_name">
          <el-input v-model="editForm.company_name" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="所属联盟" prop="company_id">
          <el-select v-model="editForm.federation_id" filterable placeholder="请选择" style="width: 100%;">
            <el-option
              v-for="item in federation_list"
              :key="item.id"
              :label="item.federation_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公司地址" prop="company_address">
          <el-input v-model="editForm.company_address" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="editForm.contact_name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_mobile">
          <el-input v-model="editForm.contact_mobile" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="editForm.remark" auto-complete="off" type="textarea" :rows="3"></el-input>
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
} from '@/api/company'
import {
  fun_getRole
} from '@/utils/common'

export default {
  data() {
    return {
      roleKey: '',
      filters: {
        federation_id: '',
        company_name: ''
      },
      addIsLoading: false,
      editIsLoading: false,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      editForm: {},
      formRules: {
        company_name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
      },
      loading: false,
      data: [],
      federation_list: [],
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
        federation_id: '',
        company_name: '',
        company_address: '',
        contact_name: '',
        contact_mobile: '',
        remark: ''
      }
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑'
      this.editForm = {
        id: row.id,
        federation_id: row.federation_id === 0 ? '' : row.federation_id,
        company_name: row.company_name,
        company_address: row.company_address,
        contact_name: row.contact_name,
        contact_mobile: row.contact_mobile,
        remark: row.remark
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
          this.federation_list = res.federation_list
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
