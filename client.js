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
 * While the window is on screen it can be dragged onto three drop bands:
 *
 *   left    the window minimises — still mounted, hidden — and its taskbar row
 *           in the left sidebar brings it back; the centre column stays empty,
 *           exactly as it is while the window is on screen
 *   center  the window closes and the Conversation returns to its column
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
        "toMain": "将主对话",
        "switchTo": "切换到当前会话",
        "minimize": "收起浮窗",
        "close": "关闭浮窗",
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
        "toMain": "Main conversation: ",
        "switchTo": "Switch to this conversation",
        "minimize": "Minimize",
        "close": "Close",
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
        "toMain": "Hauptkonversation: ",
        "switchTo": "Zu dieser Konversation wechseln",
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
        "toMain": "Conversación principal: ",
        "switchTo": "Cambiar a esta conversación",
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
        "toMain": "Conversation principale : ",
        "switchTo": "Passer à cette conversation",
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
        "toMain": "メインの会話を",
        "switchTo": "この会話に切り替え",
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
        "toMain": "Conversa principal: ",
        "switchTo": "Mudar para esta conversa",
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
        "toMain": "Основная беседа: ",
        "switchTo": "Перейти к этой беседе",
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
    /** Set on a taskbar row's button, with the Session its window shows. */
    const ROW_MARK_ATTR = 'data-dsh-conversation-float-row'
    const CHAT_ID = 'conversation-float-panel'
    const CHAT_KIND = 'conversation-float-panel'
    /** A resource address our own tab type claims; the panel is opened by it. */
    const CHAT_ADDRESS = 'dsh-resource://conversation-float'
    /**
     * How long a band must be held before it draws and before it can land.
     *
     * This is the only wall clock the plugin keeps, and it is a HAND constant,
     * not a guess at a commit. On a touch screen every drag crosses a band —
     * the window is most of the width — so "drag" has to mean "move the window"
     * and "hold, then drag" means "move the Conversation". Shortening it makes
     * the guard against a stray brush weaker, and no device measurement here
     * shows the shorter hold surviving that; 1200ms stands until one does.
     */
    const DWELL_MS = 1200
    /** Marks the window whose hold has armed the bands. */
    const ARMED_ATTR = 'data-dsh-conversation-float-armed'

    /** The dock kit's own marker for a floating panel. */
    const FLOAT_ATTR = 'data-dockkit-float'
    /** Marks our own tab body, so the reconcile pass never reads another plugin's. */
    const BODY_ATTR = 'data-dsh-conversation-float-body'
    /** Marks the float that hosts our tab, so our rules hit no other panel. */
    const OWN_FLOAT_ATTR = 'data-dsh-conversation-float-float'
    /** Set on every frame column that the float is temporarily hiding. */
    const CHROME_ATTR = 'data-dsh-conversation-float-chromeless'
    /** Set on the one frame column this plugin has moved somewhere. */
    const COLUMN_ATTR = 'data-dsh-conversation-float-column'
    /**
     * Set on a body that renders a Session's own Conversation content instead of
     * hosting the live column. Such a body shows the transcript only: the one
     * composer belongs to the Session on screen.
     */
    const FACTORY_ATTR = 'data-dsh-conversation-float-factory'
    /** A live-Session factory view that keeps its header and composer. */
    const FACTORY_LIVE_ATTR = 'data-dsh-conversation-float-factory-live'

    let sidebarRight = null
    let layout = null
    let movedColumn = null
    let movedFrom = null
    /** Whether the rest of DSH is currently hidden behind the float. */
    let chromeless = false


    /** Re-render subscribers: the entry button says one thing per state. */
    const stateListeners = new Set()

    function notifyState() {
      for (const fn of stateListeners) fn()
    }
    /**
     * The layout tick: every mounted float body re-decides which host it is for.
     *
     * This runs when something that could change the answer happens — the
     * Session on screen changes, or the Session list does — instead of every
     * body polling on its own clock. Independent timers were what let two floats
     * race for the one column.
     */
    const layoutListeners = new Set()
    /** Set while a pass runs: the plugin's own DOM writes must not ask for one. */
    let inLayout = false
    /** Whether the main slot carried a page during the last pass. */
    let lastPageOpen = false
    /**
     * What one layout pass has already worked out.
     *
     * While a page owns the main slot the Conversation column is gone, so every
     * lookup of it degrades to a whole-document scan plus forced layout reads —
     * and every mounted body asked three times in the same pass. One pass has
     * one answer; anything that moves the column drops it.
     */
    let passMemo = null
    /** Whether this pass moved the Conversation between hosts. */
    let columnMovedInPass = false
    function beginPass() {
      passMemo = { column: null, columnKnown: false, live: null, liveKnown: false, page: false, pageKnown: false }
      columnMovedInPass = false
    }
    function endPass() {
      passMemo = null
    }
    /**
     * Note that this pass moved the Conversation between hosts.
     *
     * A move keeps the node and the Session it shows, so the memo survives it:
     * only forgetColumn() drops a column, and that is where the memo is cleared.
     */
    function noteColumnMoved() {
      columnMovedInPass = true
    }
    function notifyLayout() {
      if (inLayout) return
      // Retried on every pass rather than on a timer: until the workspace
      // service is up there is nothing to subscribe to, and a pass is exactly
      // what happens when anything else changes.
      followSelection()
      const pageOpen = mainPanelOpen()
      const pageChanged = pageOpen !== lastPageOpen
      lastPageOpen = pageOpen
      // A page owns the main slot: the Conversation is not on screen, the column
      // is home and every body already shows its own transcript. Nothing a pass
      // could decide is different until the page closes — and that transition is
      // what the flag above catches.
      if (pageOpen && !pageChanged) return
      inLayout = true
      beginPass()
      try {
        // Repair the host first: every body below decides from "the Session on
        // screen", and a column parked in a page the window has left answers
        // that question with the old Conversation.
        try {
          reconcileLiveColumn()
        } catch (error) {
          report('[conversation-float] column reconcile failed:', error)
        }
        for (const listener of [...layoutListeners]) {
          try {
            listener()
          } catch (error) {
            report('[conversation-float] layout pass failed:', error)
          }
        }
        // The pass may have moved the Conversation between hosts, and a copy that
        // left in the same breath can take the composer's editor with it. A pass
        // that moved nothing cannot have broken it, so the subtree query that
        // looks for the composer stays out of the common case.
        if (columnMovedInPass) {
          try {
            healComposer()
          } catch (error) {
            report('[conversation-float] composer heal failed:', error)
          }
        }
        refreshSwitchChips()
      } finally {
        inLayout = false
        endPass()
      }
    }
    /** Set when the hide was requested before the float finished mounting. */
    let pendingChromeless = false
    /** The last sane band geometry, kept for when the columns are hidden. */
    let lastBand = null
    /** Sidebar state captured when the float opened; restored when it closes. */
    let savedChrome = null
    /**
     * A retry of the sidebar arrangement, cancelable by the user's own hand.
     *
     * This replaced a time window that claimed to suppress "changes the plugin
     * caused": nothing ever read that window, so the promise in the comment was
     * never kept. A hand on the sidebars now ends the retry directly.
     */
    let chromeApplyStop = null
    /** Set while docking to the right sidebar: the column is not going home. */
    let dockingRight = false
    /** Set when a minimise is waiting for the float that carries the column. */
    let pendingMinimise = false
    /** The Session list projection, when the Client exposes it. */
    let sessions = null
    /** Set while the float is being reopened from the drawer. */
    let suspendRestore = false
    /** The drop preview overlay, created on demand. */
    let preview = null

    /* ------------------------------------------------------------- timing */

    /*
     * Two kinds of waiting live here, and they are not the same thing.
     *
     * A duration that measures a HAND — the hold that arms the drop bands
     * ({@link DWELL_MS}) — cannot be replaced by anything: the decision is the
     * user's, and only the clock knows when it was made.
     *
     * A duration that guesses when another system commits is the fragile kind:
     * it expires early on a busy frame and late on an idle one. Those waits are
     * written as the condition they want and re-read once per frame
     * ({@link untilFrame}), so they end the frame the commit arrives.
     *
     * There are no settle durations left either. A step that has to follow a
     * close defers with queueMicrotask, which is "after this commit" without a
     * duration: later than the unmount, earlier than any input. The touch hold
     * below is the only wall clock in the plugin.
     */

    /** Frame-driven waits owned by the plugin instance; they die with it. */
    const pendingWaits = new Set()

    function cancelWaits() {
      for (const stop of [...pendingWaits]) stop()
      pendingWaits.clear()
    }

    /**
     * Re-read `check` every frame until it returns true, then call `then`.
     *
     * `deadlineMs` is a backstop for a condition that can never come true (the
     * Session was closed mid-flight), never the way a normal wait ends.
     *
     * @param check    read once per frame; true ends the wait
     * @param then     run on the frame the condition holds
     * @param deadlineMs when to give up, and `onExpire` what to do instead
     */
    function untilFrame(check, then, deadlineMs = 2000, onExpire = null) {
      const started = performance.now()
      let raf = 0
      let done = false
      const stop = () => {
        if (done) return
        done = true
        pendingWaits.delete(stop)
        if (raf !== 0) window.cancelAnimationFrame(raf)
      }
      const step = () => {
        raf = 0
        if (done) return
        let ok = false
        try { ok = check() === true } catch { ok = false }
        if (ok) {
          stop()
          try { then?.() } catch (error) { report('[conversation-float] a deferred step failed:', error) }
          return
        }
        if (performance.now() - started > deadlineMs) {
          stop()
          try { onExpire?.() } catch (error) { report('[conversation-float] a deferred fallback failed:', error) }
          return
        }
        raf = window.requestAnimationFrame(step)
      }
      pendingWaits.add(stop)
      raf = window.requestAnimationFrame(step)
      return stop
    }

    /**
     * The plugin's single diagnostic sink.
     *
     * Every failure in this file used to end at console.warn, which is fine to
     * write and impossible to read back: a band that silently did nothing left
     * no trace a user could hand over. Keeping the last one lets diag() report
     * what actually went wrong.
     */
    /** Whether a page asked for the mutating probe surface. */
    function floatDebugEnabled() {
      try {
        if (window.__dshFloatDebug === true) return true
        return /[?&]dshFloatDebug=1\b/.test(window.location.search)
      } catch {
        return false
      }
    }

    function report(...args) {
      try {
        window.__dshFloatLastError = {
          at: Date.now(),
          text: args.map((value) => (value && value.stack) || String(value)).join(' '),
        }
      } catch { /* no window yet */ }
      console.warn(...args)
    }

    /* ------------------------------------------------------- the live column */

    /**
     * The frame column that carries the Conversation. An ANCESTOR is moved, never
     * the Conversation node itself: React keeps child lists inside the nodes it
     * owns, so pulling one of those children out of its parent breaks the next
     * reconciliation — a Session switch then renders nothing at all. Moving the
     * column keeps every list inside the moved subtree intact.
     */
    function findColumn() {
      if (passMemo !== null && passMemo.columnKnown) return passMemo.column
      const column = movedColumn !== null && movedColumn.isConnected ? movedColumn : scanColumn()
      if (passMemo !== null) {
        passMemo.column = column
        passMemo.columnKnown = true
      }
      return column
    }

    /**
     * The frame's own Conversation column, read without trusting the record of
     * which node this plugin moved.
     *
     * A Session switch can take the column we were holding out of the document
     * (DSH unmounts the Session and draws the next one), and the record then
     * names a node nobody can see. Every repair below has to be able to ask
     * "what does the frame say right now", and this is how it asks.
     */
    function scanColumn() {
      // The window renders a Conversation of its own. That one is never the
      // middle column this helper is looking for, so it is skipped by name.
      const insideOurs = (el) => el !== null && el.closest(`[${WINDOW_ATTR}]`) !== null
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
        report('[conversation-float] could not size the floating panel:', error)
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
      if (!keepHome || movedFrom === null) {
        const parent = column.parentNode
        // Any host counts, not just a window: a docked page is retained the same
        // way and can be closed at any moment. The seat worth remembering is the
        // frame's, never the host it is leaving.
        const fromHost = parent !== null && typeof parent.closest === 'function'
          && (parent.closest(`[${WINDOW_ATTR}]`) !== null || parent.closest(`[${BODY_ATTR}]`) !== null)
        if (fromHost) {
          const seat = homeSeat(null)
          movedFrom = seat === null ? null : { parent: seat.parent, next: seat.before }
        } else {
          movedFrom = { parent, next: column.nextSibling }
        }
      }
      movedColumn = column
      column.setAttribute(COLUMN_ATTR, '')
      column.style.width = "100%"
      column.style.height = "100%"
      column.style.minWidth = "0"
      column.style.minHeight = "0"
      column.style.overflow = "hidden"
      container.appendChild(column)
      noteColumnMoved()
      const ownPanel = floatPanel()
      if (ownPanel !== null) ownPanel.setAttribute(OWN_FLOAT_ATTR, '')
      // The dock kit gives a new float its own seat; ask it — through the same
      // intent its own resize drag uses — for the configured one.
      sizeFloat()

      // A host has taken the column, so a docking that was waiting for its tab
      // has arrived: the restore guard must not outlive it.
      dockingRight = false

      // The left-hand action asked for the conversation while no float existed.
      // The body is mounted in a layout effect — before paint — so minimising
      // here means the window is never painted on its way out.
      if (pendingMinimise && flushPendingMinimise()) return column

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
      if (passMemo !== null && passMemo.pageKnown) return passMemo.page
      const slot = document.querySelector('[data-slot="main"]')
      let open = false
      if (slot !== null) {
        for (const child of slot.children) {
          if (child.getAttribute('data-slot') === 'main.conversation') continue
          open = true
          break
        }
      }
      if (passMemo !== null) {
        passMemo.page = open
        passMemo.pageKnown = true
      }
      return open
    }

    /* --------------------------------------------------------- internals */
    /*
     * DSH internals adapter: the only places this plugin reads something DSH
     * does not publish. Keeping them named in one block means an upgrade has
     * one place to look instead of five:
     *
     *   1. the Lexical editor, reached through the React fiber of its box
     *      (composerEditor)
     *   2. editor.setRootElement, the only way to give that editor its box back
     *      (healComposer)
     *   3. conversation.input.shell(id).persistDraft, the Session's single draft
     *      slot (guardDraftWriter)
     *
     * compatReport() probes all three; diag() reports it. A build that lost one
     * of them should say so on the first diagnostic rather than on the first
     * keystroke that goes nowhere.
     */

    /* ------------------------------------------------------ the live composer */

    /**
     * The Lexical editor behind a composer box, read off the box itself.
     *
     * The composer does not own its editable surface: `ComposerContentEditable`
     * hands the same editor a DOM node (`editor.setRootElement(el)`) on mount
     * and `null` on unmount, and one editor can only ever have one root. The
     * box therefore reports the editor that renders into it, which is the only
     * handle this plugin needs.
     */
    function composerEditor(box) {
      const key = Object.keys(box).find((name) => name.startsWith('__reactFiber$'))
      if (key === undefined) return null
      let fiber = box[key]
      for (let depth = 0; fiber && depth < 24; depth += 1, fiber = fiber.return) {
        const props = fiber.memoizedProps
        if (props && props.editor && typeof props.editor.setRootElement === 'function') return props.editor
      }
      return null
    }

    /**
     * Give the composer on screen its editor back.
     *
     * A Session's input is one shell with one editor. Our window renders a
     * transcript of a Session that is not the live one, and that copy mounts a
     * composer of its own on the SAME editor; when the copy goes away it calls
     * `setRootElement(null)`, and the composer the user is now looking at is a
     * dead box: it keeps whatever text was left in it, typing never reaches the
     * shell, and the draft the send button reads is the one the shell had before
     * the switch. Nothing in DSH re-attaches it, because the surviving composer
     * never remounted — its DOM was moved, not rendered. Re-attaching the editor
     * is what heals it, and the shell's own document (the persisted draft) comes
     * back with it.
     *
     * @returns whether the editor had to be re-attached
     */
    function healComposer() {
      // The composer that needs healing belongs to the Conversation ON SCREEN,
      // and that is not always the column this plugin moved: while the live
      // Session sits in the middle column, a window's copy can take the editor
      // and the plugin holds nothing at all. Reading only `movedColumn` healed
      // the case that cannot happen and skipped the one that does.
      const column = (movedColumn !== null && movedColumn.isConnected) ? movedColumn : findColumn()
      if (column === null || !column.isConnected) return false
      const sessionId = columnSession(column) ?? selectedSession()
      if (sessionId === null) return false
      let changed = false
      const seat = column.querySelector('[data-composer-seat]')
      const box = seat === null
        ? null
        : [...seat.querySelectorAll('[contenteditable]')].find((el) => el.getAttribute('contenteditable') !== 'false') ?? null
      if (box !== null) {
        const editor = composerEditor(box)
        if (editor !== null) {
          let root = box
          try {
            root = editor.getRootElement()
          } catch {
            root = box
          }
          if (root !== box) {
            try {
              editor.setRootElement(box)
              changed = true
            } catch (error) {
              report('[conversation-float] could not re-attach the composer:', error)
            }
          }
        }
      }
      try {
        if (guardDraftWriter(sessionId)) changed = true
      } catch (error) {
        report('[conversation-float] could not restore the draft writer:', error)
      }
      return changed
    }

    /** sessionId -> { shell, write }: the draft writer bound while this Session was live. */
    const liveDraftWriters = new Map()

    /** Which of the three published-nowhere hooks are present right now. */
    function compatReport() {
      const column = findColumn()
      const seat = (column ?? document).querySelector('[data-composer-seat]')
      const box = seat === null
        ? null
        : [...seat.querySelectorAll('[contenteditable]')].find((el) => el.getAttribute('contenteditable') !== 'false') ?? null
      const editor = box === null ? null : composerEditor(box)
      let shellOk = false
      try {
        const conversation = typeof ctxRef?.get === 'function' ? ctxRef.get('conversation') : null
        const id = columnSession(column ?? document.body) ?? selectedSession()
        const shell = id === null || conversation === null || conversation === undefined ? null : conversation.input?.shell?.(id)
        shellOk = shell !== null && shell !== undefined && typeof shell.bindDraftPersistence === 'function'
      } catch {
        shellOk = false
      }
      return {
        fiberEditor: editor !== null,
        setRootElement: editor !== null && typeof editor.setRootElement === 'function',
        draftShell: shellOk,
      }
    }

    /** The Session's input shell — the one object holding its editor and draft slot. */
    function draftShellOf(sessionId) {
      try {
        const conversation = typeof ctxRef?.get === 'function' ? ctxRef.get('conversation') : null
        const shell = conversation === null || conversation === undefined
          ? null
          : conversation.input?.shell?.(sessionId)
        return shell !== null && shell !== undefined && typeof shell.bindDraftPersistence === 'function' ? shell : null
      } catch (error) {
        return null
      }
    }

    /**
     * Put the Session's draft writer back after a copy cleared it.
     *
     * The writer is a single field on the input shell (`persistDraft`), and a
     * cleared field is how the draft stops reaching storage while the composer
     * still looks alive. The writer DSH bound while this Session was the one on
     * screen is the right one: it writes the draft into the Conversation store
     * the reload path and the send button read. It is only ever put back into an
     * EMPTY slot — a writer DSH has bound since is never replaced, so a
     * remounted composer keeps its own.
     *
     * @returns whether the slot had to be filled
     */
    function guardDraftWriter(sessionId) {
      const shell = draftShellOf(sessionId)
      if (shell === null) return false
      const current = shell.persistDraft
      const known = liveDraftWriters.get(sessionId)
      if (current !== undefined && current !== null) {
        if (known === undefined || known.shell !== shell) {
          liveDraftWriters.set(sessionId, { shell, write: current })
          capSessionMap(liveDraftWriters)
        }
        return false
      }
      if (known === undefined || known.shell !== shell) return false
      try {
        shell.persistDraft = known.write
      } catch (error) {
        return false
      }
      return true
    }

    /**
     * Re-attach the composer now, and again once the layout has settled.
     *
     * The copy that steals the editor goes away a commit after the pass that
     * notices the Session is live again, so one attempt can land before the
     * thief has finished leaving.
     */
    function healComposerSoon() {
      const heal = () => {
        try { healComposer() } catch (error) { report('[conversation-float] composer heal failed:', error) }
      }
      heal()
      // The copy that steals the editor goes away a commit after the pass that
      // notices the Session is live again, so one attempt can land before the
      // thief has finished leaving. Waiting on the editor ends the wait on the
      // frame it is back; the three fixed delays it used to have expired before
      // or after that commit depending on how busy the frame was.
      const box = liveComposerBox()
      if (box === null) return
      untilFrame(() => {
        heal()
        return editorAttachedTo(box)
      }, null, 1200)
    }

    /** The contenteditable of the Conversation on screen, wherever it lives. */
    function liveComposerBox() {
      const column = (movedColumn !== null && movedColumn.isConnected) ? movedColumn : findColumn()
      const root = column ?? document
      const seat = root.querySelector('[data-composer-seat]')
      if (seat === null) return null
      return [...seat.querySelectorAll('[contenteditable]')]
        .find((el) => el.getAttribute('contenteditable') !== 'false') ?? null
    }

    /** Whether the editor that renders into `box` is attached to it right now. */
    function editorAttachedTo(box) {
      if (box === null) return false
      const editor = composerEditor(box)
      if (editor === null) return false
      try { return editor.getRootElement() === box } catch { return false }
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
      // close button started it. Nothing has to be suppressed for that: the
      // restore below compares against a snapshot taken before the float
      // opened, so a re-rail cannot be mistaken for the user's arrangement.
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
      noteColumnMoved()
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
        // ...unless nothing else shows this Conversation any more: then the node
        // left the document with the window that hosted it, and putting it back
        // in the frame beats a blank screen that never comes back.
        //
        // The test used to be a plain `[data-conversation-session]` query, which
        // every float's own transcript copy answers as well — so with one other
        // window open the rescue never fired and the screen stayed blank for
        // good. Only a column the frame could actually use may count as a
        // survivor.
        if (scanColumn() === null) {
          const seat = homeSeat(home)
          if (seat !== null) {
            markDetach('rescued')
            seat.parent.insertBefore(column, seat.before)
          }
        }
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

    /** Every mounted body of our own tab: one per right-sidebar Session. */
    function dockedHosts() {
      const hosts = []
      for (const host of document.querySelectorAll(`[data-sidebar-right-tab] [${BODY_ATTR}]`)) {
        // The floating panel's body is not a docked one.
        if (host.closest(`[${FLOAT_ATTR}]`) === null) hosts.push(host)
      }
      return hosts
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

    /** When the recorded column was first seen outside the document, in ms. */
    let columnOrphanedAt = 0
    /** The last Session the live Conversation was seen showing. */
    let lastSession = null
    /**
     * The Session the live Conversation is showing right now. It falls back to
     * the last one seen: opening a main panel takes the Conversation down for a
     * commit, and the drawer row press has to know which Conversation it means.
     */
    function liveSession() {
      // Read through findColumn(), never `movedColumn ?? ...`: a recorded node
      // that has left the document still answers columnSession() with the
      // Session it used to show, and that freezes every decision on a
      // Conversation the user already left.
      if (passMemo !== null && passMemo.liveKnown) return passMemo.live
      const column = findColumn()
      let answer = null
      const shown = column === null ? null : columnSession(column)
      if (shown !== null) {
        answer = shown
      } else {
        // A docked page can be the Conversation's only home; its Session is the
        // one on screen and the entry must still find it.
        const docked = dockedBodySession()
        answer = docked !== null ? docked : lastSession
      }
      if (answer !== null) lastSession = answer
      if (passMemo !== null) {
        passMemo.live = answer
        passMemo.liveKnown = true
      }
      return answer
    }

    /** Set while a deferred layout pass is already queued. */
    let kickScheduled = false
    /**
     * Queue one layout pass once the browser has committed the current frame.
     *
     * Two frames, not one: DSH writes the current Session, then React commits the
     * column for it. A pass that runs between the two sees the old nodes.
     */
    function kickLayout(frames = 2) {
      if (kickScheduled) return
      kickScheduled = true
      const run = () => {
        kickScheduled = false
        notifyLayout()
      }
      // A page taking or leaving the slot swaps whole subtrees and has no Session
      // commit to wait behind: one frame is enough there. A Session switch writes
      // its store before React commits the column, so that one keeps the second.
      if (frames >= 2) window.requestAnimationFrame(() => window.requestAnimationFrame(run))
      else window.requestAnimationFrame(run)
    }

    /**
     * Subscribe to the one store that says which Session is on screen.
     *
     * The service may not be up when this plugin mounts, so the subscription is
     * taken as soon as it can be: once here, and again on every layout pass until it
     * takes. A Session switch then reaches every float in the same task it
     * happens in, instead of waiting for a tick.
     */
    let followingSelection = false
    function followSelection() {
      if (followingSelection) return
      let selection = null
      try {
        const workspace = typeof ctxRef?.get === 'function' ? ctxRef.get('uiWorkspace') : null
        selection = workspace === null || workspace === undefined ? null : workspace.selection ?? null
      } catch (error) {
        return
      }
      if (selection === null || typeof selection.subscribe !== 'function') return
      followingSelection = true
      try {
        // The store is written before React commits the new Session's DOM, so the
        // pass waits for the frame to be painted: deciding against the previous
        // Session's nodes is exactly how a column ends up parked.
        selection.subscribe(() => kickLayout())
      } catch (error) {
        followingSelection = false
        report('[conversation-float] could not follow the current Session:', error)
      }
    }

    /**
     * The Session DSH itself says is on screen.
     *
     * The workspace navigation service keeps exactly one answer, in one store
     * (`uiWorkspace.selection`, persisted as `dsh.sessions.current`), and writes
     * it on every Session switch. It is the only source that does not depend on
     * a column node this plugin may be holding somewhere off screen.
     */
    function selectedSession() {
      try {
        const workspace = typeof ctxRef?.get === 'function' ? ctxRef.get('uiWorkspace') : null
        const snapshot = workspace === null || workspace === undefined ? null : workspace.selection?.getSnapshot?.()
        const id = snapshot?.sessionId
        return typeof id === 'string' && id !== '' ? id : null
      } catch (error) {
        return null
      }
    }

    /**
     * The container that should carry this Session's Conversation, if one exists:
     * its window's body, or the right-sidebar page DSH is showing for it. Null
     * means there is nowhere but the middle column.
     */
    function hostForSession(sessionId) {
      if (sessionId === null) return null
      const win = windows.get(sessionId)
      if (win !== undefined) return win.body
      for (const host of dockedHosts()) {
        if (host.closest(`[${FLOAT_ATTR}]`) !== null) continue
        if (!hostOnScreen(host)) continue
        const owner = hostSession(host)
        if (owner === null || owner === sessionId) return host
      }
      return null
    }

    /**
     * Hand the column to whoever should carry this Session, in ONE move.
     *
     * Parking it at home first and letting the next body pick it up later is what
     * the eye sees as "it jumps to the middle on every switch": the two moves land
     * in different passes. A host that already exists takes it directly; only a
     * Session with no host at all sends the column home.
     *
     * @returns whether the column was moved
     */
    function handOffColumn(sessionId) {
      const host = hostForSession(sessionId)
      if (host !== null) {
        if (movedColumn !== null && host.contains(movedColumn)) return false
        try {
          attachColumn(host, movedColumn !== null)
        } catch (error) {
          report('[conversation-float] could not hand the conversation over:', error)
        }
        return true
      }
      detachColumn(true)
      return true
    }

    /**
     * Hand the Conversation back when the host it was moved into stops being it.
     *
     * The right sidebar keeps one page per Session and hides the rest, so a
     * Conversation docked there stays inside a page the window has left. Reading
     * that page's Session as "the one on screen" used to freeze the plugin on
     * the old Conversation: the float of the new one never took the column, so
     * the page tabs and the composer stayed behind in the sidebar, the middle
     * column stayed empty, and closing anything afterwards left a blank page.
     *
     * Three states have to be told apart, because the answer is not the same:
     *
     *   our own window, or a dock-kit float   the column lives there on purpose
     *   the frame's middle column             it is already home
     *   a docked page of another Session      taken back (see below)
     *
     * "Taken back" is either a release — when DSH has already drawn a column of
     * its own, ours is a leftover and putting it beside the live one would show
     * the same Conversation twice — or a detach, when ours is still the only
     * Conversation surface there is.
     *
     * @returns whether anything was repaired
     */
    function reconcileLiveColumn() {
      const column = movedColumn
      if (column === null) {
        columnOrphanedAt = 0
        return false
      }
      if (!column.isConnected) {
        // DSH took the node down with the Session it belonged to. If it has
        // drawn a column of its own, ours is a leftover and has to be dropped —
        // putting it back would show the old Conversation beside the new one.
        if (scanColumn() !== null) {
          columnOrphanedAt = 0
          forgetColumn(column, false)
          return true
        }
        // Nothing shows the Conversation at all. The frame may be one commit
        // away from drawing it, so give it a moment before rescuing ours: a
        // rescue that races the frame's own column leaves two of them.
        if (columnOrphanedAt === 0) {
          columnOrphanedAt = Date.now()
          return false
        }
        if (Date.now() - columnOrphanedAt < 700) return false
        columnOrphanedAt = 0
        detachColumn(true)
        return true
      }
      columnOrphanedAt = 0
      if (column.closest(`[${WINDOW_ATTR}]`) !== null) return false
      if (column.closest(`[${FLOAT_ATTR}]`) !== null) return false
      const page = column.closest('[data-sidebar-right-session]')
      if (page === null) return false
      const owner = page.getAttribute('data-sidebar-right-session')
      const live = selectedSession() ?? dockedBodySession()
      if (live === null || owner === null || owner === live) return false
      // A tab can belong to a subagent chat, which is addressed rather than
      // named: such an address is not a Session, so a mismatch with it means
      // nothing and must not take the column away.
      if (!knownSession(owner) || !knownSession(live)) return false
      const fresh = scanColumn()
      if (fresh !== null && fresh !== column) {
        forgetColumn(column, true)
        return true
      }
      // Straight to whatever should carry the Session we switched to — never
      // through the middle column, which is the visible "jump".
      handOffColumn(live)
      return true
    }

    /** Whether an id names a Session the list knows (or the list is unreadable). */
    function knownSession(id) {
      try {
        const byId = sessions?.list?.getSnapshot?.()?.byId
        if (byId === undefined || byId === null) return true
        return Object.prototype.hasOwnProperty.call(byId, id)
      } catch (error) {
        return true
      }
    }

    /**
     * Let go of a column without putting it back.
     *
     * @param column     the node the bookkeeping names, which may already be gone
     * @param discardDom also take it out of the tab body it sits in. Only for a
     *                   leftover: DSH has drawn a column of its own, so this one
     *                   is a copy nothing renders into any more, and keeping it
     *                   would show two Conversations the next time that page is
     *                   opened.
     */
    function forgetColumn(column, discardDom) {
      if (movedColumn === column) {
        movedColumn = null
        movedFrom = null
      }
      if (column === null) return
      column.removeAttribute(COLUMN_ATTR)
      column.style.width = ''
      column.style.height = ''
      column.style.minWidth = ''
      column.style.minHeight = ''
      column.style.overflow = ''
      if (discardDom && column.isConnected && column.closest(`[${BODY_ATTR}]`) !== null) column.remove()
      noteColumnMoved()
      // The column is gone: no pass may keep answering with it.
      if (passMemo !== null) {
        passMemo.columnKnown = false
        passMemo.liveKnown = false
      }
      notifyState()
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
      if (win === undefined || win.el.hidden) return t('floatTitle')
      return chromeless ? t('showDsh') : t('hideDsh')
    }

    function setChromeless(next) {
      if (next) {
        // The float mounts asynchronously: hiding before it exists would hide
        // every column, including the one that is about to host it. Our own
        // window is not a dock-kit float, so both count as "something to keep".
        if (floatPanel() === null && windows.size === 0) {
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
      // The columns are opened by the plugin, and a hand on them ends any retry
      // this pass started (see the pointerdown tracker in apply()), so the
      // user's own first click is never swallowed by a settle window.
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
        report('[conversation-float] could not expand the left sidebar:', error)
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
        report('[conversation-float] could not restore the right sidebar:', error)
      }
      try {
        if (wantLeft !== null && wantLeft !== leftCollapsed()) {
          matched = false
          layout?.toggleSidebar?.()
        }
      } catch (error) {
        report('[conversation-float] could not restore the left sidebar:', error)
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
        if (movedColumn !== null) return
        // The panel is still on its way out; give it a few frames.
        if (floatPanel() !== null) {
          if (depth < 12) scheduleRestoreChrome(depth + 1)
          return
        }
        restoreChrome()
      })
    }

    /** The pair a reveal or a close puts back: the snapshot taken on open. */
    function restoreTarget() {
      return savedChrome
    }

    /** Match the sidebars to a target, retrying while the dock kit settles. */
    function applyChromeTarget(target) {
      // A toggle the dock kit queued needs a commit to land, so a retry fired
      // before that commit reads the old state and toggles straight back. The
      // retry therefore waits for the sidebars to STOP MOVING before it fires,
      // instead of firing on a fixed 200ms beat that was both too early (double
      // toggles) and too late (a visible lag on close).
      let attempts = 0
      let seen = null
      let stable = 0
      const apply = () => {
        if (chromeMatches(target)) return true
        attempts += 1
        if (attempts > 3) return true
        applyChromeSnapshot(target)
        return false
      }
      if (apply()) return
      chromeApplyStop = untilFrame(() => {
        if (chromeMatches(target)) return true
        const now = JSON.stringify(chromeNow())
        if (now === seen) stable += 1
        else { seen = now; stable = 0 }
        return stable >= 3 && apply()
      }, null, 3000)
    }

    /** Whether the sidebars already stand where `target` wants them. */
    function chromeMatches(target) {
      if (target === null || target === undefined) return true
      const now = chromeNow()
      const wantRight = target.rightExpanded
      const wantLeft = target.leftCollapsed
      const rightOk = wantRight === null || wantRight === undefined ? true : now.rightExpanded === (wantRight === true)
      const leftOk = wantLeft === null || wantLeft === undefined ? true : now.leftCollapsed === wantLeft
      return rightOk && leftOk
    }

    function restoreChrome() {
      const target = restoreTarget()
      savedChrome = null
      if (target === null) return
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
          // The new body must mount against a tree the old tab has left, so the
          // open waits for the tab to be gone rather than for 60ms to pass.
          // Close first, then open into the freed slot. The microtask is the
          // whole ordering guarantee: it runs after the commit that unmounts
          // the closed body, and before anything the user can see or press.
          queueMicrotask(() => {
            try {
              sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'float' })
            } catch (error) {
              report('[conversation-float] could not open the floating tab:', error)
            }
          })
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
        report('[conversation-float] could not open the floating tab:', error)
      }
      notifyState()
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

    /** A Conversation's stored title, as the sidebars and windows show it. */
    function sessionTitle(id) {
      if (id === null) return null
      try {
        const title = sessions?.list?.getSnapshot?.()?.byId?.[id]?.title
        return typeof title === 'string' && title.trim() !== '' ? title.trim() : null
      } catch {
        return null
      }
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

    /**
     * The band's caption for the window under the hand.
     *
     * A band moves the Conversation on screen, never the window the hand holds:
     * dragging a second float says nothing about which Conversation goes where.
     * So the outline names its cargo — the main one — whenever the window being
     * dragged is not itself that Conversation.
     *
     * @param zone the band under the pointer
     * @param own  whether the dragged window carries the Conversation on screen
     */
    function previewLabel(zone, own) {
      const label = zoneLabel(zone)
      return own ? label : t('toMain') + label
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
    function showPreview(zone, band, own = true) {
      if (preview === null) {
        const el = document.createElement('div')
        el.className = 'dsw-preview'
        const label = document.createElement('span')
        label.className = 'dsw-preview-label'
        el.appendChild(label)
        document.body.appendChild(el)
        preview = { el, label, zone: null, own: true }
      }
      // The caption changes with OWNERSHIP as well as with the band: the same
      // band dropped from another window names a different Conversation.
      if (preview.zone === zone && preview.own === own) return
      // The outline marks the band the window will land in, so it has to sit
      // ABOVE every float window. The windows live in a band that starts at
      // 20000 and climbs as they are raised, so the outline takes the current
      // ceiling plus a margin instead of a fixed number that goes stale.
      preview.el.style.zIndex = String(Math.min(windowZ + 10, 950))
      if (preview.el.style.display === 'none') preview.el.style.display = ''
      preview.zone = zone
      preview.own = own
      const [left, top, width, height] = previewRect(zone, band)
      preview.el.style.transform = `translate3d(${left}px, ${top}px, 0)`
      preview.el.style.width = `${width}px`
      preview.el.style.height = `${height}px`
      preview.label.textContent = previewLabel(zone, own)
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

    /**
     * Finish a stow that was asked for before its float existed. The first
     * request arrives while the conversation is still a docked tab — the tab's
     * body is retained, so floating it does NOT remount the body and
     * {@link attachColumn} never runs again. Without this the request would sit
     * in `pendingMinimise` forever: the conversation would come back on screen
     * instead of being put away, which is what the menu entry promised.
     *
     * @returns whether the window was minimised.
     */
    function flushPendingMinimise() {
      if (!pendingMinimise) return false
      const panel = floatPanel()
      if (panel === null) return false
      // A float of another Session cannot host this Conversation.
      if (!floatHostsSession(panel, liveSession())) return false
      pendingMinimise = false
      pendingChromeless = false
      // Minimise, not stow: the drawer row this used to build belonged to the
      // dock-kit panel of the old architecture. A window's taskbar row already
      // exists from the moment it opens, so hiding it IS the left-hand action.
      const shown = liveSession()
      if (shown === null || !windows.has(shown)) return false
      hideWindow(shown)
      if (chromeless) revealChrome()
      notifyState()
      return true
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
        report('[conversation-float] could not close the tab:', error)
        return false
      }
    }

    /**
     * The left band, asked of whichever host the main Conversation has.
     *
     * A band always acts on the Conversation on screen, never on the window the
     * hand happens to hold, so this has to work from all three seats it can be
     * in:
     *
     *   its own window     minimised — still mounted, hidden, its taskbar row
     *                      in the left sidebar is the way back
     *   a docked tab       floated, then minimised the moment its body mounts
     *   the middle column  the same: a window is opened and put away at once
     *
     * It used to read "no window, so close it" — which closed nothing while the
     * Conversation sat in the middle, and only sent it back to the middle when
     * it was docked. A drop on the left band then never reached the left.
     */
    function stowLiveConversation() {
      const shown = liveSession()
      if (shown !== null && windows.has(shown)) {
        hideWindow(shown)
        notifyState()
      } else if (floatPanel() !== null) {
        // A float this build did not create: closing it is all that is left.
        closeFloat()
      } else {
        // No window of its own yet. Opening one and minimising it before its
        // first paint is exactly what the sidebar's own row does.
        pendingMinimise = true
        openFloating()
      }
      // A minimised float must not leave an empty screen behind: the rest of
      // DSH only comes back if the float was the thing hiding it.
      if (chromeless) revealChrome()
    }

    function drop(zone) {
      if (zone === 'right') {
        dockingRight = true
        // The float leaves as an ordinary right-sidebar tab. The sidebar
        // snapshot belonged to the float: keeping it would let a close of that
        // tab — possibly hours later — move the sidebars back in time.
        savedChrome = null
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
        // Same ordering rule as the float: after the unmount commit, nothing
        // visible in between.
        queueMicrotask(() => {
          try {
            sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'sidebar' })
          } catch (error) {
            report('[conversation-float] could not dock to the right sidebar:', error)
          }
        })
        return
      }
      if (zone === 'left') {
        stowLiveConversation()
        return
      }
      revealChrome()
      closeFloat()
    }

    /* ------------------------------------------------------ the menu entries */

    /**
     * Whether the live conversation is minimised into the left sidebar. Its
     * window is still mounted but hidden, and its taskbar row is the way back,
     * so the "stow here" row has nothing left to do.
     */
    function conversationInLeftbar() {
      const shown = liveSession()
      if (shown === null) return false
      const win = windows.get(shown)
      return win !== undefined && win.el.hidden
    }

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
     * Minimise the conversation's window, as a drop on the left band does.
     * Without a window there is nothing to minimise, so one is opened first and
     * the minimise runs the moment its body mounts — before the first paint —
     * which is why the window never flashes on screen on its way out.
     */
    function moveConversationLeft() {
      stowLiveConversation()
    }

    /**
     * Watch the float's own drag. DSH owns the dragging; we only listen. A press
     * on the float's chrome opens a sequence; a press inside the Conversation
     * column does not, because that one is a text selection.
     */
    function trackPanelDrag(container, sessionId) {
      let down = null
      let band = null
      let root = null
      let frame = 0
      let pending = null
      /**
       * Whether this window carries the Conversation on screen. The outline's
       * caption depends on it: a band acts on the main Conversation, so a drag
       * of any other window has to say whose Conversation is being moved.
       */
      const draggingMain = () => sessionId === null || sessionId === liveSession()
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
        // The float used to BE the dock kit's panel. It is a window of our own
        // now, drawn under the root, so the press may land in either.
        root = container.isConnected ? container.closest(`[${FLOAT_ATTR}], [${WINDOW_ATTR}]`) : null
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
        else showPreview(drawn, band, draggingMain())
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
          // Show the hold that armed it: without a visible change, a hold that
          // did nothing and a hold that armed look exactly the same.
          try { floatRoot()?.setAttribute(ARMED_ATTR, '') } catch { /* no window */ }
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
        try { floatRoot()?.removeAttribute(ARMED_ATTR) } catch { /* already gone */ }
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

    /** Keep a per-Session record from growing for Sessions nobody opened. */
    function capSessionMap(map, limit = 64) {
      while (map.size > limit) {
        const oldest = map.keys().next()
        if (oldest.done === true) return
        map.delete(oldest.value)
      }
    }

    function bumpContentEpoch(sessionId) {
      if (sessionId === null) return
      contentEpochs.set(sessionId, (contentEpochs.get(sessionId) ?? 0) + 1)
      capSessionMap(contentEpochs)
      for (const listener of [...epochListeners]) {
        try { listener(sessionId) } catch { /* a listener may be unmounting */ }
      }
    }

    /** sessionId -> { el, body, title, header, resizer, rect } */
    const windows = new Map()
    /**
     * The band the float windows live in.
     *
     * The band has to sit between two things measured in DSH's own stylesheets:
     *
     *   below the popovers — menus, bubbles and the usage/stat dialogs are
     *   portaled to document.body at z-index 1100, and modals at 1000. A window
     *   above them paints over the panel it just opened, so clicking "model",
     *   "permission" or "usage" looks like nothing happened.
     *
     *   above the frame — the shell tops out around 71 and the dock kit's own
     *   float layer is 60.
     */
    let windowZ = 700
    const WINDOW_Z_TOP = 900

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

    /**
     * Renumber the whole stack, keeping its order.
     *
     * The band the windows live in is bounded, so raising one past the ceiling
     * used to drop it straight onto the floor value: two windows could then
     * share a level, and "the window on top" would answer with whichever the map
     * happened to list last.
     */
    function restackWindows() {
      const stack = [...windows.values()].sort((a, b) => {
        const za = Number.parseFloat(a.el.style.zIndex)
        const zb = Number.parseFloat(b.el.style.zIndex)
        return (Number.isFinite(za) ? za : 0) - (Number.isFinite(zb) ? zb : 0)
      })
      let z = 700
      for (const win of stack) {
        z += 1
        win.el.style.zIndex = String(z)
      }
      windowZ = z
    }

    function raiseWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      if (windowZ >= WINDOW_Z_TOP) restackWindows()
      windowZ = Math.min(windowZ + 1, WINDOW_Z_TOP)
      win.el.style.zIndex = String(windowZ)
      refreshSwitchChips()
    }

    /**
     * Offer the switch chip on the window at the top of the stack.
     *
     * A float of a Conversation that is not the one on screen is a transcript
     * and nothing else: it owns neither the header nor the composer, so the way
     * into it is to make it the current Conversation. That offer belongs to the
     * window the user just raised — by a press on its taskbar row or by dragging
     * it up — so it appears on one window, never on the one being read.
     */
    function refreshSwitchChips() {
      const live = liveSession()
      const top = topWindow()
      const label = t('switchTo')
      for (const [id, win] of windows) {
        const chip = win.switchChip
        if (chip === undefined) continue
        const show = id === top && id !== live
        if (chip.hidden !== !show) chip.hidden = !show
        if (chip.textContent !== label) chip.textContent = label
        if (chip.title !== label) chip.title = label
      }
    }

    /** The id of the window at the top of the stack that is on screen, if any. */
    function topWindow() {
      let top = null
      let topZ = -Infinity
      for (const [id, win] of windows) {
        if (win.el.hidden) continue
        const z = Number.parseFloat(win.el.style.zIndex)
        if (!Number.isFinite(z)) continue
        if (z >= topZ) {
          topZ = z
          top = id
        }
      }
      return top
    }

    function windowButton(label, glyph, onClick) {
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-label', label)
      button.title = label
      button.textContent = glyph
      // 30px is the largest that fits the 34px header, and still far short of
      // the 44px a fingertip wants: the header would have to grow for that.
      button.style.cssText = 'width:30px;height:30px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:14px/1 system-ui;cursor:pointer'
      button.addEventListener('pointerdown', (event) => {
        event.stopPropagation()
      })
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        onClick()
      })
      return button
    }

    /**
     * The header chip that makes this window's Conversation the current one.
     *
     * It stays hidden until the window is the one on top: every window would
     * otherwise carry the same offer, and the press would mean "bring this one
     * forward" on a window the user is not even looking at.
     */
    function switchChip(onClick) {
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('data-dsh-conversation-float-switch', '')
      button.textContent = t('switchTo')
      button.title = t('switchTo')
      button.hidden = true
      button.style.cssText = 'flex:none;height:22px;padding:0 8px;border:0;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.08));color:var(--dsw-alias-label-primary, #111);font:11px/1 ui-sans-serif,system-ui;white-space:nowrap;cursor:pointer'
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

    function ensureWindow(sessionId) {
      const existing = windows.get(sessionId)
      if (existing !== undefined) return existing
      const root = document.getElementById('root')
      if (root === null) return null
      const el = document.createElement('div')
      el.setAttribute(WINDOW_ATTR, sessionId)
      el.setAttribute('role', 'dialog')
      // Named by its own title, and focusable as a whole: a dialog announced
      // without a name is just "dialog" to a screen reader.
      const titleId = 'dsh-float-title-' + sessionId
      el.setAttribute('aria-labelledby', titleId)
      el.tabIndex = -1
      const header = document.createElement('div')
      header.setAttribute(WINDOW_GRIP_ATTR, '')
      header.tabIndex = -1
      const title = document.createElement('span')
      title.setAttribute(WINDOW_TITLE_ATTR, '')
      title.id = titleId
      title.style.cssText = 'flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 12px/1.2 ui-sans-serif,system-ui'
      title.textContent = sessionTitle(sessionId) ?? t('floatTitle')
      const body = document.createElement('div')
      body.setAttribute(WINDOW_BODY_ATTR, '')
      const resizer = document.createElement('div')
      resizer.setAttribute(WINDOW_RESIZE_ATTR, '')
      header.appendChild(title)
      // The title bar carries no page chips: the Conversation's own header,
      // which travels with the column, is the only copy of that switch.
      const chip = switchChip(() => switchToWindow(sessionId))
      header.appendChild(chip)
      header.appendChild(windowButton(t('minimize'), '—', () => hideWindow(sessionId)))
      header.appendChild(windowButton(t('close'), '✕', () => closeWindow(sessionId)))
      el.appendChild(header)
      el.appendChild(body)
      el.appendChild(resizer)
      el.hidden = true
      root.appendChild(el)
      const win = {
        el, body, title, header, resizer, switchChip: chip,
        rect: readWindowRect(sessionId) ?? defaultWindowRect(),
      }
      windows.set(sessionId, win)
      applyWindowRect(win, clampRect(win.rect))
      bindWindowDrag(sessionId, win)
      // The float carries the three drop bands: hold it still, then drag to the
      // left sidebar (stow), the middle (return) or the right sidebar (dock).
      win.stopBandDrag = trackPanelDrag(el, sessionId)
      refreshSwitchChips()
      // Slot registration must not run inside the commit that mounted the tab
      // body: a microtask leaves that commit behind without waiting a whole
      // macrotask for it.
      queueMicrotask(syncTaskbar)
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

    /**
     * Make another Conversation the one on screen.
     *
     * DSH's own navigation entry does the switch, so the view ledger, the store
     * and both columns move together — the same call the sidebar's session rows
     * make. The window then re-decides its own mode on the next layout pass, and
     * the real column, header and composer follow it in.
     */
    function switchToWindow(sessionId) {
      let switched = false
      try {
        const workspace = typeof ctxRef?.get === 'function' ? ctxRef.get('uiWorkspace') : null
        if (workspace !== null && workspace !== undefined && typeof workspace.openSession === 'function') {
          workspace.openSession(sessionId)
          switched = true
        }
      } catch (error) {
        report('[conversation-float] could not switch the conversation:', error)
      }
      if (!switched) {
        report('[conversation-float] no uiWorkspace service to switch the Session')
        return
      }
      raiseWindow(sessionId)
      // Bodies re-decide on a slow safety net; a switch must not wait for it.
      // The column is what changes when the switch lands, so the wait ends on
      // that change: a pass is taken whenever the column shows a Session it did
      // not show last, and the wait finishes once it shows ours. Three guessed
      // delays could all fire before the column moved, or long after.
      notifyLayout()
      refreshSwitchChips()
      let lastSeen = '__start__'
      untilFrame(() => {
        const column = findColumn()
        const shown = column === null ? null : columnSession(column)
        if (shown !== lastSeen) {
          lastSeen = shown
          notifyLayout()
          refreshSwitchChips()
        }
        return shown === sessionId
      }, null, 2500)
    }

    function showWindow(sessionId) {
      const win = ensureWindow(sessionId)
      if (win === null) return null
      win.el.hidden = false
      raiseWindow(sessionId)
      // Move focus into the window that was just opened, unless the user is
      // already working inside it: a window that opens without focus leaves a
      // keyboard user tabbing into a hidden subtree behind it.
      try {
        const active = document.activeElement
        if (active === null || !win.el.contains(active)) win.el.focus({ preventScroll: true })
      } catch { /* older engines */ }
      // Typing belongs to the view that just took the screen.
      bumpContentEpoch(sessionId)
      return win
    }

    function hideWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      win.el.hidden = true
      // The window keeps its body mounted while minimised, so the middle
      // column has to take the draft slot back for its own composer — once the
      // column is actually back home, not 60ms later.
      if (liveSession() === sessionId) {
        untilFrame(() => {
          const column = findColumn()
          return column !== null && column.isConnected && column.closest(`[${WINDOW_ATTR}]`) === null
        }, healComposerSoon, 1200)
      }
      refreshSwitchChips()
    }

    function destroyWindow(sessionId) {
      const win = windows.get(sessionId)
      if (win === undefined) return
      windows.delete(sessionId)
      // The live column comes home before its host leaves: a node removed with
      // the window would be a Conversation nobody can find again.
      if (movedColumn !== null && win.el.contains(movedColumn)) detachColumn()
      if (typeof win.stopBandDrag === 'function') {
        try { win.stopBandDrag() } catch { /* listeners already gone */ }
        win.stopBandDrag = null
      }
      win.el.remove()
      queueMicrotask(syncTaskbar)
      refreshSwitchChips()
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
        report('[conversation-float] could not read this Session tab list:', error)
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
          report('[conversation-float] could not close the tab:', error)
        }
      }
      // A docked tab DSH refuses to close leaves the body alive: the window must
      // not outlive it as an orphan pointing at nothing.
      untilFrame(
        () => !windows.has(sessionId),
        () => { if (liveSession() === sessionId) healComposerSoon() },
        600,
        () => {
          if (windows.has(sessionId)) destroyWindow(sessionId)
          if (liveSession() === sessionId) healComposerSoon()
        },
      )
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
            makeDockIcon(sessionId),
          )
          taskRows.set(sessionId, [disposePanel, disposeRow])
        } catch (error) {
          report('[conversation-float] could not register the taskbar row:', error)
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

    /**
     * A taskbar row is DSH's own main-panel button: selecting it replaces the
     * central entry, which would take a plugin or automation page away. When a
     * page owns the main slot the row means only "bring that window forward";
     * the page must stay where it is.
     */
    function taskbarRowPress(event) {
      const target = event.target
      if (!(target instanceof Element)) return
      const row = target.closest(`button[${ROW_MARK_ATTR}]`)
      if (row === null) return
      const sessionId = row.getAttribute(ROW_MARK_ATTR)
      if (sessionId === null || sessionId === '') return
      event.preventDefault()
      event.stopPropagation()
      showWindow(sessionId)
    }

    /** Selecting a taskbar row shows that window and returns the centre. */
    function makeWindowPanel(sessionId) {
      return function WindowPanel() {
        React.useEffect(() => {
          showWindow(sessionId)
          try {
            layout?.selectPanel?.(null)
          } catch (error) {
            report('[conversation-float] could not restore the conversation panel:', error)
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
/* Fallback only: showPreview() raises this above the windows' own band. */
.dsw-preview {
  /* Same band as the windows (700..950). It used to claim 20050 while the code
     raised it to min(windowZ + 10, 950), so the two disagreed and the value
     that won depended on whether the inline style had been written yet. */
  position: fixed; left: 0; top: 0; z-index: 940; pointer-events: none;
  will-change: transform, width, height;
  border: 2px dashed var(--dsw-alias-brand-primary, #4d6bfe);
  border-radius: 12px;
  box-sizing: border-box;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 12%, transparent);
  display: flex; align-items: center; justify-content: center;
  transition: transform .09s ease, width .09s ease, height .09s ease;
}
/* Touch: the grip owns the gesture, so a press is not turned into a scroll. */
[data-dsh-conversation-float-float] [data-dockkit-float-grip] {
  touch-action: none;
  -webkit-user-select: none; user-select: none;
  -webkit-touch-callout: none;
}

/* The float window: a layer of our own, drawn above the frame's columns. */
[data-dsh-conversation-float-window] {
  position: fixed; z-index: 700;
  display: flex; flex-direction: column;
  min-width: 320px; min-height: 240px;
  background: var(--dsw-alias-bg-base, #fff);
  border: 1px solid var(--dsw-alias-border-l3, rgba(0, 0, 0, .14));
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, .28);
  overflow: hidden;
}
[data-dsh-conversation-float-window][hidden] { display: none; }
/* The hold that arms the bands, shown on the grip. */
[data-dsh-conversation-float-armed] [data-dsh-conversation-float-window-grip] {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 16%, var(--dsw-alias-bg-layer-2, #f5f6f8));
}
[data-dsh-conversation-float-switch][hidden] { display: none; }
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
/* A body that renders its own Conversation is a transcript and nothing else.
   Exactly one composer exists on screen — the one that travels with the live
   column, the same way the Conversation header does — so the copies DSH builds
   for these bodies are taken out. They used to be live input boxes whose draft
   writer was a second claimant on the Session's single slot. */
[data-dsh-conversation-float-factory] [data-composer-seat] { display: none !important; }
[data-dsh-conversation-float-factory-live] [data-composer-seat] { display: flex !important; }
[data-dsh-conversation-float-factory-live] [data-dsh-conversation-float-anchor] { display: none !important; }
[data-dsh-conversation-float-window-resize] {
  position: absolute; right: 0; bottom: 0; width: 22px; height: 22px;
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
      // A window put away with its own dash comes back first: hiding the rest
      // of DSH around a hidden window would leave an empty screen.
      if (win.el.hidden) {
        showWindow(sessionId)
        notifyState()
        return
      }
      // The original design: this press does not collapse the float, it takes
      // the rest of DSH off the screen and leaves the float alone; the next
      // press brings the interface back.
      setChromeless(!chromeless)
      notifyState()
    }

    /**
     * Escape: bring DSH back when the columns are hidden, close the window when
     * the hand is inside one.
     *
     * Only acts on our own surfaces. Escape is a shared key in DSH (menus,
     * dialogs, a running answer), and a capture-phase listener that took it
     * globally would be stealing it from the app.
     */
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

    /**
     * The left sidebar row's glyph. The row itself is owned by the sidebar; we
     * mark its button so a capture listener can tell our taskbar from a shipped
     * row, and know which Session's window the row means.
     */
    function makeDockIcon(sessionId) {
      return function DockIcon({ size = 16 }) {
        const ref = React.useRef(null)
        React.useLayoutEffect(() => {
          const icon = ref.current
          const row = icon === null ? null : icon.closest('button')
          if (row !== null) row.setAttribute(ROW_MARK_ATTR, sessionId)
        })
        return h('span', { ref, style: { display: 'contents' } }, h(Icon, { name: 'window', size }))
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
       * 'column'       the live middle column lives in this body
       * 'factory-live' the live Conversation is on a page: a full copy stays
       *                here, with header, View tabs and composer
       * 'factory'      a Conversation of a Session that is not live: record only
       * null           the first layout pass has not decided yet — render
       *                NOTHING, because a factory view that mounts and unmounts
       *                for nothing would clear the draft slot on its way out.
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
          report('[conversation-float] could not render the conversation content:', error)
          return null
        }
      }, [props.renderFactorySlot])
      React.useLayoutEffect(() => {
        const container = host.current
        if (container === null) return undefined
        const sessionId = container.closest('[data-sidebar-right-session]')?.getAttribute('data-sidebar-right-session') ?? null
        sessionRef.current = sessionId
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
                report('[conversation-float] could not lift the conversation into its window:', error)
                win = undefined
              }
            }
            if (win !== undefined) {
              pane.setAttribute(WINDOW_HIDE_PANE_ATTR, '')
              if (created || paneChanged) showWindow(sessionId)
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
          // A column that belongs to another Conversation must not stay in this
          // float: switching Sessions would paint the new Conversation inside
          // it, and the Conversation's own page would then be blank.
          if (movedColumn !== null && sessionId !== null && win !== undefined && win.body.contains(movedColumn)) {
            const held = columnSession(movedColumn)
            if (held !== null && held !== sessionId) {
              // Only a float left on a LATER page has to put the column back on
              // the first one; one that was already on the first page must not
              // make the Session jump for no reason.
              const tabsBefore = nativeViewTabs()
              const onFirstPage = tabsBefore[0] === undefined || tabsBefore[0].getAttribute('aria-selected') === 'true'
              handOffColumn(selectedSession() ?? liveSession())
              if (!onFirstPage) {
                // The tab strip re-renders on the commit this pass is inside;
                // one frame later is the first moment its selection is readable.
                window.requestAnimationFrame(() => {
                  const first = nativeViewTabs()[0]
                  if (first === undefined) return
                  if (first.getAttribute('aria-selected') === 'true') return
                  try { first.click() } catch { /* the header may be gone */ }
                })
              }
            }
          }
          // DSH is mid-render during a Session change and the Session on screen
          // is momentarily unreadable. Flipping to "not mine" there would mount a
          // second view of the live Conversation, and a second view takes the
          // draft writer for good. When the answer is unknown, keep the last one.
          const live = liveSession()
          if (live === null) return
          const mine = live === sessionId
          const target = pane !== null && win !== undefined ? win.body : el
          hostEl.current = target
          // A page that is not a Conversation (plugins, automations, settings)
          // renders into the very slot the column carries. Hosting the column now
          // would paint that page inside this window, and the window would follow
          // the user out of the Conversation — the View tab strip turning into a
          // plugin page's header and the composer disappearing with it. The page
          // belongs to the middle column, so the column goes home and this body
          // shows the transcript of its own Session instead: the same thing a
          // window of a Session that is not the live one shows.
          const columnNow = findColumn()
          const page = mainPanelOpen() && (columnNow === null || columnSession(columnNow) === null)
          if (page && movedColumn !== null && win !== undefined && win.body.contains(movedColumn)) {
            try {
              detachColumn(true)
            } catch (error) {
              report('[conversation-float] could not hand the page its column:', error)
            }
          }
          // A floated body always hosts the live column. A docked page hosts it
          // too when there is a column to host — that is what puts the real
          // header, and its Conversation/Trajectory tabs, inside the page.
          // A minimised float KEEPS the column: the point of floating is that the
          // Conversation leaves DSH, and a hidden window is where it lives while
          // minimised. Only a body without a column to host renders its own view,
          // and so does every body while a page outside the Conversation is open.
          // A page outside the conversation takes the main slot, so the real
          // column goes home and the page lands in the ordinary frame. The live
          // Session's window stays on screen and keeps a full Conversation of
          // its own: header, View tabs and composer, not the read-only record a
          // window of another Session shows. The page is behind the window.
          if (page && mine && chromeless) revealChrome()
          const next = (mine && !page)
            ? (pane !== null ? 'column' : (findColumn() !== null ? 'column' : 'factory'))
            : (mine && page ? 'factory-live' : 'factory')
          setMode((prev) => (prev === next ? prev : next))
          // Never re-append a column that is already inside: that would re-size
          // the float under the user's hand.
          if (next === 'column' && (movedColumn === null || !target.contains(movedColumn))) {
            // Another float may still be holding it: that float's own pass sees a
            // foreign column and releases it, so wait for that instead of yanking
            // the Conversation out from under it.
            const holder = movedColumn === null ? null : movedColumn.closest(`[${WINDOW_ATTR}]`)
            const holderId = holder === null ? null : holder.getAttribute(WINDOW_ATTR)
            if (holderId === null || holderId === sessionId) {
              try { attachColumn(target) } catch (error) {
                report('[conversation-float] could not host the live column:', error)
              }
            }
          }
        }
        layoutListeners.add(decide)
        decide()
        // No clock of its own: this body re-decides when DSH says the Session
        // changed, when a window opens or closes.
        return () => {
          try {
            disposed = true
            epochListeners.delete(onEpoch)
            layoutListeners.delete(decide)
            const pane = paneRef.current
            paneRef.current = null
            if (pane !== null) pane.removeAttribute(WINDOW_HIDE_PANE_ATTR)
            setPortalTarget(null)
            const gone = sessionRef.current
            sessionRef.current = null
            if (gone !== null) destroyWindow(gone)
          } catch (error) {
            report('[conversation-float] window cleanup failed:', error)
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
        // The copy that was showing this Conversation until this commit can take
        // the composer's editor down with it, and the composer that survives is
        // the one the user is about to type into.
        healComposerSoon()
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
      if (mode === 'factory' || mode === 'factory-live') {
        // Marked, so the stylesheet can take the composer out of this body and
        // leave the transcript. A factory-live body is the exception: it is the
        // live Session while a page owns the main slot, so it keeps the header,
        // the View tabs and the composer instead of degrading to a record.
        const live = mode === 'factory-live'
        let header = null
        if (live && typeof props.renderSlot === 'function') {
          try {
            header = props.renderSlot('conversation.session.header', { hideChrome: false })
          } catch (error) {
            report('[conversation-float] could not render the live header:', error)
          }
        }
        const shell = h('div', {
          key: epoch,
          [FACTORY_ATTR]: '',
          [FACTORY_LIVE_ATTR]: live ? '' : undefined,
          style: { display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, minWidth: 0, height: '100%' },
        }, header, content)
        body = floating && portalTarget !== null ? ReactDOM.createPortal(shell, portalTarget) : shell
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
     * The left sidebar's More menu: put the conversation's window away. The row
     * that brings it back lives in this same sidebar.
     */
    function MoveLeftRow({ onDismiss }) {
      if (conversationInLeftbar()) return null
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
        try { window.__dshFloatBuild = 'rowguard-0.2.7' } catch { /* no window yet */ }
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
            if (preview !== null && preview.zone !== null) preview.label.textContent = previewLabel(preview.zone, preview.own)
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

        ctx.effect(() => {
          window.addEventListener('keydown', escapeOnKey, true)
          document.addEventListener('click', taskbarRowPress, true)
          // A hand on the sidebars outranks any retry the plugin started: it
          // ends the retry instead of being read as a state that disagrees.
          const onHand = (event) => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest(`[${FLOAT_ATTR}], [${WINDOW_ATTR}]`) !== null) return
            if (typeof chromeApplyStop === 'function') chromeApplyStop()
          }
          window.addEventListener('pointerdown', onHand, true)
          return () => {
            window.removeEventListener('keydown', escapeOnKey, true)
            document.removeEventListener('click', taskbarRowPress, true)
            window.removeEventListener('pointerdown', onHand, true)
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


        ctx.effect(() => {
          const dispose = ctx.inject(['layout'], (sub) => {
            layout = sub.layout ?? null
            return () => {
              layout = null
            }
          })
          return dispose
        })

        // The Session list drives every re-decide: it supplies the titles the
        // sidebars and windows show, and a change to it means the layout moved.
        ctx.effect(() => {
          const dispose = ctx.inject(['sessions'], (sub) => {
            sessions = sub.sessions ?? null
            let off = null
            try {
              if (typeof sessions?.list?.subscribe === 'function') {
                off = sessions.list.subscribe(() => {
                  notifyLayout()
                })
              }
            } catch (error) {
              report('[conversation-float] could not follow the Session list:', error)
            }
            return () => {
              try {
                off?.()
              } catch {
                /* the projection is already gone */
              }
              sessions = null
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
                report('[conversation-float] tab type refused:', error)
                return () => {}
              }
            })
            sub.effect(() =>
              sub.slots.inject('sidebar.right.pane.tab', () => {
                try {
                  return sub.slots.register({ name: 'sidebar.right.pane.tab', key: CHAT_ID, locale: NS, children: { 'conversation.session.header': { kind: 'single', scope: 'session' } } }, SessionPanel)
                } catch (error) {
                  // A host that will not let this body own the header slot
                  // still gets the body, with content and composer only.
                  report('[conversation-float] header-capable body refused, retrying:', error)
                  try {
                    return sub.slots.register({ name: 'sidebar.right.pane.tab', key: CHAT_ID, locale: NS }, SessionPanel)
                  } catch (fallbackError) {
                    window.__dshFloatError = 'body: ' + String(fallbackError && (fallbackError.stack || fallbackError))
                    report('[conversation-float] tab body refused:', fallbackError)
                    return () => {}
                  }
                }
              }),
            )
            return () => {
              sidebarRight = null
              hidePreview()
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
          /** Test harness: the same switch the window's own chip makes. */
          switchTo: (id) => switchToWindow(id),
          /**
           * Probe: what the plugin believes about the Conversation column. The
           * breaks this repairs — a column parked in a page the window has left,
           * a recorded node DSH already took away — are invisible from outside,
           * so they can only be read from here.
           */
          diag() {
            const column = movedColumn
            const page = column === null ? null : column.closest('[data-sidebar-right-session]')
            const scanned = scanColumn()
            return {
              build: window.__dshFloatBuild ?? null,
              followingSession: followingSelection,
              live: liveSession(),
              selected: selectedSession(),
              moved: column === null ? null : {
                connected: column.isConnected,
                session: columnSession(column),
                host: column.closest(`[${WINDOW_ATTR}]`) !== null ? 'window'
                  : column.closest(`[${FLOAT_ATTR}]`) !== null ? 'float'
                    : page !== null ? 'docked' : 'frame',
                page: page === null ? null : page.getAttribute('data-sidebar-right-session'),
                pageVisible: page === null ? null : panelVisible(page),
              },
              scanned: scanned === null ? null : columnSession(scanned),
              columns: document.querySelectorAll('[data-conversation-session]').length,
              windows: windows.size,
              compat: compatReport(),
              lastError: window.__dshFloatLastError ?? null,
              waits: pendingWaits.size,
            }
          },
          /** Test harness: which window carries the switch chip, and what the
           *  drop outline currently says. */
          get chips() {
            const out = {}
            for (const [id, win] of windows) out[id] = win.switchChip === undefined ? null : !win.switchChip.hidden && win.switchChip.textContent
            return { top: topWindow(), live: liveSession(), shown: out }
          },
          get preview() {
            return preview === null || preview.zone === null
              ? null
              : { zone: preview.zone, own: preview.own, label: preview.label.textContent }
          },
          get moved() {
            return movedColumn !== null
          },
          /** What the sidebars restore is working from, for the test harness. */
          get chrome() {
            return { saved: savedChrome, chromeless, retrying: typeof chromeApplyStop === 'function' }
          },
        }
        // The probe is READ-ONLY unless a page asked for the harness. The
        // mutating entries below move a Session on any script's say-so, which
        // is a test surface, not an API, and shipped builds should not hand it
        // to whatever else happens to run on this origin.
        if (!floatDebugEnabled()) {
          for (const key of ['open', 'moveRight', 'moveCentre', 'switchTo']) {
            delete window.__dshSessionWindow[key]
          }
        }
        ctx.effect(() => {
          window.addEventListener('resize', reclampWindows)
          return () => window.removeEventListener('resize', reclampWindows)
        })

        // The Session on screen is DSH's own state, and DSH publishes it: one
        // store, written by every navigation. Listening to it replaces the polls
        // that used to stand in for it — a Session switch is a layout pass now,
        // not a wait for the next tick.
        ctx.effect(() => {
          followSelection()
          return () => {}
        })

        // Leaving the Conversation for a page outside it (plugins, automations,
        // settings) swaps the main slot's children and tells no service: the
        // Session is still "selected", so neither the workspace store nor the
        // Session list moves. Watch the slot itself, so a window stops following
        // the user out of the Conversation in the same turn it happens instead
        // of whenever something else happens to fire.
        ctx.effect(() => {
          const inMain = (node) => node instanceof Element
            && (node.hasAttribute('data-slot')
              || node.closest('[data-slot="main"]') !== null
              || node.querySelector('[data-slot="main"]') !== null)
          const carries = (node) => node instanceof Element
            && (node.hasAttribute('data-conversation-session')
              || node.querySelector('[data-conversation-session]') !== null
              || inMain(node))
          // Reading the main slot's own shape is what keeps this cheap: a
          // streaming answer mutates the transcript hundreds of times a second,
          // and a layout pass per token would cost more than it ever buys. Only
          // a change to WHAT the slot carries — or to whether a Conversation is
          // drawn at all — counts, and one pass per 200ms at most.
          const shape = () => {
            const slot = document.querySelector('[data-slot="main"]')
            const kinds = slot === null ? '' : [...slot.children].map((child) => child.getAttribute('data-slot') ?? child.tagName).join(',')
            return kinds + '|' + (document.querySelector('[data-conversation-session]') === null ? 'none' : 'conversation')
          }
          let seen = shape()
          let lastKick = 0
          const observer = new MutationObserver((records) => {
            let interesting = false
            for (const record of records) {
              if (record.type !== 'childList') continue
              if (inMain(record.target)) { interesting = true; break }
              for (const node of record.addedNodes) if (carries(node)) { interesting = true; break }
              if (interesting) break
              for (const node of record.removedNodes) if (carries(node)) { interesting = true; break }
              if (interesting) break
            }
            if (!interesting) return
            const now = Date.now()
            if (now - lastKick < 200) return
            const next = shape()
            if (next === seen) return
            seen = next
            lastKick = now
            kickLayout(1)
          })
          observer.observe(document.body, { childList: true, subtree: true })
          return () => observer.disconnect()
        })

        ctx.effect(() => () => {
          // Nothing this instance scheduled may outlive it: every wait is a
          // frame loop, and a frame loop left running holds a dead closure.
          cancelWaits()
          hidePreview()
          // Unloading is not a user close: leave the sidebars alone.
          suspendRestore = true
          detachColumn()
          delete window.__dshSessionWindow
        })
      },
    }
  },
})
