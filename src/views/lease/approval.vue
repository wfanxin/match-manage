<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-input v-model="filters.company_name" clearable placeholder="租赁公司"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="filters.shop_number" clearable placeholder="商铺号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.status" clearable placeholder="请选择">
              <el-option
                v-for="item in approval_status_options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!--列表-->
    <el-table v-loading="loading" :data="data" highlight-current-row style="width: 100%;">
      <el-table-column prop="company_name" label="租赁公司">
      </el-table-column>
      <el-table-column prop="shop_number" label="商铺号">
      </el-table-column>
      <el-table-column prop="lease_area" label="租赁面积㎡" width="120">
      </el-table-column>
      <el-table-column prop="lease_year" label="租赁年限" width="100">
      </el-table-column>
      <el-table-column prop="unit_price" label="租金单价元/㎡/日" width="160">
      </el-table-column>
      <el-table-column prop="property_unit_price" label="物业单价元/㎡/月" width="160">
      </el-table-column>
      <el-table-column prop="lease_area" label="状态" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1" style="color: #409EFF;">待审批</span>
          <span v-else-if="scope.row.status === 2" style="color: #67C23A;">审批通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="small" @click="view(scope.row)">明细</el-button>
          <!-- <el-button size="small" type="success" @click="pass(scope.row)" v-if="scope.row.status === 1">通过</el-button>
          <el-button size="small" type="danger" @click="fail(scope.row)" v-if="scope.row.status === 1">失败</el-button> -->
        </template>
      </el-table-column>
    </el-table>

	  <!--页码-->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page" :page-size="pageSize" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

    <!--查看界面-->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="70%">
      <!-- 详情 -->
      <house-detail
        :detail="editForm"
        :company_list="company_list"
        :pay_method_list="pay_method_list"
        :increase_type_list="increase_type_list">
      </house-detail>

      <div slot="footer" class="dialog-footer" v-if="editForm.status === 1">
        <el-button size="small" type="success" @click="pass(editForm)" v-if="editForm.status === 1">通过</el-button>
        <el-button size="small" type="danger" @click="fail(editForm)" v-if="editForm.status === 1">失败</el-button>
      </div>
    </el-dialog>
	</section>
</template>

<script>
import {
  list,
  pass,
  fail
} from '@/api/approval'
import {
  fun_getRole
} from '@/utils/common'
import houseDetail from '@/components/lease/house-detail'

export default {
  components: {
    houseDetail
  },
  data() {
    return {
      roleKey: '',
      filters: {
        company_name: '',
        shop_number: '',
        status: ''
      },
      dialogFormVisible: false,
      dialogTitle: '',
      editForm: {},
      loading: false,
      data: [],
      company_list: [],
      pay_method_list: [],
      increase_type_list: [],
      approval_status_options: [],
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
    view(row) {
      this.dialogTitle = '明细'
      this.editForm = row
      this.dialogFormVisible = true
    },
    pass(row) {
      this.$confirm('确认审批通过？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        pass({ id: row.id }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.resetForm()
            this.getList()
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    fail(row) {
      this.$prompt('请输入审批失败原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入',
        inputValue: '',
        inputValidator: function(value) { return value !== '' },
        inputErrorMessage: '审批失败原因不能为空',
        inputType: 'textarea'
      }).then(({ value }) => {
        fail({ id: row.id, fail_reason: value }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.resetForm()
            this.getList()
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    resetForm() {
      this.dialogFormVisible = false
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
          this.company_list = res.company_list
          this.pay_method_list = res.pay_method_list
          this.increase_type_list = res.increase_type_list
          this.approval_status_options = res.approval_status_options
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
<style>
.el-textarea__inner{
  height: 120px;
}
</style>
<style scoped>
.form-item-title {
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #DCDFE6;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.input-class {
  width: 200px;
}
</style>