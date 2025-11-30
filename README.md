# retail-v2

This is a work-in-progress port of the original Laravel retail app into `retail-v2` (Laravel 12, Inertia + React + TypeScript, Fortify).

Quick start

- Copy environment: `cp .env.example .env` and update DB and other secrets.
- Install PHP deps: `composer install`
- Install JS deps: `npm install`
- Generate app key: `php artisan key:generate`
- Run migrations: `php artisan migrate`
- Optional: run seeders: `php artisan db:seed`
- Run dev server: `npm run dev` and `php artisan serve`

Notes & caveats

- Composer post-install scripts may run application code that expects a configured database. If you don't have DB ready, re-run `composer install --no-scripts` and run scripts after migrations.
- The backend port currently contains copied models, events, listeners, controllers and some services. Frontend migration (Blade → Inertia/React + TypeScript) is pending.
- Environment variables required: `DB_*`, `APP_TYPE=retail`, `SERVER_VPN_IP` (for API sync), `OPENAI_API_KEY` (if used), printer-related settings.

What I did so far

- Copied backend domain code (models, services, events/listeners, controllers) from the original app into this workspace.
- Registered event listener mapping and added a minimal `RouteServiceProvider`.
- Added missing `SyncController` and `Queue` model used by `routes/api.php`.
- Installed several composer packages for feature parity (printing, excel, openai, redis, permissions).

Next steps (ask me to continue)

- Run `php artisan migrate` (requires DB) and re-run composer scripts.
- Convert Blade views to Inertia/React + TypeScript.
- Wire up broadcasting (Echo), queues and printer integrations for runtime testing.
