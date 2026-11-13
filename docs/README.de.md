# Conversation Float

**dsh-conversation-float** verwandelt die DSH-Konversation in ein echtes schwebendes Fenster innerhalb von DSH – nicht in ein zweites Betriebssystemfenster. Das Fenster kann über der App liegen, in die linke Seitenleiste als Taskleisten-Zeile minimiert oder in die rechte Seitenleiste gedockt werden. Die Konversation bleibt nutzbar, während du Plugin-Seiten, Automations-Seiten und andere Einträge der linken Seitenleiste öffnest.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Was du bekommst

- **Ein Klick** über das kleine Fenstersymbol rechts in der Titelleiste der Sitzung.
- **Die echte Konversation**, keine neu gezeichnete Kopie: Tippen, Scrollen, die Tabs Conversation/Trajectory, der Composer, Anhänge und die Persona-Auswahl bleiben nativ.
- **Mehrere Floats**, eines pro Session, jedes mit eigener Zeile in der linken Seitenleiste.
- **Eine Taskleiste, die nur Fenster nach vorn holt**: Ein Klick auf eine Sitzungszeile bringt dieses Float nach vorn und ändert nie die Seite dahinter.
- **Eine vollständige Konversation auf Seiten außerhalb der Konversation**: Wenn du Plugins, Automations, Settings oder einen anderen Eintrag der linken Seitenleiste öffnest, bleibt das Float der laufenden Konversation mit seiner Kopfzeile, den View-Tabs und dem Composer auf dem Bildschirm. Die Seite bleibt in der mittleren Spalte hinter dem Float.
- **Ein Einstiegsknopf mit drei Zuständen**: das Float öffnen, den Rest von DSH ausblenden oder den Rest von DSH zurückholen.
- **Menüzeilen, die wissen, wann sie verschwinden müssen**: „Konversation hierher legen“ blendet sich aus, sobald das Fenster minimiert ist, und „Konversation hierher verschieben“ blendet sich aus, sobald es rechts angedockt ist.

## Öffnen, minimieren, schließen

Klicke auf das Fenstersymbol in der Titelleiste der Sitzung. Das Float öffnet groß (etwa 920×720, an das Fenster skaliert), während der Rest von DSH weiterhin sichtbar ist und beide Seitenleisten den Platz nutzen, den es freilässt.

Derselbe Knopf durchläuft drei Zustände:

1. das Float öffnen;
2. die DSH-Oberfläche ausblenden und nur das Float stehen lassen;
3. die DSH-Oberfläche wieder anzeigen.

Das Schließen des Floats, sein Minimieren in die linke Seitenleiste oder sein Andocken in die rechte Seitenleiste stellt die Anordnung der Seitenleisten wieder her, die beim Öffnen des Floats festgehalten wurde. Die Momentaufnahme wird einmal erstellt und nicht überschrieben, solange das Fenster offen ist. Änderungen, die du während der Öffnung an den Seitenleisten vornimmst, werden nicht mitverfolgt.

Die **—**-Schaltfläche des Fensters minimiert es: Das Fenster verschwindet, seine Taskleisten-Zeile in der linken Seitenleiste bleibt jedoch bestehen. Klicke auf diese Zeile, um es zurückzuholen. Die **✕**-Schaltfläche schließt es endgültig: Fenster und Zeile verschwinden, und die Konversation kehrt in die mittlere Spalte zurück.

Solange DSH ausgeblendet ist, holt **Escape** die Oberfläche zurück.

## Die Konversation verschieben

Halte die Titelleiste des Fensters fest und ziehe. Wenn du **1,2 Sekunden** still hältst, werden die Ablagebereiche aktiviert; die Titelleiste färbt sich ein, ein Rahmen folgt dem Bereich unter dem Zeiger, und beim Loslassen wird die Konversation dort abgelegt. Loslassen vor Ablauf der Haltezeit bewirkt nichts. Bei Touch-Eingabe bleibt die Geste eine normale Fensterverschiebung, wenn du dich mehr als 10 px bewegst, bevor die Haltezeit abgelaufen ist.

| Ablegen auf | Ergebnis |
| --- | --- |
| **Linke Seitenleiste** | Das Fenster wird in die linke Seitenleiste minimiert. Es wird nicht geschlossen; seine Taskleisten-Zeile ist der Weg zurück. Die mittlere Spalte bleibt leer. |
| **Mitte** | Das Fenster schließt sich, und die Konversation kehrt in die mittlere Spalte zurück. |
| **Rechte Seitenleiste** | Die Konversation dockt als native Seite in der rechten Seitenleiste an, mit DSHs eigenen Zurück- und Schließen-Steuerelementen. |

Die Zeile in der linken Seitenleiste trägt den Titel der Conversation, nicht den Namen des Plugins. Sie behält diesen Titel, während das Fenster andere Conversations betrachtet. Ein Klick auf die Zeile zeigt dieses Fenster nur an und holt es nach vorn; er wählt nie das Hauptpanel des Plugins aus und nimmt nie eine Plugin- oder Automations-Seite weg.

**Oder überspringe das Ziehen.** Das Menü *Weitere* der linken Seitenleiste enthält **Konversation hierher legen**. Der Hinweis der rechten Seitenleiste enthält **Konversation hierher verschieben**. Jede Zeile blendet sich selbst aus, wenn die Konversation bereits an dieser Stelle ist.

## Seiten außerhalb der Konversation

Wenn du Plugins, Automations, Settings oder einen anderen Eintrag der linken Seitenleiste öffnest, kehrt die Konversationsspalte in die mittlere Spalte zurück, damit die Seite den normalen Dreispalten-Rahmen nutzen kann. Das Float der laufenden Session bleibt auf dem Bildschirm und wechselt zu einer **vollständigen lokalen Konversation**: Sitzungskopf, Conversation-/Trajectory-Tabs und Composer. Es ist kein schreibgeschütztes Transkript.

Die Seite liegt **hinter dem Float**. Ziehe das Float zur Seite, um auf der Seite zu arbeiten. Ein Klick auf die Taskleisten-Zeile der Session holt nur das Float nach vorn; die Seite bleibt offen und unverändert. Das Schließen der Seite oder die normale Rückkehr zur Konversation gibt die echte Konversationsspalte wieder an das Float ab.

Ein Fenster für eine Session, die **nicht** die laufende ist, zeigt weiterhin ein schreibgeschütztes Transkript. Eine Konversation hat genau einen aktiven Composer; der Composer und die View-Tabs gehören zur laufenden Session.

## Mehrere Fenster und die Taskleiste

Jede Session kann ein Float haben. Jedes Float erhält eine Zeile in der linken Seitenleiste, angeordnet wie eine Taskleiste. Die Zeilen sind nach ihren Sessions benannt.

- Ein Klick auf eine Zeile **holt dieses Fenster nach vorn**. Er wechselt nicht die aktuelle Session und ändert nicht das Hauptpanel.
- Ein nicht laufendes Fenster zeigt einen Chip **Zu dieser Konversation wechseln**, wenn es obenauf liegt. Ein Klick darauf macht diese Session zur laufenden; das Fenster übernimmt dann die echte Konversationsspalte.
- Das Schließen eines Fensters berührt die anderen nicht.
- Eine Taskleisten-Zeile einer Session ist ein Eintrag, nie eine zweite aktive Kopie der Konversation.

## In die rechte Seitenleiste docken

Das Ziehen nach rechts oder die Verwendung von **Konversation hierher verschieben** übergibt den Tab an die rechte Seitenleiste von DSH. Der Tab-Typ ist mit `keepMounted` registriert, sodass der Wechsel zu einem anderen Tab der rechten Seitenleiste die Konversation in ihrem eigenen Tab-Body belässt. Die Spalte folgt dem jeweils angezeigten beibehaltenen Body, solange ihre Session läuft; bei jeder anderen Session ist die mittlere Spalte wieder der Platz.

## Entwurf und Composer

Eine Session hat eine Eingabehülle und einen Editor, und der Editor kann immer nur an einem DOM-Root gleichzeitig hängen. Wenn die Konversation zwischen der mittleren Spalte, einem Fenster und einer Seite der rechten Seitenleiste wechselt, hängt das Plugin den Editor erneut an den Composer auf dem Bildschirm und setzt den Entwurfsschreiber in einen leeren Slot zurück. Der Entwurf, den du siehst, ist der Entwurf, der gesendet wird.

Das Schließen des Floats klickt keinen anderen View-Tab mehr an, um ein erneutes Mounten zu erzwingen. Das Plugin repariert den Editor direkt, sodass das Fenster ohne Aufblitzen von Trajectory oder einer anderen View zur Konversation zurückkehrt.

## Performance

Jeder Animationsframe führt höchstens eine Layout-Messung aus. Die drei Ablagebereiche werden einmal beim Drücken gemessen. Wartezeiten, die davon abhängen, dass DSH eine Änderung übernimmt, werden framegesteuert; das Plugin hält **kein Interval** und führt seine Reparaturen in Layout-Durchläufen aus, die DSH ohnehin verursacht. Der Rahmen wird nur neu gezeichnet, wenn sich der Bereich ändert, und bewegt sich mit `transform`.

## Bekannte Grenzen

- Das Float ist **im DSH-Fenster**, kein separates Betriebssystemfenster.
- Eine Konversation hat genau **einen Host**. Eine Taskleisten-Zeile ist ein Eintrag, nie eine zweite aktive Kopie.
- Ein Fenster, dessen Session nicht läuft, zeigt ein **schreibgeschütztes Transkript**: keine View-Tabs, keinen Composer. Wechsle es zur laufenden Session, um tippen zu können.
- Das laufende Float behält eine vollständige lokale Konversation, während eine Seite außerhalb der Konversation geöffnet ist, aber diese Seite liegt **hinter dem Fenster**. Das Float schrumpft nicht zu einer Seitenleiste und dockt sich nicht von selbst an.
- Das Float gehört zu der Session, die es geöffnet hat. Ein Session-Wechsel übergibt die Konversation an die mittlere Spalte der neuen Session oder an deren eigenes Float; beim Zurückwechseln kommt das alte Float zurück.
- Ein Neustart von DSH löscht Floats und Taskleisten-Zeilen. Die Konversation kehrt in die mittlere Spalte zurück.
- Die Composer-Reparatur nutzt einige DSH-interne Formen (der Editor hinter der Composer-Box, die Konversationseingabehülle und ihr Entwurfs-Slot). Eine künftige DSH-Version, die sie umbenennt, degradiert zum alten Verhalten statt abzustürzen.

## Installation

Erfordert DSH **>= 0.2.2-rc.1**.

### Aus npm

    npm i dsh-conversation-float@0.3.0

Registriere es danach im **`package.json` des Profils** – beide Schritte sind erforderlich:

1. füge `"dsh-conversation-float": "^0.3.0"` zu `dependencies` hinzu;
2. füge `"dsh-conversation-float"` zur Liste `dsh.profile.bundles` des Profils hinzu.

Nur ein registriertes Bundle erscheint in der Plugin-Liste und lässt sich umschalten.

### Aus einem Tarball

    dsh plugin add <path-to>/dsh-conversation-float-0.3.0.tgz

Oder lege den Tarball im Profil ab und verwende eine `file:`-Abhängigkeit, dann füge den Namen zur Bundle-Liste hinzu.

### Aus dem Quellcode

1. lege den Quellcode an einer beliebigen Stelle ab;
2. verlinke ihn nach `<profile>/node_modules/dsh-conversation-float`;
3. füge eine `link:`-Abhängigkeit und den Bundle-Namen zum Profil hinzu.

Das Bundle wird beim Start zusammengesetzt, starte DSH daher nach der Installation oder dem Upgrade neu.

## Lizenz

MIT
