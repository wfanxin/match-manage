<template>
  <section>
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" width="650px">
      <el-button size="small" style="position: absolute; top: 20px;" @click="print()">打印</el-button>
      <div v-html="tableData" id="print-table"></div>
    </el-dialog>
  </section>
</template>

<script>
import { preview } from '@/api/house'

export default {
  data() {
    return {
      dialogVisible: false,
      id: 0,
      tableData: ''
    }
  },
  methods: {
    // 行双击时给父组件广播事件
    handleRowDblclick(row, event, column) {
      this.$emit('db-click')
      this.dialogVisible = false
    },
    // 接受父事件
    handleHousePreview(row) {
      this.id = row.id
      this.tableData = ''
      this.preview()
    },
    print() {
      const iframe = document.createElement('iframe')
      iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;')
      document.body.appendChild(iframe)
      iframe.contentDocument.write(document.getElementById('print-table').innerHTML)
      iframe.contentDocument.close()
      iframe.contentWindow.print()
      document.body.removeChild(iframe)
    },
    preview() {
      preview({ id: this.id }).then(res => {
        this.dialogVisible = true
        this.tableData = res
      }).catch(() => { this.dialogVisible = true })
    }
  }
}
</script>
