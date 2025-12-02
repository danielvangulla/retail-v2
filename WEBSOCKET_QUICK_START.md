# Quick Start - WebSocket Setup

## Command Reference

### Development dengan WebSocket & Auto-Build
```bash
yarn build:ws
```
**Apa yang terjadi:**
- Jalankan Laravel Echo Server (port 9999)
- Jalankan Vite build
- Keduanya berjalan bersamaan

**Gunakan ketika:** Final build sebelum deploy

---

### Development dengan WebSocket & Hot-Reload
```bash
yarn ws:dev
```
**Apa yang terjadi:**
- Jalankan Laravel Echo Server (port 9999)
- Jalankan Vite dev server dengan hot-reload (port 5173)
- Keduanya berjalan bersamaan

**Gunakan ketika:** Development dengan real-time changes

---

### WebSocket Server Only
```bash
yarn ws
```
**Apa yang terjadi:**
- Jalankan Laravel Echo Server saja (port 9999)

**Gunakan ketika:** Testing WebSocket connection tanpa rebuild

---

### Normal Build (tanpa WebSocket)
```bash
yarn build
```
**Apa yang terjadi:**
- Build Vite saja
- WebSocket server tidak jalan

---

## Expected Output

### yarn build:ws
```
yarn run v1.22.22
$ concurrently "laravel-echo-server start" "npm run build"

L A R A V E L  E C H O  S E R V E R
version 1.6.3
Starting server...
✔  Running at 127.0.0.1 on port 9999
✔  Listening for http events...
✔  Listening for redis events...
Server ready!

vite v7.0.4 building for production...
✓ 2234 modules transformed...
dist/assets/...
Build complete in ...
```

---

## Verification Checklist

### 1. Redis Running
```bash
redis-cli ping
# Should return: PONG
```

### 2. WebSocket Server Port
```bash
lsof -i :9999
# Should show: laravel-echo-server LISTEN
```

### 3. Environment Config
```bash
grep BROADCAST_DRIVER .env
# Should return: BROADCAST_DRIVER=redis

grep REDIS_HOST .env
# Should return: REDIS_HOST=127.0.0.1
```

### 4. Frontend Connectivity
Open browser DevTools → Network tab:
- Look for WebSocket connection to `ws://localhost:9999/socket.io/`
- Status should be **101 Switching Protocols**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 9999 already in use | `pkill -f laravel-echo-server` |
| Redis connection error | `redis-cli ping` → make sure Redis running |
| Build not complete | Ctrl+C dan coba lagi |
| Dashboard not updating | Check browser console for errors |

---

## Next Steps

1. Run `yarn build:ws` untuk start development
2. Buat Pembelian/Retur di admin
3. Dashboard akan auto-update tanpa refresh
4. Check browser Network → WS untuk verify WebSocket connection

---

Selesai! WebSocket sudah siap untuk real-time dashboard updates. 🚀
