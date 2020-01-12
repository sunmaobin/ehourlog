<template>
    <div id="login">
        <el-form :model="loginData" ref="loginForm" @submit.native.prevent>
            <el-form-item
                    label=""
                    prop="token"
                    :show-message="false"
                    :validate-on-rule-change="false"
                    :rules="[
                      {required: true, message: 'Token不能为空'}
                    ]">
                <el-input type="text"
                          ref="loginToken"
                          v-model.string="loginData.token"
                          auto-complete="off"
                          :autofocus="true"
                          @keyup.enter.native="submit()"
                          placeholder="请输入你的Token"></el-input>
            </el-form-item>
            <el-form-item class="create-button">
                <el-button size="medium" type="primary" @click="submit()">确定</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron');
    import config from './config';

    export default {
        data() {
            return {
                loginData: {
                    token: ''
                }
            };
        },
        created() {
            console.log('redirect-info',this.$route.query.callback);
            ipcRenderer.on('msg-login', (event, arg) => {
                console.log('msg-login',this.$route.query.callback);
                this.$router.push({
                    path : this.$route.query.callback
                });
            });
        },
        mounted() {
            this.$refs.loginToken.$el.children[0].focus();
            console.log('login mounted state',this.$store.state);
        },
        methods: {
            submit(e) {
                this.$refs['loginForm'].validate((valid) => {
                    if (!valid) {
                        console.log('error submit!!');
                        return;
                    };

                    this.axios.post(config.url.checkUserToken, {
                        userToken: this.loginData.token,
                    }).then((response) => {
                        if(response.data.code !== 200){
                            this.$notify({
                                type: 'error',
                                message: response.data.msg || 'Token不存在',
                                duration: 1500
                            });
                            return;
                        };

                        this.$store.commit('setToken',JSON.stringify(response.data.data));
                        this.$router.push({
                            path : '/create'
                        });
                        ipcRenderer.send('msg-login');
                    });
                });
            }
        }
    }
</script>

<style>
    #login {
        padding: 20px;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }

    #login .el-form .el-button--primary{
        width: 100px;
    }

    #login .el-form-item {
        margin-bottom: 18px;
    }

    .create-button {
        margin-bottom: 0;
        text-align: right;
    }
</style>