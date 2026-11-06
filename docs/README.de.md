# Konversations-Float

**dsh-conversation-float** — hebt die **Konversationsansicht** aus ihrem festen Platz in DSH heraus und macht daraus ein schwebendes Panel.

Das Float gehört **DSH selbst** — es ist das schwebende Panel des Dock-Kits, dasselbe, das die rechte Seitenleiste nutzt, und kein zweites Browserfenster: In der Taskleiste steht weiterhin genau ein DSH-Fenster. Darin liegt die **echte Konversationsansicht** — dieselbe Spalte, keine neu gezeichnete Kopie —, deshalb bleiben Tippen, Scrollen, der Wechsel zwischen Konversation und Verlauf, der Composer, Anhänge und die Persona-Auswahl nativ.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Benutzung

**Einstieg**: das kleine Fenstersymbol rechts in der Titelleiste der Sitzung (*Conversation float*).

Ein Klick öffnet das Float, und der übrige DSH-Rahmen tritt beiseite; derselbe Knopf holt DSH zurück — ein Umschalter. Wird das Float geschlossen, in die linke Seitenleiste gelegt oder rechts angedockt, kommt der Rahmen von selbst zurück.

Das Float **öffnet groß** (etwa 920×711, an das Fenster angepasst), indem es die `resizeFloat`-Absicht des Dock-Kits aufruft — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, wobei `paneId` aus `data-dockkit-float` am Float stammt. Es vergrößert nur: Ein bereits vergrößertes Float wird nie wieder verkleinert.

Eine eingeklappte rechte Seitenleiste wird **vor** dem Öffnen ausgeklappt, damit „zurück in die Seitenleiste" ein Ziel hat; die linke wird ebenfalls ausgeklappt — das Einklappen wird über die Breite erkannt, in schmalen Fenstern wird also nie ein Einklapp-Flag geschrieben.

**Das Schließen des Floats und die Rückkehr der Konversation in die mittlere Spalte stellen die Seitenleisten genau so wieder her, wie sie vorher waren.** Hast du während des Floats **selbst** eine Seitenleiste angefasst, gilt deine letzte Einstellung. „Selbst" zählt nur deinen eigenen Klick oder Tastendruck, in beide Richtungen: dass DSH die linke Seitenleiste in einem kleinen Fenster verengt oder eine verdeckte Seitenleiste neu anordnet, zählt nicht. Der Schnappschuss wird einmal genommen, bevor eine Seitenleiste angefasst wird, und während des Floats nie überschrieben.

## Nach links, Mitte oder rechts ziehen

Titelleiste halten und ziehen. **Nach 1,2 s Halten** geht das Ziehen in den Prüfzustand; von da an folgt der Rahmen dem Band unter dem Zeiger, und das Loslassen legt in diesem Band ab. Der Prüfzustand wird pro Zug einmal betreten, beim Bandwechsel wird nie erneut gewartet. Loslassen vor 1,2 s bewirkt nichts — keine versehentlichen Verschiebungen.

Die drei Bänder sind die echten Spalten des Fensters: **linke Seitenleiste** (0..280), **mittlere Spalte** (280..680), **rechte Seitenleiste** (die Spalte `data-rightbar-col`, 680..1097). Der Rahmen deckt genau den Bereich ab, in dem das Float landen wird, in derselben Größe.

| Ablegen | Nach dem Loslassen |
| --- | --- |
| **Links** | Das Float wird **in die Schublade der linken Seitenleiste gelegt**: nicht geschlossen, nur unsichtbar, deshalb bleibt die mittlere Spalte leer; links erscheint eine Zeile *Conversation float*, die es zurückholt |
| **Mitte** | Das Float schließt, die Konversation kehrt in die mittlere Spalte zurück |
| **Rechts** | Die Konversation dockt als **Seite in der rechten Seitenleiste** an — ein nativer DSH-Tab mit *Zurück in die Seitenleiste* und Schließen |

Die Zeile links entsteht erst, nachdem wirklich ein Float dorthin gelegt wurde; vorher bleibt die linke Seitenleiste leer, ohne dauerhaften Einstieg.

## Wie es funktioniert (und warum nichts neu gezeichnet wird)

- Die Konversation existiert als **ein DOM**: Das Plugin verschiebt die tragende Spalte in den Panelkörper (gleiches Dokument, gleiche React-Wurzel) und beim Schließen oder Hostwechsel zurück; ist der alte Platz weg, ist die mittlere Spalte der Rückfall.
- **Links ablegen** = eine Markierung an der Float-Wurzel blendet sie aus (`visibility`/`opacity`); das Panel wird **nicht geschlossen**, deshalb kann die mittlere Spalte leer bleiben.
- **Rechts andocken** = der Tab geht an die rechte Seitenleiste (`openResource(..., { destination: 'sidebar' })`), Verschieben und Andocken erledigt DSH.

## Leistung

Pro Animationsframe höchstens eine Messung; die drei Bänder werden beim Drücken einmal gemessen. Der Rahmen wird nur neu gezeichnet, wenn das Band wirklich wechselt, und bewegt sich per `transform`. Frühere Versionen maßen bei jeder Mausbewegung das Layout und schrieben vier Styles — das, nicht die Ablagelogik, ließ das Ziehen träger wirken als bei DSH selbst.

## Bekannte Grenzen

- Eine Konversation hat genau einen Host: Die Zeile links ist ein **Einstieg**, nie eine zweite lebende Kopie.
- Holst du das Float aus der Schublade, erscheint es **dort, wo es abgelegt wurde** (möglicherweise über der linken Seitenleiste), nicht neu zentriert.
- Das ist ein Float im DSH-Fenster, kein eigenes Betriebssystemfenster.
- Nach einem Neustart von DSH ist der Schubladenzustand weg; die Konversation ist wieder in der mittleren Spalte.

## Installation

### Aus npm

```bash
npm i dsh-conversation-float
```

Danach in der **`package.json` des Profils** eintragen — beides ist nötig:

1. `"dsh-conversation-float": "^0.1.1"` in `dependencies`
2. `"dsh-conversation-float"` in `dsh.profile.bundles` — nur ein registriertes Bundle erscheint in der Plugin-Liste und lässt sich umschalten

### Aus dem Quelltext

1. Quelltext irgendwo ablegen
2. per Junction nach `<profile>/node_modules/dsh-conversation-float` verlinken
3. in der `package.json` des Profils: `dependencies` bekommt `"dsh-conversation-float": "link:<path>"`, `dsh.profile.bundles` bekommt `"dsh-conversation-float"`
4. `client.js` lädt heiß nach; die Host-Hälfte (`index.js`) ist ein No-op und braucht nur bei Änderungen einen Neustart

## Lizenz

MIT