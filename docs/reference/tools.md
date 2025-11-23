# Tools Reference

## spawn_remote_agent

Spawns an ephemeral remote sub-agent to execute a complex task using Claude Code.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `task_description` | `string` | **Yes** | - | The goal or task for the remote agent to accomplish |
| `requirements` | `string` | No | `""` | Any specific requirements or context |

### Returns

A string containing the remote agent's result summary, including:

- Files created
- Code written
- Test results (if applicable)
- Any errors encountered

### Example Call

```json
{
  "name": "spawn_remote_agent",
  "arguments": {
    "task_description": "Create a Python CLI tool that converts markdown to HTML",
    "requirements": "Use argparse for CLI. Support stdin and file input. Include --help documentation."
  }
}
```

### Example Response

```
Remote Agent Result:
I've created a complete markdown-to-HTML converter CLI tool.

## Files Created

1. **md2html.py** - Main CLI application with:
   - argparse-based interface
   - File and stdin input support
   - Output to file or stdout
   - Comprehensive --help documentation

2. **test_md2html.py** - Unit tests covering:
   - Basic markdown conversion
   - File I/O operations
   - Edge cases

## Usage

python md2html.py input.md -o output.html
cat README.md | python md2html.py > output.html

All tests pass successfully!
```

### Behavior Notes

1. **Sandbox Lifecycle**: Each call creates a new sandbox that is destroyed after task completion
2. **Timeout**: Sandboxes have a default timeout (~5 minutes on free tier)
3. **Isolation**: Each agent runs in complete isolation with no access to your local files
4. **State**: No state is preserved between calls - each is independent

### Error Handling

If the task fails, the response will include error details:

```
Remote Agent Result:
Error: Unable to complete task.
Details: Package 'nonexistent-package' not found in PyPI.
```

### Best Practices

- Provide clear, actionable task descriptions
- Include specific requirements for deterministic results
- Break complex tasks into focused sub-tasks
- Specify output format expectations
