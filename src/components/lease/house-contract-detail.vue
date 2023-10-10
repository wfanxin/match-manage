<template>
  <section>
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" width="70%" @close="handleRowDblclick">
      <el-button-group>
        <el-button :type="activeName === 'rent' ? 'primary' : ''" @click="activeName = 'rent'">租赁信息</el-button>
        <el-button :type="activeName === 'contract' ? 'primary' : ''" @click="activeName = 'contract'">合同信息</el-button>
      </el-button-group>
      <!-- 详情 -->
      <house-detail
        style="margin-top: 20px;"
        v-if="activeName === 'rent'"
        :detail="detailData"
        :company_list="company_list"
        :pay_method_list="pay_method_list"
        :increase_type_list="increase_type_list">
      </house-detail>
      <div v-else-if="activeName === 'contract'">
        <div v-html="tableData" class="table-class"></div>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import houseDetail from '@/components/lease/house-detail'
import { detail, preview } from '@/api/house'

export default {
  components: {
    houseDetail
  },
  data() {
    return {
      dialogVisible: false,
      activeName: 'rent',
      id: 0,
      rowData: {},
      tableData: '',
      detailData: {},
      company_list: [],
      pay_method_list: [],
      increase_type_list: []
    }
  },
  methods: {
    // 行双击时给父组件广播事件
    handleRowDblclick(row, event, column) {
      this.$emit('db-click', this.rowData)
      this.dialogVisible = false
    },
    // 接受父事件
    handleHouseContractDetail(row) {
      this.id = row.source_id
      this.rowData = row
      this.tableData = ''
      this.detailData = {}
      this.activeName = 'rent'
      this.detail()
      this.preview()
    },
    detail() {
      detail({ id: this.id }).then(res => {
        this.dialogVisible = true
        this.detailData = res.data
        this.company_list = res.company_list
        this.pay_method_list = res.pay_method_list
        this.increase_type_list = res.increase_type_list
      }).catch(() => { this.dialogVisible = true })
    },
    preview() {
      preview({ id: this.id }).then(res => {
        this.tableData = res
        this.tableData = this.tableData.replace('border="0"', 'border="1"; bordercolor="#EBEEF5"')
        this.tableData = this.tableData.replaceAll('align="left"', 'align="left" style="padding-left: 10px;"')
        this.tableData = this.tableData.replaceAll('height="30px"', 'height="50px"')
        this.tableData = this.tableData.replaceAll('<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>', '')
      }).catch(() => {})
    }
  }
}
</script>
<style scoped>
.table-class {
  width: 650px;
  margin: 20px auto;
}
</style>