const {app, dialog, Tray, Menu, Notification, BrowserWindow} = require('electron')
const path = require('path');
  
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({width: 400, height: 200});
  
  // 当前窗口无菜单
  // 所有窗口无菜单：Menu.setApplicationMenu(null)
  // 隐藏当前窗口菜单，但是按ALT出现，属性：autoHideMenuBar
  win.setMenu(null);

  // 然后加载应用的 index.html。
  win.loadFile('index.html');

  // 打开开发者工具
  //win.webContents.openDevTools();

  win.on('resize', () => {
      win.reload();
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
function showWindow (){
  let child = new BrowserWindow({
      title : '一小时过去了，休息下，同时记录下~~',
      width: 400, 
      height: 300,
      center : true,
      resizable : false,
      frame: true,//是否有边框
      minimizable : false,
      maximizable : false,
      alwaysOnTop : true, //永远在最上层
      transparent : false, //是否在任务栏中显示窗口
    });

    child.setMenu(null);

    child.loadFile('dialog.html');
    child.once('ready-to-show', () => {
      child.show()
    });
};

//通知
function showNotice(){
    var myNotice = new Notification({
       title : 'aaaa2',
       body : 'bbbbb2'
    });
    myNotice.show();

    myNotice.on('click', () => {
      if (win === null) {
        createWindow();
        return;
      };
      win.isVisible() ? win.hide() : win.show()
    });
};

//对话框
function showDialog(){
  dialog.showMessageBox(win,{
    type : 'info',
    title : '自定义标题',
    message : '自定义标题',
    detail : '这里是额外的信息啊'
  },function(){
      console.log(1111);
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
    label: '退出',
    click: function () {
        if (process.platform !== 'darwin') {
          console.log('系统托盘退出');
          win = null;
          app.quit();
        };
    }
}]);
    
function tray(){
    const iconPath = path.join(__dirname, 'icon2.png');

    let tray = new Tray(iconPath); 

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

function init(){
    //createWindow ();

    //showWindow();

    tray();

    //showNotice();

    //showDialog();
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
      createWindow();
    }
  })
  
  // 在这个文件中，你可以续写应用剩下主进程代码。
  // 也可以拆分成几个文件，然后用 require 导入。