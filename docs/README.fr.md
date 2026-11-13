# Conversation Float

**dsh-conversation-float** transforme la conversation DSH en une véritable fenêtre flottante à l'intérieur de DSH — pas une seconde fenêtre du système d'exploitation. La fenêtre peut rester au-dessus de l'application, être réduite dans la barre latérale gauche sous forme de ligne de barre des tâches, ou être ancrée dans la barre latérale droite. Elle garde la conversation utilisable pendant que vous ouvrez des pages de plugin, des pages d'automation et d'autres entrées de la barre latérale gauche.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Ce que vous obtenez

- **Un clic** depuis la petite icône de fenêtre à droite de la barre de titre de la session.
- **La vraie conversation**, pas une copie redessinée : la saisie, le défilement, les onglets Conversation/Trajectory, le composeur, les pièces jointes et le sélecteur de persona restent natifs.
- **Plusieurs flottants**, un par Session, chacun avec sa propre ligne dans la barre latérale gauche.
- **Une barre des tâches qui ne fait que remonter les fenêtres** : cliquer sur une ligne de session amène ce flottant au premier plan et ne change jamais la page qui se trouve derrière.
- **Une conversation complète sur les pages hors conversation** : ouvrir Plugins, Automations, Settings ou une autre entrée de la barre latérale gauche laisse le flottant de la conversation active à l'écran avec son en-tête, ses onglets View et son composeur. La page reste dans la colonne centrale, derrière le flottant.
- **Un bouton d'entrée à trois états** : ouvrir le flottant, masquer le reste de DSH, ou ramener le reste de DSH.
- **Des lignes de menu qui savent quand disparaître** : « Ranger la conversation ici » disparaît une fois la fenêtre réduite, et « Déplacer la conversation ici » disparaît une fois la conversation ancrée à droite.

## Ouvrir, réduire, fermer

Cliquez sur l'icône de fenêtre dans la barre de titre de la session. Le flottant s'ouvre en grand (environ 920×720, ajusté à la fenêtre), le reste de DSH restant visible et les deux barres latérales dans l'espace qu'il laisse.

Le même bouton cycle entre trois états :

1. ouvrir le flottant ;
2. masquer l'interface DSH et ne laisser que le flottant ;
3. réafficher l'interface DSH.

Fermer le flottant, le réduire dans la barre latérale gauche ou l'ancrer dans la barre latérale droite remet les barres latérales dans la disposition capturée à l'ouverture du flottant. L'instantané est pris une seule fois et n'est pas écrasé tant que la fenêtre est affichée. Les modifications que vous apportez aux barres latérales pendant que le flottant est ouvert ne sont pas suivies.

Le bouton **—** de la fenêtre la réduit : la fenêtre disparaît, mais sa ligne de barre des tâches dans la barre latérale gauche reste. Cliquez sur cette ligne pour la faire revenir. Le bouton **✕** la ferme définitivement : la fenêtre et sa ligne disparaissent, et la conversation retourne dans la colonne centrale.

Pendant que DSH est masqué, **Escape** ramène l'interface.

## Déplacer la conversation

Maintenez la barre de titre de la fenêtre et faites glisser. Un maintien immobile de **1,2 seconde** arme les zones de dépôt ; la barre de titre se teinte, un contour suit la zone située sous le pointeur, et le relâchement dépose la conversation à cet endroit. Relâcher avant la fin du maintien ne fait rien. Au toucher, un déplacement de plus de 10 px avant la fin du maintien conserve le geste comme un déplacement de fenêtre normal.

| Déposer sur | Résultat |
| --- | --- |
| **Barre latérale gauche** | La fenêtre est réduite dans la barre latérale gauche. Elle n'est pas fermée ; sa ligne de barre des tâches est le moyen d'y revenir. La colonne centrale reste vide. |
| **Centre** | La fenêtre se ferme et la conversation retourne dans la colonne centrale. |
| **Barre latérale droite** | La conversation s'ancre comme une page native dans la barre latérale droite, avec les propres contrôles de retour et de fermeture de DSH. |

La ligne de la barre latérale gauche porte le titre de la conversation, et non le nom du plugin. Elle conserve ce titre même lorsque la fenêtre affiche d'autres conversations. Cliquer sur la ligne ne fait qu'afficher et remonter cette fenêtre ; cela ne sélectionne jamais le panneau principal du plugin et ne retire jamais une page de plugin ou d'automation.

**Ou évitez le glisser.** Le menu *Plus* de la barre latérale gauche contient **Ranger la conversation ici**. Le guide de la barre latérale droite contient **Déplacer la conversation ici**. Chaque ligne se masque elle-même lorsque la conversation se trouve déjà à cet endroit.

## Pages hors de la conversation

Lorsque vous ouvrez Plugins, Automations, Settings ou une autre entrée de la barre latérale gauche, la colonne de conversation revient dans la colonne centrale afin que la page puisse utiliser le cadre normal à trois colonnes. Le flottant de la Session active reste à l'écran et passe à une **conversation locale complète** : en-tête de session, onglets Conversation/Trajectory et composeur. Ce n'est pas une transcription en lecture seule.

La page se trouve **derrière le flottant**. Faites glisser le flottant de côté pour travailler sur la page. Cliquer sur la ligne de barre des tâches de la Session ne fait que remonter le flottant ; la page reste ouverte et inchangée. Fermer la page, ou revenir normalement à la conversation, rend la vraie colonne de conversation au flottant.

Une fenêtre pour une Session qui n'est **pas** la session active affiche toujours une transcription en lecture seule. Une conversation n'a qu'un seul composeur actif ; le composeur et les onglets View appartiennent à la Session active.

## Fenêtres multiples et barre des tâches

Chaque Session peut avoir un flottant. Chaque flottant obtient une ligne dans la barre latérale gauche, ordonnée comme une barre des tâches. Les lignes portent le nom de leur Session.

- Cliquer sur une ligne **remonte cette fenêtre**. Cela ne change pas la Session courante et ne modifie pas le panneau principal.
- Une fenêtre non active affiche une puce **Passer à cette conversation** lorsqu'elle est au premier plan. Cliquer dessus rend cette Session active ; la fenêtre prend alors la vraie colonne de conversation.
- Fermer une fenêtre ne touche pas aux autres.
- Une ligne de barre des tâches de session est une entrée, jamais une seconde copie active de la conversation.

## Ancrer dans la barre latérale droite

Faire glisser vers la droite, ou utiliser **Déplacer la conversation ici**, confie l'onglet à la barre latérale droite de DSH. Le type d'onglet est enregistré avec `keepMounted`, de sorte que passer à un autre onglet de la barre latérale droite laisse la conversation dans le corps de son propre onglet. La colonne suit le corps retenu qui est à l'écran tant que sa Session est active ; pour toute autre Session, la colonne centrale redevient la place.

## Brouillon et composeur

Une Session possède une seule enveloppe de saisie et un seul éditeur, et l'éditeur ne peut être rattaché qu'à une seule racine DOM à la fois. Lorsque la conversation se déplace entre la colonne centrale, une fenêtre et une page de la barre latérale droite, le plugin rattache à nouveau l'éditeur au composeur affiché et restaure le rédacteur de brouillon dans un emplacement vide. Le brouillon que vous voyez est le brouillon qui sera envoyé.

Fermer le flottant ne clique plus sur un autre onglet View pour forcer un remontage. Le plugin répare l'éditeur directement, de sorte que la fenêtre revient à la conversation sans faire clignoter Trajectory ni aucun autre View.

## Performance

Chaque image d'animation effectue au plus une mesure de mise en page. Les trois zones de dépôt sont mesurées une fois, à l'appui. Les attentes qui dépendent d'un changement appliqué par DSH sont pilotées par les images ; le plugin ne conserve **aucun intervalle** et exécute ses réparations lors des passes de mise en page que DSH provoque déjà. Le contour n'est repeint que lorsque la zone change et se déplace avec `transform`.

## Limites connues

- Le flottant est **à l'intérieur de la fenêtre DSH**, et non une fenêtre séparée du système d'exploitation.
- Une conversation a exactement **un hôte**. Une ligne de barre des tâches est une entrée, jamais une seconde copie active.
- Une fenêtre dont la Session n'est pas active affiche une **transcription en lecture seule** : pas d'onglets View, pas de composeur. Passez-la à la Session active pour écrire.
- Le flottant actif conserve une conversation locale complète tant qu'une page hors conversation est ouverte, mais cette page se trouve **derrière la fenêtre**. Le flottant ne se réduit pas automatiquement à une barre latérale et ne s'ancre pas de lui-même.
- Le flottant appartient à la Session qui l'a ouvert. Changer de Session confie la conversation à la colonne centrale de la nouvelle Session ou à son propre flottant ; revenir en arrière ramène l'ancien flottant.
- Redémarrer DSH efface les flottants et les lignes de barre des tâches. La conversation retourne dans la colonne centrale.
- La réparation du composeur utilise quelques formes internes à DSH (l'éditeur derrière la boîte de composeur, l'enveloppe de saisie de la conversation et son emplacement de brouillon). Une future version de DSH qui les renommerait se dégraderait vers l'ancien comportement plutôt que de planter.

## Installation

Nécessite DSH **>= 0.2.2-rc.1**.

### Depuis npm

    npm i dsh-conversation-float@0.3.0

Ensuite, enregistrez-le dans le **`package.json` du profil** — les deux étapes sont obligatoires :

1. ajoutez `"dsh-conversation-float": "^0.3.0"` à `dependencies` ;
2. ajoutez `"dsh-conversation-float"` à la liste `dsh.profile.bundles` du profil.

Seul un bundle enregistré apparaît dans la liste des plugins et peut être activé.

### Depuis une archive tarball

    dsh plugin add <path-to>/dsh-conversation-float-0.3.0.tgz

Ou placez l'archive dans le profil et utilisez une dépendance `file:`, puis ajoutez le nom à la liste des bundles.

### Depuis les sources

1. placez les sources où vous voulez ;
2. liez-les dans `<profile>/node_modules/dsh-conversation-float` ;
3. ajoutez une dépendance `link:` et le nom du bundle au profil.

Le bundle est assemblé au démarrage, donc redémarrez DSH après l'installation ou la mise à jour.

## Licence

MIT
