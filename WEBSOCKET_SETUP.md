# WebSocket Server Setup

Sistem Retail V2 menggunakan Laravel Echo Server untuk real-time updates (stock changes, dashboard updates, dll).

## Installation & Configuration

### 1. Dependencies sudah terinstall
```bash
yarn install
```

Dependencies berikut sudah ada:
- `laravel-echo-server` - WebSocket server
- `laravel-echo` - Client-side WebSocket listener
- `socket.io-client` - Socket.io client
- `concurrently` - Run multiple commands simultaneously

### 2. Environment Configuration

Pastikan `.env` file sudah configured:
```
BROADCAST_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 3. Running WebSocket Server

#### Development Mode (dengan Auto-Build)
```bash
yarn build:ws
```

Ini akan menjalankan:
- Laravel Echo Server (port 9999)
- Vite Build secara bersamaan

#### Development Mode (tanpa Auto-Build)
```bash
yarn ws:dev
```

Ini akan menjalankan:
- Laravel Echo Server (port 9999)
- Vite Dev Server (port 5173) - hot reload enabled

#### WebSocket Server Only
```bash
yarn ws
```

Hanya menjalankan Echo Server di port 9999

### 4. Configuration File

File: `laravel-echo-server.json`

Key settings:
- `port`: 9999 (WebSocket server port)
- `host`: 127.0.0.1 (localhost)
- `database`: redis (using Redis for message queue)
- `protocol`: http
- `cors`: configured untuk production domain

### 5. Production Deployment

Menggunakan PM2 untuk production:

#### Start WebSocket Server with PM2
```bash
pm2 start echo-pm2.json
```

#### Save PM2 process
```bash
pm2 save
pm2 startup
```

#### Restart if needed
```bash
pm2 restart laravel-echo-server
pm2 logs laravel-echo-server
```

## How It Works

### Real-time Dashboard Updates

1. **Stock Movement Event Triggered** (dari Pembelian/Retur)
   - Calls `ManageStok::addStok()` atau `ManageStok::reduceStok()`
   - Events `StockUpdated` di-broadcast ke channel 'stock'

2. **WebSocket Broadcast**
   - Laravel Echo Server menerima event via Redis
   - Broadcast ke semua connected clients di channel 'stock'

3. **Frontend Listener** (Dashboard)
   - Hook `useDashboardRealtime` mendengarkan WebSocket events
   - Pada StockUpdated event, fetch fresh dashboard data
   - Update state dengan data terbaru
   - Component re-render dengan data real-time

4. **Fallback Polling**
   - Jika WebSocket tidak tersedia, fallback ke polling
   - Poll setiap 30 detik ke `/admin/dashboard/data`
   - Memastikan data tetap updated meski WebSocket down

## Troubleshooting

### WebSocket Server tidak start

**Check Redis Connection:**
```bash
redis-cli ping
```

Should return: `PONG`

**Check Port 9999:**
```bash
lsof -i :9999
```

**Logs:**
```bash
yarn ws
```

Terminal akan show real-time logs dari Echo Server

### Dashboard tidak terupdate

1. **Check WebSocket connection** (browser devtools → Network → WS)
2. **Check if polling fallback works** (check network requests setiap 30 detik ke `/admin/dashboard/data`)
3. **Verify Redis is running** (`redis-cli ping`)
4. **Check Laravel logs** (`tail -f storage/logs/laravel.log`)

### Port 9999 already in use

1. Kill existing process:
```bash
lsof -i :9999 | awk 'NR!=1 {print $2}' | xargs kill -9
```

2. Or change port in `laravel-echo-server.json` (not recommended)

## Events

### StockUpdated Event

Triggered when:
- Stock ditambah (Pembelian)
- Stock dikurangi (Retur)

Channel: `stock`

Payload:
```json
{
  "barang_id": "uuid",
  "quantity": 100,
  "type": "in|out",
  "timestamp": "2025-12-02T12:00:00Z"
}
```

### Extending with More Events

Untuk menambah real-time event baru:

1. Create Event class di `app/Events/YourEventName.php`
2. Implement `ShouldBroadcast` interface
3. Trigger event di controller/trait: `event(new YourEventName(...));`
4. Listen di frontend dengan Echo

## Performance Notes

- Echo Server lightweight, uses minimal resources (~50-100MB memory)
- Redis handles message queuing efficiently
- Polling fallback every 30s is reasonable for moderate traffic
- For high-traffic scenarios, consider message queue optimization

## SSL/HTTPS for Production

If using HTTPS domain:

1. Update `laravel-echo-server.json`:
   ```json
   {
     "protocol": "https",
     "sslCertPath": "/path/to/cert.pem",
     "sslKeyPath": "/path/to/key.pem"
   }
   ```

2. Update `authHost` dan CORS origins to match your domain

3. Ensure WSS (WebSocket Secure) is available on your server
