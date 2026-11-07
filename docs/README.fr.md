# Fenêtre de conversation

**dsh-conversation-float** — sort la **vue de conversation** de son siège fixe dans DSH et en fait un panneau flottant.

Le flottant est **celui de DSH** — le panneau flottant du kit d'ancrage, celui qu'utilise la barre latérale droite — et non une seconde fenêtre du navigateur : la barre des tâches n'affiche toujours qu'une seule fenêtre DSH. Il contient **la vraie vue de conversation**, la même colonne et non une copie redessinée, donc la saisie, le défilement, le passage entre Conversation et Trajectoire, le composeur, les pièces jointes et le sélecteur de persona restent natifs.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Utilisation

**Entrée** : la petite icône de fenêtre à droite de la barre de titre de la session (*Conversation float*).

Un clic ouvre le flottant **avec le reste de DSH encore à l'écran** : les deux barres latérales ouvertes, le flottant centré dans l'espace qu'elles laissent. Le *même* bouton masque ensuite l'interface de DSH et ne laisse que le flottant — son info-bulle passe de *Masquer DSH* à *Afficher DSH* — et le clic suivant ramène l'interface. Fermer le flottant, le ranger dans la barre gauche ou l'ancrer à droite rend les barres latérales à leur état.

Le flottant **s'ouvre grand** (environ 920×711, ajusté à la fenêtre) en appelant l'intention `resizeFloat` du kit lui-même — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, `paneId` étant lu depuis `data-dockkit-float` sur le flottant. Il ne fait qu'agrandir : un flottant déjà agrandi n'est jamais rétréci.

Une barre droite repliée est **dépliée avant** l'ouverture du flottant, pour que « revenir dans la barre » ait un endroit où atterrir ; une barre gauche repliée aussi — le repli se détecte en mesurant la largeur, une fenêtre étroite n'écrit donc jamais d'indicateur de repli.

**Fermer le flottant — ou quitter l'état masqué — remet les barres latérales comme la fenêtre les avait.** Si tu as fermé ou ouvert une barre **toi-même** pendant que le flottant était ouvert, c'est cette dernière disposition qui revient, y compris en fermant depuis l'état masqué : une fenêtre réduite à la colonne de droite le reste. « Toi-même » ne compte que ton appui sur une barre ou une touche, dans les deux sens ; le repli de la barre gauche par DSH sur une petite fenêtre, la re-disposition d'une barre masquée ou un clic dans le flottant lui-même ne comptent pas. L'instantané de l'état antérieur est pris une fois, avant de toucher la moindre barre, et n'est jamais écrasé tant que le flottant est ouvert.

## Le glisser à gauche, au centre ou à droite

Maintiens la barre de titre du flottant pour le glisser. **Un maintien de 1,2 s** fait passer le glissement en phase de jugement ; dès lors le contour suit la bande sous le pointeur et le relâchement fait tomber le flottant dans cette bande. Le jugement commence une fois par glissement, changer de bande n'attend donc plus. Relâcher avant 1,2 s ne fait rien — pas de déplacement accidentel.

Les trois bandes sont les vraies colonnes de la fenêtre : **barre gauche** (colonne 0 du cadre, actuellement 0..280), **colonne centrale** (280..680), **barre droite** (`data-rightbar-col`, 680..1097). Le contour couvre exactement le bloc où le flottant va atterrir, à la même taille.

| Dépôt | Après le relâchement |
| --- | --- |
| **Gauche** | Le flottant est **rangé dans le tiroir de la barre gauche** : il n'est pas fermé, seulement invisible, la colonne centrale reste donc vide ; la barre gauche gagne une ligne **portant le nom de cette conversation** qui le ramène |
| **Centre** | Le flottant se ferme et la conversation revient dans la colonne centrale |
| **Droite** | La conversation s'ancre comme **page de la barre droite** — un onglet DSH natif avec son propre *Revenir dans la barre* et sa fermeture |

La ligne de la barre gauche n'existe qu'après y avoir réellement déposé un flottant ; avant cela la barre gauche reste vide et aucune entrée permanente n'est ajoutée. La ligne porte le titre de la conversation rangée — pas le nom du plugin — et changer de conversation ne change pas ce titre : l'appuyer revient à *cette* conversation et réaffiche son flottant.

**Ou sans glisser.** Le menu *Plus* de la barre gauche contient **Ranger la conversation ici**, et la carte *Plus d'outils* de la barre droite contient **Déplacer la conversation ici**. Ce sont des lignes DSH ordinaires, sous celles fournies, et chacune se masque dès que la conversation est déjà là où elle l'enverrait.

## Comment ça marche (et pourquoi la conversation n'est pas redessinée)

- La conversation n'existe que comme **un seul DOM** : le plugin déplace la colonne qui la porte dans le corps du panneau (même document, même racine React) et la remet en place à la fermeture ou au changement d'hôte ; si son siège d'origine a disparu, la colonne centrale sert de repli.
- **Ranger à gauche** = un marqueur à la racine du flottant le rend invisible (`visibility`/`opacity`) ; le panneau **n'est pas fermé**, c'est pourquoi la colonne centrale peut rester vide.
- **Ancrer à droite** = confie l'onglet à la barre droite (`openResource(..., { destination: 'sidebar' })`) et laisse DSH faire le déplacement et l'ancrage.
- **L'onglet ancré garde son corps** : le type d'onglet est enregistré avec `keepMounted`, donc passer à un autre onglet de la barre droite laisse la conversation dans ce corps au lieu de la renvoyer dans la colonne centrale. La colonne suit le corps retenu qui est à l'écran tant que sa propre session est la session courante ; pour toute autre session, la colonne centrale redevient le siège, exactement comme avant.

## Performance

Chaque image d'animation fait au plus une mesure ; les trois bandes sont mesurées une fois, à l'appui. Le contour n'est redessiné que lorsque la bande change vraiment, et se déplace par `transform`. Les versions précédentes mesuraient la mise en page et écrivaient quatre styles à chaque mouvement de souris — c'est cela, et non la logique de dépôt, qui rendait le glissement plus lourd que celui de DSH.

## Limites connues

- Une conversation a exactement un hôte : la ligne de la barre gauche est une **entrée**, jamais une seconde copie vivante de la conversation.
- Le flottant appartient à la session qui l'a ouvert : passer à une autre session rend la conversation à la colonne centrale de cette session (ou à son propre flottant, si elle en a un), et revenir fait réapparaître le flottant de cette session.
- La ligne de la barre gauche porte le nom de la conversation rangée et le garde pendant que la fenêtre regarde d'autres conversations. L'appuyer passe à cette conversation et affiche son flottant ; elle ne fait jamais flotter la conversation affichée à l'écran.
- Le tiroir ne contient **qu'une** conversation. En ranger une autre remplace la résidente : le flottant remplacé redevient un flottant ordinaire (il ne perd que le marqueur du tiroir), la barre gauche n'a donc jamais deux lignes.
- Sortir le flottant du tiroir le remet **là où il a été rangé** (parfois par-dessus la barre gauche) ; il ne se recentre pas.
- C'est un flottant dans la fenêtre DSH, pas une fenêtre système séparée.
- Redémarre DSH et l'état du tiroir disparaît ; la conversation revient dans la colonne centrale.

## Déplacer le flottant

Le flottant est déplacé par le glissement propre à DSH. Tant qu'une main est sur le panneau, le plugin n'applique aucun siège à lui — réappliquer le rectangle mémorisé en plein glissement est ce qui faisait auparavant sauter le flottant au premier mouvement.

## Installation

Nécessite DSH **>= 0.2.2-rc.1** — la version contre laquelle ce paquet est développé et testé.

### Depuis npm

```bash
npm i dsh-conversation-float
```

Ensuite, enregistre-le dans le **`package.json` du profil** — les deux étapes sont nécessaires :

1. ajouter `"dsh-conversation-float": "^0.1.4"` à `dependencies`
2. ajouter `"dsh-conversation-float"` à `dsh.profile.bundles` — seul un paquet enregistré apparaît dans la liste des plugins et peut être activé

### Depuis les sources

1. place les sources où tu veux
2. lie-les par une junction dans `<profil>/node_modules/dsh-conversation-float`
3. dans le `package.json` du profil : `dependencies` reçoit `"dsh-conversation-float": "link:<chemin>"`, `dsh.profile.bundles` reçoit `"dsh-conversation-float"`
4. `client.js` se recharge à chaud ; la moitié hôte (`index.js`) est un no-op et n'exige un redémarrage que si tu la modifies

## Licence

MIT
