# PLAN: deploy an agent to the cloud in under 5 minutes

Goal: one command -> cloud Linux box + AI agent + synced project + mirrored ports, in < 5 min. Source spec: [`spec-mvp.md`](spec-mvp.md).

## Roadmap

| Stage | What | Output | Exit gate |
|---|---|---|---|
| 0. Prereqs | Local tools + accounts | `hcloud`, `mutagen`, `ssh` installed (WSL2); SSH key; Hetzner token; Claude auth; test project | `which hcloud mutagen ssh` all found |
| 1. Phase 0: manual proof | Do everything by hand once | `RESULTS.md` with timings + friction log | Agent survives 15+ min laptop-off; files sync; port 3000 works. **Fail = stop.** |
| 2. cloud-init | Automate server setup | `cloud-init.yaml` (pinned Claude Code version) | Fresh server ready with no manual steps |
| 3. `box` CLI | Single bash script | `box` (init, up, ssh, agent, ports, status) | `box up` from nothing < 5 min, idempotent |
| 4. Sleep/wake | Snapshot lifecycle | `box sleep`, `box wake`, `box destroy` | Wake from snapshot < 5 min; files/tools/git preserved |
| 5. Acceptance | Run the 8 tests in the spec (section 10) | Filled table in `RESULTS.md` | All pass with evidence |
| 6. Wrap-up | Docs + cleanup | `README.md`, go/no-go for Phase 2, `box destroy` | Nothing billable left at Hetzner |

## Where the 5 minutes go (budget to verify in Stage 1, not measured yet)

| Step | Target |
|---|---|
| Server create + boot | ~1 min |
| cloud-init (apt, Node, Claude Code) | ~2-3 min <- biggest cost |
| SSH ready + Mutagen start | ~30 s |
| Ready message | - |

If cloud-init alone busts the budget, the fix is a **pre-baked snapshot image** (tools already installed), so `box up` restores it instead of installing. Decide this from Stage 1 timings.

## Stage detail

**Stage 0 (10 min):** check local tools and install what is missing. Create the Hetzner API token and run `hcloud context create agent-box` yourself; never paste the token into a chat or a file. Claude Code authentication is done on the box, or via `~/.box-env`.

**Stage 1 (about 1 hour):** pick the cheapest type with >= 2 vCPU / 4 GB from live `hcloud server-type list`; create the key, firewall (port 22 only) and server; test sync, tmux persistence and port forwarding. Log every manual step. That log is the product roadmap.

**Stages 2-4:** build `box` command by command, testing each against real Hetzner before the next. Rules: `set -euo pipefail`, state in `~/.box/state.env`, timings in `~/.box/metrics.log`, never print secrets.

**Stage 5-6:** run acceptance tests, record real costs from live prices, then `box destroy`.

## Risks

| Risk | Mitigation |
|---|---|
| cloud-init too slow for 5 min | Pre-baked snapshot (see budget) |
| Hetzner signup blocked | Fall back to DigitalOcean (`doctl`) |
| Forgotten running box keeps billing | `box status` warns after 8 h; set a billing alert |
| Snapshot holds credentials | Warn user; never share snapshots |
| IP changes on wake | Rewrite `~/.ssh/config`, clear `known_hosts` entry |
| Claude Code install method changes | Check official docs before pinning |

## Out of scope (do not build)

Web app, billing, multi-user, resizing, sandbox API, Kubernetes. Phase 2 stays as notes in `RESULTS.md`.
