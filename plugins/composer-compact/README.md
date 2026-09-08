# Composer Compact

Add a Compact pill to agent composers, with an explicit confirmation before sending a command.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/composer-compact
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` to pin reviewed source. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

Paseo 0.7.2 and an active agent whose provider supports `/compact`. The provider determines how compaction works; the plugin does not implement context compaction. No configuration is required.

## Use

Open an agent workspace and select **Compact** in the composer track bar. Review the confirmation modal. Confirming sends `/compact` to that agent; canceling or dismissing sends nothing. No new agent is created.

## Data access and limitations

Reads active agent/workspace state and registers client contributions. The only message action is the confirmed `/compact` command. Duplicate clicks share an in-flight action. Cleanup removes subscriptions and cancels pending confirmations.

If the provider does not support `/compact`, use its own workflow. The plugin does not guarantee compaction can run while another request is in progress.

## Troubleshooting

A missing pill can mean the agent is archived, has no workspace or belongs to another host. If the provider rejects the command, inspect the agent response. During UI review, exercise cancel; do not compact an unrelated active agent merely to test a button.

```sh
paseo plugin logs composer-compact
paseo plugin update composer-compact
paseo plugin remove composer-compact
```

Use the actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.

## Screenshot

[Actual confirmation modal in Paseo](../../docs/screenshots/composer-compact-dark.png).
