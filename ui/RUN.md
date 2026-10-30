# Run the UI

Prototype with sample data only.

## Start
```bash
cd ui
npm install        # first time only 
npm run dev
```
Open http://localhost:5173 in your browser.

## Stop
Press `Ctrl+C` in the terminal where it runs.

If it was started in the background or the terminal is gone:
```bash
ps -eo pid,args | grep -E "[n]ode.*vite"   # find the PID
kill <PID>
```

## Other commands
```bash
npm run build      # type-check + production build (output in dist/)
npm run preview    # serve the built version
```

## Troubleshooting
- Port 5173 busy: stop the old server, or run `npm run dev -- --port 5174`.
- Reload resets all sample data.
