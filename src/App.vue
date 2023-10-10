<template>
  <div id="app">
    <!--登入动画-->
    <transition name="rotate-fall">
    <router-view  class="app-router-view"></router-view>
    </transition>
  </div>
</template>

<script>
import 'vue-transition.css'
export default {
  name: 'App',
  created() {
    // 判断设备
    var os = (function() {
      var ua = navigator.userAgent
      var isWindowsPhone = /(?:Windows Phone)/.test(ua)
      var isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
      var isAndroid = /(?:Android)/.test(ua)
      var isFireFox = /(?:Firefox)/.test(ua)
      var isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua))
      var isPhone = /(?:iPhone)/.test(ua) && !isTablet
      var isPc = !isPhone && !isAndroid && !isSymbian
      return {
        isTablet,
        isPhone,
        isAndroid,
        isPc
      }
    })()
    if (os.isAndroid || os.isPhone) {
      console.log('当前设备-手机')
    } else if (os.isTablet) {
      console.log('当前设备-平板')
    } else if (os.isPc) {
      console.log('当前设备-电脑')
    }
  }
}

</script>
<style>
  .el-cascader-menu {
    overflow: hidden;
  }
  .app .app-router-view {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    transform-style: preserve-3d;
    visibility: visible;
  }
</style>
