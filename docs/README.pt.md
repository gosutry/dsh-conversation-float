# Janela flutuante de conversa

**dsh-conversation-float** — tira a **visualização de conversa** do lugar fixo no DSH e a transforma em um painel flutuante.

A janela é **do próprio DSH** — o painel flutuante do kit de ancoragem, o mesmo usado pela barra lateral direita — e não uma segunda janela do navegador: a barra de tarefas continua mostrando uma única janela do DSH. Dentro está a **visualização de conversa real**: a mesma coluna, não uma cópia redesenhada, então digitar, rolar, alternar entre Conversa e Trajetória, o compositor, os anexos e o seletor de persona continuam nativos.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Como usar

**Entrada**: o pequeno ícone de janela à direita da barra de título da sessão (*Conversation float*).

Um clique abre a janela e o restante da interface do DSH se afasta; o mesmo botão traz o DSH de volta — é um interruptor. Fechar a janela, guardá-la na barra esquerda ou ancorá-la na direita traz a interface de volta sozinha.

A janela **abre grande** (cerca de 920×711, ajustada à janela) chamando a intenção `resizeFloat` do próprio kit — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, com `paneId` lido de `data-dockkit-float`. Ela só aumenta: uma janela que você já ampliou nunca é reduzida.

Se a barra direita estiver recolhida, ela é **expandida antes** de abrir, para que «voltar para a barra» tenha destino; a esquerda também é expandida — o recolhimento é detectado medindo a largura, então em janelas estreitas nunca se grava uma marca de recolhimento.

**Fechar a janela e devolver a conversa à coluna central restaura as barras exatamente como estavam antes.** Se **você mesmo** tocou numa barra enquanto a janela estava aberta, vale o seu último ajuste. «Você mesmo» conta apenas o seu clique ou tecla, nos dois sentidos: o DSH estreitar a barra esquerda em janela pequena, ou uma barra oculta ser reorganizada, não conta. A captura é feita uma vez, antes de tocar em qualquer barra, e nunca é sobrescrita enquanto a janela está aberta.

## Arrastar para a esquerda, o centro ou a direita

Segure a barra de título para arrastar. **Após 1,2 s de pressão** o arraste entra em julgamento; a partir daí o contorno segue a faixa sob o ponteiro e, ao soltar, cai naquela faixa. O julgamento começa uma vez por arraste, então trocar de faixa não espera de novo. Soltar antes de 1,2 s não faz nada — sem movimentos acidentais.

As três faixas são as colunas reais: **barra esquerda** (0..280), **coluna central** (280..680), **barra direita** (a coluna `data-rightbar-col`, 680..1097). O contorno cobre exatamente o bloco onde a janela vai cair, no mesmo tamanho.

| Soltar | Depois de soltar |
| --- | --- |
| **Esquerda** | A janela é **guardada na gaveta da barra esquerda**: não fecha, apenas fica invisível, por isso a coluna central continua vazia; a barra esquerda ganha uma linha *Conversation float* que a traz de volta |
| **Centro** | A janela fecha e a conversa volta para a coluna central |
| **Direita** | A conversa é ancorada como **página na barra direita** — uma aba nativa do DSH com o seu *Voltar para a barra* e fechar |

A linha da barra esquerda só existe depois de realmente guardar uma janela ali; antes disso a barra esquerda fica vazia, sem entrada permanente.

## Como funciona (e por que a conversa não é redesenhada)

- A conversa existe como **um único DOM**: o plugin move a coluna que a carrega para o corpo do painel (mesmo documento, mesma raiz React) e a devolve ao fechar ou trocar de host; se o lugar original sumiu, a coluna central é o recurso.
- **Guardar à esquerda** = uma marca na raiz da janela a esconde (`visibility`/`opacity`); o painel **não é fechado**, por isso a coluna central pode ficar vazia.
- **Ancorar à direita** = entrega a aba à barra direita (`openResource(..., { destination: 'sidebar' })`) e deixa o DSH fazer a mudança e a ancoragem.

## Desempenho

No máximo uma medição por quadro de animação; as três faixas são medidas uma vez, no toque. O contorno só é redesenhado quando a faixa realmente muda, e se move com `transform`. Versões anteriores mediam o layout e escreviam quatro estilos a cada movimento do mouse — era isso, e não a lógica de soltura, que deixava o arraste mais pesado que o do DSH.

## Limites conhecidos

- Uma conversa tem um único host: a linha da barra esquerda é uma **entrada**, nunca uma segunda cópia viva.
- Tirar a janela da gaveta a devolve **onde foi guardada** (podendo cobrir a barra esquerda); ela não se recentraliza.
- É uma janela dentro do DSH, não uma janela separada do sistema.
- Ao reiniciar o DSH o estado da gaveta se perde; a conversa volta para a coluna central.

## Instalação

### Do npm

```bash
npm i dsh-conversation-float
```

Depois registre no **`package.json` do perfil** — os dois passos são necessários:

1. adicione `"dsh-conversation-float": "^0.1.1"` em `dependencies`
2. adicione `"dsh-conversation-float"` em `dsh.profile.bundles` — só um bundle registrado aparece na lista de plugins e pode ser alternado

### Do código-fonte

1. coloque o código onde quiser
2. ligue por junction em `<profile>/node_modules/dsh-conversation-float`
3. no `package.json` do perfil: `dependencies` recebe `"dsh-conversation-float": "link:<caminho>"`, `dsh.profile.bundles` recebe `"dsh-conversation-float"`
4. `client.js` recarrega a quente; a metade host (`index.js`) é vazia e só exige reinício se você a alterar

## Licença

MIT