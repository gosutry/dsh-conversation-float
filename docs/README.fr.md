# Fenêtre flottante de conversation

**dsh-conversation-float** — sort la **vue de conversation** de sa place fixe dans DSH et en fait un panneau flottant.

La fenêtre est **celle de DSH** — le panneau flottant du kit d'ancrage, celui qu'utilise la barre latérale droite — et non une seconde fenêtre du navigateur : la barre des tâches n'affiche toujours qu'une fenêtre DSH. Elle contient la **vraie vue de conversation** : la même colonne, pas une copie redessinée, donc la saisie, le défilement, le passage entre Conversation et Trajectoire, le compositeur, les pièces jointes et le sélecteur de persona restent natifs.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Utilisation

**Entrée** : la petite icône de fenêtre à droite de la barre de titre de la session (*Conversation float*).

Un clic ouvre la fenêtre et le reste de l'interface DSH s'efface ; le même bouton ramène DSH, c'est une bascule. Fermer la fenêtre, la ranger dans la barre de gauche ou l'ancrer dans celle de droite ramène l'interface d'elle-même.

La fenêtre **s'ouvre grande** (environ 920×711, ajustée à la fenêtre) en appelant l'intention `resizeFloat` du kit — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, `paneId` étant lu dans `data-dockkit-float`. Elle n'agrandit que : une fenêtre déjà agrandie n'est jamais réduite.

Une barre de droite repliée est **dépliée avant** l'ouverture, pour que « retour à la barre » ait une destination ; la barre de gauche l'est aussi — le repli est détecté en mesurant la largeur, donc aucune marque de repli n'est écrite dans une fenêtre étroite.

**Fermer la fenêtre et ramener la conversation dans la colonne centrale restaure les barres exactement comme avant l'ouverture.** Si **vous-même** avez touché une barre pendant que la fenêtre était ouverte, votre dernier réglage l'emporte. « Vous-même » ne compte que votre appui ou votre touche, dans les deux sens : que DSH rétrécisse la barre de gauche dans une petite fenêtre, ou qu'une barre masquée soit réorganisée, ne compte pas. L'instantané est pris une fois, avant de toucher une barre, et n'est jamais écrasé pendant l'ouverture.

## Glisser à gauche, au centre ou à droite

Maintenez la barre de titre pour glisser. **Après 1,2 s d'appui**, le glissement passe en mode jugement ; dès lors le contour suit la bande sous le pointeur et le relâchement dépose dans cette bande. Le jugement s'active une fois par glissement : changer de bande n'attend plus. Relâcher avant 1,2 s ne fait rien — pas de déplacement accidentel.

Les trois bandes sont les colonnes réelles : **barre de gauche** (0..280), **colonne centrale** (280..680), **barre de droite** (la colonne `data-rightbar-col`, 680..1097). Le contour couvre exactement le bloc où la fenêtre atterrira, à sa taille.

| Dépôt | Après le relâchement |
| --- | --- |
| **Gauche** | La fenêtre est **rangée dans le tiroir de la barre de gauche** : elle n'est pas fermée, seulement invisible, donc la colonne centrale reste vide ; la barre de gauche gagne une ligne *Conversation float* qui la ramène |
| **Centre** | La fenêtre se ferme et la conversation revient dans la colonne centrale |
| **Droite** | La conversation s'ancre comme **page dans la barre de droite** — un onglet DSH natif avec son *Retour à la barre* et sa fermeture |

La ligne de gauche n'existe qu'après y avoir réellement rangé une fenêtre ; avant cela la barre de gauche reste vide, sans entrée permanente.

## Fonctionnement (et pourquoi rien n'est redessiné)

- La conversation n'existe qu'en **un seul DOM** : le plugin déplace la colonne qui la porte dans le corps du panneau (même document, même racine React) et la remet en place à la fermeture ou au changement d'hôte ; si sa place d'origine a disparu, la colonne centrale sert de repli.
- **Ranger à gauche** = un marqueur sur la racine de la fenêtre la rend invisible (`visibility`/`opacity`) ; le panneau **n'est pas fermé**, d'où la colonne centrale vide.
- **Ancrer à droite** = confie l'onglet à la barre de droite (`openResource(..., { destination: 'sidebar' })`) et laisse DSH déplacer et ancrer.

## Performance

Au plus une mesure par image d'animation ; les trois bandes sont mesurées une fois, à l'appui. Le contour n'est redessiné que lorsque la bande change réellement, et se déplace par `transform`. Les versions précédentes mesuraient la mise en page et écrivaient quatre styles à chaque mouvement de souris — c'est cela, et non la logique de dépôt, qui rendait le glissement plus poussif que celui de DSH.

## Limites connues

- Une conversation n'a qu'un hôte : la ligne de gauche est une **entrée**, jamais une seconde copie vivante.
- Sortir la fenêtre du tiroir la remet **là où elle a été rangée** (parfois sur la barre de gauche) ; elle ne se recentre pas.
- C'est une fenêtre dans DSH, pas une fenêtre système indépendante.
- Après redémarrage de DSH, l'état du tiroir est perdu ; la conversation revient dans la colonne centrale.

## Installation

### Depuis npm

```bash
npm i dsh-conversation-float
```

Puis déclarez-la dans le **`package.json` du profil** — les deux étapes sont nécessaires :

1. ajoutez `"dsh-conversation-float": "^0.1.1"` dans `dependencies`
2. ajoutez `"dsh-conversation-float"` dans `dsh.profile.bundles` — seul un bundle déclaré apparaît dans la liste des plugins et peut être activé

### Depuis les sources

1. placez les sources où vous voulez
2. liez-les par junction dans `<profile>/node_modules/dsh-conversation-float`
3. dans le `package.json` du profil : `dependencies` reçoit `"dsh-conversation-float": "link:<chemin>"`, `dsh.profile.bundles` reçoit `"dsh-conversation-float"`
4. `client.js` se recharge à chaud ; la moitié hôte (`index.js`) est vide et n'exige un redémarrage que si vous la modifiez

## Licence

MIT