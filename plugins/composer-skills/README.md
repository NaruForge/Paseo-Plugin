# Composer Skills

Choose a skill advertised by the active session and prepare a prompt for copying.

[Collection](../../README.md) · [Compatibility](../../docs/COMPATIBILITY.md) · [Support](../../SUPPORT.md)

## Install

```sh
paseo plugin add SWBaek/Paseo-Plugin:plugins/composer-skills
paseo plugin ls
```

This tracks the default branch. Add `--ref <existing-tag-or-commit>` to pin reviewed source. See [Git installation](../../docs/GIT_INSTALLATION.md).

## Requirements and configuration

Paseo 0.7.2, a session exposing skills/commands, and a web or desktop webview with the Clipboard API. Browser copying needs a secure context such as HTTPS or localhost and may require clipboard permission. No host configuration is required.

## Use

Open an agent and select **Skills**. Choose a session skill, add task text and review the resulting draft. Select **Copy to clipboard**, then paste into the intended composer yourself. The plugin neither fills the composer nor submits a message.

## Data access and limitations

Reads the selected session's command/skill catalog. The list reflects the loaded session, not every skill file on disk. Providers without explicit skill classification use a built-in-command exclusion fallback that may not classify every third-party command correctly.

Draft state is local to the modal; clipboard writes happen only after a user action. Native iOS/Android copying is currently unavailable. On clipboard failure the modal shows the generated text for manual selection/copy. Copying can also fail on insecure HTTP origins.

## Troubleshooting

An empty list can mean there are no session skills or the provider does not advertise them. Use the provider's normal catalog refresh workflow. If copying is denied, select the draft manually and check browser clipboard permissions; the plugin does not bypass them.

```sh
paseo plugin logs composer-skills
paseo plugin update composer-skills
paseo plugin remove composer-skills
```

Use the actual runtime ID and `--host <host>` where appropriate. Directory sources use `reload` instead of `update`.
