'Reminder
Const strDirectory = "D:/ehourlog/"
Const fileEndFlag = ".txt"
Const strTitle = "��ʱ��¼ - ����"
Const strInfo = "�ף�æµ1��Сʱ�ˣ���¼һ��Ŷ~~"
Const Interval = .1 '//�������ڣ���λΪ������
 
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

    '�ļ��������򴴽�
    CurTime = Now
    m_strFileName = Cstr(Year(CurTime))+"-"+Cstr(Month(CurTime))+"-"+Cstr(Day(CurTime))
    Dim strfileFullPath
    strfileFullPath = strDirectory+m_strFileName+fileEndFlag

    If Not fso.FileExists(strfileFullPath) Then
    
          '�����ļ�
          fso.CreateTextFile(strfileFullPath)

          '���ļ�д�����
          stm.Open
          stm.WriteText "", 1
          stm.SaveToFile strfileFullPath, 2
          stm.flush
          stm.Close

    End If
 
    stm.Open
    stm.loadfromfile strfileFullPath
    stm.readtext '��ȡ�ɵ�����
 
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
            
            confirm = MsgBox("ȷ����һСʱ����¼�κ����ݣ�",1,"��͵��Ŷ")
            
            If Len(strContext)<=0 And confirm = 1 Then
                Exit Do
            End If
        Loop
        
    Wend
End sub
main