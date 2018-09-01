'==============================================================
'@ FileDesc      Work logs every hour��Ehourlog��
'@ Author        Night<ismb@qq.com>
'@ LastModified  2016��7��6��09:58:20
'@ Version       V0.1
'==============================================================

Const strDirectory = "D:/ehourlog/"                 '��־�ļ�����Ŀ¼
Const fileStartFlag = "ehourlog"                    '��־�ļ�ǰ׺
Const fileEndFlag = ".md"                           '��־�ļ���׺��Ĭ����markdown�ļ���ʽ
Const strTitle = "ÿСʱ��¼"                       '���������
Const strInfo = "�ף�æµ1��Сʱ�ˣ���¼һ��Ŷ~~"   '����������
Const Interval = 60                                 '�������ڣ���λΪ������
 
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

    '�ļ��������򴴽�
    CurTime = Now
    m_strFileName = Cstr(Year(CurTime))+"-"+Cstr(Month(CurTime))+"-"+Cstr(Day(CurTime))
    Dim strfileFullPath
    strfileFullPath = strDirectory+fileStartFlag+"-"+m_strFileName+fileEndFlag

    If Not fso.FileExists(strfileFullPath) Then
    
          '�����ļ�
          fso.CreateTextFile(strfileFullPath)

          '���ļ�д����һ��ı���
          stm.Open
          stm.WriteText "## ÿСʱ��¼��"+m_strFileName+"��", 1
          stm.WriteText "", 1
          stm.SaveToFile strfileFullPath, 2
          stm.flush
          stm.Close

    End If
 
    stm.Open
    stm.loadfromfile strfileFullPath
    stm.readtext '��ȡ�ɵ�����
 
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
            
            confirm = MsgBox("ȷ����һСʱ����¼�κ����ݣ�",1,"��͵��Ŷ")
            
            If Len(strContext)<=0 And confirm = 1 Then
                Exit Do
            End If
        Loop
        
    Wend
End sub
main