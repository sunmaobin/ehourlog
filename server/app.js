/**
 * Created by Night on 2018/9/10 010.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const crypto = require('crypto');

//session mysql
var mysqlOption = {
    host: "localhost",
    user: "root",
    password: "123456",
    port: "3306",
    database: "ehourlog"
};

app.use(session({
    name : 'ehourlog',
    secret: 'ehourlog',
    resave: true,
    saveUninitiailzed: false,
    store: new MySQLStore(mysqlOption),
    cookie: {
        secure: false,
        httpOnly : true,
        maxAge : 24 * 3600 * 1000 //1天
    }
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

var sequelize = new Sequelize(mysqlOption.database, mysqlOption.user, mysqlOption.password,  {
    host: mysqlOption.host,
    dialect: 'mysql',
    define: {
        freezeTableName: true,
        charset: 'utf8',
        dialectOptions: {
            collate: 'utf8_general_ci'
        },
        timestamps: false
    },
    timezone: '+08:00'
});

//定义数据模型
var User = sequelize.define('User', {
    userId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        unique: true,
        field:'user_id'
    },
    userToken: {
        type: Sequelize.STRING,
        field: 'user_token'
    },
    userCreateTime: {
        type: Sequelize.DATE,
        field : 'user_create_time'
    },
    userUpdateTime: {
        type: Sequelize.DATE,
        field : 'user_update_time'
    },
    userStatus: {
        type: Sequelize.TINYINT,
        field : 'user_status'
    }
},{
    tableName : 'users'
});

var Log = sequelize.define('Log', {
    logId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        unique: true,
        field:'log_id'
    },
    logContent: {
        type: Sequelize.STRING,
        field: 'log_content'
    },
    logUserId : {
        type: Sequelize.BIGINT,
        field:'log_user_id'
    },
    logDate: {
        type: Sequelize.DATE,
        field : 'log_date'
    },
    logCompany: {
        type: Sequelize.STRING,
        field: 'log_company'
    },
    logStatus: {
        type: Sequelize.TINYINT,
        field : 'log_status'
    }
},{
    tableName : 'logs'
});

//获取用户信息Token
var getUserInfoByToken = function (userToken) {
    return User.findOne({
        where : {
            userToken : userToken,
            userStatus : 0
        }
    });
};
var aesKey = 'ehourlog#@!123';
function aesEncrypt(data) {
    const cipher = crypto.createCipher('aes192', aesKey);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

function aesDecrypt(encrypted) {
    const decipher = crypto.createDecipher('aes192', aesKey);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Credentials","true");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","POST,GET,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');

    //快速释放
    if(req.method != "POST"){
        res.end('Hi, this is Ehourlog.');
        //清空无用session
        req.session.destroy();
        return;
    };

    if(req.session.userInfo){
        console.log('cached data!')
        next();
        return;
    };

    if(!req.body.userToken){
        res.json({
            code : 4001,
            msg : '缺少参数 token'
        });
        return;
    };

    getUserInfoByToken(req.body.userToken).then(function (result) {
        if(!result){
            res.json({
                code : 2001,
                msg : 'Token不存在'
            });
            return;
        };

        req.session.userInfo = result;
        next();
    });
});

app.post('/checkUserToken', function(req, res){
    res.json({
        code : 200,
        data : req.session.userInfo
    });
});

app.post('/getLogList', function(req, res){
    if(!req.body.startDate || !req.body.endDate){
        res.json({
            code : 4002,
            msg : '缺少参数 startDate 或者 endDate'
        });
        return;
    };

    Log.findAll({
        where : {
            logUserId : req.session.userInfo.userId,
            logDate : {
                $between: [req.body.startDate, req.body.endDate]
            }
        },
        order : [
            ['logDate','DESC']
        ]
    }).then(function(result){
        result.forEach(function (d) {
            try{
                d.logContent = aesDecrypt(d.logContent);
            }catch (e){}
        });

        res.json({
            code : 200,
            data : result
        });
    });
});

app.post('/createLog', function(req, res){
    if(!req.body.logContent){
        res.send({
            code : 4001,
            msg : '缺少参数 logContent'
        });
        return;
    };

    Log.create({
        logUserId : req.session.userInfo.userId,
        logContent : aesEncrypt(req.body.logContent),
        logCompany : 'vivo'
    }).then(function(result){
        res.send({
            code : 200,
            data : result
        });
    });
});

app.listen(3000);
