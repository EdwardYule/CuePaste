import { app, BrowserWindow, clipboard, ipcMain, globalShortcut, Tray, Menu, nativeImage } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null = null

// 切换窗口显示状态
function toggleWindow() {
  if (!win) {
    createWindow()
    return
  }

  if (win.isVisible()) {
    win.hide()
  } else {
    win.show()
    win.focus()
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      partition: 'persist:clipboard-history',
      contextIsolation: true,
      webSecurity: true,
    },
  })

  // 获取该分区的 session
  const ses = win.webContents.session

  // 可以设置一些存储限制
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    // 只允许必要的权限
    const allowedPermissions = ['clipboard-read', 'clipboard-write']
    callback(allowedPermissions.includes(permission))
  })

  // 可以监控存储使用情况
  ses.getCacheSize().then(size => {
    console.log(`当前缓存大小: ${size / 1024 / 1024} MB`)
  })

  // 处理窗口置顶
  ipcMain.on('toggle-pin', (_event, shouldPin: boolean) => {
    win?.setAlwaysOnTop(shouldPin)
  })

  // 初始化剪贴板监听
  let lastClipboardContent = clipboard.readText()
  
  // 定期检查剪贴板内容是否变化
  setInterval(() => {
    const newContent = clipboard.readText()
    if (newContent !== lastClipboardContent) {
      lastClipboardContent = newContent
      win?.webContents.send('clipboard-change', newContent)
    }
  }, 1000)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// 创建托盘图标
function createTray() {
  try {
    const iconPath = path.join(process.env.VITE_PUBLIC, 'favicon.ico')
    
    // 检查文件是否存在
    const fs = require('fs')
    if (!fs.existsSync(iconPath)) {
      console.error('Icon file not found:', iconPath)
      return
    }

    // 使用 nativeImage 创建图标
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    console.log('Creating tray with icon:', iconPath)
    tray = new Tray(icon)
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏窗口',
        click: () => toggleWindow()
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])

    tray.setToolTip('CuePaste 剪贴板工具')
    tray.setContextMenu(contextMenu)
    
    // 点击托盘图标时切换窗口显示状态
    tray.on('click', () => toggleWindow())
    
    console.log('Tray created successfully')
  } catch (error) {
    console.error('Failed to create tray:', error)
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
  // 销毁托盘图标
  if (tray) {
    tray.destroy()
    tray = null
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  
  // 注册全局快捷键
  const ret = globalShortcut.register('CommandOrControl+Alt+Q', () => {
    toggleWindow()
  })

  if (!ret) {
    console.log('快捷键注册失败')
  }
})
