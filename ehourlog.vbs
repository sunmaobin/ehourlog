'Reminder
Const strDirectory = "D:/ehourlog/"
Const fileEndFlag = ".txt"
Const strTitle = "定时记录 - 提醒"
Const strInfo = "亲，忙碌1个小时了，记录一下哦~~"
Const Interval = .1 '//提醒周期，单位为：分钟
 
Dim fso
Dim ws
Dim m_strFilename
 
Sub Createfile(strContext)
 
    strTimeTitle = Cstr(FormatDateTime(Now,vbGeneralDate))
    strLogTitle = "<div style='color: red;text-align:right;'>"+strTimeTitle+"</div>"
 
    Set fso = CreateObject("Scripting.FileSystemObject")
    Set stm = CreateObject("Adodb.Stream")
    stm.Type = 2
    stm.mode = 3
    stm.charset = "utf-8"

    '文件不存在则创建
    CurTime = Now
    m_strFileName = Cstr(Year(CurTime))+"-"+Cstr(Month(CurTime))+"-"+Cstr(Day(CurTime))
    Dim strfileFullPath
    strfileFullPath = strDirectory+m_strFileName+fileEndFlag

    If Not fso.FileExists(strfileFullPath) Then
    
          '创建文件
          fso.CreateTextFile(strfileFullPath)

          '打开文件写入空行
          stm.Open
          stm.WriteText "", 1
          stm.SaveToFile strfileFullPath, 2
          stm.flush
          stm.Close

    End If
 
    stm.Open
    stm.loadfromfile strfileFullPath
    stm.readtext '读取旧的数据
 
    stm.WriteText strLogTitle, 1
 
    stm.WriteText "    "+strContext, 1
    stm.WriteText "------", 1
 
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