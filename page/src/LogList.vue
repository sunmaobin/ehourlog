<template>
    <div id="log-list">

        <div>
            <el-form :inline="true" :model="formInline" class="demo-form-inline">
                <el-form-item label="">
                    <el-date-picker
                            v-model="logDate"
                            type="daterange"
                            align="right"
                            unlink-panels
                            :editable="false"
                            :clearable="false"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            format="yyyy-MM-dd"
                            :default-time=pickerLogDate
                            :picker-options="pickerLogDate">
                    </el-date-picker>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="onSearch" icon="el-icon-search">查询</el-button>
                </el-form-item>

                <el-form-item>
                    <el-button @click="onCreate" icon="el-icon-plus">记录</el-button>
                </el-form-item>
            </el-form>
        </div>

        <div>
            <el-table
                    :data="logList"
                    stripe
                    height="400"
                    style="width: 100%">
                <el-table-column
                        prop="logDate"
                        label="时间"
                        :formatter="dateFormat"
                        width="150">
                </el-table-column>
                <el-table-column
                        prop="logCompany"
                        label="公司"
                        width="100">
                </el-table-column>
                <el-table-column
                        prop="logContent"
                        label="记录">
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
    import moment from 'moment';
    import config from './config';

    export default {
        data() {
            return {
                logList: [],

                formInline: {
                    user: '',
                    region: ''
                },

                pickerLogDate: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                logDate: [new Date(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date()]
            }
        },
        mounted() {
            this.onSearch();
        },
        methods: {
            onSearch () {
                console.log('getters',this.$store.getters);
                this.axios.post(config.url.getLogList, {
                    userToken : this.$store.getters.getToken(),
                    startDate: moment(this.logDate[0]).startOf('day').format("YYYY-MM-DD HH:mm:ss"),
                    endDate: moment(this.logDate[1]).endOf('day').format("YYYY-MM-DD HH:mm:ss")
                }).then((response) => {
                    console.log(response.data)
                    if (response.data.code === 2001) {
                        this.$store.commit('clearToken');
                        this.$router.push('login');
                        return;
                    };
                    if (response.data.code !== 200) {
                        this.$notify({
                            type: 'error',
                            message: response.data.msg || '系统错误，请稍后重试',
                            duration: 3000
                        });
                        return;
                    };
                    this.logList = response.data.data;
                });
            },
            onCreate () {
                this.$router.push({
                    path: '/create',
                    query: {
                        list : 1
                    }
                })
            },
            dateFormat:function(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                };
                return moment(date).format("YYYY-MM-DD HH:mm");
            }
        }
    }
</script>

<style>
    #log-list {
        padding: 20px;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }

    #log-list .el-form-item {
        margin-bottom: 0;
    }

    #log-list .el-form .el-button{
        width: 100px;
    }
</style>
