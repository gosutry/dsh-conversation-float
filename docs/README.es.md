# Flotante de conversación

**dsh-conversation-float** — saca la **vista de conversación** de su sitio fijo en DSH y la convierte en un panel flotante.

El flotante es **el propio de DSH** — el panel flotante del kit de acoplado, el mismo que usa la barra lateral derecha —, no una segunda ventana del navegador: la barra de tareas sigue mostrando una sola ventana de DSH. Contiene **la vista real de la conversación**, la misma columna y no una copia redibujada, así que escribir, desplazarse, cambiar entre Conversación y Trayectoria, el compositor, los adjuntos y el selector de personas siguen siendo nativos.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Uso

**Entrada**: el pequeño icono de ventana a la derecha de la barra de título de la sesión (*Conversation float*).

Un clic abre el flotante **con el resto de DSH aún en pantalla**: ambas barras laterales abiertas y el flotante centrado en el hueco que dejan. El *mismo* botón oculta después la interfaz de DSH y deja solo el flotante — su tooltip pasa de *Ocultar DSH* a *Mostrar DSH* — y el siguiente clic devuelve la interfaz. Al cerrar el flotante, guardarlo en la barra izquierda o acoplarlo a la derecha, las barras laterales vuelven solas a su sitio.

El flotante **se abre grande** (unos 920×711, ajustado a la ventana) llamando a la intención `resizeFloat` del propio kit — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, con `paneId` leído de `data-dockkit-float` en el flotante. Solo agranda: un flotante que ya has ampliado nunca se encoge.

Una barra lateral derecha plegada se **despliega antes** de abrir el flotante, para que «volver a la barra lateral» tenga dónde caer; una barra izquierda plegada también — el plegado se detecta midiendo el ancho, así que una ventana estrecha nunca escribe una marca de plegado.

**Cerrar el flotante — o salir del estado oculto — devuelve las barras laterales a como las tenía la ventana.** Si cerraste o abriste una barra **tú mismo** mientras el flotante estaba abierto, vuelve esa última disposición, y también vuelve al cerrar desde el estado oculto: una ventana reducida a la columna derecha sigue así. «Tú mismo» cuenta solo tu pulsación en una barra o una tecla, en ambos sentidos; que DSH pliegue la barra izquierda en una ventana pequeña, que una barra oculta se vuelva a maquetar o una pulsación dentro del propio flotante no cuentan. La instantánea del estado anterior se toma una vez, antes de tocar ninguna barra, y nunca se sobrescribe mientras el flotante está abierto.

## Arrastrarlo a la izquierda, al centro o a la derecha

Mantén pulsada la barra de título del flotante y arrastra. **Mantener 1,2 s** pone el arrastre en modo de juicio; desde ahí el contorno sigue la banda bajo el puntero y al soltar cae en esa banda. El juicio empieza una vez por arrastre, así que cambiar de banda nunca vuelve a esperar. Soltar antes de 1,2 s no hace nada — sin movimientos accidentales.

Las tres bandas son las columnas reales de la ventana: **barra izquierda** (columna 0 del marco, actualmente 0..280), **columna central** (280..680), **barra derecha** (`data-rightbar-col`, 680..1097). El contorno cubre exactamente el bloque donde caerá el flotante, con el mismo tamaño.

| Destino | Tras soltar |
| --- | --- |
| **Izquierda** | El flotante se **guarda en el cajón de la barra izquierda**: no se cierra, solo se vuelve invisible, así que la columna central queda vacía; la barra izquierda gana una fila **con el nombre de esa conversación** que la devuelve |
| **Centro** | El flotante se cierra y la conversación vuelve a la columna central |
| **Derecha** | La conversación se acopla como **página de la barra derecha** — una pestaña nativa de DSH con su propio *Volver a la barra lateral* y cerrar |

La fila de la barra izquierda existe solo después de haber puesto ahí un flotante de verdad; antes, la barra izquierda queda vacía y no se añade ninguna entrada permanente. La fila lleva el título de la conversación guardada — no el nombre del plugin — y cambiar de conversación no cambia ese título: pulsarla vuelve a *esa* conversación y muestra de nuevo su flotante.

**O sin arrastrar.** El menú *Más* de la barra izquierda tiene **Guardar la conversación aquí**, y la tarjeta *Más herramientas* de la barra derecha tiene **Mover la conversación aquí**. Ambas son filas normales de DSH, debajo de las incluidas, y cada una se oculta cuando la conversación ya está donde la llevaría.

## Cómo funciona (y por qué la conversación no se redibuja)

- La conversación existe como **un solo DOM**: el plugin mueve la columna que la lleva al cuerpo del panel (mismo documento, misma raíz de React) y la devuelve al cerrar o al cambiar de anfitrión; si su sitio original desapareció, el respaldo es la columna central.
- **Guardar a la izquierda** = una marca en la raíz del flotante lo oculta (`visibility`/`opacity`); el panel **no se cierra**, por eso la columna central puede quedar vacía.
- **Acoplar a la derecha** = entrega la pestaña a la barra derecha (`openResource(..., { destination: 'sidebar' })`) y deja que DSH haga el movimiento y el acoplado.
- **La pestaña acoplada conserva su cuerpo**: el tipo de pestaña se registra con `keepMounted`, así que al cambiar a otra pestaña de la barra derecha la conversación se queda en ese cuerpo en lugar de volver a la columna central. La columna sigue al cuerpo retenido que esté en pantalla mientras su propia sesión sea la actual; para cualquier otra sesión la columna central vuelve a ser el sitio, igual que antes.

## Rendimiento

Cada fotograma hace como mucho una medición; las tres bandas se miden una vez, al pulsar. El contorno se redibuja solo cuando la banda cambia de verdad, y se mueve con `transform`. Las versiones anteriores medían el diseño y escribían cuatro estilos en cada movimiento del ratón — eso, no la lógica de soltar, era lo que hacía que arrastrar se sintiera más lento que el de DSH.

## Límites conocidos

- Una conversación tiene exactamente un anfitrión: la fila de la barra izquierda es una **entrada**, nunca una segunda copia viva de la conversación.
- El flotante pertenece a la sesión que lo abrió: cambiar a otra sesión devuelve la conversación a la columna central de esa sesión (o a su propio flotante, si lo tiene), y al volver reaparece el flotante de esta sesión.
- La fila de la barra izquierda lleva el nombre de la conversación guardada y lo mantiene mientras la ventana mira otras conversaciones. Pulsarla cambia a esa conversación y muestra su flotante; nunca flota la conversación que esté en pantalla.
- El cajón contiene **una** conversación. Guardar otra sustituye a la residente: el flotante sustituido vuelve a ser un flotante normal (pierde solo la marca del cajón), así que la barra izquierda nunca gana una segunda fila.
- Sacar el flotante del cajón lo devuelve **donde se guardó** (posiblemente sobre la barra izquierda); no se recentra.
- Esto es un flotante dentro de la ventana de DSH, no una ventana independiente del sistema.
- Si reinicias DSH, el estado del cajón desaparece; la conversación vuelve a la columna central.

## Mover el flotante

El flotante lo mueve el propio arrastre de DSH. Mientras una mano está sobre el panel, el plugin no aplica ningún sitio propio — reaplicar el rectángulo recordado a mitad del arrastre era lo que antes hacía saltar el flotante al primer movimiento.

## Instalación

Requiere DSH **>= 0.2.2-rc.1** — la versión con la que este paquete se desarrolla y prueba.

### Desde npm

```bash
npm i dsh-conversation-float
```

Después regístralo en el **`package.json` del perfil** — ambos pasos son necesarios:

1. añade `"dsh-conversation-float": "^0.1.4"` a `dependencies`
2. añade `"dsh-conversation-float"` a `dsh.profile.bundles` — solo un paquete registrado aparece en la lista de plugins y puede activarse

### Desde el código fuente

1. pon el código donde quieras
2. enlázalo con una junction en `<perfil>/node_modules/dsh-conversation-float`
3. en el `package.json` del perfil: `dependencies` recibe `"dsh-conversation-float": "link:<ruta>"`, `dsh.profile.bundles` recibe `"dsh-conversation-float"`
4. `client.js` se recarga en caliente; la mitad de host (`index.js`) es un no-op y solo necesita reinicio si la cambias

## Licencia

MIT
