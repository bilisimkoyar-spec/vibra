/* Vibra masaüstü uygulaması (Electron). Oyun sunucusu uygulamanın içinde çalışır. */
const { app, BrowserWindow, Menu, session, desktopCapturer, shell } = require('electron');
const path = require('path'), fs = require('fs'), http = require('http');

if (!app.requestSingleInstanceLock()) app.quit();
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const PORT = +process.env.PORT || 3777;
let win = null;

function readConfig() {   // %APPDATA%/Vibra/config.json  →  { "url": "https://benim-sunucum.com" }  (boşsa kendi bilgisayarında sunucu açar)
  const f = path.join(app.getPath('userData'), 'config.json');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify({ url: '' }, null, 2)); } catch {} return {}; }
}
function waitFor(url, tries = 60) {
  return new Promise((res, rej) => {
    const t = n => http.get(url, r => { r.resume(); res(); }).on('error', () => n > 0 ? setTimeout(() => t(n - 1), 250) : rej(new Error('Sunucu açılamadı')));
    t(tries);
  });
}
async function boot() {
  const cfg = readConfig(); let url = process.env.VIBRA_URL || cfg.url;
  if (!url) {
    process.env.PORT = String(PORT); process.env.HOST = '0.0.0.0'; process.env.BASE_URL = `http://localhost:${PORT}`;
    process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');
    require('../server.js'); url = `http://localhost:${PORT}`; await waitFor(url);
  }
  session.defaultSession.setPermissionRequestHandler((_wc, _p, cb) => cb(true));
  session.defaultSession.setDisplayMediaRequestHandler((_req, cb) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then(src => cb(src[0] ? { video: src[0], audio: 'loopback' } : {})).catch(() => cb({}));
  });
  win = new BrowserWindow({ width: 1280, height: 800, minWidth: 900, minHeight: 600, backgroundColor: '#0f1226', title: 'Vibra', autoHideMenuBar: true, webPreferences: { contextIsolation: true } });
  win.webContents.setWindowOpenHandler(({ url: u }) => { shell.openExternal(u); return { action: 'deny' }; });
  win.loadURL(url);
}
Menu.setApplicationMenu(Menu.buildFromTemplate([
  { label: 'Vibra', submenu: [
    { label: 'Tam ekran (F11)', accelerator: 'F11', click: () => win && win.setFullScreen(!win.isFullScreen()) },
    { label: 'Yenile', accelerator: 'CmdOrCtrl+R', click: () => win && win.reload() },
    { label: 'Ayar dosyasını aç (sunucu adresi)', click: () => shell.openPath(path.join(app.getPath('userData'), 'config.json')) },
    { label: 'Veri klasörünü aç', click: () => shell.openPath(app.getPath('userData')) },
    { type: 'separator' }, { role: 'quit', label: 'Çık' } ] },
]));
app.whenReady().then(() => boot().catch(e => { require('electron').dialog.showErrorBox('Vibra açılamadı', String(e.message || e)); app.quit(); }));
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
