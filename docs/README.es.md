# Ventana flotante de conversación

**dsh-conversation-float** — saca la **vista de conversación** de su lugar fijo en DSH y la convierte en un panel flotante.

La ventana es **de DSH mismo** — el panel flotante del kit de acople, el que usa la barra lateral derecha — y no una segunda ventana del navegador: en la barra de tareas sigue habiendo una sola ventana de DSH. Dentro está la **vista de conversación real**: la misma columna, no una copia redibujada, así que escribir, desplazarse, cambiar entre Conversación y Trayectoria, el compositor, los adjuntos y el selector de persona siguen siendo nativos.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Uso

**Entrada**: el pequeño icono de ventana a la derecha de la barra de título de la sesión (*Conversation float*).

Un clic abre la ventana flotante y el resto de la interfaz de DSH se aparta; el mismo botón trae DSH de vuelta, es un interruptor. Al cerrar la ventana, guardarla en la barra izquierda o acoplarla en la derecha, la interfaz vuelve sola.

La ventana **se abre grande** (unos 920×711, ajustada a la ventana) llamando a la intención `resizeFloat` del propio kit — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, con `paneId` tomado de `data-dockkit-float`. Solo agranda: una ventana que ya has ampliado nunca se reduce.

Si la barra derecha estaba plegada se **despliega antes** de abrir, para que «volver a la barra» tenga destino; la izquierda también se despliega — el plegado se detecta midiendo el ancho, así que en ventanas estrechas nunca se escribe una marca de plegado.

**Cerrar la ventana y devolver la conversación a la columna central restaura las barras tal como estaban antes.** Si **tú mismo** tocaste una barra mientras la ventana estaba abierta, gana tu último ajuste. «Tú mismo» cuenta solo tu pulsación o tecla, en ambos sentidos: que DSH estreche la barra izquierda en una ventana pequeña, o que una barra oculta se reordene, no cuenta. La instantánea se toma una vez, antes de tocar cualquier barra, y nunca se sobrescribe mientras la ventana está abierta.

## Arrastrar a izquierda, centro o derecha

Mantén la barra de título para arrastrar. **Tras 1,2 s de pulsación** el arrastre entra en modo de juicio; desde ahí el contorno sigue la franja bajo el puntero y al soltar cae en esa franja. El juicio se entra una vez por arrastre, así que cruzar franjas no vuelve a esperar. Soltar antes de 1,2 s no hace nada — sin movimientos accidentales.

Las tres franjas son las columnas reales: **barra izquierda** (0..280), **columna central** (280..680), **barra derecha** (la columna `data-rightbar-col`, 680..1097). El contorno cubre exactamente el bloque donde caerá la ventana, con su mismo tamaño.

| Soltar | Después de soltar |
| --- | --- |
| **Izquierda** | La ventana se **guarda en el cajón de la barra izquierda**: no se cierra, solo queda invisible, así que la columna central sigue vacía; la barra izquierda gana una fila *Conversation float* que la trae de vuelta |
| **Centro** | La ventana se cierra y la conversación vuelve a la columna central |
| **Derecha** | La conversación se acopla como **página en la barra derecha** — una pestaña nativa de DSH con su *Volver a la barra* y su cierre |

La fila de la barra izquierda solo existe después de haber guardado de verdad una ventana; antes, la barra izquierda está vacía y no se añade ninguna entrada permanente.

## Cómo funciona (y por qué no se redibuja la conversación)

- La conversación existe como **un solo DOM**: el plugin mueve la columna que la lleva al cuerpo del panel (mismo documento, misma raíz de React) y la devuelve al cerrar o cambiar de host; si su sitio original desapareció, la columna central es el respaldo.
- **Guardar a la izquierda** = una marca en la raíz de la ventana la oculta (`visibility`/`opacity`); el panel **no se cierra**, por eso la columna central puede quedar vacía.
- **Acoplar a la derecha** = entrega la pestaña a la barra derecha (`openResource(..., { destination: 'sidebar' })`) y deja que DSH haga el traslado y el acople.

## Rendimiento

Como mucho una medición por fotograma; las tres franjas se miden una vez, al pulsar. El contorno se redibuja solo cuando la franja cambia de verdad, y se mueve con `transform`. Las versiones anteriores medían el diseño y escribían cuatro estilos en cada movimiento del ratón: eso, no la lógica de soltado, era lo que hacía el arrastre más torpe que el de DSH.

## Límites conocidos

- Una conversación tiene un solo host: la fila de la barra izquierda es una **entrada**, nunca una segunda copia viva.
- Sacar la ventana del cajón la devuelve **donde se guardó** (quizá sobre la barra izquierda); no se recentra.
- Es una ventana dentro de DSH, no una ventana independiente del sistema.
- Si reinicias DSH, el estado del cajón se pierde; la conversación vuelve a la columna central.

## Instalación

Requiere DSH **>= 0.2.2-rc.1**, la versión con la que se desarrolló y probó este bundle.

### Desde npm

```bash
npm i dsh-conversation-float
```

Luego regístralo en la **`package.json` del perfil**; ambos pasos son necesarios:

1. añade `"dsh-conversation-float": "^0.1.1"` a `dependencies`
2. añade `"dsh-conversation-float"` a `dsh.profile.bundles` — solo un bundle registrado aparece en la lista de plugins y se puede activar

### Desde el código fuente

1. coloca el código donde quieras
2. enlázalo con junction en `<profile>/node_modules/dsh-conversation-float`
3. en la `package.json` del perfil: `dependencies` recibe `"dsh-conversation-float": "link:<ruta>"`, `dsh.profile.bundles` recibe `"dsh-conversation-float"`
4. `client.js` se recarga en caliente; la mitad host (`index.js`) es un no-op y solo necesita reinicio si la cambias

## Licencia

MIT