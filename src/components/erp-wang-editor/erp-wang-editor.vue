<template>
  <div class="home">
    <div id="demo1"></div>
    <button type="button" class="btn">获取当前内容</button>
  </div>
</template>

<script>
/* eslint-disable */
// 引入 wangEditor
import wangEditor from 'wangeditor'
import {
  getToken
} from '@/utils/auth'
export default {
  props: {
    /* 上传图片的地址 */
    uploadUrl: {
      type: String
    },
    /* 编辑器的内容 */
    value: {
      type: String
    }
  },
  data() {
    return {
      editor: null,
      editorData: ''
    }
  },
  watch: {
    value (newV, oldV) { // watch监听props里status的变化，然后执行操作
      if (newV !== this.editorData) {
        this.editor.txt.html(newV)
      }
    }
  },
  mounted() {
    const editor = new wangEditor(`#demo1`)
    // 配置 onchange 回调函数，将数据同步到 vue 中
    editor.config.onchange = (newHtml) => {
      console.log(newHtml)
      this.editorData = newHtml
      this.$emit('input', this.editorData)
    }
    editor.config.uploadFileName = 'file'
    editor.config.uploadImgServer = this.uploadUrl
    editor.config.uploadImgHeaders = {
      'X-Token': getToken()
    }
    // 创建编辑器
    editor.create()
    editor.txt.html(this.value)
    this.editor = editor
  },
  methods: {
  },
  beforeDestroy() {
    // 调用销毁 API 对当前编辑器实例进行销毁
    this.editor.destroy()
    this.editor = null
  }
}
</script>

<style lang="scss">
  .home {
    width: 100%;
    position: relative;
    .btn {
      position: absolute;
      right: 0;
      top: 0;
      padding: 5px 10px;
      cursor: pointer;
    }
    h3 {
      margin: 30px 0 15px;
    }
  }
</style>
