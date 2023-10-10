<template>
	<section class="app-container">
		<!--工具条-->
    <el-row>
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
                v-for="item in status_options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
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
          <span v-if="scope.row.status === 0" style="color: #909399;">待提交</span>
          <span v-else-if="scope.row.status === 1" style="color: #409EFF;">审批中</span>
          <span v-else-if="scope.row.status === 2" style="color: #67C23A;">审批通过</span>
          <span v-else-if="scope.row.status === 3" style="color: #F56C6C; display: flex;">审批失败<el-popover
              placement="top-start"
              title=""
              width="200"
              trigger="hover"
              :content="scope.row.fail_reason">
              <el-button type="text" slot="reference">原因</el-button>
            </el-popover>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 3">修改</el-button>
          <el-button size="small" type="primary" @click="submitReview(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 3">提交审批</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.row)" v-if="scope.row.status === 0 || scope.row.status === 3">删除</el-button>
          <el-button size="small" @click="view(scope.row)" v-if="scope.row.status === 1 || scope.row.status === 2">查看</el-button>
          <el-button size="small" type="primary" @click="exportExcel(scope.row)" v-if="scope.row.status === 2">导出excel</el-button>
          <!-- <el-button size="small" @click="handleHousePreview(scope.row)" v-if="scope.row.status === 2">预览</el-button> -->
          <el-button size="small" @click="print(scope.row)" v-if="scope.row.status === 2">打印</el-button>
        </template>
      </el-table-column>
    </el-table>

	  <!--页码-->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page" :page-size="pageSize" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

    <!--编辑界面-->
    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" :show-close="false" width="70%">
      <el-form :model="editForm" label-width="110px" :rules="formRules" ref="form">
        <div class="form-item-title">租金</div>
        <el-row>
          <el-col :span="8">
            <el-form-item label="租赁公司" prop="company_id">
              <el-select v-model="editForm.company_id" filterable placeholder="请选择">
                <el-option
                  v-for="item in company_list"
                  :key="item.id"
                  :label="item.company_name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="起始租期" prop="begin_lease_date">
              <el-date-picker
                class="input-class"
                v-model="editForm.begin_lease_date"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="装修期" prop="repair_period">
              <el-input v-model="editForm.repair_period" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="单价元/㎡/日" prop="unit_price">
              <el-input v-model="editForm.unit_price" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="租金支付方式" prop="pay_method">
              <el-select v-model="editForm.pay_method" placeholder="请选择">
                <el-option
                  v-for="item in pay_method_list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商铺号" prop="shop_number">
              <el-input v-model="editForm.shop_number" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="计租日期" prop="stat_lease_date">
              <el-date-picker
                class="input-class"
                v-model="editForm.stat_lease_date"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="业态/品类" prop="category">
              <el-input v-model="editForm.category" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="履约保证金" prop="performance_bond">
              <el-input v-model="editForm.performance_bond" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="租金涨幅">
              <el-button type="primary" size="small" @click="setIncrease">配置</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="租赁面积㎡" prop="lease_area">
              <el-input v-model="editForm.lease_area" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="租赁年限" prop="lease_year">
              <el-input-number v-model="editForm.lease_year" :min="1" :max="100" auto-complete="off"></el-input-number>
            </el-form-item>
            <el-form-item label="租赁合同编号" prop="contract_number">
              <el-input v-model="editForm.contract_number" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="免租经营期" prop="free_period">
              <el-input v-model="editForm.free_period" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item v-if="editForm.pay_method === -1" label="计租日(天数)" prop="rent_day">
              <el-input-number v-model="editForm.rent_day" :min="1" auto-complete="off" class="input-class"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-item-title">物业费</div>
        <el-row>
          <el-col :span="8">
            <el-form-item label="物业合同编号" prop="property_contract_number">
              <el-input v-model="editForm.property_contract_number" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="单价元/㎡/月" prop="property_unit_price">
              <el-input v-model="editForm.property_unit_price" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item v-if="editForm.property_pay_method === -1" label="计租日(天数)" prop="property_rent_day">
              <el-input-number v-model="editForm.property_rent_day" :min="1" auto-complete="off" class="input-class"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="安全责任人" prop="property_safety_person">
              <el-input v-model="editForm.property_safety_person" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="物业支付方式" prop="property_pay_method">
              <el-select v-model="editForm.property_pay_method" placeholder="请选择">
                <el-option
                  v-for="item in pay_method_list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系方式" prop="property_contact_info">
              <el-input v-model="editForm.property_contact_info" auto-complete="off" class="input-class"></el-input>
            </el-form-item>
            <el-form-item label="物业涨幅">
              <el-button type="primary" size="small" @click="setPropertyIncrease">配置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click.native="resetForm()">取消</el-button>
        <el-button v-if="dialogStatus == 'create'" type="primary" @click="createData" :loading="addIsLoading">添加</el-button>
        <el-button v-else type="primary" @click="updateData" :loading="editIsLoading">修改</el-button>
      </div>
    </el-dialog>

    <!-- 租金涨幅配置 -->
    <el-dialog title="租金涨幅配置" :visible.sync="dialogSetTableVisible" :close-on-click-modal="false" :show-close="false" width="600px">
      <el-form>
        <el-row>
          <el-form-item label="涨幅方式" prop="pay_method" label-width="75px">
            <el-select v-model="editForm.increase_type" placeholder="请选择">
              <el-option
                v-for="item in increase_type_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-for="(item, index) in editForm.increase_content" :key="index">
          <template v-if="editForm.increase_type === 1">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.percent" auto-complete="off" placeholder="递增比例" class="input-class"><template slot="append">%</template></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else-if="editForm.increase_type === 2">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.unit_price" auto-complete="off" placeholder="租金单价" class="input-class"><template slot="append">元/㎡/日</template></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogSetTableVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 物业涨幅配置 -->
    <el-dialog title="物业涨幅配置" :visible.sync="dialogSetPropertyTableVisible" :close-on-click-modal="false" :show-close="false" width="600px">
      <el-form>
        <el-row>
          <el-form-item label="涨幅方式" prop="pay_method" label-width="75px">
            <el-select v-model="editForm.property_increase_type" placeholder="请选择">
              <el-option
                v-for="item in increase_type_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-for="(item, index) in editForm.property_increase_content" :key="index">
          <template v-if="editForm.property_increase_type === 1">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.percent" auto-complete="off" placeholder="递增比例" class="input-class"><template slot="append">%</template></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else-if="editForm.property_increase_type === 2">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.unit_price" auto-complete="off" placeholder="租金单价" class="input-class"><template slot="append">元/㎡/月</template></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogSetPropertyTableVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 查看 -->
    <el-dialog title="查看" :visible.sync="dialogViewTableVisible" :close-on-click-modal="false" width="70%">
      <!-- 详情 -->
      <house-detail
        :detail="editForm"
        :company_list="company_list"
        :pay_method_list="pay_method_list"
        :increase_type_list="increase_type_list">
      </house-detail>
    </el-dialog>

    <!-- 预览 -->
    <HousePreview ref="HousePreview"></HousePreview>
	</section>
</template>

<script>
import {
  list,
  add,
  edit,
  submitReview,
  del,
  exportExcel,
  preview
} from '@/api/house'
import {
  fun_getRole
} from '@/utils/common'
import houseDetail from '@/components/lease/house-detail'
import HousePreview from '@/components/lease/house-preview'

export default {
  components: {
    houseDetail,
    HousePreview
  },
  data() {
    return {
      roleKey: '',
      filters: {
        company_name: '',
        shop_number: '',
        status: ''
      },
      addIsLoading: false,
      editIsLoading: false,
      dialogFormVisible: false,
      dialogViewTableVisible: false,
      dialogStatus: '',
      dialogTitle: '',
      editForm: {},
      formRules: {
        company_id: [{ required: true, message: '请选择租赁公司', trigger: 'blur' }],
        shop_number: [{ required: true, message: '请输入商铺号', trigger: 'blur' }],
        begin_lease_date: [{ required: true, message: '请选择起始租期', trigger: 'blur' }],
        stat_lease_date: [{ required: true, message: '请选择计租日期', trigger: 'blur' }],
        lease_area: [{ required: true, message: '请输入租赁面积', trigger: 'blur' }],
        lease_year: [{ required: true, message: '请输入租赁年限', trigger: 'blur' }],
        unit_price: [{ required: true, message: '请输入租金单价', trigger: 'blur' }],
        pay_method: [{ required: true, message: '请选择租金支付方式', trigger: 'blur' }],
        rent_day: [{ required: true, message: '请输入租金计租日', trigger: 'blur' }],
        property_unit_price: [{ required: true, message: '请输入物业费单价', trigger: 'blur' }],
        property_pay_method: [{ required: true, message: '请选择物业支付方式', trigger: 'blur' }],
        property_rent_day: [{ required: true, message: '请输入物业计租日', trigger: 'blur' }]
      },
      dialogSetTableVisible: false,
      dialogSetPropertyTableVisible: false,
      loading: false,
      data: [],
      company_list: [],
      pay_method_list: [],
      increase_type_list: [],
      status_options: [],
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
              this.resetForm()
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
              this.resetForm()
            }
          }).catch(() => { this.editIsLoading = false })
        }
      })
    },
    handleAdd() {
      this.dialogStatus = 'create'
      this.dialogTitle = '添加'
      this.editForm = {
        company_id: '',
        shop_number: '',
        lease_area: '',
        begin_lease_date: '',
        stat_lease_date: '',
        lease_year: 1,
        repair_period: '',
        free_period: '',
        category: '',
        contract_number: '',
        unit_price: '',
        performance_bond: '',
        pay_method: '',
        rent_day: 1,
        increase_type: 1,
        increase_content: [],

        property_contract_number: '',
        property_safety_person: '',
        property_contact_info: '',
        property_unit_price: '',
        property_pay_method: '',
        property_rent_day: 1,
        property_increase_type: 1,
        property_increase_content: []
      }
      this.dialogFormVisible = true
    },
    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogTitle = '编辑'
      this.editForm = {
        id: row.id,
        company_id: row.company_id,
        shop_number: row.shop_number,
        lease_area: row.lease_area,
        begin_lease_date: row.begin_lease_date,
        stat_lease_date: row.stat_lease_date,
        lease_year: row.lease_year,
        repair_period: row.repair_period,
        free_period: row.free_period,
        category: row.category,
        contract_number: row.contract_number,
        unit_price: row.unit_price,
        performance_bond: row.performance_bond,
        pay_method: row.pay_method,
        rent_day: row.rent_day,
        increase_type: row.increase_type,
        increase_content: row.increase_content,

        property_contract_number: row.property_contract_number,
        property_safety_person: row.property_safety_person,
        property_contact_info: row.property_contact_info,
        property_unit_price: row.property_unit_price,
        property_pay_method: row.property_pay_method,
        property_rent_day: row.property_rent_day,
        property_increase_type: row.property_increase_type,
        property_increase_content: row.property_increase_content
      }
      this.dialogFormVisible = true
    },
    // 租金涨幅
    setIncrease() {
      if (this.editForm.increase_content.length < this.editForm.lease_year) { // 不够，则追加
        for (let index = this.editForm.increase_content.length; index < this.editForm.lease_year; index++) {
          this.editForm.increase_content.push({
            percent: '',
            unit_price: '',
            year_price: ''
          })
        }
      }

      if (this.editForm.increase_content.length > this.editForm.lease_year) { // 超出，则减少
        for (let index = this.editForm.increase_content.length - 1; index >= this.editForm.lease_year; index--) {
          this.editForm.increase_content.splice(index, 1)
        }
      }

      this.dialogSetTableVisible = true
    },
    // 物业涨幅
    setPropertyIncrease() {
      if (this.editForm.property_increase_content.length < this.editForm.lease_year) { // 不够，则追加
        for (let index = this.editForm.property_increase_content.length; index < this.editForm.lease_year; index++) {
          this.editForm.property_increase_content.push({
            percent: '',
            unit_price: '',
            year_price: ''
          })
        }
      }

      if (this.editForm.property_increase_content.length > this.editForm.lease_year) { // 超出，则减少
        for (let index = this.editForm.property_increase_content.length - 1; index >= this.editForm.lease_year; index--) {
          this.editForm.property_increase_content.splice(index, 1)
        }
      }

      this.dialogSetPropertyTableVisible = true
    },
    submitReview(row) {
      this.$confirm('确认提交审批？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitReview({ id: row.id }).then(res => {
          if (res.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.getList()
          }
        })
      }).catch(() => {})
    },
    handleDel(row) {
      this.$confirm('确认删除？', '提示', {
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
        })
      }).catch(() => {})
    },
    resetForm() {
      this.dialogFormVisible = false
      this.$refs['form'].resetFields()
    },
    view(row) {
      this.editForm = row
      this.dialogViewTableVisible = true
    },
    exportExcel(row) {
      exportExcel({ id: row.id }).then(res => {
        if (res.code === 0) {
          window.open(res.excelUrl, '_blank')
        }
      })
    },
    handleHousePreview(row) {
      this.$refs['HousePreview'].handleHousePreview(row)
    },
    print(row) {
      preview({ id: row.id }).then(res => {
        const iframe = document.createElement('iframe')
        iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;')
        document.body.appendChild(iframe)
        iframe.contentDocument.write(res)
        iframe.contentDocument.close()
        iframe.contentWindow.print()
        document.body.removeChild(iframe)
      }).catch(() => {})
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
          this.status_options = res.status_options
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
.el-button--text {
  padding: 0;
  padding-left: 10px;
}
</style>