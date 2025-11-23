# E2B Commands Reference

Common E2B CLI commands for managing sandboxes and debugging.

## List & Monitor

```bash
# List all running sandboxes
e2b sandbox list

# JSON output for scripting
e2b sandbox list --json

# View sandbox logs
e2b sandbox logs <sandbox-id>
```

## Manage Sandboxes

```bash
# Kill a specific sandbox
e2b sandbox kill <sandbox-id>

# Kill all running sandboxes
e2b sandbox kill --all

# Connect to a running sandbox (interactive)
e2b sandbox connect <sandbox-id>
```

## Templates

```bash
# List available templates
e2b template list

# Build template from e2b.toml
e2b template build

# Initialize new template
e2b template init
```

## Authentication

```bash
# Login to E2B
e2b auth login

# Logout
e2b auth logout

# Show current auth status
e2b auth info
```

## Useful Flags

| Flag | Description |
|------|-------------|
| `--timeout <seconds>` | Set sandbox timeout |
| `--debug` | Enable debug output |
| `--json` | Output in JSON format |

## Troubleshooting

### No sandboxes found

```bash
$ e2b sandbox list
No sandboxes found
```

This is normal - sandboxes are ephemeral and terminate quickly after task completion.

### Sandbox timeout

If tasks are timing out, consider:

1. Breaking the task into smaller pieces
2. Upgrading to an E2B plan with longer timeouts
3. Checking if the task is stuck in an infinite loop

### Authentication issues

```bash
# Re-authenticate
e2b auth logout
e2b auth login
```

## Notes

- Sandboxes are ephemeral and auto-terminate after inactivity
- Default timeout is typically 5 minutes for free tier
- Use `e2b sandbox list` to check if previous tasks are still running
- Files created in sandboxes are not persisted after termination
