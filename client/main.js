const {app, dialog, Tray, Menu, Notification, BrowserWindow} = require('electron')
const path = require('path');
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let isForceQuit = false;
let timer,
    num;

let urlConfig = {
    list : 'http://120.76.251.109/ehourlog?t=2',
    create : 'http://120.76.251.109/ehourlog?t=2#create'
};

/*urlConfig = {
    list : 'http://localhost:8010',
    create : 'http://localhost:8010/#/create'
};*/

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({
      width: 800,
      height: 520,
      show : false,
  });
  
  // 当前窗口无菜单
  // 所有窗口无菜单：Menu.setApplicationMenu(null)
  // 隐藏当前窗口菜单，但是按ALT出现，属性：autoHideMenuBar
  win.setMenu(null);

  // 然后加载应用的 index.html。
  win.loadURL(urlConfig.list);

  // 打开开发者工具
  win.webContents.openDevTools();

  win.on('resize', () => {
      win.reload();
  });

    win.on('close', (e) => {
        if(!isForceQuit){
            e.preventDefault();
            win.hide();
        };
    });

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', (e) => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;
  });
};

//弹出框
let child;
function showWindow (){
  child = new BrowserWindow({
      title : '我来了',
      width: 500,
      height: 200,
      center : true,
      resizable : false,
      frame: true,//是否有边框
      //minimizable : false,
      maximizable : false,
      alwaysOnTop : true, //永远在最上层
      transparent : false, //是否在任务栏中显示窗口
      show : false,
      //backgroundColor: '#2e2c29'
    });

    child.setMenu(null);

    //打开开发者工具
    child.webContents.openDevTools();

    child.loadURL(urlConfig.create);
    /*child.once('ready-to-show', () => {
      child.show()
    });*/

    child.on('close', (e) => {
        if(!isForceQuit) {
            e.preventDefault();
            child.hide();

            showDialog(function (result) {
                console.log('dialog-result',result);
                result ? timeDialog() : (child.webContents.send('msg-show') && child.show());
            });
        };
    });

    child.on('closed', (e) => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        child = null;
    });

    //开启倒计时
    timeDialog();

    const {ipcMain} = require('electron');

    ipcMain.on('msg-create', (event, arg) => {
        child && child.hide();
        //重新开启倒计时
        timeDialog();
        //showNotice('记录成功');
    });

    ipcMain.on('msg-login', (event, arg) => {
        console.log('msg-login');
        win.webContents.send('msg-login');
        child.webContents.send('msg-login');
    });
    
    return child;
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
        createWindow();
        return;
      };
      win.isVisible() ? win.hide() : win.show()
    });*/
};

//对话框
function showDialog(callback){
  dialog.showMessageBox(win,{
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
},{
    label: '记录一下',
    click: function () {
        if(child){
            timer && clearInterval(timer);
            child.webContents.send('msg-show');
            child.show();
        };
    }
},{
    label: '退出',
    click: function () {
        if (process.platform !== 'darwin') {
            isForceQuit = true;
          win = null;
          child = null;
          app.quit();
            console.log('system logout');
        };
    }
}]);

let tray;
function showTray(){
    const iconPath = path.join(__dirname, 'icon.png');

    tray = new Tray(iconPath);

    //设置此托盘图标的悬停提示内容
    tray.setToolTip('This is my application.');

    //console.log(trayMenu);

    //系统托盘右键菜单
    tray.setContextMenu(trayMenu);

    tray.on('click', () => {
      if (win === null) {
        createWindow();
        return;
      };
      win.isVisible() ? win.hide() : win.show()
    });

    //自动开机启动
    enableAutoStart();
};

function timeDialog() {
    num = 3600;
    timer && clearInterval(timer);
    timer = setInterval(() => {
        num--;
        //console.log('timer=',num);
        if(num === 0){
            tray.setTitle('(waiting)');
            clearInterval(timer);
            if(child){
                child.webContents.send('msg-show');
                child.show();
            };
            return;
        };
        tray.setTitle('(' + num + ')');
    },1000);
};

function init(){
    showNotice();
    showTray();

    createWindow ();
    showWindow ();
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
    xe.returnValue = false;
    return false;
  });
  
  app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
      createWindow();
    }
  })
  
  // 在这个文件中，你可以续写应用剩下主进程代码。
  // 也可以拆分成几个文件，然后用 require 导入。