/**
 * Client half of the conversation-float bundle.
 *
 * The floating window is DSH's own: the right-sidebar dock kit can host a tab
 * in a floating panel, and its controller accepts `destination: 'float'`. One
 * click on the entry opens our tab type straight into that panel — no dragging,
 * no browser window, no second process.
 *
 * The panel's body hosts the live Conversation column: the column is moved into
 * the panel (same document, same React root, so events and reconciliation keep
 * working) and moved back to its seat when the panel closes.
 *
 * While the float is on screen it can be dragged onto three drop bands:
 *
 *   left    the float is stowed — still mounted, hidden — and the left sidebar
 *           grows a row that brings it back; the centre column stays empty,
 *           exactly as it is while the float is on screen
 *   center  the float closes and the Conversation returns to its column
 *   right   the tab is handed to the right sidebar, where DSH docks it
 *
 * The bands are measured once per drag. Holding the press for {@link DWELL_MS}
 * switches the drag into judging: from that moment the outline follows the band
 * under the pointer and the drop takes that band. One wait per drag, never one
 * per band. The outline uses `transform`, so repainting costs no layout pass.
 */
window.__ModuleLoader__.load({
  id: 'dsh-conversation-float',
  factory(require) {
    'use strict'

    const React = require('react')
    const h = React.createElement

    const NS = 'dsh-conversation-float'

    /**
     * The dock kit's own menu row. It ships in the browser module table, the same
     * place React comes from, so a client bundle may require it without declaring
     * anything extra; the plain button is only for a host that lacks it.
     */
    const primitives = (() => {
      try {
        return require('@deepseek-ai/dsh-client-ui-primitives') ?? null
      } catch {
        return null
      }
    })()
    const MenuItemButton = primitives?.MenuItemButton ?? null

    /**
     * Copy for every locale DSH ships. The word for the Conversation is read
     * from this table only, so the panel title, the sidebar row and the entry
     * button all say what the View tab strip says in the same language.
     */
    const COPY = {
      "zh": {
        "conversation": "会话",
        "floatTitle": "会话浮窗",
        "showDsh": "显示 DSH 界面",
        "hideDsh": "隐藏 DSH 界面",

        "moveLeft": "会话收至此处",

        "moveRight": "会话移至此处",
        "stow": "放进左栏",
        "center": "回到中间",
        "dock": "停到右栏",
        "description": "把会话视图做成 DSH 自带的浮窗：拖到左边收进左栏抽屉、拖到中间回到中栏、拖到右边停进右侧栏。"
      },
      "en": {
        "conversation": "Conversation",
        "floatTitle": "Conversation float",
        "showDsh": "Show DSH",
        "hideDsh": "Hide DSH",

        "moveLeft": "Stow the conversation here",

        "moveRight": "Move the conversation here",
        "stow": "Stow in the left sidebar",
        "center": "Return to the middle",
        "dock": "Dock in the right sidebar",
        "description": "Turns the Conversation view into DSH own floating panel: drag it left to stow it in the sidebar drawer, centre to return it to the middle column, right to dock it in the right sidebar."
      },
      "de": {
        "conversation": "Konversation",
        "floatTitle": "Konversations-Float",
        "showDsh": "DSH anzeigen",
        "hideDsh": "DSH ausblenden",

        "moveLeft": "Konversation hierher legen",

        "moveRight": "Konversation hierher verschieben",
        "stow": "In der linken Seitenleiste ablegen",
        "center": "Zurück in die Mitte",
        "dock": "In der rechten Seitenleiste andocken",
        "description": "Macht die Konversationsansicht zu DSH eigenem schwebenden Panel: nach links ziehen legt sie in der linken Seitenleiste ab, Mitte bringt sie zurück, rechts dockt sie rechts an."
      },
      "es": {
        "conversation": "Conversación",
        "floatTitle": "Ventana flotante de conversación",
        "showDsh": "Mostrar DSH",
        "hideDsh": "Ocultar DSH",

        "moveLeft": "Guardar la conversación aquí",

        "moveRight": "Mover la conversación aquí",
        "stow": "Guardar en la barra izquierda",
        "center": "Volver al centro",
        "dock": "Acoplar en la barra derecha",
        "description": "Convierte la vista de conversación en el panel flotante propio de DSH: a la izquierda se guarda en la barra lateral, al centro vuelve a la columna central, a la derecha se acopla a la barra derecha."
      },
      "fr": {
        "conversation": "Conversation",
        "floatTitle": "Fenêtre flottante de conversation",
        "showDsh": "Afficher DSH",
        "hideDsh": "Masquer DSH",

        "moveLeft": "Ranger la conversation ici",

        "moveRight": "Déplacer la conversation ici",
        "stow": "Placer dans la barre latérale gauche",
        "center": "Revenir au centre",
        "dock": "Ancrer dans la barre latérale droite",
        "description": "Transforme la vue de conversation en panneau flottant propre à DSH : à gauche il se range dans la barre latérale, au centre il revient dans la colonne, à droite il s ancre à droite."
      },
      "ja": {
        "conversation": "会話",
        "floatTitle": "会話フロート",
        "showDsh": "DSH を表示",
        "hideDsh": "DSH を隠す",

        "moveLeft": "会話をここにしまう",

        "moveRight": "会話をここへ移動",
        "stow": "左サイドバーにしまう",
        "center": "中央に戻す",
        "dock": "右サイドバーにドッキング",
        "description": "会話ビューを DSH 自身のフロートパネルにします。左へドラッグで左サイドバーに収納、中央で中央列に戻り、右で右サイドバーにドッキングします。"
      },
      "pt": {
        "conversation": "Conversa",
        "floatTitle": "Janela flutuante da conversa",
        "showDsh": "Mostrar DSH",
        "hideDsh": "Ocultar DSH",

        "moveLeft": "Guardar a conversa aqui",

        "moveRight": "Mover a conversa para aqui",
        "stow": "Guardar na barra lateral esquerda",
        "center": "Voltar ao centro",
        "dock": "Ancorar na barra lateral direita",
        "description": "Transforma a vista de conversa no painel flutuante do próprio DSH: à esquerda guarda na barra lateral, no centro volta à coluna central, à direita ancora na barra direita."
      },
      "ru": {
        "conversation": "Беседа",
        "floatTitle": "Плавающее окно беседы",
        "showDsh": "Показать DSH",
        "hideDsh": "Скрыть DSH",

        "moveLeft": "Убрать беседу сюда",

        "moveRight": "Переместить беседу сюда",
        "stow": "Убрать в левую панель",
        "center": "Вернуть в центр",
        "dock": "Закрепить в правой панели",
        "description": "Превращает вид беседы в собственное плавающее окно DSH: влево — убрать в левую панель, в центр — вернуть в средний столбец, вправо — закрепить в правой панели."
      }
    }

    const LOCALES = ['zh', 'en', 'de', 'es', 'fr', 'ja', 'pt', 'ru']

    function localeKey() {
      const fromDocument = (document.documentElement.lang || '').toLowerCase().slice(0, 2)
      const fromBrowser = (navigator.language || '').toLowerCase().slice(0, 2)
      const key = LOCALES.includes(fromDocument) ? fromDocument : fromBrowser
      return LOCALES.includes(key) ? key : 'en'
    }

    function t(key) {
      const table = COPY[localeKey()] ?? COPY.en
      return table[key] ?? COPY.en[key] ?? key
    }
    const ANCHOR_ATTR = 'data-dsh-conversation-float-anchor'
    const CHAT_ID = 'conversation-float-panel'
    const CHAT_KIND = 'conversation-float-panel'
    /** A resource address our own tab type claims; the panel is opened by it. */
    const CHAT_ADDRESS = 'dsh-resource://conversation-float'
    /** The left sidebar row, and the main-panel key it addresses. */
    const DOCK_ROW_ID = 'conversation-float'
    /** Marks that row's own glyph, so a Conversation named like a shipped row is not mistaken for it. */
    const ROW_MARK_ATTR = 'data-dsh-conversation-float-row'
    /** How long a band must be held before it draws and before it can land. */
    const DWELL_MS = 1200
    /** The dock kit's own marker for a floating panel. */
    const FLOAT_ATTR = 'data-dockkit-float'
    /** Marks our own tab body, so the reconcile pass never reads another plugin's. */
    const BODY_ATTR = 'data-dsh-conversation-float-body'
    /** Set on the float panel while it is stowed in the left drawer. */
    const STOW_ATTR = 'data-dsh-conversation-float-stowed'
    /** Marks the float that hosts our tab, so our rules hit no other panel. */
    const OWN_FLOAT_ATTR = 'data-dsh-conversation-float-float'
    /** Set on every frame column that the float is temporarily hiding. */
    const CHROME_ATTR = 'data-dsh-conversation-float-chromeless'

    let sidebarRight = null
    let layout = null
    let movedColumn = null
    let movedFrom = null
    /**
     * Whether the left sidebar currently holds the re-opener row. It stays for
     * as long as ANY of our floats is stowed, whichever Conversation that is:
     * the row is the way back, and switching Conversations must not take it away.
     */
    let dockedLeft = false
    /** Whether the rest of DSH is currently hidden behind the float. */
    let chromeless = false

    /** Re-render subscribers: the entry button says one thing per state. */
    const stateListeners = new Set()

    function notifyState() {
      for (const fn of stateListeners) fn()
    }
    /** Set when the hide was requested before the float finished mounting. */
    let pendingChromeless = false
    /** The last sane band geometry, kept for when the columns are hidden. */
    let lastBand = null
    /** Sidebar state captured when the float opened; restored when it closes. */
    let savedChrome = null
    /** The pair the user last left the sidebars in while the float was up. */
    let touchedChrome = null
    /** How long after a press or a key a column change still counts as the user's. */
    const GESTURE_WINDOW = 900
    /** How long the float's own force-open needs to settle before sampling. */
    const FORCE_SETTLE_MS = 1200
    /** The last time the user pressed a key or a mouse button, in ms. */
    let gestureAt = 0
    /**
     * Whether the user's hand is currently on a float. The dock kit moves the
     * panel on its own drag; a seat applied from here during that drag would
     * snap it back to where the plugin last put it.
     */
    let draggingFloat = false
    /** Press position of that drag, until it moves past the slop. */
    let floatGrab = null
    /** While the plugin moves the columns itself, changes are not the user's. */
    let holdOffUntil = 0
    /** Set while docking to the right sidebar: the column is not going home. */
    let dockingRight = false
    /** Set when the drawer action is waiting for the float that carries the column. */
    let pendingStow = false
    /**
     * The Conversation whose float is stowed in the left drawer, or null. The
     * row carries this Conversation's name and pressing it returns there, so
     * switching Conversations must repoint neither.
     */
    let stowedSession = null
    /** The label the drawer row was registered with; a different one re-registers. */
    let dockLabel = null
    /** The Session list projection, when the Client exposes it. */
    let sessions = null
    /** Session navigation, used by the drawer row. */
    let uiWorkspace = null
    /** Set while the float is being reopened from the drawer. */
    let suspendRestore = false
    /** Disposer of the `sidebar.panellist` row, while it is registered. */
    let dockRow = null
    /** The drop preview overlay, created on demand. */
    let preview = null

    /* ------------------------------------------------------- the live column */

    /**
     * The frame column that carries the Conversation. An ANCESTOR is moved, never
     * the Conversation node itself: React keeps child lists inside the nodes it
     * owns, so pulling one of those children out of its parent breaks the next
     * reconciliation — a Session switch then renders nothing at all. Moving the
     * column keeps every list inside the moved subtree intact.
     */
    function findColumn() {
      if (movedColumn !== null && movedColumn.isConnected) return movedColumn
      const candidates = [
        document.querySelector('[data-conversation-session]'),
        document.querySelector(`[${ANCHOR_ATTR}]`),
        document.querySelector('[data-conversation-header-corner]'),
        document.querySelector('[data-conversation-tabs]'),
      ]
      for (const anchor of candidates) {
        if (anchor === null) continue
        // While the Conversation is hosted by one of our bodies, the column is
        // that body's own child — walking up instead would climb out of the
        // right sidebar and name the whole right column as "the column", and
        // moving that into the float feeds it its own ancestor.
        const body = anchor.closest(`[${BODY_ATTR}]`)
        if (body !== null) {
          for (const child of Array.from(body.children)) {
            if (child.contains(anchor)) return child
          }
        }
        let node = anchor
        while (node.parentElement !== null) {
          const parent = node.parentElement
          if (parent.querySelector(':scope > [data-shell-overlay]') !== null) return node
          node = parent
        }
      }
      return null
    }

    /** DSH's layout grid: every panel edge lands on a multiple of it. */
    const GRID = 8
    /**
     * The float's size: 450 x 720 by request, never larger than the room the
     * window actually has. Asking for more makes the dock kit clamp on its own
     * and hands back a half-sized panel with no room left for the messages.
     */
    function floatSize() {
      return {
        width: Math.max(320, Math.min(450, window.innerWidth - 80)),
        height: Math.max(320, Math.min(720, window.innerHeight - 80)),
      }
    }

    /** The room the sidebars leave in the middle: their two inner edges. */
    function middleRoom() {
      const width = window.innerWidth
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      let left = 0
      let right = width
      if (frame !== null) {
        const sidebar = frame.firstElementChild
        if (sidebar !== null) {
          const box = sidebar.getBoundingClientRect()
          if (box.width > 80) left = Math.round(box.right)
        }
        const rightColumn = frame.querySelector('[data-rightbar-col]')
        if (rightColumn !== null) {
          const box = rightColumn.getBoundingClientRect()
          if (box.width > 80) right = Math.round(box.left)
        }
      }
      return { left, right: Math.max(left, right) }
    }

    /**
     * Upper-left corner of that seat: centred in the room the sidebars leave,
     * snapped, clear of the frame. With the window showing nothing but the
     * float those columns measure zero and the seat falls back to the window.
     */
    function floatSeat(size) {
      const snap = (value) => Math.max(0, Math.round(value / GRID) * GRID)
      const room = middleRoom()
      const free = room.right - room.left
      return {
        x: free > size.width ? snap(room.left + (free - size.width) / 2) : snap(room.left),
        y: Math.max(48, snap((window.innerHeight - size.height) / 2)),
      }
    }

    /**
     * Give the float a readable size on open. DSH's dock kit builds a fresh
     * float at a small default; the plugin cannot write the panel's inline box,
     * but the kit exposes the very intent its own resize drag dispatches:
     * `sidebarRight.require()` -> `actions.resizeFloat(sessionId, paneId, rect)`.
     * The pane id is the float element's own `data-dockkit-float` value.
     */
    function sizeFloat() {
      // Never move a panel the user has their hand on: the seat is a starting
      // place, and re-applying it mid-drag yanks the float out from under them.
      if (draggingFloat) return
      const panel = floatPanel()
      if (panel === null) return
      const paneId = panel.getAttribute(FLOAT_ATTR) ?? document.querySelector(`[${FLOAT_ATTR}]`)?.getAttribute(FLOAT_ATTR)
      if (paneId === null || paneId === undefined) return
      let seat = null
      try {
        seat = sidebarRight?.require?.() ?? null
      } catch {
        seat = null
      }
      if (seat === null) {
        // The mounted-session shortcut can be missing right after a docked tab
        // is floated again; fall back to the per-session action face.
        try {
          const sessionId = sidebarRight?.mounted?.getSnapshot?.()
          const actions = sessionId === undefined ? undefined : sidebarRight?.actionsFor?.(sessionId)
          if (actions !== undefined && actions !== null) seat = { sessionId, actions }
        } catch {
          seat = null
        }
      }
      if (seat === null || typeof seat.actions?.resizeFloat !== 'function') return
      const size = floatSize()
      const corner = floatSeat(size)
      const rect = { ...corner, width: size.width, height: size.height }
      try {
        seat.actions.resizeFloat(seat.sessionId, paneId, rect)
      } catch (error) {
        console.warn('[conversation-float] could not size the floating panel:', error)
      }
    }
    /** The session's dock-kit action face, or null when it is not reachable. */
    function sessionSeat() {
      try {
        const direct = sidebarRight?.require?.()
        if (direct !== undefined && direct !== null) return direct
      } catch {
        /* fall through to the per-session face */
      }
      try {
        const sessionId = sidebarRight?.mounted?.getSnapshot?.()
        const actions = sessionId === undefined ? undefined : sidebarRight?.actionsFor?.(sessionId)
        if (actions !== undefined && actions !== null) return { sessionId, actions }
      } catch {
        return null
      }
      return null
    }

    /** Float our tab for real, with the size we want. */
    function floatExistingTab() {
      if (floatPanel() !== null) {
        sizeFloat()
        return true
      }
      const tabId = floatTabId()
      if (tabId === null) return false
      const seat = sessionSeat()
      if (seat === null || typeof seat.actions?.floatTab !== 'function') return false
      const size = floatSize()
      const corner = floatSeat(size)
      try {
        seat.actions.floatTab(seat.sessionId, tabId, { ...corner, width: size.width, height: size.height })
        return true
      } catch (error) {
        console.warn('[conversation-float] could not float the docked tab:', error)
        return false
      }
    }
    function attachColumn(container, keepHome = false) {
      const column = findColumn()
      if (column === null || container === null) return null
      // Never feed a node its own descendant: that append throws and leaves the
      // bookkeeping pointing at a node that was never moved.
      if (column.contains(container)) return null
      // A retained body that takes the column over from another body keeps the
      // seat recorded first: the middle column, never the tab it came from.
      if (!keepHome || movedFrom === null) movedFrom = { parent: column.parentNode, next: column.nextSibling }
      movedColumn = column
      column.style.width = "100%"
      column.style.height = "100%"
      column.style.minWidth = "0"
      column.style.minHeight = "0"
      column.style.overflow = "hidden"
      container.appendChild(column)
      const ownPanel = floatPanel()
      if (ownPanel !== null) ownPanel.setAttribute(OWN_FLOAT_ATTR, '')
      // The dock kit gives a new float its own seat; ask it — through the same
      // intent its own resize drag uses — for the configured one.
      sizeFloat()

      // A host has taken the column, so a docking that was waiting for its tab
      // has arrived: the restore guard must not outlive it.
      dockingRight = false

      // The drawer action asked for the conversation while no float existed. The
      // body is mounted in a layout effect — before paint — so stowing here means
      // the float is never painted on its way into the drawer.
      if (pendingStow && flushPendingStow()) return column

      // The float body is mounted now, so a hide that was waiting for it can be
      // applied against a real float element.
      if (pendingChromeless) setChromeless(true)
      return column
    }


    /**
     * Where the column belongs in the frame: the seat recorded when it was
     * taken, or — when a re-render replaced that seat's neighbours — the spot
     * the middle column keeps, right before the right column.
     */
    function homeSeat(home) {
      if (home !== null && home.parent !== null && home.parent.isConnected) {
        const next = home.next
        if (next === null || next.parentNode === home.parent) return { parent: home.parent, before: next }
      }
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      if (frame === null) return null
      const before = frame.querySelector(':scope > [data-rightbar-col]') ??
        frame.querySelector(':scope > [data-shell-bottom]') ??
        frame.querySelector(':scope > [data-shell-overlay]')
      return { parent: frame, before }
    }

    /** The frame's middle column, used when the recorded home was re-rendered. */
    function currentCenter() {
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      if (frame === null) return null
      for (const child of Array.from(frame.children)) {
        if (child === frame.firstElementChild) continue
        if (child.hasAttribute('data-rightbar-col')) continue
        if (child.hasAttribute('data-shell-bottom')) continue
        if (child.hasAttribute('data-shell-overlay')) continue
        if (child.hasAttribute('data-shell-leading')) continue
        return child
      }
      return null
    }

    /**
     * Whether DSH is showing a page (plugins, automation, settings) in the main
     * panel instead of the Conversation. The panel host lives inside the column
     * we move, so a page rendered while the column sits in a float — and DSH
     * suppresses the whole float while a page is open — would be invisible.
     */
    function mainPanelOpen() {
      const slot = document.querySelector('[data-slot="main"]')
      if (slot === null) return false
      for (const child of slot.children) {
        if (child.getAttribute('data-slot') === 'main.conversation') continue
        return true
      }
      return false
    }

    function detachColumn(keepChrome = false) {
      const column = movedColumn
      const home = movedFrom
      movedColumn = null
      movedFrom = null
      notifyState()
      // Closing is the plugin's doing, even when a click on the panel's own
      // close button started it: the columns DSH re-rails on the way out must
      // not be read as the user's own arrangement.
      holdOff(1200)
      for (const el of document.querySelectorAll(`[${OWN_FLOAT_ATTR}]`)) el.removeAttribute(OWN_FLOAT_ATTR)
      // The float is leaving the screen: the rest of DSH has to come back.
      if (chromeless) setChromeless(false)
      // A float that goes home hands the sidebars back as they were — but only
      // when it really goes home. Moving the live column between hosts (back
      // out of the left drawer, a remounted float body) also detaches it for
      // a frame; restoring there would collapse the sidebars under a float
      // that is still on screen.
      if (!keepChrome && !dockingRight && !suspendRestore) scheduleRestoreChrome()
      dockingRight = false
      if (column === null) return
      column.style.width = ''
      column.style.height = ''
      column.style.minWidth = ''
      column.style.minHeight = ''
      column.style.overflow = ''
      // DSH took the Conversation down while it was ours (a main panel opened,
      // the Session changed): a node React has removed must not be put back, or
      // a stale copy of the conversation would sit in the middle column.
      if (!column.isConnected) return
      const seat = homeSeat(home)
      if (seat !== null) {
        seat.parent.insertBefore(column, seat.before)
        return
      }
      // The recorded seat is gone (the panel took it down with it): put the
      // column back in the middle column so the session is never lost.
      const center = currentCenter()
      if (center !== null) center.appendChild(column)
    }

    /**
     * A closed floating panel can take our body down without running its
     * cleanup first, so the column is watched directly: as soon as its container
     * leaves the document it goes home.
     */
    function watchColumn() {
      /** The float element the last repair ran against. */
      let seenFloat = null
      /** The float whose fixed size was last applied. */
      let sizedFloat = null
      /** Attempts made to settle that float size. */
      let sizeTries = 0
      let seenParent = null
      let seenHost = null
      /** Whether the last pass saw the host suppressed by a main panel. */
      let wasSuppressed = false
      let frame = 0
      const check = () => {
        frame = 0
        if (movedColumn !== null && !movedColumn.isConnected) detachColumn()
        // A float belongs to one Session: the right sidebar keeps one panel per
        // Session and hides the rest. Switching Sessions leaves the column in
        // the panel of the one the window has left, where it measures zero —
        // the new Session then has no visible Conversation at all (a blank
        // window). The column comes home as soon as its float is not the one.
        // The column can also end up inside a float with no bookkeeping at all
        // (a docking hand-off that dropped it there): take it back and send it
        // home, or the Conversation would sit in a hidden panel for good.
        if (movedColumn === null) {
          const stray = findColumn()
          const host = stray === null ? null : stray.closest(`[${FLOAT_ATTR}]`)
          if (host !== null && (!floatHostsSession(host, columnSession(stray)) || !panelVisible(host))) {
            movedColumn = stray
            movedFrom = null
            detachColumn(true)
          }
        }
        const aboard = movedColumn === null ? null : movedColumn.closest(`[${FLOAT_ATTR}]`)
        if (aboard !== null) {
          const showing = columnSession(movedColumn)
          const foreign = !floatHostsSession(aboard, showing)
          const visible = panelVisible(aboard)
          if (foreign || !visible) {
            // Switching Conversations is not closing the float: the column comes
            // home, but the sidebars and the drawer row stay exactly as they are.
            detachColumn(true)
          }
        }
        // A page owns the main panel: hand the column back to the frame for as
        // long as it lasts, or the page would be drawn inside a hidden float.
        const pageOpen = mainPanelOpen()
        if (pageOpen && movedColumn !== null && movedColumn.closest('[data-rightbar-col]') !== null) {
          detachColumn(true)
        }
        // A docked tab's body is retained across tab, Session and collapse
        // changes, so the column follows whichever of those bodies is on
        // screen instead of being handed back to the middle column.
        if (!pageOpen) reconcileDockedHost()
        const panel = floatPanel()
        // A stow asked for while the conversation was still a docked tab lands
        // here: the tab's body is retained, so floating it remounts nothing and
        // the request would otherwise stay pending forever.
        if (pendingStow) flushPendingStow()
        // Never stay hidden without a float: that is a blank window.
        if (chromeless && panel === null) setChromeless(false)
        // The repairs below walk the whole frame, so they run only when the
        // float moves house (a new panel, a new parent column, or a new body)
        // and never on every mutation a drag produces.
        const parent = panel === null ? null : panel.parentElement
        const host = panel === null ? null : panel.querySelector(".dsw-host")
        if (panel !== null) {
          if (panel !== sizedFloat) {
            sizedFloat = panel
            sizeTries = 0
          }
          const want = floatSize()
          const box = panel.getBoundingClientRect()
          const off = Math.abs(box.width - want.width) > 24 || Math.abs(box.height - want.height) > 24
          if (off && sizeTries < 4) {
            sizeTries += 1
            sizeFloat()
          }
        }
        if (panel !== seenFloat || parent !== seenParent || host !== seenHost) {
          seenFloat = panel
          seenParent = parent
          seenHost = host
          if (panel !== null && chromeless) refreshChromeless()
        }
        // The float may lose its body to a panel page or a re-render without its
        // own structure changing, so the body is healed on every pass — but never
        // while the host is suppressed for a main panel, or the conversation
        // would be parked in a hidden float.
        if (panel !== null && !panel.hasAttribute('aria-hidden') && !pageOpen) healFloatBody()
        // A main panel suppresses the float, and the dock kit gives it back at a
        // fresh default seat: put it where the sidebars leave room again.
        if (panel !== null) {
          const suppressed = panel.hasAttribute('aria-hidden')
          if (wasSuppressed && !suppressed) settleFloatSeat()
          wasSuppressed = suppressed
        }
        noteChromeChange()
        // The row follows the markers, whichever Conversation they belong to.
        syncDrawerRow()
      }


      const schedule = () => {
        if (frame !== 0) return
        frame = window.requestAnimationFrame(check)
      }
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, { childList: true, subtree: true })
      // A safety pass: Session switches, page swaps and a torn-down body can
      // all land between two mutation batches, and a missed pass leaves the
      // Conversation inside a hidden panel. The reaper is cheap on a quiet
      // window and it never has to wait longer than this.
      const safety = window.setInterval(check, 600)

      // Switching tab, Session, or collapsing the column leaves the nodes in
      // place and only rewrites attributes: a retained body never remounts, so
      // those changes have to reach the check as well.
      const attributeObserver = new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target
          if (!(target instanceof Element)) continue
          if (target.closest('[data-rightbar-col]') !== null) {
            schedule()
            return
          }
          // The drawer is the other column whose arrangement matters here; its
          // collapse rewrites attributes rather than the node list.
          const drawer = frameSidebar()
          if (drawer !== null && (drawer === target || drawer.contains(target))) {
            schedule()
            return
          }
        }
      })
      attributeObserver.observe(document.body, {
        attributes: true,
        // The Session marker counts: a Session switch can hide the old panel
        // first and rewrite this marker a commit later, and the reaper has to
        // run again when it does.
        attributeFilter: ['hidden', 'class', 'style', 'aria-hidden', 'data-conversation-session', 'data-dockkit-float'],
        subtree: true,
      })

      return () => {
        observer.disconnect()
        attributeObserver.disconnect()
        window.clearInterval(safety)
        if (frame !== 0) window.cancelAnimationFrame(frame)
      }
    }

    /**
     * A float that lost its body — clicking the drawer row re-lays the main
     * column, the panel remounts, and the Conversation is momentarily out of the
     * document — is put back together here. An empty float is worse than a flash.
     */
    function healFloatBody() {
      const panel = floatPanel()
      if (panel === null) return
      // A float of a Session the window has left, or one hidden behind another
      // Session, is not a host: healing into it would hide the live Conversation.
      if (!panelVisible(panel)) return
      const host = panel.querySelector('.dsw-host')
      if (host === null) return
      const column = findColumn()
      if (column === null) return
      if (!floatHostsSession(panel, columnSession(column))) return
      // A stowed float is a drawer, not a seat: returning to this Conversation
      // shows the drawer state again — the column lives in the hidden panel and
      // the middle stays empty until the row brings it back.
      if (panel.hasAttribute(STOW_ATTR)) {
        if (movedColumn === null || !host.contains(movedColumn)) attachColumn(host, movedColumn !== null)
        return
      }
      if (host.contains(column)) {
        // The body was torn down between two passes and the column is already
        // back inside it, but nothing records that: adopt it. An untracked
        // column is not watched, so the next Session switch would leave the
        // Conversation inside a hidden panel for good.
        adoptColumn(column)
        return
      }
      // A column that is already ours keeps the seat it came from: the float is
      // a temporary host, never the place it goes home to.
      attachColumn(host, movedColumn !== null)
    }

    /** Take the live column back without moving it: the host already holds it. */
    function adoptColumn(column) {
      movedColumn = column
      if (column.style.width !== '100%') {
        column.style.width = '100%'
        column.style.height = '100%'
        column.style.minWidth = '0'
        column.style.minHeight = '0'
        column.style.overflow = 'hidden'
      }
      if (movedFrom === null) {
        const seat = homeSeat(null)
        if (seat !== null) movedFrom = { parent: seat.parent, next: seat.before }
      }
      const ownPanel = floatPanel()
      // The float keeps the seat the user gave it: this pass runs on every DOM
      // change, so asking the dock kit for the default rectangle here would drag
      // the panel back under the pointer and make it impossible to move.
      if (ownPanel !== null && !ownPanel.hasAttribute(OWN_FLOAT_ATTR)) ownPanel.setAttribute(OWN_FLOAT_ATTR, '')
    }
    /** Every mounted body of our own tab: one per right-sidebar Session. */
    function dockedHosts() {
      const hosts = []
      for (const host of document.querySelectorAll(`[data-sidebar-right-tab] [${BODY_ATTR}]`)) {
        // The floating panel's body is not a docked one.
        if (host.closest(`[${FLOAT_ATTR}]`) === null) hosts.push(host)
      }
      return hosts
    }

    /** The frame's left column (the drawer), when the frame is mounted. */
    function frameSidebar() {
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      return frame === null ? null : frame.firstElementChild
    }

    /** Whether a host is on screen: a retained body of a hidden tab is not. */
    function hostOnScreen(host) {
      if (!host.isConnected) return false
      const box = host.getBoundingClientRect()
      return box.width > 0 && box.height > 0
    }

    /** The Session the column is showing right now. */
    function columnSession(column) {
      const mark = column.querySelector('[data-conversation-session]')
      return mark === null ? null : mark.getAttribute('data-conversation-session')
    }

    /** The Session a docked body belongs to. */
    function hostSession(host) {
      const owner = host.closest('[data-sidebar-right-session]')
      return owner === null ? null : owner.getAttribute('data-sidebar-right-session')
    }

    /** The Session a floating panel belongs to, or null when it carries none. */
    function floatOwnerSession(panel) {
      const owner = panel.closest('[data-sidebar-right-session]')
      return owner === null ? null : owner.getAttribute('data-sidebar-right-session')
    }

    /**
     * Whether a panel can be seen. The right sidebar keeps one panel per Session
     * and hides the others, so a float of a Session the window has left measures
     * zero: it is still mounted, and it must never be treated as the live host.
     */
    function panelVisible(panel) {
      if (!panel.isConnected) return false
      if (panel.closest('[hidden], [aria-hidden="true"]') !== null) return false
      const box = panel.getBoundingClientRect()
      return box.width > 0 && box.height > 0
    }

    /** Whether a float may host the conversation currently showing `session`. */
    function floatHostsSession(panel, session) {
      const owner = floatOwnerSession(panel)
      return owner === null || session === null || owner === session
    }

    /** The last Session the live Conversation was seen showing. */
    let lastSession = null
    /**
     * The Session the live Conversation is showing right now. It falls back to
     * the last one seen: opening a main panel takes the Conversation down for a
     * commit, and the drawer row press has to know which Conversation it means.
     */
    function liveSession() {
      const column = movedColumn ?? findColumn()
      const shown = column === null ? null : columnSession(column)
      if (shown !== null) lastSession = shown
      return shown ?? lastSession
    }

    /**
     * The Conversation column has one host at a time, and a docked tab body is
     * retained rather than unmounted when the user switches tab, switches
     * Session, or collapses the column. So the column follows whichever of
     * those bodies is the one on screen: an unmounted body took the column back
     * to the middle column, and a body that is never remounted would otherwise
     * sit empty while the column stayed in a tab nobody is looking at.
     *
     * A body only ever holds the column while its own Session is the one on
     * screen. The column shows whichever Session is current, so leaving it in
     * the retained body of a Session the user has left would hide the Session
     * they switched to — the window would go blank.
     */
    function reconcileDockedHost() {
      // A floating panel owns the column while it is on screen; a docked tab
      // behind it never takes the column away.
      if (movedColumn !== null && movedColumn.closest(`[${FLOAT_ATTR}]`) !== null) return
      const hosts = dockedHosts()
      if (hosts.length === 0) return
      const column = movedColumn ?? findColumn()
      const session = column === null ? null : columnSession(column)
      const mine = hosts.filter((host) => {
        if (session === null) return true
        const owner = hostSession(host)
        return owner === null || owner === session
      })
      const visible = mine.find(hostOnScreen)
      if (visible !== undefined) {
        if (movedColumn !== null && visible.contains(movedColumn)) return
        attachColumn(visible, movedColumn !== null)
        return
      }
      // Another tab of this Session is: the retained body is exactly where the
      // column belongs, and the middle column stays empty behind the tab strip.
      if (mine.length > 0) return
      // The Session changed: the middle column is the seat for whatever the
      // window shows now, exactly as it was before the body was retained.
      if (movedColumn !== null) detachColumn()
    }

    /** Re-apply the hide list: the float may have moved to another branch. */
    function refreshChromeless() {
      for (const el of document.querySelectorAll(`[${CHROME_ATTR}]`)) el.removeAttribute(CHROME_ATTR)
      for (const el of chromeTargets()) el.setAttribute(CHROME_ATTR, '')
    }
    /* ---------------------------------------------------------- the chrome */

    /**
     * Hide everything the float does not need. Clicking the entry opens the
     * float and leaves the window showing nothing but the float; the same
     * button then brings the rest of DSH back (and hides it again).
     */
    function chromeTargets() {
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      if (frame === null) return []
      const floatEl = floatPanel()
      const hidden = []
      /** Keep the branch that holds the float; hide every sibling beside it. */
      const walk = (el) => {
        if (floatEl !== null && (el === floatEl || el.contains(floatEl))) {
          if (el === floatEl) return
          for (const kid of Array.from(el.children)) walk(kid)
          return
        }
        hidden.push(el)
      }
      for (const el of Array.from(frame.children)) {
        if (el === overlay) continue
        walk(el)
      }
      return hidden
    }

    /** What the entry's tooltip promises for the next press. */
    function entryTitle() {
      if (chromeless) return t('showDsh')
      const panel = floatPanel()
      return panel === null || panel.hasAttribute(STOW_ATTR) ? t('floatTitle') : t('hideDsh')
    }

    function setChromeless(next) {
      if (next) {
        // The float mounts asynchronously: hiding before it exists would hide
        // every column, including the one that is about to host it.
        if (floatPanel() === null) {
          pendingChromeless = true
          return
        }
      }
      pendingChromeless = false
      chromeless = next
      notifyState()
      const targets = chromeTargets()
      if (next) {
        for (const el of targets) el.setAttribute(CHROME_ATTR, '')
      } else {
        for (const el of document.querySelectorAll(`[${CHROME_ATTR}]`)) el.removeAttribute(CHROME_ATTR)
      }
      try {
        const button = document.querySelector(`[${ANCHOR_ATTR}]`)
        if (button !== null) button.title = entryTitle()
      } catch {
        /* the button may not be mounted */
      }
    }

    /**
     * Bring the rest of DSH back. Hiding the columns lets DSH re-rail the left
     * sidebar, so the window used to come back as "only the right column": a
     * reveal opens the drawer again, the same way opening the float does.
     */
    function revealChrome(forceDrawer = false) {
      setChromeless(false)
      // The columns opened here are the plugin's doing, not the user's: a
      // short settle, not a long one, or the user's own first click after the
      // reveal would be ignored as if it were the plugin's.
      holdOff(400)
      // Back to the arrangement the window had: whatever the user last left the
      // sidebars in, or the pair the float found. Never a blanket "both open" —
      // that would undo a sidebar the user closed on purpose.
      const base = restoreTarget()
      // Stowing the float needs its drawer row on screen, whatever the target.
      // The forced drawer is folded into the target itself: a separate toggle
      // would be undone by the retry pass that follows it.
      const target = base === null ? null : forceDrawer ? { ...base, leftCollapsed: false } : base
      if (target !== null) {
        applyChromeTarget(target)
        return
      }
      if (!forceDrawer) return
      try {
        if (leftCollapsed()) layout?.toggleSidebar?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the left sidebar:', error)
      }
    }

    /**
     * Match the sidebars to the snapshot, and report whether they already do.
     * Right goes first because opening the left drawer rails the right column
     * on a narrow window; doing the left last leaves the pair the snapshot
     * asked for.
     */
    function applyChromeSnapshot(saved) {
      if (saved === null || saved === undefined) return true
      let matched = true
      const wantRight = saved.rightExpanded
      const wantLeft = saved.leftCollapsed
      // The right column first, the drawer last. A window wide enough holds
      // both; a narrow one keeps whichever was asked for last, and that is the
      // drawer — the side the float lives against.
      try {
        const right = rightExpanded()
        // `null` means there is no mounted right column to read at all.
        // Toggling blind there would collapse a column nobody closed.
        if (right !== null && wantRight !== null && right !== (wantRight === true)) {
          matched = false
          sidebarRight?.toggleExpanded?.()
        }
      } catch (error) {
        console.warn('[conversation-float] could not restore the right sidebar:', error)
      }
      try {
        if (wantLeft !== null && wantLeft !== leftCollapsed()) {
          matched = false
          layout?.toggleSidebar?.()
        }
      } catch (error) {
        console.warn('[conversation-float] could not restore the left sidebar:', error)
      }
      return matched
    }

    /* ------------------------------------------------------------- openings */

    function leftCollapsed() {
      // Width is the reliable signal: the narrow layout rails the sidebar
      // without necessarily writing its collapsed marker.
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      const sidebar = frame === null ? null : frame.firstElementChild
      if (sidebar !== null) {
        const width = sidebar.getBoundingClientRect().width
        if (width > 0) return width < 120
      }
      return document.querySelector('[data-sidebar-collapsed="true"]') !== null
    }

    function rightExpanded() {
      try {
        return sidebarRight?.isExpanded?.() ?? null
      } catch {
        return null
      }
    }

    /** The two sidebars as they stand right now. */
    function chromeNow() {
      return { leftCollapsed: leftCollapsed(), rightExpanded: rightExpanded() }
    }

    /** The plugin is about to move a column itself: ignore the fallout. */
    function holdOff(ms = 1200) {
      holdOffUntil = performance.now() + ms
    }

    /**
     * Only the user's own hand can author a column change: a press or a key
     * just before it does, DSH railing a column on its own does not. The
     * plugin's own entry button is excluded — it moves the columns by design.
     */
    function noteGesture(event) {
      if (performance.now() < holdOffUntil) return
      const target = event.target
      if (!(target instanceof Element)) return
      // The entry and the float are the plugin's own surfaces: a press there is
      // a drag, a page click or a close, never a sidebar the user just moved.
      if (target.closest(`[${ANCHOR_ATTR}]`) !== null) return
      if (target.closest(`[${FLOAT_ATTR}]`) !== null) return
      gestureAt = performance.now()
    }

    /**
     * Note a hand on a float. DSH's dock kit moves the panel itself; from the
     * first real movement this plugin must stop re-applying the seat, or the
     * float is pulled back to where the plugin last put it.
     */
    function trackFloatGrab() {
      const press = (event) => {
        if (event.button !== undefined && event.button !== 0) return
        const target = event.target
        if (!(target instanceof Element)) return
        if (target.closest(`[${FLOAT_ATTR}]`) === null) return
        if (movedColumn !== null && movedColumn.contains(target)) return
        floatGrab = { x: event.clientX, y: event.clientY }
      }
      const move = (event) => {
        if (floatGrab === null) return
        const dx = event.clientX - floatGrab.x
        const dy = event.clientY - floatGrab.y
        // A press that never moves is a click on the float's chrome, not a drag.
        if (dx * dx + dy * dy > 36) draggingFloat = true
      }
      const release = () => {
        floatGrab = null
        if (!draggingFloat) return
        // Let the dock kit finish its own drop before a seat may be applied.
        window.setTimeout(() => {
          if (floatGrab === null) draggingFloat = false
        }, 300)
      }
      const pairs = [
        ['pointerdown', press],
        ['mousedown', press],
        ['pointermove', move],
        ['mousemove', move],
        ['pointerup', release],
        ['mouseup', release],
        ['pointercancel', release],
      ]
      for (const [name, handler] of pairs) window.addEventListener(name, handler, true)
      window.addEventListener('blur', release)
      return () => {
        for (const [name, handler] of pairs) window.removeEventListener(name, handler, true)
        window.removeEventListener('blur', release)
      }
    }

    /**
     * Remember the sidebars as they were before the float forced them open.
     * The capture happens once, before the plugin touches anything, and is
     * never refreshed while the float is up: a later sample would record the
     * forced state instead, and then every close would look like the user's
     * choice and nothing would ever be restored.
     */
    function saveChromeState() {
      if (savedChrome !== null) return
      savedChrome = chromeNow()
      touchedChrome = null
      // The force-open that follows is the plugin's doing, not the user's.
      holdOff(FORCE_SETTLE_MS)
    }

    /**
     * The float forces both sidebars open and hides them. A column that sits
     * away from the snapshot after that was either moved by the user or railed
     * by DSH on its own; only the first outranks the snapshot, and only a
     * press or a key just before the change tells the two apart. Both
     * directions count: closing a column the float opened, and opening one it
     * failed to open, are equally the user's choice.
     */
    function noteChromeChange() {
      if (savedChrome === null) return
      // While the columns are hidden their geometry says nothing: DSH rails the
      // left sidebar on its own there, and reading that as the user's choice
      // would cancel the restore the float promised.
      if (chromeless || pendingChromeless) return
      // A re-host (out of the drawer, a remounted body) leaves the column out
      // of the document and the right column reading "not expanded" for a
      // frame. That is the plugin moving, never the user choosing.
      if (dockedLeft || (floatPanel() !== null && movedColumn === null)) return
      const now = performance.now()
      if (now < holdOffUntil) return
      if (now - gestureAt > GESTURE_WINDOW) return
      // The user's own arrangement outranks the pair the float found: a reveal
      // or a close puts back whatever they last chose. With no such choice the
      // snapshot stays the target, so the restore is a no-op when they left the
      // sidebars exactly as the float found them.
      touchedChrome = chromeNow()
    }

    /**
     * A detach is not a close until the float is really gone. The drawer row
     * re-hosts the live column and a remounted body re-attaches it, and both
     * detach it for a frame; the chrome is restored only when nothing took the
     * column back and no panel is left to finish tearing down.
     */
    function scheduleRestoreChrome(depth = 0) {
      window.requestAnimationFrame(() => {
        // A host took the column back: the float is still open, not closed.
        if (dockedLeft || movedColumn !== null) return
        // The panel is still on its way out; give it a few frames.
        if (floatPanel() !== null) {
          if (depth < 12) scheduleRestoreChrome(depth + 1)
          return
        }
        restoreChrome()
      })
    }

    /**
     * Put back the sidebars the window had: the user's own last arrangement, or
     * the pair the float found. This runs while the float's tab is still being
     * torn down, and the dock kit can swallow a toggle aimed at a surface that
     * is on its way out: the target is reapplied until both columns match it or
     * the attempts run out.
     */
    /** The pair a reveal or a close puts back: the user's own, else the float's. */
    function restoreTarget() {
      return touchedChrome ?? savedChrome
    }

    /** Match the sidebars to a target, retrying while the dock kit settles. */
    function applyChromeTarget(target) {
      let tries = 0
      const apply = () => {
        tries += 1
        if (applyChromeSnapshot(target)) return
        // A toggle the dock kit queued needs a moment to land; retrying on the
        // next frame would read the old state and toggle straight back.
        if (tries < 8) window.setTimeout(apply, 200)
      }
      window.requestAnimationFrame(apply)
    }

    function restoreChrome() {
      const target = restoreTarget()
      savedChrome = null
      touchedChrome = null
      if (target === null) return
      holdOff(1500)
      applyChromeTarget(target)
    }

    /** Open (or focus) the float at the dock kit's own default seat. */
    function openFloatAtDefault() {
      saveChromeState()
      // The left drawer is where "放进左栏" lands: a collapsed sidebar has no
      // room to grow the row, so open it first — the right column's rule.
      try {
        if (leftCollapsed()) layout?.toggleSidebar?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the left sidebar:', error)
      }
      // The docked side of the panel is where "收回到侧边栏" lands: keep it open
      // so the float always has a home to be returned to.
      try {
        if (sidebarRight !== null && sidebarRight.isExpanded?.() === false) sidebarRight.toggleExpanded?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the right sidebar:', error)
      }
      if (floatExistingTab()) {
        notifyState()
        settleFloatSeat()
        // The tab was retained, so its body does not mount again: a stow that
        // was waiting for that mount has to be finished here, now.
        flushPendingStow()
        return
      }
      try {
        sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'float' })
      } catch (error) {
        console.warn('[conversation-float] could not open the floating panel:', error)
      }
      // Opening the float keeps the rest of DSH on screen: the entry drops the
      // window to the float on the NEXT press, not this one.
      notifyState()
      settleFloatSeat()
    }

    /**
     * Keep asking for the seat while the sidebars finish opening. The expand
     * runs on the same tick as the panel and the column slides in after that, so
     * the first measurements see a room that is still moving; the passes stop
     * once the float already sits where the settled room puts it.
     */
    function settleFloatSeat(attempt = 0) {
      // The float is already readable at the size asked for; a hand on it wins.
      if (draggingFloat) return
      const panel = floatPanel()
      if (panel !== null) {
        const size = floatSize()
        const seat = floatSeat(size)
        const box = panel.getBoundingClientRect()
        if (Math.abs(box.x - seat.x) > 8 || Math.abs(box.width - size.width) > 24) sizeFloat()
      }
      if (attempt < 5) window.setTimeout(() => settleFloatSeat(attempt + 1), 250)
    }

    function openFloating(attempt = 0) {
      // The float of the Conversation on screen: bring that one back. A stow
      // that belongs to another Conversation stays in the drawer — the row is
      // shared, the panels are not.
      const stowed = stowedFloat()
      if (stowed !== null) {
        stowed.removeAttribute(STOW_ATTR)
        if (floatOwnerSession(stowed) === stowedSession) stowedSession = null
        syncDrawerRow()
        notifyState()
        // The live column returns to this float on the next watcher pass; the
        // panel keeps the seat it had, so a reopened float does not recentre.
        return
      }
      if (floatPanel() !== null) {
        notifyState()
        return
      }
      // The drawer row opens a main panel first, and the dock kit suppresses a
      // float while a page owns the panel: ask again once that page has closed.
      if (mainPanelOpen()) {
        if (attempt < 15) window.setTimeout(() => openFloating(attempt + 1), 40)
        return
      }
      openFloatAtDefault()
    }

    /**
     * The stowed float belonging to the Conversation on screen, or null.
     *
     * It is found by owner, not by visibility: pressing the drawer row opens a
     * main panel first, and that hides every Session panel for a commit — the
     * one frame in which this lookup has to keep working.
     */
    function stowedFloat() {
      const showing = liveSession()
      for (const el of document.querySelectorAll(`[${STOW_ATTR}]`)) {
        const owner = floatOwnerSession(el)
        if (owner === null || showing === null || owner === showing) return el
      }
      return null
    }

    /** Whether any of our floats is stowed, in any Conversation. */
    function anyStowed() {
      return document.querySelector(`[${STOW_ATTR}]`) !== null
    }

    /** The stored title the row promises: the stowed Conversation's own name. */
    function sessionTitle(id) {
      if (id === null) return null
      try {
        const title = sessions?.list?.getSnapshot?.()?.byId?.[id]?.title
        return typeof title === 'string' && title.trim() !== '' ? title.trim() : null
      } catch {
        return null
      }
    }

    /** What the drawer row says: the stowed Conversation, else the plugin's name. */
    function dockRowLabel() {
      return sessionTitle(stowedSession ?? stowedOwner()) ?? t('floatTitle')
    }

    /**
     * The Conversation a stowed float belongs to, read from the panel itself so
     * that a marker left over from an earlier run still names someone.
     */
    function stowedOwner() {
      const el = document.querySelector(`[${STOW_ATTR}]`)
      if (el === null) return null
      return floatOwnerSession(el) ?? liveSession()
    }

    /**
     * The row lives while a stowed float exists, and it is named after that
     * Conversation. It stays put when the window switches Sessions: the row is
     * the way back to the stowed one, never a view of the current one.
     */
    function syncDrawerRow() {
      dockedLeft = anyStowed()
      if (!dockedLeft) {
        stowedSession = null
        syncDockRow()
        return
      }
      if (stowedSession === null) stowedSession = stowedOwner()
      // One box, never a pile: a state left by an earlier build (several
      // markers at once) is pruned down to the row's own Conversation.
      if (document.querySelectorAll(`[${STOW_ATTR}]`).length > 1) releaseStowedExcept(stowedSession)
      syncDockRow()
    }

    /**
     * The tab id of our docked occurrence for the Conversation on screen, or
     * null. It is read from the markup of that Session, never from the global
     * tab inventory: the inventory lists every Session's tabs, and floating one
     * Session's tab into another would hand the wrong Conversation to the float.
     */
    function floatTabId() {
      const sessionId = liveSession()
      for (const tab of document.querySelectorAll('[data-sidebar-right-tab]')) {
        const id = tab.getAttribute('data-sidebar-right-tab')
        if (id === null) continue
        const owner = tab.closest('[data-sidebar-right-session]')
        const ownerSid = owner === null ? null : owner.getAttribute('data-sidebar-right-session')
        if (sessionId !== null && ownerSid !== null && ownerSid !== sessionId) continue
        if (tab.querySelector(`[${BODY_ATTR}]`) === null) continue
        return id
      }
      return null
    }

    /** Close the float; the column comes home through the watcher. */
    function closeFloat() {
      const id = floatTabId()
      if (id === null) {
        console.warn('[conversation-float] no floating tab id; the float stays open')
        return false
      }
      try {
        sidebarRight.hide(id)
        return true
      } catch (error) {
        console.warn('[conversation-float] could not hide the floating tab:', error)
        return false
      }
    }

    /* ---------------------------------------------------------------- bands */

    /**
     * The three drop bands, taken from the frame's own columns: the left
     * sidebar is the frame's first child, the right sidebar carries
     * `data-rightbar-col`, and the middle column is whatever lies between them.
     * The preview therefore covers the same area the drop lands in.
     */
    function bands() {
      const width = window.innerWidth
      const height = window.innerHeight
      // With the window showing nothing but the float, the columns are hidden:
      // their rects read as a zero-width left band, which is exactly why "放进
      // 左栏" could never be chosen. Judge by thirds of the window there.
      if (chromeless) return thirds(width, height)
      const overlay = document.querySelector('[data-shell-overlay]')
      const frame = overlay === null ? null : overlay.parentElement
      let left = 0
      let right = 0
      if (frame !== null) {
        const sidebar = frame.firstElementChild
        if (sidebar !== null) left = Math.round(sidebar.getBoundingClientRect().right)
        const rightCol = frame.querySelector('[data-rightbar-col]')
        if (rightCol !== null) right = Math.round(rightCol.getBoundingClientRect().left)
      }
      // A collapsed right column measures at the window's edge, which would leave
      // the "dock right" band zero wide and unreachable; keep a third of the
      // window aimable there, and the docking itself opens the column.
      if (right >= width - 1) right = Math.round((width * 2) / 3)
      // While the columns are hidden the measurements collapse; keep the last
      // geometry that made sense so a drag does not land in nonsense bands.
      const sane = left >= 0 && right > left + 80 && right <= width + 1
      if (!sane) return lastBand !== null ? { ...lastBand, width, height } : thirds(width, height)
      // A railed drawer is too thin to aim at: widen its band to something a
      // hand can actually hit.
      lastBand = { left: Math.max(left, 96), right, width, height }
      return lastBand
    }

    /** The window in thirds: the bands used while the float is alone. */
    function thirds(width, height) {
      return { left: Math.round(width / 3), right: Math.round((width * 2) / 3), width, height }
    }
    function zoneAt(x, band) {
      if (x <= band.left) return 'left'
      if (x >= band.right) return 'right'
      return 'center'
    }

    /**
     * The band's caption, read at draw time. It used to be a table built once at
     * load: a language switch then left the preview saying the old words.
     */
    function zoneLabel(zone) {
      if (zone === 'left') return t('stow')
      if (zone === 'right') return t('dock')
      return t('center')
    }

    function previewRect(zone, band) {
      if (zone === 'left') return [0, 0, band.left, band.height]
      if (zone === 'right') return [band.right, 0, band.width - band.right, band.height]
      return [band.left, 0, band.right - band.left, band.height]
    }

    /**
     * Draw the band outline. Only runs when the band changes: the first version
     * rewrote four styles (after a layout read) on every pointer move, and that
     * is what made the drag stutter next to DSH's own dragging.
     */
    function showPreview(zone, band) {
      if (preview === null) {
        const el = document.createElement('div')
        el.className = 'dsw-preview'
        const label = document.createElement('span')
        label.className = 'dsw-preview-label'
        el.appendChild(label)
        document.body.appendChild(el)
        preview = { el, label, zone: null }
      }
      if (preview.zone === zone) return
      if (preview.el.style.display === 'none') preview.el.style.display = ''
      preview.zone = zone
      const [left, top, width, height] = previewRect(zone, band)
      preview.el.style.transform = `translate3d(${left}px, ${top}px, 0)`
      preview.el.style.width = `${width}px`
      preview.el.style.height = `${height}px`
      preview.label.textContent = zoneLabel(zone)
    }

    function hidePreview() {
      // The node is kept, not destroyed: appending and removing it on every band
      // change is a subtree mutation per change, which the DOM watcher then has
      // to service in the middle of a drag.
      if (preview === null) return
      preview.zone = null
      preview.el.style.display = 'none'
    }

    /* ------------------------------------------------------------ the drop */

    /**
     * Stow the float: the panel stays mounted (so the Conversation keeps its
     * single host and the centre column stays empty, exactly as it does while
     * the float is on screen) but becomes invisible. The left sidebar row is
     * the way back.
     */
    function floatPanel() {
      const column = movedColumn
      const fromColumn = column === null ? null : column.closest(`[${FLOAT_ATTR}]`)
      if (fromColumn !== null) return fromColumn
      // The right sidebar keeps one mounted panel per Session and hides the
      // ones the window has left. A foreign float is not *the* float: reading it
      // as one would make the entry believe a panel is on screen and hide DSH
      // around a window that holds nothing at all.
      const showing = liveSession()
      for (const el of document.querySelectorAll(`[${FLOAT_ATTR}]`)) {
        if (el.closest('[hidden], [aria-hidden="true"]') !== null) continue
        const owner = floatOwnerSession(el)
        if (owner !== null && showing !== null && owner !== showing) continue
        return el
      }
      return null
    }

    function stowFloat() {
      const el = floatPanel()
      if (el === null) return false
      const owner = floatOwnerSession(el) ?? liveSession()
      // The left drawer holds exactly one Conversation: stowing a new one
      // replaces the resident, whose float is closed so it goes back to its
      // own place instead of lingering as an unreachable hidden panel.
      releaseStowedExcept(owner)
      el.setAttribute(STOW_ATTR, '')
      // The row is this Conversation's way back: record who was stowed before
      // the marker is read back, or a switch would re-point the row later.
      stowedSession = owner
      syncDrawerRow()
      return true
    }

    /** Close every stowed float of a Conversation other than `keep`. */
    function releaseStowedExcept(keep) {
      for (const el of [...document.querySelectorAll(`[${STOW_ATTR}]`)]) {
        const owner = floatOwnerSession(el)
        if (owner !== null && owner === keep) continue
        releaseStowed(el)
      }
    }

    /**
     * Take one float out of the drawer: it goes back to being an ordinary
     * float, exactly the state it had before it was stowed. It is not closed —
     * closing a Session's float unmounts its body, and that body's cleanup
     * would hand the live Conversation column home with it.
     */
    function releaseStowed(el) {
      el.removeAttribute(STOW_ATTR)
    }

    /**
     * Finish a stow that was asked for before its float existed. The first
     * request arrives while the conversation is still a docked tab — the tab's
     * body is retained, so floating it does NOT remount the body and
     * {@link attachColumn} never runs again. Without this the request would sit
     * in `pendingStow` forever: the conversation would come back as a float
     * instead of landing in the drawer, which is exactly what the menu entry
     * promised it would not do.
     *
     * @returns whether the float was stowed.
     */
    function flushPendingStow() {
      if (!pendingStow) return false
      const panel = floatPanel()
      if (panel === null) return false
      // A float of another Session cannot host this Conversation.
      if (!floatHostsSession(panel, liveSession())) return false
      pendingStow = false
      pendingChromeless = false
      if (!stowFloat()) return false
      revealChrome(true)
      window.setTimeout(notifyState, 0)
      return true
    }

    /** Abandon a stow that could not be completed; the row follows the markers. */
    function resetDrawer() {
      if (pendingStow) {
        pendingStow = false
        pendingChromeless = false
      }
      syncDrawerRow()
    }

    function unstowFloat() {
      for (const el of document.querySelectorAll(`[${STOW_ATTR}]`)) el.removeAttribute(STOW_ATTR)
      stowedSession = null
      syncDrawerRow()
    }

    function drop(zone) {
      if (zone === 'right') {
        dockingRight = true
        // The float leaves as an ordinary right-sidebar tab. The sidebar
        // snapshot belonged to the float: keeping it would let a close of that
        // tab — possibly hours later — move the sidebars back in time.
        savedChrome = null
        touchedChrome = null
        const docked = floatPanel()
        if (docked !== null) {
          docked.removeAttribute(STOW_ATTR)
          if (floatOwnerSession(docked) === stowedSession) stowedSession = null
        }
        syncDrawerRow()
        try {
          sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'sidebar' })
        } catch (error) {
          console.warn('[conversation-float] could not dock to the right sidebar:', error)
        }
        return
      }
      if (zone === 'left') {
        if (!stowFloat()) {
          // No panel to hide: a row without a float would be a button that
          // reaches nowhere, so the conversation goes back to the middle.
          resetDrawer()
          closeFloat()
        }
        // The drawer row lives in the left sidebar: bring the chrome back and
        // make sure that drawer is open, whatever arrangement comes back.
        revealChrome(true)
        return
      }
      syncDrawerRow()
      revealChrome()
      closeFloat()
    }

    /* ------------------------------------------------------ the menu entries */

    /**
     * Whether the live conversation is a docked tab of the right sidebar. The
     * menu entry that says "move it here" has nothing to do when it is already.
     */
    function conversationInRightbar() {
      const column = movedColumn ?? findColumn()
      if (column === null) return false
      if (column.closest(`[${FLOAT_ATTR}]`) !== null) return false
      return column.closest('[data-rightbar-col]') !== null
    }

    /** Dock the conversation in the right sidebar, exactly as a drop does. */
    function moveConversationRight() {
      drop('right')
    }

    /**
     * Stow the conversation in the left drawer, as a drop there does. Without a
     * float there is no panel to stow, so the float is opened first and the
     * stow runs the moment its body mounts — before the first paint — which is
     * why the conversation never flashes on screen on its way into the drawer.
     */
    function moveConversationLeft() {
      if (stowedFloat() !== null) return
      if (floatPanel() !== null) {
        drop('left')
        return
      }
      pendingStow = true
      openFloating()
    }

    /**
     * Watch the float's own drag. DSH owns the dragging; we only listen. A press
     * on the float's chrome opens a sequence; a press inside the Conversation
     * column does not, because that one is a text selection.
     */
    function trackPanelDrag(container) {
      let down = null
      let band = null
      let root = null
      let frame = 0
      let pending = null
      /** The band under the pointer right now. */
      let hovered = null
      /** The band the outline currently shows. */
      let drawn = null
      /** Set once the press has been held long enough to mean business. */
      let judging = false
      let judgeTimer = 0
      /** Finger jitter below this is not a move: touch always drifts. */
      const SLOP = 10

      /** Resolved per pointer sequence: the panel mounts after this body does. */
      const floatRoot = () => {
        if (root !== null && root.isConnected) return root
        root = container.isConnected ? container.closest(`[${FLOAT_ATTR}]`) : null
        return root
      }

      const stopJudge = () => {
        if (judgeTimer === 0) return
        window.clearTimeout(judgeTimer)
        judgeTimer = 0
      }

      /** Redraw only when the band under the pointer actually differs. */
      const paint = () => {
        if (!judging || drawn === hovered) return
        drawn = hovered
        if (drawn === null) hidePreview()
        else showPreview(drawn, band)
      }

      const onDown = (event) => {
        if (event.button !== 0) return
        const panel = floatRoot()
        if (panel === null) {
          down = null
          return
        }
        // The handle is the float's own chrome. A press that lands anywhere
        // else — a sidebar row, the frame's title bar, another panel — must not
        // arm a drop: holding it for two seconds and then releasing over a band
        // would move a session the user never grabbed.
        const target = event.target
        const path = typeof event.composedPath === 'function' ? event.composedPath() : []
        const onPanel = path.includes(panel) || (target instanceof Node && panel.contains(target))
        if (!onPanel) {
          down = null
          return
        }
        // A press inside the Conversation is a text selection, not the panel's
        // drag. Everything else on the float is its chrome.
        if (movedColumn !== null && target instanceof Node && movedColumn.contains(target)) {
          down = null
          return
        }
        down = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false, at: performance.now() }
        // The bands cannot move under a drag: read them once, here.
        band = bands()
        hovered = null
        drawn = null
        judging = false
        armJudge()
      }

      /**
       * Arm the hold. It has to be a STILL hold: any movement past the slop
       * restarts this, so grabbing the panel and dragging at once never counts.
       */
      const armJudge = () => {
        stopJudge()
        judgeTimer = window.setTimeout(() => {
          judgeTimer = 0
          if (down === null) return
          // Coalesced or missed move events cannot fool this: compare the
          // last known pointer position before calling it a still hold.
          const stillFor = performance.now() - (down.movedAt ?? down.at)
          if (stillFor < DWELL_MS - 40) {
            armJudge()
            return
          }
          judging = true
          // A still hold never produced a move, so take the band from where
          // the pointer is right now instead of leaving it unset.
          if (hovered === null) hovered = zoneAt(down.lastX ?? down.x, band)
          paint()
        }, DWELL_MS)
      }

      /** One layout-independent pass per animation frame, never per event. */
      const flush = () => {
        frame = 0
        const event = pending
        pending = null
        if (event === null || down === null) return
        down.lastX = event.clientX
        down.lastY = event.clientY
        const dx = event.clientX - down.x
        const dy = event.clientY - down.y
        if (dx * dx + dy * dy > SLOP * SLOP) {
          down.moved = true
          down.movedAt = performance.now()
          if (!judging) {
            // Still not armed: measure the hold from here, not from the press.
            down.x = event.clientX
            down.y = event.clientY
            armJudge()
          }
        }
        hovered = zoneAt(event.clientX, band)
        paint()
      }

      const onMove = (event) => {
        if (down === null) return
        pending = event
        if (frame !== 0) return
        frame = window.requestAnimationFrame(flush)
      }

      const settle = () => {
        if (frame !== 0) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
        if (pending !== null) flush()
        stopJudge()
        const target = judging ? hovered : null
        down = null
        band = null
        pending = null
        hovered = null
        drawn = null
        judging = false
        hidePreview()
        return { target }
      }

      const onUp = () => {
        if (down === null) return
        const result = settle()
        if (result.target !== null) drop(result.target)
      }

      const onCancel = () => {
        if (down === null) return
        settle()
      }

      // Both channels: a real drag reports pointer events, while synthesised
      // input (and some remote-input paths) can report mouse events only. The
      // handlers are shared, and the frame gate keeps the doubled stream cheap.
      // Touch arrives as its own event family on some WebViews; wrap it in the
      // shape the shared handlers read. Pointer events also fire on modern
      // browsers and the frame gate keeps the doubled stream cheap.
      const touchPoint = (event) => {
        const touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0])
        if (touch === undefined) return null
        return { button: 0, clientX: touch.clientX, clientY: touch.clientY, target: event.target, composedPath: () => event.composedPath?.() ?? [] }
      }
      const onTouchDown = (event) => {
        const point = touchPoint(event)
        if (point !== null) onDown(point)
      }
      const onTouchMove = (event) => {
        const point = touchPoint(event)
        if (point !== null) onMove(point)
      }
      const onTouchUp = (event) => {
        const point = touchPoint(event)
        if (point !== null) onUp(point)
      }
      const pairs = [
        ['pointerdown', onDown],
        ['pointermove', onMove],
        ['pointerup', onUp],
        ['pointercancel', onCancel],
        ['mousedown', onDown],
        ['mousemove', onMove],
        ['mouseup', onUp],
        ['touchstart', onTouchDown],
        ['touchmove', onTouchMove],
        ['touchend', onTouchUp],
        ['touchcancel', onCancel],
      ]
      for (const [name, handler] of pairs) window.addEventListener(name, handler, { capture: true, passive: name !== 'touchmove' })
      // Only the window's own blur. Captured, this would also fire for every
      // descendant losing focus — a focused input blurring would cancel a drag
      // that is still going on.
      const onWindowBlur = (event) => {
        if (event.target === window || event.target === document) onCancel()
      }
      window.addEventListener('blur', onWindowBlur)
      return () => {
        for (const [name, handler] of pairs) window.removeEventListener(name, handler, true)
        window.removeEventListener('blur', onWindowBlur)
        onCancel()
      }
    }

    /* ----------------------------------------------------------- the drawer */

    function syncDockRow() {
      if (!dockedLeft) {
        disposeDockRow()
        dockLabel = null
        return
      }
      // The sidebar resolves a row's label once, when it registers: a row that
      // must say a different Conversation's name is re-registered, never
      // rewritten under the sidebar's feet.
      const label = dockRowLabel()
      if (dockRow !== null && label === dockLabel) return
      disposeDockRow()
      dockLabel = label
      try {
        dockRow = ctxRef.slots.register(
          { name: 'sidebar.panellist', id: DOCK_ROW_ID, order: 20, label: () => dockLabel },
          DockIcon,
        )
      } catch (error) {
        console.warn('[conversation-float] could not register the sidebar row:', error)
        dockRow = null
      }
    }

    function disposeDockRow() {
      if (dockRow === null) return
      try {
        dockRow()
      } catch {
        /* already disposed with the slot */
      }
      dockRow = null
    }

    let ctxRef = null

    /* ---------------------------------------------------------- components */

    function Icon({ name, size = 16 }) {
      const paths = ICONS[name] ?? ICONS.dot
      return h(
        'svg',
        {
          viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
          strokeLinejoin: 'round', 'aria-hidden': true, style: { display: 'block' },
        },
        paths.map((d, index) => h('path', { key: index, d })),
      )
    }

    const ICONS = {
      window: ['M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z', 'M4 8.5h16'],
      dot: ['M12 12h.01'],
    }

    const CSS = `
.dsw-icon {
  display: inline-flex; align-items: center; justify-content: center;
  /* Same box as the header's own ghost buttons: 28x28, 8px corner. */
  width: 28px; height: 28px; padding: 0; border: 0; border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
  transition: background .12s ease, color .12s ease;
}
/* Same hover surface as the Conversation header's own ghost buttons — a
   filled layer that is visible on light backgrounds too. */
.dsw-icon:hover { background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-2)); color: var(--dsw-alias-label-primary); }
/* The menu row used only when the host carries no MenuItemButton primitive. */
.dsw-menu-row {
  display: flex; align-items: center; width: 100%; min-height: 32px;
  padding: 6px 10px; border: 0; border-radius: 6px; background: transparent;
  font: inherit; text-align: left; color: var(--dsw-alias-label-primary); cursor: pointer;
}
.dsw-menu-row:hover { background: var(--dsw-alias-bg-layer-2); }
.dsw-menu-row:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -2px; }
.dsw-icon:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.dsw-host {
  position: relative;
  display: flex; flex-direction: column;
  width: 100%; height: 100%; min-height: 0; overflow: hidden;
  background: var(--dsw-alias-bg-base);
}
.dsw-preview {
  position: fixed; left: 0; top: 0; z-index: 90; pointer-events: none;
  will-change: transform, width, height;
  border: 2px dashed var(--dsw-alias-brand-primary, #4d6bfe);
  border-radius: 12px;
  box-sizing: border-box;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  display: flex; align-items: center; justify-content: center;
  transition: transform .09s ease, width .09s ease, height .09s ease;
}
/* The float, stowed in the left drawer: mounted, so the centre stays empty. */
[data-dsh-conversation-float-stowed] {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
/* Touch: the grip owns the gesture, so a press is not turned into a scroll. */
[data-dsh-conversation-float-float] [data-dockkit-float-grip] {
  touch-action: none;
  -webkit-user-select: none; user-select: none;
  -webkit-touch-callout: none;
}
/* Everything the float hides while it is the only thing on screen. */
[data-dsh-conversation-float-chromeless] {
  display: none !important;
}
.dsw-preview-label {
  font-size: 15px; font-weight: 600; letter-spacing: .04em;
  color: var(--dsw-alias-brand-primary, #4d6bfe);
  background: var(--dsw-alias-bg-base, #fff);
  border-radius: 999px; padding: 4px 14px;
}
`

    function Styles() {
      return h('style', { 'data-plugin-css': NS }, CSS)
    }

    /**
     * The entry's job depends on the state: with no float it opens one (leaving
     * the window to the float alone), and with a float on screen it brings the
     * rest of DSH back — or hides it again.
     */
    function onEntryClick() {
      // No float of this Conversation on screen, or one stowed in the drawer:
      // the button brings the float back instead of toggling the window.
      const panel = floatPanel()
      if (panel === null || panel.hasAttribute(STOW_ATTR)) {
        openFloating()
        return
      }
      if (chromeless) revealChrome()
      else setChromeless(true)
    }

    /**
     * The drawer row is DSH's own panel button: pressing it would select the
     * plugin's main-panel entry, which takes the Conversation down for a commit
     * — and the dock kit refuses to open a float while a page owns the panel.
     * Take the press in the capture phase instead: the row means "return to the
     * stowed Conversation", never "open a page".
     */
    function drawerRowPress(event) {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (button === null) return
      // The row carries the stowed Conversation's own name, which may collide
      // with a shipped row's name: the glyph we render is what tells it apart.
      if (button.querySelector(`[${ROW_MARK_ATTR}]`) === null) return
      if (button.getAttribute('aria-label') !== (dockLabel ?? dockRowLabel())) return
      const drawer = frameSidebar()
      if (drawer === null || !drawer.contains(button)) return
      event.preventDefault()
      event.stopPropagation()
      bringStowedBack()
    }

    /**
     * The row's promise: show that Conversation again, with its float back on
     * screen. The window may be looking at another Conversation — the marker is
     * shared, the panels are not — so the row switches to the stowed one first.
     * Its float is already mounted in the right column and only hidden, so once
     * the switch lands it just has to be un-hidden.
     */
    function bringStowedBack() {
      const id = stowedSession ?? stowedOwner()
      if (id === null) {
        openFloating()
        return
      }
      if (liveSession() === id) {
        revealStowed(id)
        return
      }
      try {
        uiWorkspace?.openSession?.(id)
      } catch (error) {
        console.warn('[conversation-float] could not return to the stowed Conversation:', error)
        return
      }
      awaitStowedSession(id, 0)
    }

    /** Wait for the switch to land, then reveal the float; give up at ~3s. */
    function awaitStowedSession(id, attempt) {
      if (liveSession() === id) {
        revealStowed(id)
        return
      }
      if (attempt >= 60) {
        console.warn('[conversation-float] the stowed Conversation did not open; the row stays')
        return
      }
      window.setTimeout(() => awaitStowedSession(id, attempt + 1), 50)
    }

    /** Un-hide the stowed float of `id` and keep the column that hosts it open. */
    function revealStowed(id) {
      const el = stowedFloatOf(id)
      if (el !== null) el.removeAttribute(STOW_ATTR)
      stowedSession = null
      syncDrawerRow()
      // The float lives in the right column: a collapsed one has nowhere to put
      // it, so the same expansion an open does applies here.
      try {
        if (sidebarRight !== null && sidebarRight.isExpanded?.() === false) sidebarRight.toggleExpanded?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the right sidebar:', error)
      }
      notifyState()
      sizeFloat()
      settleFloatSeat()
    }

    /** The stowed float belonging to `id`, whichever Session is on screen. */
    function stowedFloatOf(id) {
      for (const el of document.querySelectorAll(`[${STOW_ATTR}]`)) {
        if (floatOwnerSession(el) === id) return el
      }
      return null
    }

    /** Escape always brings DSH back: the way out of a hidden window. */
    function escapeOnKey(event) {
      if (event.key !== 'Escape' || !chromeless) return
      revealChrome()
    }

    /** Conversation-header entry: opens the float, or reveals DSH behind it. */
    function HeaderAction() {
      const [, bump] = React.useState(0)
      React.useEffect(() => {
        const fn = () => bump((n) => n + 1)
        stateListeners.add(fn)
        return () => stateListeners.delete(fn)
      }, [])
      return h(
        'button',
        {
          type: 'button',
          className: 'dsw-icon',
          title: entryTitle(),
          'aria-label': entryTitle(),
          [ANCHOR_ATTR]: '',
          onClick: onEntryClick,
        },
        h(Styles),
        h(Icon, { name: 'window' }),
      )
    }

    /** The left sidebar row's glyph. The row itself is owned by the sidebar. */
    function DockIcon({ size = 16 }) {
      return h('span', { [ROW_MARK_ATTR]: '', style: { display: 'contents' } }, h(Icon, { name: 'window', size }))
    }

    /**
     * The main panel this row addresses. It only exists so a click on the row
     * cannot leave the centre column on an empty page: the click re-opens the
     * float and hands the centre back to the conversation.
     */
    function DockPanel() {
      React.useEffect(() => {
        openFloating()
        try {
          layout?.selectPanel?.(null)
        } catch (error) {
          console.warn('[conversation-float] could not restore the conversation panel:', error)
        }
      }, [])
      return null
    }

    /** The floating panel's body: it holds the live Conversation column. */
    function SessionPanel() {
      const host = React.useRef(null)
      React.useLayoutEffect(() => {
        const container = host.current
        if (container === null) return undefined
        attachColumn(container)
        // Only the floating occurrence is draggable; a tab docked in the right
        // sidebar must not arm the drop bands at all. The panel element mounts
        // after this body does, so the tracker resolves it per pointer sequence.
        const stop = trackPanelDrag(container)
        return () => {
          stop()
          detachColumn()
        }
      }, [])
      return h('div', { className: 'dsw-host', ref: host, [BODY_ATTR]: '' }, h(Styles))
    }

    /**
     * One menu row: the dock kit's own row component when the browser module
     * table carries it, a plain menu button otherwise. Selecting it closes the
     * menu first, the way every shipped row does.
     */
    function MoveRow({ onDismiss, label, onSelect }) {
      const select = () => {
        try {
          onDismiss?.()
        } catch {
          /* the menu may already be gone */
        }
        onSelect()
      }
      // The shipped rows lead with a 16px glyph; ours keeps the window one so the
      // row sits on the same grid instead of starting where the icons do.
      if (MenuItemButton !== null) return h(MenuItemButton, { icon: h(Icon, { name: 'window' }), onSelect: select }, label)
      return h('button', { type: 'button', role: 'menuitem', className: 'dsw-menu-row', onClick: select }, label)
    }

    /**
     * The left sidebar's More menu: stow the conversation in that drawer. It
     * hides itself once the float is already stowed there.
     */
    function MoveLeftRow({ onDismiss }) {
      if (stowedFloat() !== null) return null
      return h(MoveRow, { onDismiss, label: t('moveLeft'), onSelect: moveConversationLeft })
    }

    /**
     * The right sidebar guide's More menu: dock the conversation as a tab there.
     * It hides itself once the conversation already is one.
     */
    function MoveRightRow({ onDismiss }) {
      if (conversationInRightbar()) return null
      return h(MoveRow, { onDismiss, label: t('moveRight'), onSelect: moveConversationRight })
    }

    /* --------------------------------------------------------------- wiring */

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctxRef = ctx
        ctx.effect(() => {
          try {
            return ctx.locale.register(NS, Object.fromEntries(LOCALES.map((id) => [id, { title: COPY[id].floatTitle, description: COPY[id].description }])))
          } catch {
            return () => {}
          }
        })

        // A language switch happens while the window is open: the entry's own
        // caption and an outline that is already drawn follow the new table.
        ctx.effect(() =>
          ctx.locale.subscribe(() => {
            notifyState()
            if (preview !== null && preview.zone !== null) preview.label.textContent = zoneLabel(preview.zone)
          }),
        )

        const register = (slot, id, component, options = {}) =>
          ctx.effect(() =>
            ctx.slots.inject(slot, () =>
              ctx.slots.register({ name: slot, id, locale: NS, ...options }, component),
            ),
          )

        register('conversation.session.header.utilities', 'conversation-float-control', HeaderAction, { order: 30 })
        // The same two destinations a drop offers, as rows in the sidebars' own
        // More menus — below the shipped rows, which register at the default 0.
        register('sidebar.panellist.actions', 'conversation-float-stow', MoveLeftRow, { order: 100 })
        register('sidebar.right.tab.guide.actions', 'conversation-float-move', MoveRightRow, { order: 100 })

        ctx.effect(() => watchColumn())

        ctx.effect(() => {
          window.addEventListener('keydown', escapeOnKey, true)
          document.addEventListener('click', drawerRowPress, true)
          return () => {
            window.removeEventListener('keydown', escapeOnKey, true)
            document.removeEventListener('click', drawerRowPress, true)
          }
        })

        // A hand on a float outranks any seat this plugin remembered.
        ctx.effect(() => trackFloatGrab())

        // A press or a key is the only evidence that a column moved by the
        // user's hand rather than by DSH re-railing it.
        ctx.effect(() => {
          document.addEventListener('pointerdown', noteGesture, true)
          document.addEventListener('keydown', noteGesture, true)
          return () => {
            document.removeEventListener('pointerdown', noteGesture, true)
            document.removeEventListener('keydown', noteGesture, true)
          }
        })

        // One frame after load, give any float already on screen its size.
        ctx.effect(() => {
          const id = window.requestAnimationFrame(() => sizeFloat())
          return () => window.cancelAnimationFrame(id)
        })
        // A reload can leave the last run's hidden columns behind.
        // An earlier build parked the View tab strip in the main window; put it
        // back inside the Conversation column and drop the parked container.
        for (const dock of document.querySelectorAll('.dsw-tabdock')) {
          const strip = dock.querySelector('[data-conversation-tabs]')
          const column = document.querySelector('[data-conversation-session]')
          if (strip !== null && column !== null && !column.contains(strip)) {
            column.insertBefore(strip, column.firstChild)
          }
          dock.remove()
        }
        // A previous build hid the two shipped View buttons; put them back.
        for (const el of document.querySelectorAll('[data-dsh-conversation-float-core-tab]')) el.removeAttribute('data-dsh-conversation-float-core-tab')
        setChromeless(false)


        ctx.effect(() =>
          ctx.slots.inject('main', () =>
            ctx.slots.register({ name: 'main', key: DOCK_ROW_ID, locale: NS }, DockPanel),
          ),
        )

        ctx.effect(() => {
          const dispose = ctx.inject(['layout'], (sub) => {
            layout = sub.layout ?? null
            return () => {
              layout = null
            }
          })
          return dispose
        })

        // The drawer row is named after the Conversation that was stowed and
        // returns to it: the Session list supplies the name, workspace
        // navigation re-opens the Conversation.
        ctx.effect(() => {
          const dispose = ctx.inject(['sessions', 'uiWorkspace'], (sub) => {
            sessions = sub.sessions ?? null
            uiWorkspace = sub.uiWorkspace ?? null
            let off = null
            try {
              if (typeof sessions?.list?.subscribe === 'function') {
                off = sessions.list.subscribe(() => {
                  if (dockedLeft) syncDrawerRow()
                })
              }
            } catch (error) {
              console.warn('[conversation-float] could not follow the Session list:', error)
            }
            return () => {
              try {
                off?.()
              } catch {
                /* the projection is already gone */
              }
              sessions = null
              uiWorkspace = null
            }
          })
          return dispose
        })

        ctx.effect(() =>
          ctx.inject(['sidebarRightTabs', 'sidebarRight'], (sub) => {
            sidebarRight = sub.sidebarRight ?? null
            sub.effect(() =>
              sub.sidebarRightTabs.register({
                id: CHAT_ID,
                kind: CHAT_KIND,
                title: () => t('conversation'),
                // The body hosts the live Conversation column. DSH unmounts an
                // unretained body on every tab switch, and that unmount is what
                // handed the column back to the middle column. Retaining the
                // body keeps the column where the user docked it.
                keepMounted: true,
              }),
            )
            sub.effect(() =>
              sub.slots.inject('sidebar.right.pane.tab', () =>
                sub.slots.register({ name: 'sidebar.right.pane.tab', key: CHAT_ID, locale: NS }, SessionPanel),
              ),
            )
            return () => {
              sidebarRight = null
              hidePreview()
              if (dockedLeft) {
                dockedLeft = false
                syncDockRow()
              }
              detachColumn()
            }
          }),
        )

        window.__dshSessionWindow = {
          open: openFloating,
          findColumn,
          bands,
          get moved() {
            return movedColumn !== null
          },
          get dockedLeft() {
            return dockedLeft
          },
          /** What the sidebars restore is working from, for the test harness. */
          get chrome() {
            return { saved: savedChrome, touched: touchedChrome, chromeless, hiddenAt: holdOffUntil }
          },
        }
        ctx.effect(() => () => {
          hidePreview()
          unstowFloat()
          // Unloading is not a user close: leave the sidebars alone.
          suspendRestore = true
          detachColumn()
          delete window.__dshSessionWindow
        })
      },
    }
  },
})
