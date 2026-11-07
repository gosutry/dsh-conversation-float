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
    const ReactDOM = require('react-dom')
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
        "dockRight": "停到右栏",
        "minimize": "收起浮窗",
        "close": "关闭浮窗",
        "viewChat": "对话",
        "viewTrajectory": "轨迹",
        "viewNeedsFocus": "切到这条会话后就能换页",
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
        "dockRight": "Dock in the right sidebar",
        "minimize": "Minimize",
        "close": "Close",
        "viewChat": "Chat",
        "viewTrajectory": "Trajectory",
        "viewNeedsFocus": "Open this conversation to change pages",
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
    /** Set on the one frame column this plugin has moved somewhere. */
    const COLUMN_ATTR = 'data-dsh-conversation-float-column'

    let sidebarRight = null
    let uiConversation = null
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
      // The window renders a Conversation of its own. That one is never the
      // middle column this helper is looking for, so it is skipped by name.
      const insideOurs = (el) => el !== null && (el.closest(`[${WINDOW_ATTR}]`) !== null || el.closest(`[${WINDOW_CONTENT_ATTR}]`) !== null)
      const candidates = [
        [...document.querySelectorAll('[data-conversation-session]')].find((el) => !insideOurs(el)) ?? null,
        document.querySelector(`[${ANCHOR_ATTR}]`),
        document.querySelector('[data-conversation-header-corner]'),
        document.querySelector('[data-conversation-tabs]'),
      ]
      for (const anchor of candidates) {
        if (anchor === null || insideOurs(anchor)) continue
        // While the Conversation is hosted by one of our bodies, the column is
        // that body's own child — walking up instead would climb out of the
        // right sidebar and name the whole right column as "the column", and
        // moving that into the float feeds it its own ancestor.
        const body = anchor.closest(`[${BODY_ATTR}]`)
        if (body !== null) {
          // Only a column WE moved into this body counts. A body rendering a
          // Conversation of its own (a docked page) has the anchor as a view;
          // reading that view as the frame's column made the panel believe it
          // was hosting the live column while it was rendering a copy.
          for (const child of Array.from(body.children)) {
            if (child.hasAttribute(COLUMN_ATTR) && child.contains(anchor)) return child
          }
          return null
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
      column.setAttribute(COLUMN_ATTR, '')
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

    /** Where the column went on its way home (probe only, read by the tests). */
    function markDetach(where) {
      try {
        const box = window.__dshFloatDetach ?? (window.__dshFloatDetach = { seat: 0, center: 0, fallback: 0, nowhere: 0, disconnected: 0, calls: 0 })
        box.calls += 1
        box[where] = (box[where] ?? 0) + 1
      } catch { /* no window yet */ }
    }

    function detachColumn(keepChrome = false) {
      const column = movedColumn
      const home = movedFrom
      if (column !== null) column.removeAttribute(COLUMN_ATTR)
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
      if (!column.isConnected) {
        markDetach('disconnected')
        return
      }
      const seat = homeSeat(home)
      if (seat !== null) {
        markDetach('seat')
        seat.parent.insertBefore(column, seat.before)
        return
      }
      // The recorded seat is gone (the panel took it down with it): put the
      // column back in the middle column so the session is never lost.
      const center = currentCenter()
      if (center !== null) {
        markDetach('center')
        center.appendChild(column)
        return
      }
      // Last resort: keep it in the frame instead of letting it leave the
      // document with the window that hosted it.
      const frame = document.querySelector('[data-shell-overlay]')?.parentElement ?? null
      if (frame !== null) {
        markDetach('fallback')
        frame.insertBefore(column, frame.querySelector(':scope > [data-rightbar-col]'))
        return
      }
      markDetach('nowhere')
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
        // The same rule for OUR windows: one may keep the live column only
        // while its own Conversation is the one on screen and it is showing.
        const inWindow = movedColumn === null ? null : movedColumn.closest(`[${WINDOW_ATTR}]`)
        if (inWindow !== null && (inWindow.hidden || inWindow.getAttribute(WINDOW_ATTR) !== columnSession(movedColumn))) {
          detachColumn(true)
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
     * Whether the live column is being hosted by one of OUR windows, where the
     * dock-kit panel is only a hidden shell for the tab.
     */
    function columnInOwnWindow() {
      return movedColumn !== null && movedColumn.closest(`[${WINDOW_ATTR}]`) !== null
    }

    /**
     * A float that lost its body — clicking the drawer row re-lays the main
     * column, the panel remounts, and the Conversation is momentarily out of the
     * document — is put back together here. An empty float is worse than a flash.
     */
    function healFloatBody() {
      const panel = floatPanel()
      if (panel === null) return
      // Our own window is the host: healing here would move the Conversation
      // into the hidden dock-kit panel instead.
      if (columnInOwnWindow()) return
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
      if (shown !== null) {
        lastSession = shown
        return shown
      }
      // A docked page can be the Conversation's only home; its Session is the
      // one on screen and the entry must still find it.
      const docked = dockedBodySession()
      if (docked !== null) {
        lastSession = docked
        return docked
      }
      return lastSession
    }

    /** The Session of the right-sidebar page that is on screen, if any. */
    function dockedBodySession() {
      for (const host of document.querySelectorAll(`[${BODY_ATTR}]`)) {
        if (host.closest(`[${FLOAT_ATTR}]`) !== null) continue
        if (!hostOnScreen(host)) continue
        const owner = hostSession(host)
        if (owner !== null) return owner
      }
      return null
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
      // One of our windows owns it, for the same reason.
      if (columnInOwnWindow()) return
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
      const sessionId = liveSession()
      const win = sessionId === null ? undefined : windows.get(sessionId)
      if (win === undefined) return t('floatTitle')
      return win.el.hidden ? t('floatTitle') : t('minimize')
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
    /**
     * Give this Conversation a window.
     *
     * The window is ours, so no sidebar has to be opened for it and nothing is
     * re-seated: the tab body mounts and the body is what owns the window. A tab
     * kept from an earlier run is reused — its body is still mounted, so only
     * the window has to come back.
     */
    function openFloatAtDefault() {
      const sessionId = liveSession()
      if (sessionId === null) return
      saveChromeState()
      if (tabIdFor(sessionId) !== null) {
        // The tab exists. Floating it is the SAME tab moving, never a second
        // one: a docked page is floated through the dock kit's own intent, and
        // the re-hosted body then raises this Conversation's window.
        if (floatPanel() === null) {
          // Docked page: close it and open a fresh float, so the floating body
          // mounts against a clean tree and takes the column with it.
          closeTabFor(sessionId)
          window.setTimeout(() => {
            try {
              sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'float' })
            } catch (error) {
              console.warn('[conversation-float] could not open the floating tab:', error)
            }
          }, 60)
          notifyState()
          return
        }
        showWindow(sessionId)
        notifyState()
        return
      }
      try {
        sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'float' })
      } catch (error) {
        console.warn('[conversation-float] could not open the floating tab:', error)
      }
      notifyState()
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

    /** Open this Conversation's window, or bring it back from the taskbar. */
    function openFloating() {
      const sessionId = liveSession()
      if (sessionId === null) return
      if (windows.has(sessionId)) {
        showWindow(sessionId)
        notifyState()
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

    /** Close this Conversation's window: its tab goes, the window with it. */
    function closeFloat() {
      const sessionId = liveSession()
      if (sessionId === null) return false
      closeWindow(sessionId)
      return true
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

    /** Close this Conversation's tab for good: the next host mounts a new body. */
    function closeTabFor(sessionId) {
      const id = tabIdFor(sessionId)
      if (id === null) return false
      try {
        if (typeof sidebarRight?.closeIn === 'function') sidebarRight.closeIn(sessionId, id)
        else sidebarRight?.hide?.(id)
        return true
      } catch (error) {
        console.warn('[conversation-float] could not close the tab:', error)
        return false
      }
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
        // Our window and the right-sidebar page are the same tab: the window
        // goes first, or it would outlive the page it was showing and sit there
        // blank while the tab moves underneath it.
        const shown = liveSession()
        if (shown !== null) {
          // A re-hosted body keeps its React tree and loses the column's
          // bookkeeping with it; closing the tab first gives the page a fresh
          // body that attaches the column again.
          closeTabFor(shown)
          if (windows.has(shown)) destroyWindow(shown)
        }
        syncDrawerRow()
        window.setTimeout(() => {
          try {
            sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'sidebar' })
          } catch (error) {
            console.warn('[conversation-float] could not dock to the right sidebar:', error)
          }
        }, 60)
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

    /* ------------------------------------------------------- the float window */

    /**
     * A float is OUR window: one element per Conversation, parented to `#root`
     * rather than to a column, so it stays on screen while the window looks at
     * another Session or another page.
     *
     * The Conversation is rendered by DSH's own `conversation.content` factory
     * inside this Session's right-sidebar tab body. That body is registered
     * `keepMounted`, so DSH keeps it — and the Session subtree that owns it —
     * alive off screen (`SidebarSessionViews.prune` only retires a view without a
     * retained tab). The body's content node is then moved into this window.
     */
    const WINDOW_ATTR = 'data-dsh-conversation-float-window'
    const WINDOW_BODY_ATTR = 'data-dsh-conversation-float-window-body'
    const WINDOW_GRIP_ATTR = 'data-dsh-conversation-float-window-grip'
    const WINDOW_RESIZE_ATTR = 'data-dsh-conversation-float-window-resize'
    const WINDOW_TITLE_ATTR = 'data-dsh-conversation-float-window-title'
    const WINDOW_CONTENT_ATTR = 'data-dsh-conversation-float-window-content'
    const WINDOW_HIDE_PANE_ATTR = 'data-dsh-conversation-float-hide-pane'
    const WINDOW_KEY = 'dsh-conversation-float.window.'
    /**
     * One per-Session content epoch.
     *
     * DSH binds a Session's draft writer into a SINGLE slot
     * (`inputHub.shell(id).bindDraftPersistence`), so whichever Conversation
     * view mounted last owns typing. The window and the middle column therefore
     * hand the slot back and forth by remounting, never by fighting for it.
     */
    const contentEpochs = new Map()
    const epochListeners = new Set()

    function bumpContentEpoch(sessionId) {
      if (sessionId === null) return
      contentEpochs.set(sessionId, (contentEpochs.get(sessionId) ?? 0) + 1)
      for (const listener of [...epochListeners]) {
        try { listener(sessionId) } catch { /* a listener may be unmounting */ }
      }
    }

    /** sessionId -> { el, body, title, header, resizer, rect } */
    const windows = new Map()
    let windowZ = 20000

    function readWindowRect(sessionId) {
      try {
        const raw = window.localStorage.getItem(WINDOW_KEY + sessionId)
        if (raw === null) return null
        const r = JSON.parse(raw)
        if (!r || typeof r.x !== 'number' || typeof r.y !== 'number' || typeof r.width !== 'number' || typeof r.height !== 'number') return null
        return r
      } catch {
        return null
      }
    }

    function writeWindowRect(sessionId, rect) {
      try {
        window.localStorage.setItem(WINDOW_KEY + sessionId, JSON.stringify(rect))
      } catch {
        /* a full quota must not break the float */
      }
    }

    /**
     * Keep a window fully on screen.
     *
     * The composer is the last row of the Conversation, so a window whose bottom
     * hangs past the viewport hides exactly the control this float exists to
     * keep usable. A window taller than the viewport starts at the top instead.
     */
    /**
     * The strip at the top of the window that belongs to DSH, not to the page.
     *
     * On Windows the caption is an overlay drawn ON the web content, so a fixed
     * window whose header slides under it can no longer be grabbed: the window
     * is stuck. Every window therefore stops at this line, and none may start
     * above it.
     */
    function windowTopInset() {
      const root = getComputedStyle(document.documentElement)
      for (const name of ['--dsh-windows-titlebar-height', '--dsh-frame-top-clearance']) {
        const raw = root.getPropertyValue(name).trim()
        const px = Number.parseFloat(raw)
        if (Number.isFinite(px) && px > 0) return Math.round(px)
      }
      return 48
    }

    function clampRect(rect) {
      const top = windowTopInset()
      const usable = Math.max(160, window.innerHeight - top)
      const width = Math.max(320, Math.min(rect.width, window.innerWidth))
      const height = Math.max(240, Math.min(rect.height, usable))
      const maxX = Math.max(0, window.innerWidth - width)
      const maxY = Math.max(top, window.innerHeight - height)
      const x = Math.max(0, Math.min(rect.x, maxX))
      const y = Math.max(top, Math.min(rect.y, maxY))
      return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) }
    }

    /** Re-fit every window after the application window itself changes size. */
    function reclampWindows() {
      for (const win of windows.values()) applyWindowRect(win, clampRect(win.rect))
    }

    function defaultWindowRect() {
      const top = windowTopInset()
      const width = Math.min(920, Math.round(window.innerWidth * 0.62))
      const height = Math.min(720, Math.round((window.innerHeight - top) * 0.86))
      return clampRect({
        x: Math.round((window.innerWidth - width) / 2),
        y: Math.round(top + (window.innerHeight - top - height) / 2),
        width,
        height,
      })
    }

    function applyWindowRect(win, rect) {
      win.rect = rect
      win.el.style.left = rect.x + 'px'
      win.el.style.top = rect.y + 'px'
      win.el.style.width = rect.width + 'px'
      win.el.style.height = rect.height + 'px'
    }

    function raiseWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      windowZ += 1
      win.el.style.zIndex = String(windowZ)
    }

    function windowButton(label, glyph, onClick) {
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-label', label)
      button.title = label
      button.textContent = glyph
      button.style.cssText = 'width:24px;height:24px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:14px/1 system-ui;cursor:pointer'
      button.addEventListener('pointerdown', (event) => {
        event.stopPropagation()
      })
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        onClick()
      })
      return button
    }

    /** A header chip that switches the Conversation's page. */
    function viewButton(label, onClick) {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = label
      button.setAttribute('data-dsh-conversation-float-view', '')
      button.style.cssText = 'flex:none;height:22px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:11px/1 ui-sans-serif,system-ui;cursor:pointer'
      button.addEventListener('pointerdown', (event) => event.stopPropagation())
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        onClick()
      })
      return button
    }

    /**
     * The Conversation's own page tabs — the ones the header draws.
     *
     * They live in the main column's header, which belongs to the Session on
     * screen. A press on one runs DSH's selectView, so the view ledger, the store
     * and both columns move together; nothing here re-implements that.
     */
    function nativeViewTabs() {
      return [...document.querySelectorAll('[role="tab"]')].filter((tab) => (
        tab.closest('[data-dockkit-tab]') === null &&
        tab.closest(`[${WINDOW_ATTR}]`) === null
      ))
    }

    /** Mirror the header's two page tabs onto the window's chips. */
    function paintWindowView(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      const tabs = liveSession() === sessionId ? nativeViewTabs() : []
      const ids = ['chat', 'trajectory']
      for (let index = 0; index < ids.length; index += 1) {
        const button = win.views[ids[index]]
        const tab = tabs[index]
        if (button === undefined) continue
        const usable = tab !== undefined
        button.disabled = !usable
        button.title = usable ? '' : t('viewNeedsFocus')
        button.style.opacity = usable ? '1' : '.45'
        button.style.cursor = usable ? 'pointer' : 'default'
        if (!usable) continue
        const label = (tab.textContent || '').trim()
        if (label !== '' && button.textContent !== label) button.textContent = label
        const active = tab.getAttribute('aria-selected') === 'true'
        button.style.background = active ? 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.06))' : 'transparent'
        button.style.color = active ? 'var(--dsw-alias-label-primary, #111)' : 'var(--dsw-alias-label-secondary)'
        button.style.fontWeight = active ? '600' : '400'
      }
    }

    /**
     * Hand the Session's draft slot back to the middle column.
     *
     * The column's own Conversation remounts when the page changes, and that
     * remount is what re-binds its writer — the slot is single, so it cannot be
     * bound from here.
     */
    function rebindMainComposer() {
      const tabs = nativeViewTabs()
      if (tabs.length < 2) return
      const current = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0]
      const other = tabs.find((tab) => tab !== current)
      if (current === undefined || other === undefined) return
      other.click()
      window.setTimeout(() => {
        try { current.click() } catch { /* the header may be gone */ }
      }, 80)
    }

    /**
     * Switch the page a Conversation shows, through the service the shipped
     * header uses (`uiConversation.binding(id).activate(viewId)`).
     *
     * The header itself is a plain slot we may not render from here, and a page
     * docked in the right sidebar has no header of its own — this is how its
     * chips can still move between Conversation and Trajectory.
     */
    function switchConversationView(sessionId, viewId) {
      if (sessionId === null || typeof viewId !== 'string') return false
      try {
        const service = typeof ctxRef?.get === 'function' ? ctxRef.get('uiConversation') : null
        const binding = service === null || service === undefined ? null : service.binding?.(sessionId)
        if (binding === null || binding === undefined || typeof binding.activate !== 'function') return false
        binding.activate(viewId)
        return true
      } catch (error) {
        console.warn('[conversation-float] could not switch the conversation view:', error)
        return false
      }
    }

    /** Press the header's tab at that index, for the Session the window shows. */
    function activateWindowView(sessionId, index) {
      if (liveSession() !== sessionId) {
        paintWindowView(sessionId)
        return
      }
      const tab = nativeViewTabs()[index]
      if (tab === undefined) {
        console.warn('[conversation-float] no view tab at index', index)
        return
      }
      tab.click()
      window.setTimeout(() => paintWindowView(sessionId), 80)
    }

    function ensureWindow(sessionId) {
      const existing = windows.get(sessionId)
      if (existing !== undefined) return existing
      const root = document.getElementById('root')
      if (root === null) return null
      const el = document.createElement('div')
      el.setAttribute(WINDOW_ATTR, sessionId)
      el.setAttribute('role', 'dialog')
      const header = document.createElement('div')
      header.setAttribute(WINDOW_GRIP_ATTR, '')
      const title = document.createElement('span')
      title.setAttribute(WINDOW_TITLE_ATTR, '')
      title.style.cssText = 'flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 12px/1.2 ui-sans-serif,system-ui'
      title.textContent = sessionTitle(sessionId) ?? t('floatTitle')
      const body = document.createElement('div')
      body.setAttribute(WINDOW_BODY_ATTR, '')
      const resizer = document.createElement('div')
      resizer.setAttribute(WINDOW_RESIZE_ATTR, '')
      header.appendChild(title)
      // The two shipped pages, and only those: a plugin that invents a
      // Conversation view of its own must not decide what a float shows.
      const chatButton = viewButton(t('viewChat'), () => activateWindowView(sessionId, 0))
      const trajectoryButton = viewButton(t('viewTrajectory'), () => activateWindowView(sessionId, 1))
      header.appendChild(chatButton)
      header.appendChild(trajectoryButton)
      header.appendChild(windowButton(t('minimize'), '—', () => hideWindow(sessionId)))
      header.appendChild(windowButton(t('close'), '✕', () => closeWindow(sessionId)))
      el.appendChild(header)
      el.appendChild(body)
      el.appendChild(resizer)
      el.hidden = true
      root.appendChild(el)
      const win = {
        el, body, title, header, resizer,
        views: { chat: chatButton, trajectory: trajectoryButton },
        rect: readWindowRect(sessionId) ?? defaultWindowRect(),
      }
      windows.set(sessionId, win)
      applyWindowRect(win, clampRect(win.rect))
      bindWindowDrag(sessionId, win)
      paintWindowView(sessionId)
      // Slot registration must not run inside the commit that mounted the tab
      // body: defer it out of React's render phase.
      window.setTimeout(syncTaskbar, 0)
      return win
    }

    function bindWindowDrag(sessionId, win) {
      let grab = null
      win.el.addEventListener('pointerdown', () => raiseWindow(sessionId), true)
      win.header.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return
        grab = { x: event.clientX, y: event.clientY, rect: win.rect }
        try { win.header.setPointerCapture(event.pointerId) } catch { /* older engines */ }
        event.preventDefault()
      })
      win.header.addEventListener('pointermove', (event) => {
        if (grab === null) return
        applyWindowRect(win, clampRect({
          x: grab.rect.x + (event.clientX - grab.x),
          y: grab.rect.y + (event.clientY - grab.y),
          width: grab.rect.width,
          height: grab.rect.height,
        }))
      })
      const drop = () => {
        if (grab === null) return
        grab = null
        writeWindowRect(sessionId, win.rect)
      }
      win.header.addEventListener('pointerup', drop)
      win.header.addEventListener('pointercancel', drop)

      let sizing = null
      win.resizer.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return
        sizing = { x: event.clientX, y: event.clientY, rect: win.rect }
        try { win.resizer.setPointerCapture(event.pointerId) } catch { /* older engines */ }
        event.preventDefault()
        event.stopPropagation()
      })
      win.resizer.addEventListener('pointermove', (event) => {
        if (sizing === null) return
        applyWindowRect(win, clampRect({
          x: sizing.rect.x,
          y: sizing.rect.y,
          width: sizing.rect.width + (event.clientX - sizing.x),
          height: sizing.rect.height + (event.clientY - sizing.y),
        }))
      })
      const settled = () => {
        if (sizing === null) return
        sizing = null
        writeWindowRect(sessionId, win.rect)
      }
      win.resizer.addEventListener('pointerup', settled)
      win.resizer.addEventListener('pointercancel', settled)
    }

    function showWindow(sessionId) {
      const win = ensureWindow(sessionId)
      if (win === null) return null
      win.el.hidden = false
      raiseWindow(sessionId)
      // Typing belongs to the view that just took the screen.
      bumpContentEpoch(sessionId)
      return win
    }

    function hideWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      win.el.hidden = true
      // The window keeps its body mounted while minimised, so the middle
      // column has to take the draft slot back for its own composer.
      if (liveSession() === sessionId) window.setTimeout(rebindMainComposer, 60)
    }

    function destroyWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      windows.delete(sessionId)
      // The live column comes home before its host leaves: a node removed with
      // the window would be a Conversation nobody can find again.
      if (movedColumn !== null && win.el.contains(movedColumn)) detachColumn()
      win.el.remove()
      window.setTimeout(syncTaskbar, 0)
    }

    /**
     * The id of OUR tab in one Session, asked of the Session's own tab list.
     *
     * Reading it from the markup was how the previous build got it, and that
     * routine could not tell one Session's tab from another's once the body had
     * been lifted out of the strip: closing a float then closed the wrong tab.
     */
    function tabIdFor(sessionId) {
      if (sessionId === null) return null
      try {
        const tabs = sidebarRight?.tabsIn?.(sessionId) ?? []
        const mine = tabs.find((tab) => tab && tab.kind === CHAT_KIND)
        return typeof mine?.id === 'string' ? mine.id : null
      } catch (error) {
        console.warn('[conversation-float] could not read this Session tab list:', error)
        return null
      }
    }

    /**
     * Close a Conversation's float for good.
     *
     * The TAB goes first. 'hide' only collapses a docked column, which left the
     * body mounted with an empty host — the next float opened into that body was
     * blank. Closing the tab unmounts the body, and the body's own cleanup takes
     * the window down with it.
     */
    function closeWindow(sessionId) {
      const id = tabIdFor(sessionId)
      if (id !== null) {
        try {
          if (typeof sidebarRight?.closeIn === 'function') sidebarRight.closeIn(sessionId, id)
          else sidebarRight?.hide?.(id)
        } catch (error) {
          console.warn('[conversation-float] could not close the tab:', error)
        }
      }
      // A docked tab DSH refuses to close leaves the body alive: the window must
      // not outlive it as an orphan pointing at nothing.
      window.setTimeout(() => {
        if (windows.has(sessionId)) destroyWindow(sessionId)
        if (liveSession() === sessionId) rebindMainComposer()
      }, 0)
    }

    function dockWindowRight(sessionId) {
      destroyWindow(sessionId)
      const id = tabIdFor(sessionId)
      if (id !== null) {
        try { sidebarRight?.hide?.(id) } catch { /* already gone */ }
      }
      try {
        sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'sidebar' })
      } catch (error) {
        console.warn('[conversation-float] could not dock the conversation:', error)
      }
    }

    /* ------------------------------------------------------- the taskbar */

    /** sessionId -> disposers for its sidebar row and the panel entry behind it. */
    const taskRows = new Map()

    /**
     * The left sidebar is the taskbar: one row per open window, named after its
     * Conversation. The row is a panel row, so it needs a main-panel entry to
     * select; that entry shows the window and hands the centre back.
     */
    function syncTaskbar() {
      if (ctxRef === null) return
      for (const [sessionId] of windows) {
        if (taskRows.has(sessionId)) continue
        const rowId = 'conversation-window:' + sessionId
        const label = sessionTitle(sessionId) ?? t('floatTitle')
        try {
          const disposePanel = ctxRef.slots.register({ name: 'main', key: rowId, locale: NS }, makeWindowPanel(sessionId))
          const disposeRow = ctxRef.slots.register(
            { name: 'sidebar.panellist', id: rowId, order: 20, label: () => label },
            DockIcon,
          )
          taskRows.set(sessionId, [disposePanel, disposeRow])
        } catch (error) {
          console.warn('[conversation-float] could not register the taskbar row:', error)
        }
      }
      for (const [sessionId, disposers] of [...taskRows]) {
        if (windows.has(sessionId)) continue
        taskRows.delete(sessionId)
        for (const off of disposers) {
          try { off() } catch { /* the slot may be gone */ }
        }
      }
    }

    /** Selecting a taskbar row shows that window and returns the centre. */
    function makeWindowPanel(sessionId) {
      return function WindowPanel() {
        React.useEffect(() => {
          showWindow(sessionId)
          try {
            layout?.selectPanel?.(null)
          } catch (error) {
            console.warn('[conversation-float] could not restore the conversation panel:', error)
          }
        }, [])
        return null
      }
    }

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

/* The float window: a layer of our own, drawn above the frame's columns. */
[data-dsh-conversation-float-window] {
  position: fixed; z-index: 20000;
  display: flex; flex-direction: column;
  min-width: 320px; min-height: 240px;
  background: var(--dsw-alias-bg-base, #fff);
  border: 1px solid var(--dsw-alias-border-l3, rgba(0, 0, 0, .14));
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, .28);
  overflow: hidden;
}
[data-dsh-conversation-float-window][hidden] { display: none; }
[data-dsh-conversation-float-window-grip] {
  flex: none; display: flex; align-items: center; gap: 4px;
  height: 34px; padding: 0 6px 0 12px;
  background: var(--dsw-alias-bg-layer-2, #f5f6f8);
  border-bottom: 1px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, .08));
  cursor: grab; user-select: none; touch-action: none;
  color: var(--dsw-alias-label-primary, #111);
}
[data-dsh-conversation-float-window-grip]:active { cursor: grabbing; }
[data-dsh-conversation-float-window-body] {
  flex: 1 1 auto; min-height: 0; min-width: 0; display: flex; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff); overflow: hidden;
}
[data-dsh-conversation-float-window-body] > * { flex: 1 1 auto; min-height: 0; min-width: 0; }
[data-dsh-conversation-float-window-resize] {
  position: absolute; right: 0; bottom: 0; width: 16px; height: 16px;
  cursor: nwse-resize; touch-action: none;
  background: linear-gradient(135deg, transparent 50%, var(--dsw-alias-border-l3, rgba(0, 0, 0, .22)) 50%);
}
[data-dsh-conversation-float-hide-pane] {
  visibility: hidden !important;
  pointer-events: none !important;
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
      const sessionId = liveSession()
      if (sessionId === null) return
      const win = windows.get(sessionId)
      if (win === undefined) {
        openFloating()
        return
      }
      if (win.el.hidden) showWindow(sessionId)
      else hideWindow(sessionId)
      notifyState()
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

    /**
     * A failing side-share must not take the float down with it.
     *
     * The hidden native header is a nicety: when DSH refuses to render it, the
     * window still has to open, so it is fenced off behind this boundary.
     */
    class FloatBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }
      static getDerivedStateFromError() {
        return { failed: true }
      }
      componentDidCatch(error) {
        console.warn('[conversation-float] fenced-off subtree failed:', error)
      }
      render() {
        return this.state.failed ? null : this.props.children
      }
    }

    /**
     * The floating tab's body.
     *
     * ONE Conversation has ONE view. Its draft writer is a single slot
     * (`bindDraftPersistence`): the view that mounts last takes the slot, and
     * when that view unmounts it clears the slot while the first view — still on
     * screen — can never bind again. The composer then accepts text that never
     * reaches the store, which is the reported "typing does nothing" bug.
     *
     * So this body renders a Conversation of its own only while the live one
     * belongs to another Session. For its own Session it hosts the LIVE middle
     * column — the same node the middle column shows — so the composer keeps the
     * writer it always had.
     */
    function SessionPanel(props) {
      const host = React.useRef(null)
      const sessionRef = React.useRef(null)
      /** Where the live column goes while this body hosts it. */
      const hostEl = React.useRef(null)
      /** The dock-kit float pane this body was last seen in. */
      const paneRef = React.useRef(null)
      const [portalTarget, setPortalTarget] = React.useState(null)
      const [epoch, setEpoch] = React.useState(0)
      /**
       * 'column'  the live middle column lives in this body
       * 'factory' this body renders a Conversation of a Session that is not live
       * 'empty'   the live Conversation is on screen as the middle column
       * null      the first layout pass has not decided yet — render NOTHING,
       *           because a factory view that mounts and unmounts for nothing
       *           would clear the draft slot on its way out.
       */
      const [mode, setMode] = React.useState(null)
      /** True while this body sits in a dock-kit float pane and has our window. */
      const [floating, setFloating] = React.useState(false)
      const content = React.useMemo(() => {
        if (typeof props.renderFactorySlot !== 'function') return null
        try {
          // 'embedded', not 'main': the embedded variant is the one DSH gives a
          // Conversation that lives outside the main root. Its stylesheet keys on
          // [data-content-phase=active] to let the message list grow and pin the
          // composer to the bottom; as 'main' the list is squashed and the
          // composer is pushed thousands of pixels out of the window.
          return props.renderFactorySlot('conversation.content', { variant: 'embedded', phase: 'active', hero: false })
        } catch (error) {
          console.warn('[conversation-float] could not render the conversation content:', error)
          return null
        }
      }, [props.renderFactorySlot])
      React.useLayoutEffect(() => {
        const container = host.current
        if (container === null) return undefined
        const sessionId = container.closest('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session') ?? null
        sessionRef.current = sessionId
        let timer = 0
        let disposed = false
        let seenPane = null
        const onEpoch = (id) => {
          if (id === sessionRef.current) setEpoch((value) => value + 1)
        }
        epochListeners.add(onEpoch)
        /**
         * DSH can move this very body between the float pane and a right-sidebar
         * page without remounting it, so the host is decided on every pass and
         * not once at mount.
         */
        const decide = () => {
          if (disposed) return
          const el = host.current
          if (el === null) return
          const pane = el.closest('[' + FLOAT_ATTR + ']')
          const paneChanged = pane !== seenPane
          seenPane = pane
          paneRef.current = pane
          let win = sessionId === null ? undefined : windows.get(sessionId)
          if (pane !== null && sessionId !== null) {
            let created = false
            if (win === undefined) {
              try {
                win = ensureWindow(sessionId)
                created = win !== undefined
              } catch (error) {
                console.warn('[conversation-float] could not lift the conversation into its window:', error)
                win = undefined
              }
            }
            if (win !== undefined) {
              pane.setAttribute(WINDOW_HIDE_PANE_ATTR, '')
              if (created || paneChanged) {
                showWindow(sessionId)
                paintWindowView(sessionId)
              }
            }
            setFloating(win !== undefined)
            setPortalTarget(win === undefined ? null : win.body)
          } else {
            if (win !== undefined) {
              // The tab left the float for a sidebar page: our window has no
              // tenant behind it any more, and a stray empty window is worse
              // than none at all.
              destroyWindow(sessionId)
              win = undefined
            }
            setFloating(false)
            setPortalTarget(null)
          }
          const mine = liveSession() === sessionId
          const shown = pane !== null && win !== undefined ? !win.el.hidden : true
          const target = pane !== null && win !== undefined ? win.body : el
          hostEl.current = target
          // A floated body always hosts the live column. A docked page hosts it
          // too when there is a column to host — that is what puts the real
          // header, and its Conversation/Trajectory tabs, inside the page.
          const next = !mine
            ? 'factory'
            : (pane !== null ? (shown ? 'column' : 'empty') : (findColumn() !== null ? 'column' : 'factory'))
          setMode((prev) => (prev === next ? prev : next))
          // Never re-append a column that is already inside: that would re-size
          // the float under the user's hand.
          if (next === 'column' && (movedColumn === null || !target.contains(movedColumn))) {
            try { attachColumn(target) } catch (error) {
              console.warn('[conversation-float] could not host the live column:', error)
            }
          }
        }
        decide()
        timer = window.setInterval(decide, 250)
        return () => {
          try {
            disposed = true
            if (timer !== 0) window.clearInterval(timer)
            epochListeners.delete(onEpoch)
            const pane = paneRef.current
            paneRef.current = null
            if (pane !== null) pane.removeAttribute(WINDOW_HIDE_PANE_ATTR)
            setPortalTarget(null)
            const gone = sessionRef.current
            sessionRef.current = null
            if (gone !== null) destroyWindow(gone)
          } catch (error) {
            console.warn('[conversation-float] window cleanup failed:', error)
          }
        }
      }, [])
      // Hosting the live column replaces the factory view: hand it back the
      // moment this Conversation stops being the one on screen.
      React.useLayoutEffect(() => {
        if (mode !== 'column') return undefined
        const target = hostEl.current
        if (target === null) return undefined
        if (movedColumn === null || !target.contains(movedColumn)) attachColumn(target)
        return () => {
          // Only take the column home while THIS body still holds it: a page
          // that has already adopted it must not lose it to a window teardown.
          if (movedColumn !== null && target.contains(movedColumn)) detachColumn()
        }
      }, [mode, portalTarget, floating])
      const hostProps = { className: 'dsw-host', ref: host, [BODY_ATTR]: '' }
      let body = null
      // A body only ever renders a Conversation of its OWN when that
      // Conversation is not the live one — hosting the live column replaces it.
      if (mode === 'factory') {
        if (floating) {
          if (portalTarget !== null) {
            body = ReactDOM.createPortal(h('div', { key: epoch, style: { display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, minWidth: 0, height: '100%' } }, content), portalTarget)
          }
        } else {
          body = content
        }
      }
      return h('div', hostProps, h(Styles), body)
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
        // Build marker: lets a probe tell a re-imported client.js from the copy
        // the host still holds in memory (a page refresh does NOT reload it).
        try { window.__dshFloatBuild = 'columnmode-13' } catch { /* no window yet */ }
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

        // The column watcher belonged to the build that borrowed the middle
        // column. Each window now owns its Conversation outright, so there is
        // no column to chase.
        void watchColumn

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
            // Each registration is fenced on its own: one refused registration
            // used to take the tab TYPE down with it, and a float that cannot
            // claim its tab cannot open at all.
            sub.effect(() => {
              try {
                return sub.sidebarRightTabs.register({
                  id: CHAT_ID,
                  kind: CHAT_KIND,
                  title: () => t('conversation'),
                  keepMounted: true,
                })
              } catch (error) {
                window.__dshFloatError = 'tab-type: ' + String(error && (error.stack || error))
                console.warn('[conversation-float] tab type refused:', error)
                return () => {}
              }
            })
            sub.effect(() =>
              sub.slots.inject('sidebar.right.pane.tab', () => {
                try {
                  return sub.slots.register({ name: 'sidebar.right.pane.tab', key: CHAT_ID, locale: NS }, SessionPanel)
                } catch (error) {
                  window.__dshFloatError = 'body: ' + String(error && (error.stack || error))
                  console.warn('[conversation-float] tab body refused:', error)
                  return () => {}
                }
              }),
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
          /** Test harness: the same moves the drag bands and the menus make. */
          moveRight: () => drop('right'),
          moveCentre: () => drop('centre'),
          /** Switch the page the Conversation shows (chat / trajectory). */
          switchView: (id) => switchConversationView(liveSession(), id),
          /** Probe: float the docked tab through the dock kit's own intent. */
          floatTab: () => floatExistingTab(),
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
        ctx.effect(() => {
          window.addEventListener('resize', reclampWindows)
          return () => window.removeEventListener('resize', reclampWindows)
        })

        // The header's selected page is DSH's, not ours: follow it while a
        // window is on screen so the chips never claim the wrong page.
        ctx.effect(() => {
          const timer = window.setInterval(() => {
            for (const [sessionId, win] of windows) {
              if (!win.el.hidden) paintWindowView(sessionId)
            }
          }, 1000)
          return () => window.clearInterval(timer)
        })

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
