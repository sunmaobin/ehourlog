<template>
    <div id="log-create">
        <el-form :model="logData" ref="logForm" @submit.native.prevent>
            <el-form-item
                    label=""
                    prop="content"
                    :show-message="false"
                    :validate-on-rule-change="false"
                    :rules="[
                      { required: true, message: '记录不能为空', trigger: 'blur'},
                      { min: 3, max: 100, message: '记录长度介于3~100字符之间', trigger: 'blur' }
                    ]">
                <el-input type="text"
                          ref="logContent"
                          v-model.string="logData.content"
                          auto-complete="off"
                          :autofocus="true"
                          @keyup.enter.native="submit()"
                          @keyup.esc.native="cancel()"
                          placeholder="记录一下这一小时的工作哦~~"></el-input>
            </el-form-item>
            <el-form-item class="create-button">
                <el-button type="text" @click="cancel()">忽略&nbsp;(Esc)</el-button>
                <el-button size="medium" type="primary" @click="submit()">保存&nbsp;(Enter)</el-button>
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
                logData: {
                    content: ''
                }
            };
        },
        created() {
            ipcRenderer.on('msg-show', (event, arg) => {
                this.$refs['logForm'] && this.$refs['logForm'].resetFields();
                this.$refs.logContent && this.$refs.logContent.$el.children[0].focus();
            });
        },
        methods: {
            submit(e) {
                this.$refs['logForm'].validate((valid) => {
                    if (!valid) {
                        console.log('error submit!!');
                        return;
                    };

                    this.axios.post(config.url.createLog, {
                        userToken : this.$store.getters.getToken(),
                        logContent: this.logData.content,
                    }).then((response) => {
                        if (response.data.code !== 200) {
                            this.$notify({
                                type: 'error',
                                message: response.data.msg || '系统错误，请稍后重试',
                                duration: 3000
                            });
                            return;
                        };

                        if(this.$route.query.list){
                            this.$router.push({
                                path: '/'
                            });
                            return;
                        };

                        ipcRenderer.send('msg-create');
                    });

                    return false;
                });
            },
            cancel() {
                this.$refs['logForm'].resetFields();

                if(this.$route.query.list){
                    this.$router.push({
                        path: '/'
                    });
                    return;
                };

                ipcRenderer.send('msg-create');
            }
        }
    }
</script>

<style>
    #log-create {
        padding: 20px;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }

    #log-create .el-form .el-button--primary{
        width: 100px;
    }

    #log-create .el-form-item {
        margin-bottom: 18px;
    }

    .create-button {
        margin-bottom: 0;
        text-align: right;
    }
</style>