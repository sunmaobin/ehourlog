const {app, dialog, Tray, Menu, Notification, BrowserWindow} = require('electron')
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let isForceQuit = false;
let timer,
    num;

let urlConfig = {
    list: `http://120.76.251.109/ehourlog?t=${+new Date()}`,
    create: `http://120.76.251.109/ehourlog?t=${+new Date()}#create`
};

/*urlConfig = {
    list : 'http://localhost:8010',
    create : 'http://localhost:8010/#/create'
};*/

function listWin () {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        title : 'Ehourlog',
        width: 800,
        height: 520,
        show : false
    });

    // 当前窗口无菜单
    // 所有窗口无菜单：Menu.setApplicationMenu(null)
    // 隐藏当前窗口菜单，但是按ALT出现，属性：autoHideMenuBar
    win.setMenu(null);

    // 然后加载应用的 index.html。
    win.loadURL(urlConfig.list);

    // 打开开发者工具
    // win.webContents.openDevTools();

    win.on('resize', () => {
        win.reload();
    });

    win.on('close', (e) => {
        console.log('win close');
        if(isForceQuit){
           return;
        };

        // 可见状态下点击关闭
        if (win.isVisible()) {
            e.preventDefault();
            win.hide();
        };
    });

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', (e) => {
        console.log('win closed');
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
    });
};

//弹出框
let log;
function logWin (){
    log = new BrowserWindow({
        title : '记录一下',
        width: 500,
        height: 200,
        center : true,
        resizable : false,
        frame: true,//是否有边框
        //minimizable : false,
        maximizable : false,
        alwaysOnTop : true, //永远在最上层
        show : false,
        //backgroundColor: '#2e2c29'
    });

    log.setMenu(null);

    // 打开开发者工具
    // log.webContents.openDevTools();

    log.loadURL(urlConfig.create);
    /*log.once('ready-to-show', () => {
      log.show()
    });*/

    log.on('close', (e) => {
        console.log('log close');

        if (isForceQuit) {
           return;
        };

        if (log.isVisible()) {
            e.preventDefault();
            showDialog(function (result) {
                if (result) {
                    log.hide();
                    timeDialog();
                };
            });
        };
    });

    log.on('closed', (e) => {
        console.log('log closed');
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
    });

    //开启倒计时
    timeDialog();

    const {ipcMain} = require('electron');

    ipcMain.on('msg-create', (event, arg) => {
        log && log.hide();
        //重新开启倒计时
        timeDialog();
        //showNotice('记录成功');
    });

    ipcMain.on('msg-login', (event, arg) => {
        console.log('msg-login');
        win.webContents.send('msg-login');
        log.webContents.send('msg-login');
    });

    return log;
};

//通知
function showNotice(msg){
    var myNotice = new Notification({
        title : 'Ehourlog',
        body : msg || '淫荡的一天犹豫朝阳般开始了'
    });
    myNotice.show();

    /*myNotice.on('click', () => {
      if (win === null) {
        listWin();
        return;
      };
      win.isVisible() ? win.hide() : win.show()
    });*/
};

//对话框
function showDialog(callback){
    dialog.showMessageBox(log,{
        type : 'warning',
        title : 'Ehourlog',
        buttons : ['返回记录','确定放弃'],
        message : '打扰了',
        detail : "确定放弃这一小时的记录？"
    },function(response,checkboxChecked){
        callback && callback(response);
    });
}

//设置开机启动
var minecraftAutoLauncher;
function enableAutoStart() {
    let AutoLaunch = require('auto-launch');

    minecraftAutoLauncher = new AutoLaunch({
        name: 'ehourlog', //应用名称
        path: process.execPath, //应用绝对路径
        isHidden: true, //是否隐藏启动
        mac: {
            useLaunchAgent: false //是否启用代理启动，默认是AppleScript启动
        }
    });

    minecraftAutoLauncher.enable();
}

//托盘图标
var trayMenu = Menu.buildFromTemplate([{
    id : 'startup',
    label : '开机启动',
    type : 'checkbox',
    checked : true,
    click : function(){
        minecraftAutoLauncher.isEnabled().then(function(isEnabled){
            isEnabled ? minecraftAutoLauncher.disable() : minecraftAutoLauncher.enable();
            trayMenu.getMenuItemById('startup').checked = !isEnabled;
        }).catch(function(err){
            // handle error
        });
    }
},  {
    label: '记录一下',
    click: function () {
        if(log){
            timer && clearInterval(timer);
            log.webContents.send('msg-show');
            log.show();
        };
    }
},  {
    label: '查看记录',
    click: function () {
        win &&  win.show();
    }
}, {
    label: '退出账号',
    click: function () {
        log.webContents.send('msg-logout');
        tray.setTitle('60:00');
        timer && clearInterval(timer);
        win.hide();
        log.show();
    }
}, {
    label: '关闭程序',
    click: function () {
        isForceQuit = true;
        win = null;
        log = null;
        app.quit();
        console.log('system logout');
    }
}]);

let tray;
function showTray(){
    const iconPath = path.join(__dirname, 'tray.png');

    tray = new Tray(iconPath);

    //设置此托盘图标的悬停提示内容
    tray.setToolTip('EhourLog');

    //console.log(trayMenu);

    //系统托盘右键菜单
    tray.setContextMenu(trayMenu);

    tray.on('click', () => {
        if (win === null) {
            listWin();
            return;
        };
        win.isVisible() ? win.hide() : win.show()
    });

    //自动开机启动
    enableAutoStart();
};

function timeDialog() {
    console.log('time tray');
    tray.setTitle('60:00');
    num = 3600;
    timer && clearInterval(timer);
    timer = setInterval(() => {
        num--;
        //console.log('timer=',num);
        if(num === 0){
            tray.setTitle('(waiting)');
            clearInterval(timer);
            if(log){
                log.webContents.send('msg-show');
                log.show();
            };
            return;
        };
        tray.setTitle(`(${~~(num/60)}:${num%60})`);
    },1000);
};

function init(){
    showNotice();
    showTray();

    listWin ();
    logWin ();
};



// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', init);

// 当全部窗口关闭时退出。
app.on('window-all-closed', (e) => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    //if (process.platform !== 'darwin') {
    //  app.quit()
    //}

    console.log('window-all-closed');

    e.preventDefault();
    e.returnValue = false;
    return false;
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        listWin();
    };
});

app.on('before-quit', function (e){
    if(isForceQuit){
        return;
    };
    win.hide();
    log.hide();
    app.dock.hide();
    e.preventDefault();
});

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。