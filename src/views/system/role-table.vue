<template>
	<section class="app-container">
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters" @submit.native.prevent>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="角色名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="handleSearch">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
          <el-form-item>
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length === 0">批量删除</el-button>
          </el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table v-loading="loading" :data="roles" highlight-current-row @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="角色名称">
			</el-table-column>
			<el-table-column prop="created_at" label="创建时间">
			</el-table-column>
			<el-table-column prop="updated_at" label="修改时间">
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--页码-->
    <el-pagination background layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="text-align:center;margin-top:10px">
    </el-pagination>

		<!--编辑界面-->
		<el-dialog
     :title="textMap[dialogStatus]"
     :visible.sync="dialogFormVisible"
     :close-on-click-modal="false"
     :show-close="false" :fullscreen="true">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="角色名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="权限" prop="rolePermissions">
          <div class="permisson-box">
            <div class="permisson-box-title">
              <div class="row row1">权限模块</div>
              <div class="row row2">二级权限模块</div>
              <div class="row row3">三级权限模块</div>
            </div>
            <el-checkbox-group v-model="rolePermissions">
              <div class="permisson-box-content">
                <div class="permisson-box-content-item" v-for="(item, index) in permissions" :key="index">
                  <div class="col">
                    <el-checkbox :label="item.id" :key="item.id" :indeterminate="indeterminateList[index].indeterminate"
                      @change="allSecond(item.children, item.id)">{{ item.name }}</el-checkbox>
                  </div>
                  <div style="width: 100%;">
                    <div class="second-box" v-for="(obj, i) in item.children" :key="i">
                      <div class="second-box-left">
                        <div class="second-item">
                          <el-checkbox :label="obj.id" :key="obj.id" :indeterminate="indeterminateList[index].statusList[i]"
                            @change="allThree(obj.children, obj.id, item.children, item.id)">{{ obj.name
                            }}</el-checkbox>
                        </div>
                      </div>
                      <div class="second-box-right">
                        <div class="three-item" v-for="(j, k) in obj.children" :key="k">
                          <el-checkbox :label="j.id" :key="j.id"
                            @change="selItem(item.children, obj.children, j.id, obj.id, item.id)">{{ j.name }}</el-checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
			 <el-button @click.native="resetForm()">取消</el-button>
			  <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
import {
  getRoleListPage,
  removeRole,
  batchRemoveRole,
  editRole,
  addRole
} from '@/api/role-table'
import {
  getTotal as getPermissions
} from '@/api/permission-table'

export default {
  data() {
    return {
      loading: true,
      // 权限
      permissions: [],
      indeterminateList: [],
      props: {
        label: 'name',
        children: 'children'
      },
      defaultId: 0,
      rolePermissions: [],
      dialogStatus: '',
      textMap: {
        update: '编辑角色',
        create: '创建角色'
      },
      dialogFormVisible: false,
      filters: {
        name: ''
      },
      roles: [],
      total: 0,
      page: 1,
      sels: [], // 列表选中列
      editFormRules: {
        name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
      },
      // 编辑界面数据
      editForm: {
        name: ''
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {
        name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleSearch() {
      this.page = 1
      this.getRoles()
    },
    allSecond(arr, id) {
      var arr_new = []
      if (this.rolePermissions.indexOf(id) === -1) {
        var indexArr = []
        for (let index = 0; index < arr.length; index++) {
          indexArr.push(arr[index].id)
          if (arr[index].children && arr[index].children.length !== 0) {
            for (let i = 0; i < arr[index].children.length; i++) {
              indexArr.push(arr[index].children[i].id)
            }
          }
        }
        for (let index = 0; index < this.rolePermissions.length; index++) {
          if (indexArr.indexOf(this.rolePermissions[index]) === -1) {
            arr_new.push(this.rolePermissions[index])
          }
        }
        this.$set(this, 'rolePermissions', arr_new)
      } else {
        for (let index = 0; index < arr.length; index++) {
          if (this.rolePermissions.indexOf(arr[index].id) === -1) {
            this.rolePermissions.push(arr[index].id)
          }
          if (arr[index].children && arr[index].children.length !== 0) {
            for (let i = 0; i < arr[index].children.length; i++) {
              if (this.rolePermissions.indexOf(arr[index].children[i].id) === -1) {
                this.rolePermissions.push(arr[index].children[i].id)
              }
            }
          }
        }
      }
      this.selAll()
    },
    allThree(arr, id, pLength, pId) {
      var l = 0
      var arr_new = []
      if (!arr) {
        return
      }
      if (this.rolePermissions.indexOf(id) === -1) {
        var indexArr = []
        for (let index = 0; index < arr.length; index++) {
          indexArr.push(arr[index].id)
        }
        for (let index = 0; index < this.rolePermissions.length; index++) {
          if (indexArr.indexOf(this.rolePermissions[index]) === -1) {
            arr_new.push(this.rolePermissions[index])
          }
        }
        this.$set(this, 'rolePermissions', arr_new)
        if (pLength.length === 1) {
          if (this.rolePermissions.indexOf(pId) !== -1) {
            this.rolePermissions.splice(this.rolePermissions.indexOf(pId), 1)
          }
        } else {
          l = pLength.length
          for (let index = 0; index < pLength.length; index++) {
            if (this.rolePermissions.indexOf(pLength[index].id) === -1) {
              l--
            }
          }
          if (l === pLength.length) {
            if (this.rolePermissions.indexOf(pId) === -1) {
              this.rolePermissions.push(pId)
            }
          } else {
            if (this.rolePermissions.indexOf(pId) !== -1) {
              this.rolePermissions.splice(this.rolePermissions.indexOf(pId), 1)
            }
          }
        }
      } else {
        for (let index = 0; index < arr.length; index++) {
          if (this.rolePermissions.indexOf(arr[index].id) === -1) {
            this.rolePermissions.push(arr[index].id)
          }
        }
        if (pLength.length === 1) {
          if (this.rolePermissions.indexOf(pId) === -1) {
            this.rolePermissions.push(pId)
          }
        } else {
          l = pLength.length
          for (let index = 0; index < pLength.length; index++) {
            if (this.rolePermissions.indexOf(pLength[index].id) === -1) {
              l--
            }
          }
          if (l === pLength.length) {
            if (this.rolePermissions.indexOf(pId) === -1) {
              this.rolePermissions.push(pId)
            }
          } else {
            if (this.rolePermissions.indexOf(pId) !== -1) {
              this.rolePermissions.splice(this.rolePermissions.indexOf(pId), 1)
            }
          }
        }
      }
      this.selAll()
    },
    selItem(arr, arr2, id, pId, ppId) {
      if (this.rolePermissions.indexOf(id) === -1) {
        if (this.rolePermissions.indexOf(pId) !== -1) {
          this.rolePermissions.splice(this.rolePermissions.indexOf(pId), 1)
          if (arr.length === 1) {
            if (this.rolePermissions.indexOf(ppId) !== -1) {
              this.rolePermissions.splice(this.rolePermissions.indexOf(ppId), 1)
            }
          }
        }
      } else {
        var status = true
        for (let index = 0; index < arr2.length; index++) {
          if (this.rolePermissions.indexOf(arr2[index].id) === -1) {
            status = false
          }
        }
        if (status) {
          if (this.rolePermissions.indexOf(pId) === -1) {
            this.rolePermissions.push(pId)
            if (arr.length === 1) {
              if (this.rolePermissions.indexOf(ppId) === -1) {
                this.rolePermissions.push(ppId)
              }
            }
          }
        } else {
          if (this.rolePermissions.indexOf(pId) !== -1) {
            this.rolePermissions.splice(this.rolePermissions.indexOf(pId), 1)
            if (arr.length === 1) {
              if (this.rolePermissions.indexOf(ppId) !== -1) {
                this.rolePermissions.splice(this.rolePermissions.indexOf(ppId), 1)
              }
            }
          }
        }
      }
      this.selAll()
    },
    resetForm() {
      this.dialogFormVisible = false
      this.$refs['editForm'].resetFields()
    },
    // 获取用户列表
    handleCurrentChange(val) {
      this.page = val
      this.getRoles()
    },
    getRoles() {
      const para = {
        page: this.page,
        name: this.filters.name
      }

      getRoleListPage(para).then(res => {
        this.total = res.total
        this.roles = res.roles
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    // 删除
    handleDel(index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { id: row.id }
          removeRole(para).then(res => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getRoles()
          }).catch(() => {})
        })
        .catch(() => {})
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.editForm = Object.assign({}, row)

      this.defaultId = row.id
      var defaultPermissions = JSON.parse(row.permission)

      // 初始化权限默认值
      this.rolePermissions = defaultPermissions
      this.selAll()
    },
    // 判断是否全选的方法
    selAll() {
      for (let index = 0; index < this.permissions.length; index++) {
        if (this.permissions[index].children && this.permissions[index].children.length !== 0) {
          var lengthP = this.permissions[index].children.length
          for (let i = 0; i < this.permissions[index].children.length; i++) {
            if (this.permissions[index].children[i].children && this.permissions[index].children[i].children.length !== 0) {
              var length = this.permissions[index].children[i].children.length
              for (let j = 0; j < this.permissions[index].children[i].children.length; j++) {
                if (this.rolePermissions.indexOf(this.permissions[index].children[i].children[j].id) !== -1) {
                  length--
                }
              }
              if (length === 0) {
                this.indeterminateList[index].statusList[i] = false
              } else {
                if (length !== 0 && length < this.permissions[index].children[i].children.length) {
                  this.indeterminateList[index].statusList[i] = true
                } else {
                  this.indeterminateList[index].statusList[i] = false
                }
              }
            }

            if (this.rolePermissions.indexOf(this.permissions[index].children[i].id) !== -1) {
              lengthP--
            }
          }

          if (lengthP === 0) {
            this.indeterminateList[index].indeterminate = false
          } else {
            if (lengthP !== 0 && lengthP < this.permissions[index].children.length) {
              this.indeterminateList[index].indeterminate = true
            } else {
              if (this.indeterminateList[index].statusList.indexOf(true) !== -1) {
                this.indeterminateList[index].indeterminate = true
              } else {
                this.indeterminateList[index].indeterminate = false
              }
            }
          }
        }
      }
    },
    // 显示新增界面
    handleAdd() {
      this.defaultId = 0
      this.rolePermissions = []
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.editForm = {
        name: ''
      }
      this.selAll()
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {})
            .then(() => {
              const para = {
                name: this.editForm.name,
                rolePermissions: this.rolePermissions
              }
              editRole(this.defaultId, para).then(res => {
                this.$message({
                  message: '提交成功',
                  type: 'success'
                })
                this.$refs['editForm'].resetFields()
                this.dialogFormVisible = false
                this.getRoles()
              })
            })
            .catch(() => {})
        }
      })
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {})
            .then(() => {
              this.editForm.id = (parseInt(Math.random() * 100)).toString() // mock a id
              const para = {
                name: this.editForm.name,
                rolePermissions: this.rolePermissions
              }
              addRole(para).then(res => {
                this.$message({
                  message: '提交成功',
                  type: 'success'
                })
                this.$refs['editForm'].resetFields()
                this.dialogFormVisible = false
                this.getRoles()
              })
            })
            .catch(() => {})
        }
      })
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString()
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          const para = { ids: ids }
          batchRemoveRole(para).then(res => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.getRoles()
          })
            .catch(err => {
              // 打印一下错误
              console.log(err)
            })
        })
        .catch(() => {})
    },
    getList() {
      getPermissions().then(res => {
        this.permissions = res.list
        for (let index = 0; index < this.permissions.length; index++) {
          this.indeterminateList.push({
            statusList: [],
            indeterminate: false
          })
          for (let i = 0; i < this.permissions[index].children.length; i++) {
            this.indeterminateList[index].statusList.push(false)
          }
        }
      }).catch(() => {})
    }
  },
  mounted() {
    this.getRoles()
    this.getList()
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.edit-mask-box {
  width: 100%;
  display: flex;
}

.permisson-box {
  width: 100%;
  height: calc(100vh - 300px);
  border: 1px solid #E4E7ED;
  margin: 0 auto;
}

.permisson-box-title {
  display: flex;
  width: 100%;
  height: 53px;
  border-bottom: 1px solid #E4E7ED;
  background-color: #E4E7ED;
  color: #333;
}

.permisson-box .row {
  line-height: 53px;
  padding-left: 35px;
  font-size: 14px;
}

.permisson-box .row1 {
  width: 200px;
}

.permisson-box .row2 {
  width: 250px;
}

.permisson-box .row3 {
  width: calc(100% - 450px);
}

.permisson-box-content {
  width: 100%;
  height: calc(100vh - 360px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.permisson-box-content-item {
  display: flex;
}

.permisson-box .col {
  width: 200px;
  height: 100%;
  /* min-height: 53px; */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #303133;
  font-size: 14px;
  border-bottom: 1px solid #E4E7ED;
  border-right: 1px solid #E4E7ED;
}

.second-box {
  width: 100%;
  display: flex;
}

.second-box-left {
  display: flex;
  width: 250px;
  /* min-height: 53px; */
  flex-direction: column;
}

.second-item {
  width: 250px;
  height: 100%;
  /* min-height: 53px; */
  display: flex;
  align-items: center;
  color: #303133;
  font-size: 14px;
  padding-left: 20px;
  border-bottom: 1px solid #E4E7ED;
  border-right: 1px solid #E4E7ED;
  padding-top: 5px;
  padding-bottom: 5px;
}

.second-box-right {
  display: flex;
  width: calc(100% - 250px);
  /* min-height: 53px; */
  align-items: center;
  border-bottom: 1px solid #E4E7ED;
  border-right: 1px solid #E4E7ED;
  flex-wrap: wrap;
  padding: 5px 0;
}

.three-item {
  width: 164px;
  height: 30px;
  line-height: 30px;
  text-align: left;
  padding-left: 15px;
}
</style>
