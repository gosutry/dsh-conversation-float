# Conversation float

**dsh-conversation-float** — lifts the **conversation view** out of its fixed seat in DSH and turns it into a floating panel.

The float is **DSH's own** — the dock kit's floating panel, the same one the right sidebar uses — not a second browser window: the taskbar still shows a single DSH window. It holds **the real conversation view**, the same column rather than a redrawn copy, so typing, scrolling, switching between Conversation and Trajectory, the composer, attachments and the persona picker all stay native.

[English](README.md) · [简体中文](docs/README.zh.md) · [日本語](docs/README.ja.md) · [Deutsch](docs/README.de.md) · [Español](docs/README.es.md) · [Français](docs/README.fr.md) · [Português](docs/README.pt.md) · [Русский](docs/README.ru.md)

## Use it

**Entry**: the small window icon at the right of the session title bar (*Conversation float*).

One click opens the float and the rest of the DSH chrome steps aside; the same button then brings DSH back, so it is one toggle. Closing the float, stowing it in the left sidebar or docking it into the right sidebar brings the chrome back on its own.

The float **opens large** (about 920×711, scaled to the window) by calling the dock kit's own `resizeFloat` intent — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, with `paneId` read from `data-dockkit-float` on the float. It only grows a float; one you already enlarged is never shrunk back.

A collapsed right sidebar is **expanded before** the float opens, so "stow back into the sidebar" has somewhere to land, and a collapsed left sidebar is expanded too — collapse is detected by measuring width, so a narrow window never gets a collapse flag written.

**Closing the float and returning the conversation to the middle column restores the sidebars exactly as they were before it opened.** If you touched a sidebar **yourself** while the float was open, that last setting wins. "Yourself" counts only your own press or key, in both directions: DSH narrowing the left sidebar on a small window, or a hidden sidebar being re-laid-out, does not count. The snapshot is taken once, before any sidebar is touched, and is never overwritten while the float is up.

## Drag it left, centre or right

Hold the float's title bar to drag. **Holding for 1.2 s** puts the drag into judging; from then on the outline follows the band under the pointer and the release drops into that band. Judging starts once per drag, so crossing bands never waits again. Releasing before 1.2 s does nothing — no accidental moves.

The three bands are the window's real columns: **left sidebar** (frame column 0, currently 0..280), **middle column** (280..680), **right sidebar** (the `data-rightbar-col` column, 680..1097). The outline covers exactly the block the float will land in, at the same size.

| Drop | After release |
| --- | --- |
| **Left** | The float is **stowed in the left sidebar drawer**: it is not closed, only invisible, so the middle column stays empty; the left sidebar grows a *Conversation float* row that brings it back |
| **Centre** | The float closes and the conversation returns to the middle column |
| **Right** | The conversation docks as a **page in the right sidebar** — a native DSH tab with its own *Return to sidebar* and close |

The left-sidebar row exists only after a float has actually been put there; before that the left sidebar stays empty and no permanent entry is added.

## How it works (and why the conversation is not redrawn)

- The conversation exists as **one DOM**: the plugin moves the column that carries it into the panel body (same document, same React root) and moves it back on close or host change; if its original seat is gone, the fallback is the middle column.
- **Stow left** = a marker on the float's root makes it hidden (`visibility`/`opacity`); the panel is **not closed**, which is why the middle column can stay empty.
- **Dock right** = hands the tab to the right sidebar (`openResource(..., { destination: 'sidebar' })`) and lets DSH do the move and the docking.

## Performance

Each animation frame does at most one measurement; the three bands are measured once, on press. The outline is repainted only when the band actually changes, and moves with `transform`. Earlier versions measured layout and wrote four styles on every mouse move — that, not the drop logic, was what made dragging feel slower than DSH's own.

## Known limits

- A conversation has exactly one host: the left-sidebar row is an **entry**, never a second live copy of the conversation.
- Taking the float back out of the drawer puts it back **where it was stowed** (possibly over the left sidebar); it does not recentre.
- This is a float inside the DSH window, not a separate OS window.
- Restart DSH and the drawer state is gone; the conversation returns to the middle column.

## Install

### From npm

```bash
npm i dsh-conversation-float
```

Then register it in the **profile's `package.json`** — both steps are required:

1. add `"dsh-conversation-float": "^0.1.1"` to `dependencies`
2. add `"dsh-conversation-float"` to `dsh.profile.bundles` — only a registered bundle shows up in the plugin list and can be toggled

### From source

1. put the source anywhere
2. junction it into `<profile>/node_modules/dsh-conversation-float`
3. in the profile's `package.json`: `dependencies` gets `"dsh-conversation-float": "link:<path>"`, `dsh.profile.bundles` gets `"dsh-conversation-float"`
4. `client.js` reloads hot; the host half (`index.js`) is a no-op and needs a restart only if you change it

## License

MIT