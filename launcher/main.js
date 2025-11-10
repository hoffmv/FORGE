const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const config = require('./forge-builder.config.json')

let backendProcess
let frontendProcess

function startBackend() {
  const py = process.platform === 'win32' ? 'python' : 'python3'
  const cwd = path.join(__dirname, '..')
  backendProcess = spawn(
    py,
    ['-m', 'uvicorn', 'backend.app:app', '--host', '0.0.0.0', '--port', String(config.backendPort)],
    { cwd, shell: false }
  )
  backendProcess.stdout.on('data', d => console.log(`[backend] ${d}`))
  backendProcess.stderr.on('data', d => console.error(`[backend] ${d}`))
}

function startFrontend() {
  const cwd = path.join(__dirname, config.frontendPath)
  frontendProcess = spawn('npm', ['run', 'dev'], { cwd, shell: true })
  frontendProcess.stdout.on('data', d => console.log(`[frontend] ${d}`))
  frontendProcess.stderr.on('data', d => console.error(`[frontend] ${d}`))
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  setTimeout(() => {
    mainWindow.loadURL(`http://localhost:${config.frontendPort}`)
  }, 3000)
}

app.whenReady().then(() => {
  startBackend()
  startFrontend()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  if (backendProcess) backendProcess.kill()
  if (frontendProcess) frontendProcess.kill()
})
