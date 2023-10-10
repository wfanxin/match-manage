<template>
  <el-form class="login-form" status-icon :rules="loginRules" ref="loginForm" :model="loginForm" label-width="0">
    <el-form-item prop="user_name">
      <el-input size="small" @keyup.enter.native="handleLogin" v-model="loginForm.user_name" auto-complete="off" placeholder="请输入用户名">
        <i slot="prefix" class="icon-yonghu"></i>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input size="small" @keyup.enter.native="handleLogin" :type="passwordType" v-model="loginForm.password" auto-complete="off" placeholder="请输入密码">
        <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
        <i slot="prefix" class="icon-mima"></i>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" size="small" @click.native.prevent="handleLogin" class="login-submit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { getDeviceId } from '@/utils/auth'

export default {
  name: 'userlogin',
  data() {
    return {
      loginForm: {
        user_name: '',
        password: '',
        vcode: ''
      },
      checked: false,
      isCode: true,
      codeSrc: '',
      loginRules: {
        user_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, message: '账号或密码错误', trigger: 'blur' }
        ]
      },
      passwordType: 'password'
    }
  },
  created() {
  },
  mounted() {
    this.refreshCode()
  },
  computed: {
  },
  props: [],
  methods: {
    refreshCode() {
      this.codeSrc = process.env.BASE_API + '/lv/captchas/' + Math.random() + '?device_id=' + getDeviceId()
    },
    showPassword() {
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$store.dispatch('Login', this.loginForm).then(res => {
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.refreshCode()
          })
        }
      })
    }
  }
}
</script>
<style>
.code{
  cursor: pointer;
  color: #409eff;
}
.code:hover {
  text-decoration: underline;
}
.login-form .el-form-item{
  margin-bottom: 15px;
}
.login-submit{
  margin-top: 0px;
}
</style>
