/// <summary>
/// 创建文件的快捷方式
/// </summary>
/// <param name="directory">快捷方式目录</param>
/// <param name="shortcutname">快捷方式名称</param>
/// <param name="targetpath">文件所在目录</param>
/// <param name="paramters">？？？</param>
/// <param name="description">描述</param>
/// <param name="iconlocation">快捷方式图标</param>
public static void CteateShortcut(string directory,string shortcutname,string targetpath,string paramters,string description=null,string iconlocation=null)
{
    if(!System.IO.Directory.Exists(directory))
    {
        System.IO.Directory.CreateDirectory(directory);
    }
    string shortcutpath = Path.Combine(directory, string.Format("{0}.lnk", shortcutname));
    WshShell shell = new WshShell();
    IWshShortcut shortcut = shell.CreateShortcut(shortcutpath) as IWshShortcut;
    shortcut.TargetPath = targetpath;
    shortcut.Arguments = paramters;
    shortcut.WorkingDirectory = Path.GetDirectoryName(targetpath);
    shortcut.WindowStyle = 1;
    shortcut.Description = description;
    shortcut.IconLocation = iconlocation;
    shortcut.Save();
}
