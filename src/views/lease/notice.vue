<template>
	<section class="app-container">
		<!--工具条-->
    <el-row >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters" @submit.native.prevent>
          <el-form-item>
            <el-select v-model="filters.is_read" clearable placeholder="请选择">
              <el-option
                v-for="item in read_status_options"
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
      <el-table-column prop="title" label="标题" width="250">
      </el-table-column>
      <el-table-column prop="content" label="内容">
      </el-table-column>
      <el-table-column prop="from_user_name" label="发送人" width="120">
      </el-table-column>
      <el-table-column prop="created_at" label="发送时间" width="180">
      </el-table-column>
      <el-table-column prop="lease_area" label="状态" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.is_read === 0" style="color: #409EFF;">未读</span>
          <span v-else-if="scope.row.is_read === 1">已读</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="small" @click="handleHouseContractDetail(scope.row)" v-if="scope.row.type !== 1">明细</el-button>
        </template>
      </el-table-column>
    </el-table>

	  <!--页码-->
    <el-pagination background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page" :page-size="pageSize" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

    <!-- 查看租赁合同明细 -->
    <HouseContractDetail ref="HouseContractDetail" @db-click="closeContractDetail"></HouseContractDetail>
	</section>
</template>

<script>
import {
  list,
  read
} from '@/api/notice'
import {
  fun_getRole
} from '@/utils/common'
import HouseContractDetail from '@/components/lease/house-contract-detail'

export default {
  components: {
    HouseContractDetail
  },
  data() {
    return {
      roleKey: '',
      filters: {
        is_read: ''
      },
      loading: false,
      data: [],
      read_status_options: [],
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
    handleHouseContractDetail(row) {
      this.$refs['HouseContractDetail'].handleHouseContractDetail(row)
    },
    closeContractDetail(row) {
      if (row.is_read === 0) { // 未读
        this.read(row) // 已读，缴费通知，查看后关闭再设为已读
      }
    },
    read(row) {
      read({ id: row.id }).then(res => {
        if (res.code === 0) {
          this.getList()
        }
      })
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
          this.read_status_options = res.read_status_options
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