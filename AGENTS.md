# Agent Development Notes

## E2B Sandbox Commands

### List & Monitor
```bash
e2b sandbox list              # List all running sandboxes
e2b sandbox list --json       # JSON output for scripting
e2b sandbox logs <sandbox-id> # View sandbox logs
```

### Manage Sandboxes
```bash
e2b sandbox kill <sandbox-id> # Kill a specific sandbox
e2b sandbox kill --all        # Kill all running sandboxes
e2b sandbox connect <id>      # Connect to a running sandbox
```

### Templates
```bash
e2b template list             # List available templates
e2b template build            # Build template from e2b.toml
e2b template init             # Initialize new template
```

### Authentication
```bash
e2b auth login                # Login to E2B
e2b auth logout               # Logout
e2b auth info                 # Show current auth status
```

### Useful Flags
- `--timeout <seconds>` - Set sandbox timeout (default varies by plan)
- `--debug` - Enable debug output
- `--json` - Output in JSON format

### Notes
- Sandboxes are ephemeral and auto-terminate after inactivity
- Default timeout is typically 5 minutes for free tier
- Use `e2b sandbox list` to check if previous tasks are still running
