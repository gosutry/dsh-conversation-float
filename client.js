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
     * Copy for every locale DSH ships. The word for the Conversation is read
     * from this table only, so the panel title, the sidebar row and the entry
     * button all say what the View tab strip says in the same language.
     */
    const COPY = {
      "zh": {
        "conversation": "会话",
        "floatTitle": "会话浮窗",
        "showDsh": "显示 DSH 界面",
        "stow": "放进左栏",
        "center": "回到中间",
        "dock": "停到右栏",
        "description": "把会话视图做成 DSH 自带的浮窗：拖到左边收进左栏抽屉、拖到中间回到中栏、拖到右边停进右侧栏。"
      },
      "en": {
        "conversation": "Conversation",
        "floatTitle": "Conversation float",
        "showDsh": "Show DSH",
        "stow": "Stow in the left sidebar",
        "center": "Return to the middle",
        "dock": "Dock in the right sidebar",
        "description": "Turns the Conversation view into DSH own floating panel: drag it left to stow it in the sidebar drawer, centre to return it to the middle column, right to dock it in the right sidebar."
      },
      "de": {
        "conversation": "Konversation",
        "floatTitle": "Konversations-Float",
        "showDsh": "DSH anzeigen",
        "stow": "In der linken Seitenleiste ablegen",
        "center": "Zurück in die Mitte",
        "dock": "In der rechten Seitenleiste andocken",
        "description": "Macht die Konversationsansicht zu DSH eigenem schwebenden Panel: nach links ziehen legt sie in der linken Seitenleiste ab, Mitte bringt sie zurück, rechts dockt sie rechts an."
      },
      "es": {
        "conversation": "Conversación",
        "floatTitle": "Ventana flotante de conversación",
        "showDsh": "Mostrar DSH",
        "stow": "Guardar en la barra izquierda",
        "center": "Volver al centro",
        "dock": "Acoplar en la barra derecha",
        "description": "Convierte la vista de conversación en el panel flotante propio de DSH: a la izquierda se guarda en la barra lateral, al centro vuelve a la columna central, a la derecha se acopla a la barra derecha."
      },
      "fr": {
        "conversation": "Conversation",
        "floatTitle": "Fenêtre flottante de conversation",
        "showDsh": "Afficher DSH",
        "stow": "Placer dans la barre latérale gauche",
        "center": "Revenir au centre",
        "dock": "Ancrer dans la barre latérale droite",
        "description": "Transforme la vue de conversation en panneau flottant propre à DSH : à gauche il se range dans la barre latérale, au centre il revient dans la colonne, à droite il s ancre à droite."
      },
      "ja": {
        "conversation": "会話",
        "floatTitle": "会話フロート",
        "showDsh": "DSH を表示",
        "stow": "左サイドバーにしまう",
        "center": "中央に戻す",
        "dock": "右サイドバーにドッキング",
        "description": "会話ビューを DSH 自身のフロートパネルにします。左へドラッグで左サイドバーに収納、中央で中央列に戻り、右で右サイドバーにドッキングします。"
      },
      "pt": {
        "conversation": "Conversa",
        "floatTitle": "Janela flutuante da conversa",
        "showDsh": "Mostrar DSH",
        "stow": "Guardar na barra lateral esquerda",
        "center": "Voltar ao centro",
        "dock": "Ancorar na barra lateral direita",
        "description": "Transforma a vista de conversa no painel flutuante do próprio DSH: à esquerda guarda na barra lateral, no centro volta à coluna central, à direita ancora na barra direita."
      },
      "ru": {
        "conversation": "Беседа",
        "floatTitle": "Плавающее окно беседы",
        "showDsh": "Показать DSH",
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
    /** How long a band must be held before it draws and before it can land. */
    const DWELL_MS = 1200
    /** The dock kit's own marker for a floating panel. */
    const FLOAT_ATTR = 'data-dockkit-float'
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
    /** Whether the left sidebar currently holds a re-opener for the float. */
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
    /** Set when the user changed a sidebar while the float was open. */
    let chromeTouched = false
    /** How long after a press or a key a column change still counts as the user's. */
    const GESTURE_WINDOW = 900
    /** How long the float's own force-open needs to settle before sampling. */
    const FORCE_SETTLE_MS = 1200
    /** The last time the user pressed a key or a mouse button, in ms. */
    let gestureAt = 0
    /** While the plugin moves the columns itself, changes are not the user's. */
    let holdOffUntil = 0
    /** Set while docking to the right sidebar: the column is not going home. */
    let dockingRight = false
    /** Set while the float is being reopened from the drawer. */
    let suspendRestore = false
    /** Disposer of the `sidebar.panellist` row, while it is registered. */
    let dockRow = null
    /** The drop preview overlay, created on demand. */
    let preview = null

    /* ------------------------------------------------------- the live column */

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

    /** Upper-left corner of that seat: centred, snapped, clear of the frame. */
    function floatSeat(size) {
      const snap = (value) => Math.max(0, Math.round(value / GRID) * GRID)
      return {
        x: snap((window.innerWidth - size.width) / 2),
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
    function attachColumn(container) {
      const column = findColumn()
      if (column === null || container === null) return null
      movedFrom = { parent: column.parentNode, next: column.nextSibling }
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

      // The float body is mounted now, so a hide that was waiting for it can be
      // applied against a real float element.
      if (pendingChromeless) setChromeless(true)
      return column
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

    function detachColumn() {
      const column = movedColumn
      const home = movedFrom
      movedColumn = null
      movedFrom = null
      for (const el of document.querySelectorAll(`[${OWN_FLOAT_ATTR}]`)) el.removeAttribute(OWN_FLOAT_ATTR)
      // The float is leaving the screen: the rest of DSH has to come back.
      if (chromeless) setChromeless(false)
      // A float that goes home hands the sidebars back as they were — but only
      // when the user has not reshaped them meanwhile, and never while the tab
      // is merely moving into the right sidebar.
      if (!dockingRight && !suspendRestore) restoreChrome()
      dockingRight = false
      if (column === null) return
      column.style.width = ''
      column.style.height = ''
      column.style.minWidth = ''
      column.style.minHeight = ''
      column.style.overflow = ''
      if (home !== null && home.parent !== null && home.parent.isConnected) {
        home.parent.insertBefore(column, home.next)
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
      let frame = 0
      const check = () => {
        frame = 0
        if (movedColumn !== null && !movedColumn.isConnected) detachColumn()
        const panel = floatPanel()
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
          if (panel !== null) {
            healFloatBody()
            if (chromeless) refreshChromeless()
          }
        }
        noteChromeChange()
      }
      const schedule = () => {
        if (frame !== 0) return
        frame = window.requestAnimationFrame(check)
      }
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, { childList: true, subtree: true })

      return () => {
        observer.disconnect()
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
      const host = panel.querySelector('.dsw-host')
      if (host === null) return
      if (movedColumn !== null && host.contains(movedColumn)) return
      const column = findColumn()
      if (column === null || host.contains(column)) return
      attachColumn(host)
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
        if (button !== null) button.title = next ? t('showDsh') : t('floatTitle')
      } catch {
        /* the button may not be mounted */
      }
    }

    /**
     * Bring the rest of DSH back. Hiding the columns lets DSH re-rail the left
     * sidebar, so the window used to come back as "only the right column": a
     * reveal opens the drawer again, the same way opening the float does.
     */
    function revealChrome() {
      setChromeless(false)
      // The columns opened here are the plugin's doing, not the user's: a
      // short settle, not a long one, or the user's own first click after the
      // reveal would be ignored as if it were the plugin's.
      holdOff(400)
      // The design: while the window is only the float, both sidebars are open —
      // the drawer holds a stowed float, the right column is where "收回到侧边栏"
      // docks. The reveal opens both, whatever DSH railed away while hidden.
      try {
        if (leftCollapsed()) layout?.toggleSidebar?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the left sidebar:', error)
      }
      try {
        if (sidebarRight !== null && sidebarRight.isExpanded?.() === false) sidebarRight.toggleExpanded?.()
      } catch (error) {
        console.warn('[conversation-float] could not expand the right sidebar:', error)
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
      if (target instanceof Element && target.closest(`[${ANCHOR_ATTR}]`) !== null) return
      gestureAt = performance.now()
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
      chromeTouched = false
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
      const now = performance.now()
      if (now < holdOffUntil) return
      const current = chromeNow()
      // Back on the snapshot's own pair: there is nothing to remember, and the
      // restore would be a no-op anyway.
      if (current.leftCollapsed === savedChrome.leftCollapsed && current.rightExpanded === savedChrome.rightExpanded) return
      if (now - gestureAt > GESTURE_WINDOW) return
      chromeTouched = true
    }

    /**
     * Put back what the user had, unless they changed it themselves. This runs
     * while the float's tab is still being torn down, and the dock kit can
     * swallow a toggle aimed at a surface that is on its way out: the snapshot
     * is reapplied until both columns match it or the attempts run out.
     */
    function restoreChrome() {
      const saved = savedChrome
      const touched = chromeTouched
      savedChrome = null
      chromeTouched = false
      if (saved === null || touched) return
      holdOff(1500)
      let tries = 0
      const apply = () => {
        tries += 1
        if (applyChromeSnapshot(saved)) return
        // A toggle the dock kit queued needs a moment to land; retrying on the
        // next frame would read the old state and toggle straight back.
        if (tries < 8) window.setTimeout(apply, 200)
      }
      window.requestAnimationFrame(apply)
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
        setChromeless(true)
        return
      }
      try {
        sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'float' })
      } catch (error) {
        console.warn('[conversation-float] could not open the floating panel:', error)
      }
      // Opening the float leaves the window to the float alone.
      setChromeless(true)
    }

    function openFloating() {
      if (!dockedLeft) {
        unstowFloat()
        openFloatAtDefault()
        return
      }
      // Out of the drawer the float is still mounted, holding the only copy of
      // the Conversation. Reopening it as a fresh panel raced the old one's
      // cleanup and left an empty window, so take it back as it stands.
      dockedLeft = false
      syncDockRow()
      unstowFloat()
      setChromeless(true)
    }

    /** The tab id of our floating occurrence, or null when it is not minted. */
    function floatTabId() {
      try {
        const active = sidebarRight?.active?.()
        if (active !== undefined && active !== null && active.kind === CHAT_KIND) return active.id
      } catch {
        /* fall through to the inventory */
      }
      try {
        const snapshot = sidebarRight?.openTabs?.getSnapshot?.()
        const found = new Set()
        const walk = (value, depth) => {
          if (value === null || value === undefined || depth > 6) return
          if (Array.isArray(value)) {
            for (const item of value) walk(item, depth + 1)
            return
          }
          if (typeof value !== 'object') return
          if (value.kind === CHAT_KIND && typeof value.id === 'string') found.add(value.id)
          for (const key of Object.keys(value)) walk(value[key], depth + 1)
        }
        walk(snapshot, 0)
        const ids = Array.from(found)
        return ids.length === 1 ? ids[0] : (ids[ids.length - 1] ?? null)
      } catch {
        return null
      }
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

    const ZONE_LABEL = { left: t('stow'), center: t('center'), right: t('dock') }

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
      preview.label.textContent = ZONE_LABEL[zone] ?? ''
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
      return fromColumn ?? document.querySelector(`[${FLOAT_ATTR}]`)
    }

    function stowFloat() {
      const el = floatPanel()
      if (el === null) return false
      el.setAttribute(STOW_ATTR, '')
      return true
    }

    function unstowFloat() {
      for (const el of document.querySelectorAll(`[${STOW_ATTR}]`)) el.removeAttribute(STOW_ATTR)
    }

    function drop(zone) {
      if (zone === 'right') {
        dockedLeft = false
        dockingRight = true
        // The float leaves as an ordinary right-sidebar tab. The sidebar
        // snapshot belonged to the float: keeping it would let a close of that
        // tab — possibly hours later — move the sidebars back in time.
        savedChrome = null
        chromeTouched = false
        unstowFloat()
        syncDockRow()
        try {
          sidebarRight?.openResource(CHAT_ADDRESS, { kind: CHAT_KIND, destination: 'sidebar' })
        } catch (error) {
          console.warn('[conversation-float] could not dock to the right sidebar:', error)
        }
        return
      }
      if (zone === 'left') {
        dockedLeft = true
        syncDockRow()
        if (!stowFloat()) closeFloat()
        // The drawer row lives in the left sidebar: bring the chrome back so it
        // can be seen and clicked.
        revealChrome()
        return
      }
      dockedLeft = false
      syncDockRow()
      revealChrome()
      closeFloat()
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
      if (dockedLeft && dockRow === null) {
        try {
          dockRow = ctxRef.slots.register(
            { name: 'sidebar.panellist', id: DOCK_ROW_ID, order: 20, label: () => t('floatTitle') },
            DockIcon,
          )
        } catch (error) {
          console.warn('[conversation-float] could not register the sidebar row:', error)
          dockRow = null
        }
      } else if (!dockedLeft && dockRow !== null) {
        try {
          dockRow()
        } catch {
          /* already disposed with the slot */
        }
        dockRow = null
      }
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
  width: 26px; height: 26px; padding: 0; border: 0; border-radius: 7px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
  transition: background .12s ease, color .12s ease;
}
.dsw-icon:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
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
      // Docked in the right sidebar (or stowed in the drawer) there is no
      // float panel to toggle: the button must bring the float back instead.
      if (dockedLeft || floatPanel() === null) {
        openFloating()
        return
      }
      if (chromeless) revealChrome()
      else setChromeless(true)
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
          title: chromeless ? t('showDsh') : t('floatTitle'),
          'aria-label': chromeless ? t('showDsh') : t('floatTitle'),
          [ANCHOR_ATTR]: '',
          onClick: onEntryClick,
        },
        h(Styles),
        h(Icon, { name: 'window' }),
      )
    }

    /** The left sidebar row's glyph. The row itself is owned by the sidebar. */
    function DockIcon({ size = 16 }) {
      return h(Icon, { name: 'window', size })
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
      return h('div', { className: 'dsw-host', ref: host }, h(Styles))
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

        const register = (slot, id, component, options = {}) =>
          ctx.effect(() =>
            ctx.slots.inject(slot, () =>
              ctx.slots.register({ name: slot, id, locale: NS, ...options }, component),
            ),
          )

        register('conversation.session.header.utilities', 'conversation-float-control', HeaderAction, { order: 30 })

        ctx.effect(() => watchColumn())

        ctx.effect(() => {
          window.addEventListener('keydown', escapeOnKey, true)
          return () => window.removeEventListener('keydown', escapeOnKey, true)
        })

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

        ctx.effect(() =>
          ctx.inject(['sidebarRightTabs', 'sidebarRight'], (sub) => {
            sidebarRight = sub.sidebarRight ?? null
            sub.effect(() =>
              sub.sidebarRightTabs.register({
                id: CHAT_ID,
                kind: CHAT_KIND,
                title: () => t('conversation'),
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
