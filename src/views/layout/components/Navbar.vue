<template>
  <el-menu class="navbar" mode="horizontal">
    <nx-hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></nx-hamburger>

    <nx-breadcrumb class="breadcrumb-container"></nx-breadcrumb>

    <div class="right-menu">
      <!-- <nx-lang-select class="international right-menu-item"></nx-lang-select> -->

      <span style="position: relative; top: -13px;">您好，{{ username }}</span>

      <!-- <nx-top-lock style="cursor:pointer" class="nx-help"></nx-top-lock> -->

      <!-- <el-tooltip effect="dark" content="全屏" placement="bottom">
        <nx-full-screen class="screenfull right-menu-item"></nx-full-screen>
      </el-tooltip> -->

      <!-- <nx-skin class="theme-switch right-menu-item"></nx-skin> -->

      <el-dropdown class="avatar-container right-menu-item" trigger="click">
        <div class="avatar-wrapper">
          <img class="user-avatar" src="../../../../static/img/me/home.png">
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item divided>
            <span @click="handleChangePwd" style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span @click="logout" style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!--编辑界面-->
		<el-dialog
      title="修改密码"
      :visible.sync="dialogFormVisible"
      :show-close="false"
      width="900px">
			<el-form :model="form" label-width="180px" :rules="formRules" ref="form">
        <el-form-item label="原密码" prop="old_password">
					<el-input v-model="form.old_password" type="password" auto-complete="off" style="width: 300px"></el-input>
				</el-form-item>

        <el-form-item label="新密码" prop="password">
					<el-input v-model="form.password" type="password" auto-complete="off" style="width: 300px; float:left;"></el-input>
          <el-row type="flex" class="row-bg" style="width:50%; float:left;top:25px;padding-left: 5px;">
            <el-col class="pwd"><div :class="pwd1"></div></el-col>
            <el-col class="pwd"><div :class="pwd2"></div></el-col>
            <el-col class="pwd"><div :class="pwd3"></div></el-col>
          </el-row>
          <span class="pwd-str">{{ pwdLevel }}</span>
				</el-form-item>
        <el-form-item label="重复密码" prop="re_password">
					<el-input v-model="form.re_password" type="password" auto-complete="off" style="width: 300px"></el-input>
				</el-form-item>

        <el-form-item>
          <el-button @click.native="resetForm()">取消</el-button>
          <el-button type="primary" @click="updateData" :loading="updateing">提交</el-button>
        </el-form-item>
			</el-form>
		</el-dialog>

    <!-- 查看租赁合同明细 -->
    <HouseContractDetail ref="HouseContractDetail" @db-click="closeContractDetail"></HouseContractDetail>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import nxTopLock from '@/components/nx-top-lock'
import nxBreadcrumb from '@/components/nx-breadcrumb'
import nxHamburger from '@/components/nx-hamburger'
import nxFullScreen from '@/components/nx-full-screen/index'
import nxLangSelect from '@/components/nx-lang-select/index'
import nxGithub from '@/components/nx-github/index'
import nxSkin from '@/components/nx-skin/index'
import HouseContractDetail from '@/components/lease/house-contract-detail'
import store from '@/store'
import { changePwd } from '@/api/user-table'
import { getNotice, read } from '@/api/notice'
export default {
  data() {
    var checkPwd = (rule, value, callback) => {
      // eslint-disable-next-line space-unary-ops
      if (! rule.required && value === '') {
        return callback()
      }

      if (value.length <= 4) {
        this.pwdLevel = ''
        this.pwd1 = 'grid-content bg-purple pwd-color'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
        return callback(new Error('密码需要大于4位'))
      // eslint-disable-next-line space-unary-ops
      } else if (! value.match(/^[A-Za-z0-9]+$/)) {
        this.pwdLevel = ''
        this.pwd1 = 'grid-content bg-purple pwd-color'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
        return callback(new Error('密码只能英文字母和数字'))
      }

      var level = 0
      if (value.match(/[A-Z]/)) {
        level = level + 1
      }
      if (value.match(/[a-z]/)) {
        level = level + 1
      }
      if (value.match(/[0-9]/)) {
        level = level + 1
      }

      if (level === 1) {
        this.pwdLevel = '弱'
        this.pwd1 = 'grid-content bg-purple pwd-color danger'
        this.pwd2 = 'grid-content bg-purple pwd-color'
        this.pwd3 = 'grid-content bg-purple pwd-color'
      } else if (level === 2) {
        this.pwdLevel = '中'
        this.pwd1 = 'grid-content bg-purple pwd-color warning'
        this.pwd2 = 'grid-content bg-purple pwd-color warning'
        this.pwd3 = 'grid-content bg-purple pwd-color'
      } else if (level === 3) {
        this.pwdLevel = '强'
        this.pwd1 = 'grid-content bg-purple pwd-color success'
        this.pwd2 = 'grid-content bg-purple pwd-color success'
        this.pwd3 = 'grid-content bg-purple pwd-color success'
      }

      return callback()
    }

    var rePwd = (rule, value, callback) => {
      var pwd = this.form.password

      if (value !== pwd) {
        return callback(new Error('俩次密码不一致'))
      }

      return callback()
    }

    return {
      username: store.getters.name,

      cur_date: '',
      pwdLevel: '',
      pwd1: 'grid-content bg-purple pwd-color',
      pwd2: 'grid-content bg-purple pwd-color',
      pwd3: 'grid-content bg-purple pwd-color',
      updateing: false,
      dialogFormVisible: false,
      form: {
        old_password: '',
        password: '',
        re_password: ''
      },
      formRules: {
        old_password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        password: [
          { required: true, validator: checkPwd, trigger: 'blur' }
        ],
        re_password: [
          { required: true, message: '请输入重复密码', trigger: 'blur' },
          { true: false, validator: rePwd, trigger: 'blur' }
        ]
      },
      notification: null
    }
  },
  name: 'navBar',
  components: {
    HouseContractDetail,
    nxBreadcrumb,
    nxHamburger,
    // nxHelp,
    nxFullScreen,
    nxLangSelect,
    nxTopLock,
    nxSkin,
    nxGithub
    // ErrorLog
  },
  computed: {
    ...mapGetters(['sidebar', 'name', 'avatar'])
  },
  methods: {
    handleChangePwd() {
      this.dialogFormVisible = true
    },
    resetForm() {
      this.form = {
        old_password: '',
        password: '',
        re_password: ''
      }
      this.dialogFormVisible = false
    },
    updateData() {
      if (this.form.password !== '' && this.form.password !== this.form.re_password) {
        this.$message.error('俩次密码不一致')
        return false
      }

      this.updateing = true
      this.$refs.form.validate(valid => {
        if (valid) {
          const para = Object.assign({}, this.form)
          changePwd(para).then(res => {
            this.$message({
              message: '提交成功',
              type: 'success'
            })

            this.logout()
            this.updateing = false
          }).catch(e => {
          // 打印一下错误
            this.updateing = false
          })
        }
      })
    },
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // In order to re-instantiate the vue-router object to avoid bugs
      })
    },
    getNotice() {
      setTimeout(() => {
        getNotice({}).then(res => {
          if (res.code === 0 && res.data) {
            const h = this.$createElement
            const button = h('el-button', {
              style: {
                float: 'right'
              },
              props: {
                type: 'primary',
                size: 'mini'
              },
              on: {
                click: () => {
                  this.notification.close()
                  this.showDetail(res.data)
                }
              }
            }, res.data.type === 1 ? '知道了' : '查看')
            // const createAt = h('div', {}, res.data.created_at)
            const content = h('div', {
              style: {
                margin: '10px 0'
              }
            }, res.data.content)
            this.notification = this.$notify({
              title: res.data.title,
              dangerouslyUseHTMLString: true,
              message: h('div', {
                style: {
                  width: '280px'
                }
              }, [
                // createAt,
                content,
                button
              ]),
              showClose: false,
              duration: 0
            })
          } else {
            this.getNotice()
          }
        }).catch(() => { this.getNotice() })
      }, 3000)
    },
    showDetail(row) {
      if (row.type === 1) {
        this.read(row.id) // 已读，审批通知直接已读
      } else {
        this.$refs['HouseContractDetail'].handleHouseContractDetail(row)
      }
    },
    closeContractDetail(row) {
      this.read(row.id) // 已读，缴费通知，查看后关闭再设为已读
    },
    read(id) {
      read({ id: id }).then(res => {
        this.getNotice()
      }).catch(() => { this.getNotice() })
    }
  },
  mounted() {
    var that = this
    setInterval(function() {
      that.cur_date = window.localStorage.getItem('cur_date')
    }, 1000)

    this.getNotice()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container {
    float: left;
  }
  .nx-help {
    display: inline-block;
    vertical-align: top;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international {
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        margin-top: 5px;
        position: relative;
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.pwd {
  margin-right: 2px;
  width: 30px;
}
.pwd-str {
    width: 100px;
    text-align: center;
    position: relative;
    top: -1px;
    left: -296px;
}
.pwd-color {
  border:1px solid #dcdfe6;
  height: 10px;
  width: 30px;
}
.danger {
  background: #f80505;
}
.warning {
  background: #fbc676;
}
.success {
  background: #67C23A;
}
</style>
