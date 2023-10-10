<template>
  <div>
    <el-row style="margin: 30px 0 30px 0;">
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="23">
        <el-select v-model="company_id" filterable placeholder="请选择租赁公司" @change="getData">
          <el-option label="全部" value=""></el-option>
          <el-option
            v-for="item in company_list"
            :key="item.id"
            :label="item.company_name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="10">
        <div class="histogram-title">租金</div>
        <!-- <ve-pie :data="chartData" :settings="chartSettings"></ve-pie> -->
        <ve-histogram :data="chartData" :extend="chartExtend"></ve-histogram>
      </el-col>
      <el-col :span="2">&nbsp;</el-col>
      <el-col :span="10">
        <div class="histogram-title">物业费</div>
        <!-- <ve-pie :data="property_chartData" :settings="chartSettings"></ve-pie> -->
        <ve-histogram :data="property_chartData" :extend="chartExtend"></ve-histogram>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
    </el-row>
  </div>
</template>

<script>
import {
  getData
} from '@/api/stat-price'
import {
  fun_getRole
} from '@/utils/common'

export default {
  data() {
    return {
      roleKey: '',
      company_id: '',
      company_list: [],
      chartData: {},
      property_chartData: {},
      chartSettings: {
        label: {
          formatter: function(data) {
            return `${data.name}
            ${data.value} (${data.percent.toFixed(1)}%)`
          }
        }
      },
      chartExtend: {
        series: {
          type: 'bar',
          barWidth: '10%',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          }
        }
      }
    }
  },
  methods: {
    getData() {
      getData({ company_id: this.company_id }).then(res => {
        if (res.code === 0) {
          this.chartData = res.chartData
          this.property_chartData = res.property_chartData
          this.company_list = res.company_list
        }
      }).catch(() => {})
    }
  },
  mounted() {
    this.roleKey = fun_getRole()
    this.getData()
  }
}
</script>
<style>
.histogram-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 30px;
}
</style>
