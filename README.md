# Conversation Float

**dsh-conversation-float** turns the DSH conversation into a real floating window inside DSH — not a second OS window. The window can sit over the app, be minimised into the left sidebar as a taskbar row, or be docked into the right sidebar. It keeps the conversation usable while you open plugin pages, automation pages and other left-sidebar entries.

[English](README.md) · [简体中文](docs/README.zh.md) · [日本語](docs/README.ja.md) · [Deutsch](docs/README.de.md) · [Español](docs/README.es.md) · [Français](docs/README.fr.md) · [Português](docs/README.pt.md) · [Русский](docs/README.ru.md)

## What you get

- **One click** from the small window icon at the right of the session title bar.
- **The real conversation**, not a redrawn copy: typing, scrolling, the Conversation/Trajectory tabs, the composer, attachments and the persona picker stay native.
- **Multiple floats**, one per Session, each with its own row in the left sidebar.
- **A taskbar that only raises windows**: clicking a session row brings that float forward and never changes the page behind it.
- **A full conversation on non-conversation pages**: opening Plugins, Automations, Settings or another left-sidebar entry leaves the live conversation's float on screen with its header, View tabs and composer. The page stays in the middle column behind the float.
- **A three-state entry button**: open the float, hide the rest of DSH, or bring the rest of DSH back.
- **Menu rows that know when to disappear**: “Stow the conversation here” hides once the window is minimised, and “Move the conversation here” hides once it is docked on the right.

## Open, minimise, close

Click the window icon in the session title bar. The float opens large (about 920×720, scaled to the window), with the rest of DSH still visible and both sidebars in the room it leaves.

The same button cycles through three states:

1. open the float;
2. hide the DSH interface and leave only the float;
3. show the DSH interface again.

Closing the float, minimising it into the left sidebar, or docking it into the right sidebar restores the sidebars to the arrangement captured when the float opened. The snapshot is taken once and is not overwritten while the window is up. Changes you make to the sidebars while the float is open are not tracked.

The window's **—** button minimises it: the window disappears, but its left-sidebar taskbar row stays. Click that row to bring it back. The **✕** button closes it for good: the window and its row go away, and the conversation returns to the middle column.

While DSH is hidden, **Escape** brings the interface back.

## Move the conversation

Hold the window's title bar and drag. Holding still for **1.2 seconds** arms the drop bands; the title bar tints, an outline follows the band under the pointer, and releasing drops the conversation there. Releasing before the hold does nothing. On touch, moving more than 10 px before the hold finishes keeps the gesture as a normal window move.

| Drop on | Result |
| --- | --- |
| **Left sidebar** | The window is minimised into the left sidebar. It is not closed; its taskbar row is the way back. The middle column stays empty. |
| **Centre** | The window closes and the conversation returns to the middle column. |
| **Right sidebar** | The conversation docks as a native page in the right sidebar, with DSH's own return and close controls. |

The left-sidebar row carries the Conversation's title, not the plugin's name. It keeps that title while the window looks at other Conversations. Clicking the row only shows and raises that window; it never selects the plugin's main panel and never takes a plugin or automation page away.

**Or skip the drag.** The left sidebar's *More* menu carries **Stow the conversation here**. The right sidebar's guide carries **Move the conversation here**. Each row hides itself when the conversation is already in that place.

## Pages outside the conversation

When you open Plugins, Automations, Settings or another left-sidebar entry, the conversation column goes back to the middle column so the page can use the normal three-column frame. The live Session's float stays on screen and switches to a **full local conversation**: session header, Conversation/Trajectory tabs and composer. It is not a read-only transcript.

The page is **behind the float**. Drag the float aside to work on the page. Clicking the Session's taskbar row only raises the float; the page stays open and unchanged. Closing the page, or returning to the conversation normally, hands the real conversation column back to the float.

A window for a Session that is **not** the live one still shows a read-only transcript. One conversation has one live composer; the composer and View tabs belong to the live Session.

## Multiple windows and the taskbar

Each Session can have one float. Every float gets a row in the left sidebar, ordered as a taskbar. Rows are named after their Sessions.

- Clicking a row **raises that window**. It does not switch the current Session and does not change the main panel.
- A non-live window shows a **Switch to this conversation** chip when it is on top. Clicking it makes that Session live; the window then takes the real conversation column.
- Closing one window does not touch the others.
- A session taskbar row is an entry, never a second live copy of the conversation.

## Dock into the right sidebar

Dragging right, or using **Move the conversation here**, hands the tab to DSH's right sidebar. The tab type is registered with `keepMounted`, so switching to another right-sidebar tab leaves the conversation in its own tab body. The column follows whichever retained body is on screen while its Session is live; for any other Session the middle column is the seat again.

## Draft and composer

A Session has one input shell and one editor, and the editor can only ride one DOM root at a time. When the conversation moves between the middle column, a window and a right-sidebar page, the plugin re-attaches the editor to the composer on screen and restores the draft writer into an empty slot. The draft you see is the draft that gets sent.

Closing the float no longer clicks another View tab to force a remount. The plugin heals the editor directly, so the window returns to the conversation without flashing Trajectory or any other View.

## Performance

Each animation frame does at most one layout measurement. The three drop bands are measured once, on press. Waits that depend on DSH committing a change are frame-driven; the plugin keeps **no interval** and runs its repairs on layout passes DSH already causes. The outline is repainted only when the band changes and moves with `transform`.

## Known limits

- The float is **inside the DSH window**, not a separate OS window.
- A conversation has exactly **one host**. A taskbar row is an entry, never a second live copy.
- A window whose Session is not live shows a **read-only transcript**: no View tabs, no composer. Switch it to the live Session to type.
- The live float keeps a full local conversation while a non-conversation page is open, but that page is **behind the window**. The float does not shrink to a sidebar or dock itself automatically.
- The float belongs to the Session that opened it. Switching Sessions hands the conversation to the new Session's middle column or its own float; switching back brings the old float back.
- Restarting DSH clears floats and taskbar rows. The conversation returns to the middle column.
- The composer repair uses a few DSH-internal shapes (the editor behind the composer box, the conversation input shell, and its draft slot). A future DSH release that renames them degrades to the old behaviour rather than crashing.

## Install

Requires DSH **>= 0.2.2-rc.1**.

### From npm

    npm i dsh-conversation-float@0.3.0

Then register it in the **profile's `package.json`** — both steps are required:

1. add `"dsh-conversation-float": "^0.3.0"` to `dependencies`;
2. add `"dsh-conversation-float"` to the profile's `dsh.profile.bundles` list.

Only a registered bundle shows up in the plugin list and can be toggled.

### From a tarball

    dsh plugin add <path-to>/dsh-conversation-float-0.3.0.tgz

Or put the tarball in the profile and use a `file:` dependency, then add the name to the bundle list.

### From source

1. put the source anywhere;
2. link it into `<profile>/node_modules/dsh-conversation-float`;
3. add a `link:` dependency and the bundle name to the profile.

The bundle is assembled at startup, so restart DSH after installing or upgrading.

## License

MIT
