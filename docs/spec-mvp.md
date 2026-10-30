# Agent Box MVP: build and real-world test

> This is the original specification, written as instructions for an AI coding agent. It is kept as the source of truth for the design.
> Reference idea: a "Prized-style" persistent cloud box where AI coding agents keep working after the user closes their laptop. This is an inferred design based on public marketing info, not Prized's actual internals.

## 1. Goal

Prove, with the least possible code and cost, this promise:

> A user runs one command, and in under 5 minutes has a cloud Linux machine with an AI agent installed, their project folder synced, and ports mirrored to localhost. They start an agent task, close the laptop, and the agent keeps working.

Later this becomes a hosted service for non-technical-business users (developers who do not want to manage cloud infrastructure). **This file covers only the MVP test (Phase 0 and Phase 1).** Phase 2 is a roadmap, do not build it.

## 2. Glossary (so everyone uses the same words)

| Term | Meaning |
|---|---|
| **Box** | A persistent Linux VM owned by one user. Files, tools and sessions survive between uses. |
| **tmux** | Terminal session that lives on the box. Survives SSH disconnects and closed laptops. This is what keeps the agent running. |
| **Mutagen** | Two-way file sync between a local folder and the same folder on the box. |
| **Sleep** | Snapshot the box disk, then delete the VM. Only snapshot storage is billed. |
| **Wake** | Create a new VM from the snapshot. |
| **Snapshot** | Saved copy of the box disk at the provider. |

## 3. Scope

**In scope:** one provider, one user, one box, a bash CLI named `box`, cloud-init setup, Mutagen sync, SSH port forwarding, tmux persistence, sleep/wake, cost and time measurement.

**Out of scope (do NOT build):** web app, Stripe or billing, credit ledger, multi-user, resizing, sandbox/microVM API, auto-scaling, Kubernetes, Docker orchestration.

## 4. What the human needs to provide (ask for these, never invent them)

1. **Hetzner Cloud account** with a project and an **API token** (read/write). Cheapest option. If signup or verification is blocked, fall back to **DigitalOcean** (`doctl`, droplet snapshots work the same way).
2. A **payment method** on the provider account. Expected total spend for the test: about 1 to 3 USD (unverified, check live prices in step 6.1).
3. A **local SSH key** (`~/.ssh/id_ed25519`). If missing, create one with `ssh-keygen -t ed25519`.
4. **Claude Code authentication**: either log in interactively on the box (`claude`) or provide an `ANTHROPIC_API_KEY`.
5. A small **test project folder** (a hello-world web app is fine).

**Never** commit tokens or keys to git. Store the Hetzner token only via `hcloud context create` (local config) and the Anthropic key only in `~/.box-env` on the box (`chmod 600`).

Laptop OS: Mac or Linux work natively. On Windows, use WSL2 and run everything inside it. Ask the human which they use if unclear.

## 5. Architecture

```
Laptop                                  Hetzner Cloud
------                                  -------------
box CLI (bash) ---- hcloud API -------> create / snapshot / delete server
Mutagen  <======= SSH (two-way sync) => ~/project on the box
ssh -L 3000:localhost:3000 -----------> app running on the box
ssh -t ... tmux new -As agent --------> tmux session -> Claude Code (keeps running when laptop closes)
```

## 6. Phase 0: manual validation (do this first, about 1 hour)

Do these by hand before writing any script. Record time and problems in `RESULTS.md`.

### 6.1 Pick the cheapest suitable server
- Install the CLI: `brew install hcloud` (Mac) or download from the hcloud GitHub releases (Linux).
- `hcloud context create agent-box` and paste the token.
- Run `hcloud server-type list` and `hcloud location list`. **Choose the cheapest type with at least 2 vCPU and 4 GB RAM** (server type names change over time, do not hardcode from memory). Prefer an EU location with low latency to the user.
- Note the hourly and monthly price in `RESULTS.md`.

### 6.2 Create the server
- Upload the public key: `hcloud ssh-key create --name box-key --public-key-from-file ~/.ssh/id_ed25519.pub`
- Create the server with the cloud-init file from section 8: `hcloud server create --name box-test --type <chosen> --image ubuntu-24.04 --ssh-key box-key --location <chosen> --user-data-from-file cloud-init.yaml`
- Create a firewall allowing only inbound TCP 22, and attach it: `hcloud firewall create --name box-fw --rule direction=in,protocol=tcp,port=22,source_ips=0.0.0.0/0,source_ips=::/0` then `hcloud firewall apply-to-resource box-fw --type server --server box-test`.
- Wait for cloud-init: `ssh dev@<ip> 'cloud-init status --wait'`.

### 6.3 Validate the core promise manually
1. `ssh dev@<ip>` then `claude --version` and `tmux -V` work.
2. Authenticate Claude Code on the box.
3. Start the sync: `mutagen sync create --name box-test --sync-mode two-way-resolved --ignore node_modules --ignore .venv ./project dev@<ip>:~/project`, then `mutagen sync monitor`.
4. Open the agent in tmux: `ssh -t dev@<ip> 'tmux new -As agent'`, run `cd ~/project && claude`, and give it a task that takes 10 or more minutes (for example: build a small web app with tests).
5. Detach (`Ctrl-b d`), **close the laptop lid or disconnect Wi-Fi for 15+ minutes**, reopen, run `tmux attach -t agent`.
6. **Pass:** the task kept running or finished, and files appear locally via Mutagen.
7. Test port forwarding: start the app on the box on port 3000, run `ssh -N -L 3000:localhost:3000 dev@<ip>`, open `http://localhost:3000`.

If Phase 0 fails, stop and report. Do not proceed to Phase 1.

## 7. Phase 1: the `box` CLI (bash, single file, about 150 to 250 lines)

Build `box` as one portable bash script plus `cloud-init.yaml`. Use `hcloud` for all provider calls. Keep state in `~/.box/state.env` (box name, server ID, IP, snapshot ID, project path).

| Command | Behavior |
|---|---|
| `box init` | Check dependencies (`hcloud`, `mutagen`, `ssh`), create SSH key and firewall at the provider if missing, write state file. |
| `box up [project-dir]` | If a snapshot exists, restore from it. Otherwise create a fresh server with cloud-init. Wait for SSH and cloud-init. Update `~/.ssh/config` entry `Host box`. Start Mutagen sync. Print the ready message and elapsed time. |
| `box agent` | `ssh -t box 'tmux new -As agent'` (attach or create). |
| `box ssh` | Plain shell on the box. |
| `box ports 3000 8000` | Open `ssh -N -L` tunnels in the background for the given ports; `box ports stop` closes them. |
| `box status` | Show state (running, sleeping, none), IP, server type, hourly price, uptime, estimated cost so far, snapshot size and monthly storage cost, sync status. **Print a loud warning if the box has been running for more than 8 hours.** |
| `box sleep` | Flush sync (`mutagen sync flush`), terminate sync, snapshot the server (`hcloud server create-image --type snapshot`), wait until ready, delete the server, delete older snapshots, update state. |
| `box wake` | Alias for `box up` using the snapshot. IP will change: update `~/.ssh/config` and clear the stale host key. |
| `box destroy` | Delete server, snapshots, firewall and SSH key after an explicit `yes` confirmation. |

Requirements:
- Fail fast: `set -euo pipefail`, clear error messages, no silent retries beyond SSH-ready polling (timeout 5 minutes).
- Every command prints what it is doing and how long it took.
- Log timings to `~/.box/metrics.log` (command, seconds, timestamp).
- Idempotent where possible: running `box up` twice must not create two servers.
- Never print the API token or the Anthropic key.

## 8. `cloud-init.yaml` (starting point, adjust as needed)

```yaml
#cloud-config
users:
  - name: dev
    groups: [sudo]
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - <PUBLIC_KEY_PLACEHOLDER>
ssh_pwauth: false
disable_root: true
package_update: true
packages: [tmux, git, curl, build-essential, unzip, htop, python3-pip, python3-venv]
write_files:
  - path: /etc/box-versions.env
    content: |
      NODE_MAJOR=20
      CLAUDE_CODE_VERSION=<PIN_A_CURRENT_VERSION>
runcmd:
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs
  - npm install -g @anthropic-ai/claude-code@<PIN_A_CURRENT_VERSION>
  - sudo -u dev mkdir -p /home/dev/project
  - sudo -u dev touch /home/dev/.box-env && chmod 600 /home/dev/.box-env
  - echo 'set -g mouse on' > /home/dev/.tmux.conf && chown dev:dev /home/dev/.tmux.conf
  - echo '[ -f ~/.box-env ] && set -a && . ~/.box-env && set +a' >> /home/dev/.bashrc
  - touch /var/lib/box-ready
```

Check the current Claude Code install method and package name in the official docs before pinning; installation methods change. Optionally add Codex the same way if the human wants it.

## 9. Security checklist

- SSH key login only, password login disabled, root login disabled.
- Firewall: inbound 22 only. App ports are reached through SSH tunnels, never opened publicly.
- Secrets only in `~/.box-env` (mode 600) on the box. **Warn the human that snapshots contain that file and any logged-in agent credentials.** Never share snapshots.
- Enable unattended security upgrades (`unattended-upgrades`).
- Create a provider budget or billing alert if the provider supports it; otherwise rely on `box status` warnings.

## 10. Acceptance tests (report pass or fail with evidence in `RESULTS.md`)

| # | Test | Target |
|---|---|---|
| 1 | `box up` from nothing to working box (SSH, agent installed, sync active) | under 5 minutes |
| 2 | `box up` after `box sleep` (restore from snapshot) | under 5 minutes |
| 3 | Agent task started in tmux survives laptop closed for 15+ minutes | pass |
| 4 | File edited locally appears on box, and file created by the agent appears locally | under 5 seconds typical |
| 5 | `box ports 3000` shows the app at `localhost:3000` | pass |
| 6 | `box sleep` then `box wake` preserves files, installed tools, git state | pass |
| 7 | After `box sleep`, only snapshot cost remains and no server is listed in `hcloud server list` | pass |
| 8 | `box destroy` leaves no billable resources (servers, snapshots, volumes, primary IPs) | pass |

## 11. Measurements to record in `RESULTS.md`

- Seconds for each of: first `box up`, `box sleep`, `box wake`.
- Sync latency (rough, for small and for 100 MB folders).
- Real cost: server hours times hourly price, plus snapshot storage. Use live prices from the provider, not memory.
- Friction log: every manual step the user had to do. This list becomes the product roadmap, since the goal is zero manual steps.
- Failures: what broke, how often.

## 12. Known issues to handle or document

- Server IP changes on wake, so SSH config and `known_hosts` must be refreshed.
- Snapshots cost storage while asleep and slow restores for large disks. Keep only the latest.
- Mutagen conflicts: use `two-way-resolved` (the local side wins) and ignore `node_modules`, `.venv`, build output.
- Agent CLIs change often, so pin versions and record them in `RESULTS.md`.
- A forgotten running box keeps billing, which is why `box status` warnings exist.

## 13. Phase 2 roadmap (do NOT build now, include as notes in `RESULTS.md`)

To turn this into a hosted service where a non-technical user is live in under 5 minutes:

1. **Control plane API** (create, sleep, wake, snapshot, destroy per user) and a database for users, boxes and usage.
2. **One-line installer**: `curl ... | sh` installs the CLI, then `box login` opens the browser (no manual provider tokens or SSH keys).
3. **Provisioning pool**: pre-warmed servers or a pre-baked image (agents already installed) to cut boot time to seconds instead of minutes.
4. **Auto-sleep on idle** plus resize.
5. **Billing**: monthly credit plan, hourly metering, disk-only billing while asleep, rollover.
6. **Isolation and security** for multiple tenants (the largest risk when running other people's code).
7. **Optional sandbox API** for per-second, short-lived microVMs, similar to the container flow used in Docker/Kubernetes agent deployments.
8. **Dashboard** for status, cost and logs.

## 14. Definition of done

- All acceptance tests in section 10 are filled in.
- `box` and `cloud-init.yaml` are committed in a repo with a short README (install, usage).
- `RESULTS.md` contains measurements, real costs, the friction log, and a clear **go / no-go recommendation** for Phase 2.
- Final cleanup: run `box destroy` and confirm in the provider console that nothing billable remains.
