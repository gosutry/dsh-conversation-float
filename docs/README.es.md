# Flotante de conversación

**dsh-conversation-float** convierte la conversación de DSH en una ventana flotante real dentro de DSH, no en una segunda ventana del sistema operativo. La ventana puede quedar sobre la aplicación, minimizarse en la barra lateral izquierda como una fila de la barra de tareas, o acoplarse en la barra lateral derecha. Mantiene la conversación utilizable mientras abres páginas de plugins, páginas de automatizaciones y otras entradas de la barra lateral izquierda.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Qué obtienes

- **Un solo clic** desde el pequeño icono de ventana situado a la derecha de la barra de título de la sesión.
- **La conversación real**, no una copia redibujada: escribir, desplazarse, las pestañas Conversation/Trajectory, el compositor, los adjuntos y el selector de persona siguen siendo nativos.
- **Varias ventanas flotantes**, una por Session, cada una con su propia fila en la barra lateral izquierda.
- **Una barra de tareas que solo trae ventanas al frente**: al hacer clic en la fila de una sesión, esa ventana flotante pasa al frente y nunca cambia la página que hay detrás.
- **Una conversación completa en páginas que no son de conversación**: abrir Plugins, Automations, Settings u otra entrada de la barra lateral izquierda deja en pantalla la ventana flotante de la conversación activa con su cabecera, sus pestañas View y su compositor. La página permanece en la columna central, detrás de la ventana flotante.
- **Un botón de entrada con tres estados**: abrir la ventana flotante, ocultar el resto de DSH, o traer de vuelta el resto de DSH.
- **Filas de menú que saben cuándo desaparecer**: «Guardar la conversación aquí» se oculta cuando la ventana está minimizada, y «Mover la conversación aquí» se oculta cuando la conversación está acoplada a la derecha.

## Abrir, minimizar, cerrar

Haz clic en el icono de ventana de la barra de título de la sesión. La ventana flotante se abre grande (unos 920×720, escalada al tamaño de la ventana), con el resto de DSH todavía visible y ambas barras laterales en el espacio que deja libre.

El mismo botón recorre tres estados:

1. abrir la ventana flotante;
2. ocultar la interfaz de DSH y dejar solo la ventana flotante;
3. volver a mostrar la interfaz de DSH.

Cerrar la ventana flotante, minimizarla en la barra lateral izquierda o acoplarla en la barra lateral derecha devuelve las barras laterales a la disposición capturada cuando se abrió la ventana. La instantánea se toma una sola vez y no se sobrescribe mientras la ventana está abierta. Los cambios que hagas en las barras laterales con la ventana abierta no se registran.

El botón **—** de la ventana la minimiza: la ventana desaparece, pero su fila de la barra de tareas en la barra lateral izquierda se queda. Haz clic en esa fila para traerla de vuelta. El botón **✕** la cierra definitivamente: la ventana y su fila desaparecen, y la conversación vuelve a la columna central.

Mientras DSH está oculto, **Escape** devuelve la interfaz.

## Mover la conversación

Mantén pulsada la barra de título de la ventana y arrastra. Si te detienes **1,2 segundos**, se arman las bandas de destino; la barra de título se tiñe, un contorno sigue la banda bajo el puntero y al soltar la conversación cae ahí. Si sueltas antes de completar la pulsación, no pasa nada. En pantalla táctil, mover más de 10 px antes de que termine la pulsación mantiene el gesto como un movimiento normal de ventana.

| Suelta sobre | Resultado |
| --- | --- |
| **Barra lateral izquierda** | La ventana se minimiza en la barra lateral izquierda. No se cierra; su fila de la barra de tareas es la forma de volver. La columna central queda vacía. |
| **Centro** | La ventana se cierra y la conversación vuelve a la columna central. |
| **Barra lateral derecha** | La conversación se acopla como una página nativa en la barra lateral derecha, con los propios controles de volver y cerrar de DSH. |

La fila de la barra lateral izquierda lleva el título de la Conversation, no el nombre del plugin. Mantiene ese título mientras la ventana mira otras Conversations. Al hacer clic en la fila solo se muestra y se trae al frente esa ventana; nunca selecciona el panel principal del plugin ni quita una página de plugin o de automatización.

**O sáltate el arrastre.** El menú *Más* de la barra lateral izquierda incluye **Guardar la conversación aquí**. La guía de la barra lateral derecha incluye **Mover la conversación aquí**. Cada fila se oculta cuando la conversación ya está en ese sitio.

## Páginas fuera de la conversación

Cuando abres Plugins, Automations, Settings u otra entrada de la barra lateral izquierda, la columna de conversación vuelve a la columna central para que la página pueda usar el marco normal de tres columnas. La ventana flotante de la Session activa sigue en pantalla y cambia a una **conversación local completa**: cabecera de sesión, pestañas Conversation/Trajectory y compositor. No es una transcripción de solo lectura.

La página está **detrás de la ventana flotante**. Arrastra la ventana a un lado para trabajar en la página. Al hacer clic en la fila de la barra de tareas de la Session solo se trae al frente la ventana flotante; la página sigue abierta y sin cambios. Al cerrar la página, o al volver normalmente a la conversación, la columna de conversación real vuelve a la ventana flotante.

Una ventana de una Session que **no** es la activa sigue mostrando una transcripción de solo lectura. Una conversación tiene un solo compositor activo; el compositor y las pestañas View pertenecen a la Session activa.

## Ventanas múltiples y la barra de tareas

Cada Session puede tener una ventana flotante. Cada ventana flotante recibe una fila en la barra lateral izquierda, ordenadas como una barra de tareas. Las filas llevan el nombre de su Session.

- Al hacer clic en una fila **se trae al frente esa ventana**. No cambia la Session actual ni modifica el panel principal.
- Una ventana que no está activa muestra el chip **Cambiar a esta conversación** cuando está encima. Al hacer clic en él, esa Session pasa a estar activa; la ventana toma entonces la columna de conversación real.
- Cerrar una ventana no afecta a las demás.
- La fila de la barra de tareas de una sesión es una entrada, nunca una segunda copia activa de la conversación.

## Acoplar en la barra lateral derecha

Arrastrar hacia la derecha, o usar **Mover la conversación aquí**, entrega la pestaña a la barra lateral derecha de DSH. El tipo de pestaña se registra con `keepMounted`, así que cambiar a otra pestaña de la barra lateral derecha deja la conversación en el cuerpo de su propia pestaña. La columna sigue al cuerpo retenido que esté en pantalla mientras su Session está activa; para cualquier otra Session, la columna central vuelve a ser el asiento.

## Borrador y compositor

Una Session tiene una sola carcasa de entrada y un solo editor, y el editor solo puede ir sobre una raíz del DOM cada vez. Cuando la conversación se mueve entre la columna central, una ventana y una página de la barra lateral derecha, el plugin vuelve a enganchar el editor al compositor en pantalla y restaura el escritor de borradores en una ranura vacía. El borrador que ves es el borrador que se envía.

Cerrar la ventana flotante ya no hace clic en otra pestaña View para forzar un remontaje. El plugin repara el editor directamente, así que la ventana vuelve a la conversación sin parpadear a Trajectory ni a ninguna otra View.

## Rendimiento

Cada fotograma de animación hace como máximo una medición de diseño. Las tres bandas de destino se miden una vez, al pulsar. Las esperas que dependen de que DSH confirme un cambio se guían por fotogramas; el plugin no mantiene **ningún intervalo** y ejecuta sus reparaciones en las pasadas de diseño que DSH ya provoca. El contorno solo se repinta cuando cambia la banda y se mueve con `transform`.

## Límites conocidos

- La ventana flotante está **dentro de la ventana de DSH**, no es una ventana independiente del sistema operativo.
- Una conversación tiene exactamente **un anfitrión**. La fila de la barra de tareas es una entrada, nunca una segunda copia activa.
- Una ventana cuya Session no está activa muestra una **transcripción de solo lectura**: sin pestañas View, sin compositor. Cámbiala a la Session activa para escribir.
- La ventana flotante activa mantiene una conversación local completa mientras hay abierta una página que no es de conversación, pero esa página está **detrás de la ventana**. La ventana flotante no se encoge a una barra lateral ni se acopla sola.
- La ventana flotante pertenece a la Session que la abrió. Cambiar de Session entrega la conversación a la columna central de la nueva Session o a su propia ventana flotante; volver atrás recupera la antigua ventana flotante.
- Reiniciar DSH borra las ventanas flotantes y las filas de la barra de tareas. La conversación vuelve a la columna central.
- La reparación del compositor usa unas pocas formas internas de DSH (el editor detrás de la caja del compositor, la carcasa de entrada de la conversación y su ranura de borrador). Una futura versión de DSH que las renombre degrada al comportamiento anterior en lugar de fallar.

## Instalación

Requiere DSH **>= 0.2.2-rc.1**.

### Desde npm

    npm i dsh-conversation-float@0.3.0

Después regístralo en el **`package.json` del perfil**: ambos pasos son obligatorios:

1. añade `"dsh-conversation-float": "^0.3.0"` a `dependencies`;
2. añade `"dsh-conversation-float"` a la lista `dsh.profile.bundles` del perfil.

Solo un bundle registrado aparece en la lista de plugins y se puede activar o desactivar.

### Desde un tarball

    dsh plugin add <path-to>/dsh-conversation-float-0.3.0.tgz

O pon el tarball en el perfil y usa una dependencia `file:`, y luego añade el nombre a la lista de bundles.

### Desde el código fuente

1. pon el código fuente donde quieras;
2. enlázalo en `<profile>/node_modules/dsh-conversation-float`;
3. añade una dependencia `link:` y el nombre del bundle al perfil.

El bundle se ensambla al arrancar, así que reinicia DSH después de instalar o actualizar.

## Licencia

MIT
