# Conversation Float

**dsh-conversation-float** — hebt die **Konversationsansicht** aus ihrem festen Platz in DSH und macht daraus ein schwebendes Panel.

Der Float ist **DSHs eigener** — das schwebende Panel des Dock-Kits, dasselbe, das die rechte Seitenleiste nutzt —, kein zweites Browserfenster: In der Taskleiste steht weiterhin nur ein DSH-Fenster. Er enthält **die echte Konversationsansicht**, dieselbe Spalte statt einer neu gezeichneten Kopie, sodass Tippen, Scrollen, der Wechsel zwischen Konversation und Verlauf, der Composer, Anhänge und die Persona-Auswahl nativ bleiben.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Benutzung

**Einstieg**: das kleine Fenstersymbol rechts in der Titelleiste der Sitzung (*Conversation Float*).

Ein Klick öffnet den Float, **während der Rest von DSH sichtbar bleibt**: Beide Seitenleisten sind offen, und der Float sitzt mittig in dem Platz, den sie freilassen. Derselbe Knopf blendet danach die DSH-Oberfläche aus und lässt nur den Float stehen — der Tooltip wechselt dabei von *DSH ausblenden* zu *DSH anzeigen* —, und der nächste Klick holt die Oberfläche zurück. Schließt man den Float, legt ihn in die linke Seitenleiste oder dockt ihn rechts an, geben sich die Seitenleisten von selbst zurück.

Der Float **öffnet groß** (etwa 920×711, an das Fenster angepasst), indem er die eigene `resizeFloat`-Absicht des Dock-Kits aufruft — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, wobei `paneId` aus `data-dockkit-float` am Float stammt. Er vergrößert nur; ein bereits vergrößerter Float wird nie wieder verkleinert.

Eine eingeklappte rechte Seitenleiste wird **vor** dem Öffnen aufgeklappt, damit „zurück in die Seitenleiste“ ein Ziel hat; eine eingeklappte linke Seitenleiste ebenso — das Einklappen wird über die gemessene Breite erkannt, ein schmales Fenster schreibt also nie ein Einklapp-Flag.

**Den Float schließen — oder den verborgenen Zustand verlassen — stellt die Seitenleisten so wieder her, wie das Fenster sie hatte.** Hast du während des Floats **selbst** eine Seitenleiste geschlossen oder geöffnet, kommt genau diese letzte Anordnung zurück, auch beim Schließen aus dem verborgenen Zustand: Ein auf die rechte Spalte reduziertes Fenster bleibt so. „Selbst“ zählt nur dein eigener Klick auf eine Seitenleiste oder eine Taste, in beide Richtungen; dass DSH bei kleinem Fenster die linke Seitenleiste einklappt, eine verborgene Seitenleiste neu gesetzt wird oder ein Klick im Float selbst zählt nicht. Der Schnappschuss des früheren Zustands wird einmal vorgenommen, bevor eine Seitenleiste berührt wird, und während des Floats nie überschrieben.

## Nach links, Mitte oder rechts ziehen

Titelleiste des Floats gedrückt halten und ziehen. **1,2 s Halten** bringt den Zug in den Prüfzustand; von da an folgt die Vorschau dem Band unter dem Zeiger, und das Loslassen lässt den Float in dieses Band fallen. Der Prüfzustand startet einmal pro Zug, ein Bandwechsel wartet also nie erneut. Loslassen vor 1,2 s bewirkt nichts — kein versehentliches Verschieben.

Die drei Bänder sind die echten Spalten des Fensters: **linke Seitenleiste** (Rahmenspalte 0, derzeit 0..280), **mittlere Spalte** (280..680), **rechte Seitenleiste** (`data-rightbar-col`, 680..1097). Die Vorschau deckt genau den Block ab, in dem der Float landen wird, in derselben Größe.

| Ziel | Nach dem Loslassen |
| --- | --- |
| **Links** | Der Float wird **in der Schublade der linken Seitenleiste verstaut**: nicht geschlossen, nur unsichtbar, die mittlere Spalte bleibt leer; die linke Seitenleiste bekommt eine Zeile **mit dem Namen dieser Konversation**, die ihn zurückholt |
| **Mitte** | Der Float schließt sich, die Konversation kehrt in die mittlere Spalte zurück |
| **Rechts** | Die Konversation dockt als **Seite in der rechten Seitenleiste** an — ein nativer DSH-Tab mit eigenem *Zurück in die Seitenleiste* und Schließen |

Die Zeile in der linken Seitenleiste entsteht erst, nachdem ein Float wirklich dort abgelegt wurde; vorher bleibt die linke Seitenleiste leer, es gibt keinen dauerhaften Eintrag. Die Zeile trägt den Titel der verstauten Konversation — nicht den Namen des Plugins —, und ein Wechsel der Konversation lässt diesen Titel unverändert: Ein Klick bringt *diese* Konversation zurück und zeigt ihren Float wieder an.

**Oder ganz ohne Ziehen.** Das *Mehr*-Menü der linken Seitenleiste enthält **Konversation hierher verstauen**, die Karte *Weitere Werkzeuge* der rechten Seitenleiste enthält **Konversation hierher verschieben**. Beides sind normale DSH-Menüzeilen unter den mitgelieferten, und jede verbirgt sich, sobald die Konversation schon dort ist, wohin sie führen würde.

## Wie es funktioniert (und warum die Konversation nicht neu gezeichnet wird)

- Die Konversation existiert als **ein DOM**: Das Plugin verschiebt die Spalte, die sie trägt, in den Panel-Körper (dasselbe Dokument, dieselbe React-Wurzel) und beim Schließen oder Hostwechsel zurück; ist ihr ursprünglicher Platz weg, ist die mittlere Spalte der Rückfall.
- **Links verstauen** = eine Markierung an der Wurzel des Floats blendet ihn aus (`visibility`/`opacity`); das Panel wird **nicht geschlossen**, deshalb kann die mittlere Spalte leer bleiben.
- **Rechts andocken** = der Tab wird an die rechte Seitenleiste übergeben (`openResource(..., { destination: 'sidebar' })`) und DSH übernimmt Verschieben und Andocken.
- **Der angedockte Tab behält seinen Körper**: Der Tab-Typ ist mit `keepMounted` registriert, daher bleibt die Konversation beim Wechsel auf einen anderen Tab der rechten Seitenleiste in diesem Körper, statt in die mittlere Spalte zurückzukehren. Die Spalte folgt dem jeweils sichtbaren gehaltenen Körper, solange ihre eigene Sitzung die aktuelle ist; bei jeder anderen Sitzung ist die mittlere Spalte wieder der Platz, genau wie zuvor.

## Performance

Jeder Animationsframe misst höchstens einmal; die drei Bänder werden beim Drücken einmal gemessen. Die Vorschau wird nur neu gezeichnet, wenn sich das Band tatsächlich ändert, und bewegt sich per `transform`. Frühere Versionen maßen bei jeder Mausbewegung das Layout und schrieben vier Stile — das, nicht die Drop-Logik, ließ das Ziehen langsamer wirken als bei DSH selbst.

## Bekannte Grenzen

- Eine Konversation hat genau einen Host: Die Zeile in der linken Seitenleiste ist ein **Einstieg**, nie eine zweite lebende Kopie der Konversation.
- Der Float gehört zu der Sitzung, die ihn geöffnet hat: Ein Wechsel zu einer anderen Sitzung gibt die Konversation an deren mittlere Spalte zurück (oder an deren eigenen Float, falls sie einen hat), und beim Zurückwechseln erscheint der Float dieser Sitzung wieder.
- Die Zeile in der linken Seitenleiste trägt den Namen der verstauten Konversation und behält ihn, während das Fenster andere Konversationen zeigt. Ein Klick wechselt zu dieser Konversation und blendet ihren Float ein; er schwebt nie die Konversation, die gerade auf dem Bildschirm ist.
- Die Schublade hält **eine** Konversation. Ein weiteres Verstauen ersetzt die ansässige: Der ersetzte Float wird wieder ein gewöhnlicher Float (er verliert nur die Schubladen-Markierung), sodass die linke Seitenleiste nie eine zweite Zeile bekommt.
- Ein Float aus der Schublade zurückzuholen setzt ihn **dorthin, wo er verstaut wurde** (möglicherweise über der linken Seitenleiste); er zentriert sich nicht neu.
- Dies ist ein Float im DSH-Fenster, kein separates Betriebssystemfenster.
- Nach einem Neustart von DSH ist der Schubladenzustand weg; die Konversation kehrt in die mittlere Spalte zurück.

## Den Float bewegen

Der Float wird von DSHs eigenem Ziehen bewegt. Solange eine Hand am Panel ist, wendet das Plugin keinen eigenen Platz an — das erneut angewandte Rechteck mitten im Ziehen war der Grund, warum der Float früher bei der ersten Bewegung zurücksprang.

## Installation

Erfordert DSH **>= 0.2.2-rc.1** — die Version, gegen die dieses Bundle entwickelt und getestet wird.

### Von npm

```bash
npm i dsh-conversation-float
```

Danach in der **`package.json` des Profils** registrieren — beide Schritte sind nötig:

1. `"dsh-conversation-float": "^0.1.4"` zu `dependencies` hinzufügen
2. `"dsh-conversation-float"` zu `dsh.profile.bundles` hinzufügen — nur ein registriertes Bundle erscheint in der Plugin-Liste und lässt sich umschalten

### Aus dem Quellcode

1. Quellcode irgendwo ablegen
2. per Junction nach `<Profil>/node_modules/dsh-conversation-float` verlinken
3. in der `package.json` des Profils: `dependencies` bekommt `"dsh-conversation-float": "link:<Pfad>"`, `dsh.profile.bundles` bekommt `"dsh-conversation-float"`
4. `client.js` lädt heiß nach; die Host-Hälfte (`index.js`) ist ein No-op und braucht nur beim Ändern einen Neustart

## Lizenz

MIT
