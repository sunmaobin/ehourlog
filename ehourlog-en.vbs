'==============================================================
'@ FileDesc      Work logs every hour（Ehourlog）
'@ Author        Night<ismb@qq.com>
'@ LastModified  2016年7月6日09:58:20
'@ Version       V0.1
'==============================================================

Const strDirectory = "D:/ehourlog/"                 '日志文件保存目录
Const fileStartFlag = "ehourlog"                    '日志文件前缀
Const fileEndFlag = ".md"                           '日志文件后缀，默认是markdown文件格式
Const strTitle = "每小时记录"                       '弹出框标题
Const strInfo = "亲，忙碌1个小时了，记录一下哦~~"   '弹出框描述
Const Interval = 60                                 '提醒周期，单位为：分钟
 
Dim fso
Dim ws
Dim m_strFilename
 
Sub Createfile(strContext)
 
    strTimeTitle = Cstr(FormatDateTime(Now,4))
    strLogTitle = "1. "+strTimeTitle
 
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set stm = CreateObject("Adodb.Stream")
    stm.Type = 2
    stm.mode = 3
    stm.charset = "utf-8"

    '文件不存在则创建
    CurTime = Now
    m_strFileName = Cstr(Year(CurTime))+"-"+Cstr(Month(CurTime))+"-"+Cstr(Day(CurTime))
    Dim strfileFullPath
    strfileFullPath = strDirectory+fileStartFlag+"-"+m_strFileName+fileEndFlag

    If Not fso.FileExists(strfileFullPath) Then
    
          '创建文件
          fso.CreateTextFile(strfileFullPath)

          '打开文件写入这一天的标题
          stm.Open
          stm.WriteText "## 每小时记录（"+m_strFileName+"）", 1
          stm.WriteText "", 1
          stm.SaveToFile strfileFullPath, 2
          stm.flush
          stm.Close

    End If
 
    stm.Open
    stm.loadfromfile strfileFullPath
    stm.readtext '读取旧的数据
 
    stm.WriteText strLogTitle, 1
    stm.WriteText "   * "+strContext, 1
 
    stm.SaveToFile strfileFullPath, 2
    stm.flush
    stm.Close
    Set stm = Nothing
 
End Sub
 
Sub main
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set stm = CreateObject("Adodb.Stream")
    stm.Type = 2
    stm.mode = 3
    stm.charset = "utf-8"
 
    If Not fso.FolderExists(strDirectory) Then
        fso.CreateFolder(strDirectory)
    End If
 
    While True
        WScript.Sleep(1000*60*Interval)
 
        Dim confirm 
        Do
            strContext = InputBox(strInfo, strTitle)
            
            If Len(strContext)>0 Then
                Createfile strContext
                Exit Do
            End If
            
            confirm = MsgBox("确定这一小时不记录任何内容？",1,"别偷懒哦")
            
            If Len(strContext)<=0 And confirm = 1 Then
                Exit Do
            End If
        Loop
        
    Wend
End sub
main