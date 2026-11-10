# Conversation float

**dsh-conversation-float** — lifts the **conversation view** out of its fixed seat in DSH and turns it into a floating panel.

The float is **DSH's own** — the dock kit's floating panel, the same one the right sidebar uses — not a second browser window: the taskbar still shows a single DSH window. It holds **the real conversation view**, the same column rather than a redrawn copy, so typing, scrolling, switching between Conversation and Trajectory, the composer, attachments and the persona picker all stay native.

[English](README.md) · [简体中文](docs/README.zh.md) · [日本語](docs/README.ja.md) · [Deutsch](docs/README.de.md) · [Español](docs/README.es.md) · [Français](docs/README.fr.md) · [Português](docs/README.pt.md) · [Русский](docs/README.ru.md)

## Use it

**Entry**: the small window icon at the right of the session title bar (*Conversation float*).

One click opens the float **with the rest of DSH still on screen**: both sidebars open, and the float sits centred in the room they leave. The *same* button then hides the DSH interface and leaves the float alone — its tooltip reads *Hide DSH* before that press and *Show DSH* while hidden — and the press after that brings the interface back. Closing the float, stowing it in the left sidebar or docking it into the right sidebar hands the sidebars back on its own.

The float **opens large** (about 920×711, scaled to the window) by calling the dock kit's own `resizeFloat` intent — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, with `paneId` read from `data-dockkit-float` on the float. It only grows a float; one you already enlarged is never shrunk back.

A collapsed right sidebar is **expanded before** the float opens, so "stow back into the sidebar" has somewhere to land, and a collapsed left sidebar is expanded too — collapse is detected by measuring width, so a narrow window never gets a collapse flag written.

**Closing the float — or leaving the hidden state — puts the sidebars back the way the window had them.** If you closed or opened a sidebar **yourself** while the float was open, that last arrangement is what comes back, and it is what comes back even when you close the float from the hidden state: a window you pared down to the right column stays that way. "Yourself" counts only your own press on a sidebar or a key, in both directions: DSH narrowing the left sidebar on a small window, a hidden sidebar being re-laid-out, or a press inside the float itself does not count. The snapshot of the earlier window is taken once, before any sidebar is touched, and is never overwritten while the float is up.

## Drag it left, centre or right

Hold the float's title bar to drag. **Holding for 1.2 s** puts the drag into judging; from then on the outline follows the band under the pointer and the release drops into that band. Judging starts once per drag, so crossing bands never waits again. Releasing before 1.2 s does nothing — no accidental moves.

The three bands are the window's real columns: **left sidebar** (frame column 0, currently 0..280), **middle column** (280..680), **right sidebar** (the `data-rightbar-col` column, 680..1097). The outline covers exactly the block the float will land in, at the same size.

| Drop | After release |
| --- | --- |
| **Left** | The float is **stowed in the left sidebar drawer**: it is not closed, only invisible, so the middle column stays empty; the left sidebar grows a row **named after that Conversation** that brings it back |
| **Centre** | The float closes and the conversation returns to the middle column |
| **Right** | The conversation docks as a **page in the right sidebar** — a native DSH tab with its own *Return to sidebar* and close |

The left-sidebar row exists only after a float has actually been put there; before that the left sidebar stays empty and no permanent entry is added. The row carries the stowed Conversation's title — not the plugin's name — and switching Conversations leaves that title alone: pressing the row returns to *that* Conversation and puts its float back on screen.

**Or skip the drag.** The left sidebar's *More* menu carries **Stow the conversation here**, and the guide's *More tools* card in the right sidebar carries **Move the conversation here**. Both are ordinary DSH menu rows below the shipped ones, and each hides itself once the conversation is already where it would send it.

## How it works (and why the conversation is not redrawn)

- The conversation exists as **one DOM**: the plugin moves the column that carries it into the panel body (same document, same React root) and moves it back on close or host change; if its original seat is gone, the fallback is the middle column.
- **Stow left** = a marker on the float's root makes it hidden (`visibility`/`opacity`); the panel is **not closed**, which is why the middle column can stay empty.
- **Dock right** = hands the tab to the right sidebar (`openResource(..., { destination: 'sidebar' })`) and lets DSH do the move and the docking.
- **The docked tab keeps its body**: the tab type is registered with `keepMounted`, so switching to another tab of the right sidebar leaves the conversation in that tab's body instead of handing it back to the middle column. The column follows whichever retained body is on screen while its own Session is the current one; for any other Session the middle column is the seat again, exactly as before.
- **Pages outside the conversation** (plugins, automations, settings) render into the very slot the column carries. The float does not follow them: the column goes back to the middle so the page lands where it belongs, and the window shows its own Session's transcript instead — no View tab strip, no composer — until a conversation is on screen again.
- **The composer is re-attached after every host change**. A Session has one input shell with one editor, and the editor rides one DOM root at a time; the transcript a window renders while its Session is not the live one mounts a composer on that same shell, and its unmount detaches the editor. The plugin points the editor back at the composer on screen and puts the draft writer DSH bound back into an empty slot, so the draft a window shows is the draft it sends.

## Performance

Each animation frame does at most one measurement; the three bands are measured once, on press. The outline is repainted only when the band actually changes, and moves with `transform`. Earlier versions measured layout and wrote four styles on every mouse move — that, not the drop logic, was what made dragging feel slower than DSH's own.

## Known limits

- A conversation has exactly one host: the left-sidebar row is an **entry**, never a second live copy of the conversation.
- The View tab strip and the composer belong to the conversation on screen. A window whose Session is not the live one — and every window while a page outside the conversation is open — shows a read-only transcript.
- The float belongs to the Session that opened it: switching to another Session hands the Conversation back to that Session's middle column (or to its own float, if that Session has one), and switching back brings this Session's float back.
- The left-sidebar row is named after the Conversation that was stowed and keeps that name while the window looks at other Conversations. Pressing it switches to that Conversation and un-hides its float; it never floats whichever Conversation happens to be on screen.
- The drawer holds **one** Conversation. Stowing another replaces the resident one: the replaced float is released back to being an ordinary float (losing only the drawer marker), so the left sidebar never grows a second row.
- Taking the float back out of the drawer puts it back **where it was stowed** (possibly over the left sidebar); it does not recentre.
- This is a float inside the DSH window, not a separate OS window.
- Restart DSH and the drawer state is gone; the conversation returns to the middle column.

## Moving the float

The float is moved by DSH's own drag. While a hand is on the panel the plugin applies no seat of its own — re-applying the remembered rectangle mid-drag is what used to snap the float back on the first movement.

## Install

Requires DSH **>= 0.2.2-rc.1** — the version this bundle is developed and tested against.

### From npm

```bash
npm i dsh-conversation-float
```

Then register it in the **profile's `package.json`** — both steps are required:

1. add `"dsh-conversation-float": "^0.1.4"` to `dependencies`
2. add `"dsh-conversation-float"` to `dsh.profile.bundles` — only a registered bundle shows up in the plugin list and can be toggled

### From source

1. put the source anywhere
2. junction it into `<profile>/node_modules/dsh-conversation-float`
3. in the profile's `package.json`: `dependencies` gets `"dsh-conversation-float": "link:<path>"`, `dsh.profile.bundles` gets `"dsh-conversation-float"`
4. `client.js` reloads hot; the host half (`index.js`) is a no-op and needs a restart only if you change it

## License

MIT