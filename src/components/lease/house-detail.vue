<template>
  <el-form label-width="110px">
    <div class="form-item-title" style="line-height: 50px;">租金</div>
    <el-row>
      <el-col :span="8">
        <el-form-item label="租赁公司" prop="company_id">
          <el-select v-model="detail.company_id" filterable placeholder="请选择" disabled>
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
            disabled
            class="input-class"
            v-model="detail.begin_lease_date"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="装修期" prop="repair_period">
          <el-input v-model="detail.repair_period" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="单价元/㎡/日" prop="unit_price">
          <el-input v-model="detail.unit_price" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="租金支付方式" prop="pay_method">
          <el-select v-model="detail.pay_method" placeholder="请选择" disabled>
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
          <el-input v-model="detail.shop_number" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="计租日期" prop="stat_lease_date">
          <el-date-picker
            disabled
            class="input-class"
            v-model="detail.stat_lease_date"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="业态/品类" prop="category">
          <el-input v-model="detail.category" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="履约保证金" prop="performance_bond">
          <el-input v-model="detail.performance_bond" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="租金涨幅">
          <el-button type="text" size="small" @click="setIncrease">查看</el-button>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="租赁面积㎡" prop="lease_area">
          <el-input v-model="detail.lease_area" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="租赁年限" prop="lease_year">
          <el-input-number v-model="detail.lease_year" :min="1" :max="100" auto-complete="off" disabled></el-input-number>
        </el-form-item>
        <el-form-item label="租赁合同编号" prop="contract_number">
          <el-input v-model="detail.contract_number" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="免租经营期" prop="free_period">
          <el-input v-model="detail.free_period" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item v-if="detail.pay_method === -1" label="计租日(天数)" prop="rent_day">
          <el-input-number v-model="detail.rent_day" :min="1" auto-complete="off" class="input-class" disabled></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="form-item-title" style="line-height: 50px;">物业费</div>
    <el-row>
      <el-col :span="8">
        <el-form-item label="物业合同编号" prop="property_contract_number">
          <el-input v-model="detail.property_contract_number" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="单价元/㎡/月" prop="property_unit_price">
          <el-input v-model="detail.property_unit_price" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item v-if="detail.property_pay_method === -1" label="计租日(天数)" prop="property_rent_day">
          <el-input-number v-model="detail.property_rent_day" :min="1" auto-complete="off" class="input-class" disabled></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="安全责任人" prop="property_safety_person">
          <el-input v-model="detail.property_safety_person" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="物业支付方式" prop="property_pay_method">
          <el-select v-model="detail.property_pay_method" placeholder="请选择" disabled>
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
          <el-input v-model="detail.property_contact_info" auto-complete="off" class="input-class" disabled></el-input>
        </el-form-item>
        <el-form-item label="物业涨幅">
          <el-button type="text" size="small" @click="setPropertyIncrease">查看</el-button>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 租金涨幅配置 -->
    <el-dialog title="租金涨幅配置" :visible.sync="dialogSetTableVisible" :close-on-click-modal="false" :append-to-body="true" width="600px">
      <el-form>
        <el-row>
          <el-form-item label="涨幅方式" prop="pay_method" label-width="75px">
            <el-select v-model="detail.increase_type" placeholder="请选择" disabled>
              <el-option
                v-for="item in increase_type_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-for="(item, index) in detail.increase_content" :key="index">
          <template v-if="detail.increase_type === 1">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.percent" auto-complete="off" placeholder="递增比例" class="input-class" disabled><template slot="append">%</template></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else-if="detail.increase_type === 2">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.unit_price" auto-complete="off" placeholder="租金单价" class="input-class" disabled><template slot="append">元/㎡/日</template></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
    </el-dialog>

    <!-- 物业涨幅配置 -->
    <el-dialog title="物业涨幅配置" :visible.sync="dialogSetPropertyTableVisible" :close-on-click-modal="false" :append-to-body="true" width="600px">
      <el-form>
        <el-row>
          <el-form-item label="涨幅方式" prop="pay_method" label-width="75px">
            <el-select v-model="detail.property_increase_type" placeholder="请选择" disabled>
              <el-option
                v-for="item in increase_type_list"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
        <el-row v-for="(item, index) in detail.property_increase_content" :key="index">
          <template v-if="detail.property_increase_type === 1">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.percent" auto-complete="off" placeholder="递增比例" class="input-class" disabled><template slot="append">%</template></el-input>
              </el-form-item>
            </el-col>
          </template>
          <template v-else-if="detail.property_increase_type === 2">
            <el-col :span="12">
              <el-form-item :label="'第'+(index+1)+'年'" label-width="75px">
                <el-input v-model="item.unit_price" auto-complete="off" placeholder="租金单价" class="input-class" disabled><template slot="append">元/㎡/月</template></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
    </el-dialog>
  </el-form>
</template>

<script>
export default {
  name: 'house-detail',
  props: {
    detail: {
      default: {},
      require: true
    },
    company_list: {
      default: [],
      require: true
    },
    pay_method_list: {
      default: [],
      require: true
    },
    increase_type_list: {
      default: [],
      require: true
    }
  },
  data() {
    return {
      dialogSetTableVisible: false,
      dialogSetPropertyTableVisible: false
    }
  },
  methods: {
    // 租金涨幅
    setIncrease() {
      this.dialogSetTableVisible = true
    },
    // 物业涨幅
    setPropertyIncrease() {
      this.dialogSetPropertyTableVisible = true
    }
  }
}
</script>
<style>
.el-input.is-disabled .el-input__inner {
  color: #606266;
}
</style>
