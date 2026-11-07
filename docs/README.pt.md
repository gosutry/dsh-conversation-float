# Flutuante de conversa

**dsh-conversation-float** — tira a **visão da conversa** do seu lugar fixo no DSH e a transforma num painel flutuante.

O flutuante é **o do próprio DSH** — o painel flutuante do kit de encaixe, o mesmo que a barra lateral direita usa —, e não uma segunda janela do navegador: a barra de tarefas continua mostrando uma única janela do DSH. Ele contém **a visão real da conversa**, a mesma coluna e não uma cópia redesenhada, então digitar, rolar, alternar entre Conversa e Trajetória, o compositor, os anexos e o seletor de persona continuam nativos.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## Como usar

**Entrada**: o pequeno ícone de janela à direita da barra de título da sessão (*Conversation float*).

Um clique abre o flutuante **com o resto do DSH ainda na tela**: as duas barras laterais abertas e o flutuante centralizado no espaço que elas deixam. O *mesmo* botão então esconde a interface do DSH e deixa só o flutuante — a dica passa de *Ocultar DSH* para *Mostrar DSH* — e o clique seguinte traz a interface de volta. Fechar o flutuante, guardá-lo na barra esquerda ou ancorá-lo à direita devolve as barras laterais ao lugar delas.

O flutuante **abre grande** (cerca de 920×711, ajustado à janela) chamando a intenção `resizeFloat` do próprio kit — `sidebarRight.require()` → `actions.resizeFloat(sessionId, paneId, rect)`, com `paneId` lido de `data-dockkit-float` no flutuante. Ele só aumenta: um flutuante que você já ampliou nunca é reduzido.

Uma barra lateral direita recolhida é **expandida antes** de o flutuante abrir, para que "voltar para a barra lateral" tenha onde cair; uma barra esquerda recolhida também — o recolhimento é detectado medindo a largura, então uma janela estreita nunca grava uma marca de recolhimento.

**Fechar o flutuante — ou sair do estado oculto — devolve as barras laterais ao que a janela tinha.** Se você fechou ou abriu uma barra **por conta própria** enquanto o flutuante estava aberto, é essa última disposição que volta, inclusive ao fechar a partir do estado oculto: uma janela reduzida à coluna direita continua assim. "Por conta própria" conta apenas o seu toque numa barra ou uma tecla, nos dois sentidos; o DSH recolher a barra esquerda numa janela pequena, uma barra oculta ser remontada ou um clique dentro do próprio flutuante não contam. A foto do estado anterior é tirada uma vez, antes de tocar em qualquer barra, e nunca é sobrescrita enquanto o flutuante está aberto.

## Arrastar para a esquerda, o centro ou a direita

Segure a barra de título do flutuante e arraste. **Segurar por 1,2 s** coloca o arrasto em julgamento; a partir daí o contorno segue a faixa sob o ponteiro e soltar deixa o flutuante cair naquela faixa. O julgamento começa uma vez por arrasto, então trocar de faixa nunca espera de novo. Soltar antes de 1,2 s não faz nada — sem movimentos acidentais.

As três faixas são as colunas reais da janela: **barra esquerda** (coluna 0 do quadro, atualmente 0..280), **coluna central** (280..680), **barra direita** (`data-rightbar-col`, 680..1097). O contorno cobre exatamente o bloco onde o flutuante vai cair, no mesmo tamanho.

| Destino | Depois de soltar |
| --- | --- |
| **Esquerda** | O flutuante é **guardado na gaveta da barra esquerda**: não é fechado, só fica invisível, então a coluna central continua vazia; a barra esquerda ganha uma linha **com o nome daquela conversa** que o traz de volta |
| **Centro** | O flutuante fecha e a conversa volta para a coluna central |
| **Direita** | A conversa é ancorada como **página da barra direita** — uma aba nativa do DSH com seu próprio *Voltar para a barra lateral* e fechar |

A linha da barra esquerda só existe depois que um flutuante foi realmente colocado ali; antes disso a barra esquerda fica vazia e nenhuma entrada permanente é adicionada. A linha carrega o título da conversa guardada — não o nome do plugin — e trocar de conversa não muda esse título: pressioná-la volta a *essa* conversa e mostra o flutuante dela de novo.

**Ou sem arrastar.** O menu *Mais* da barra esquerda tem **Guardar a conversa aqui**, e o cartão *Mais ferramentas* da barra direita tem **Mover a conversa para cá**. Os dois são linhas normais do DSH, abaixo das incluídas, e cada uma se esconde quando a conversa já está onde ela a levaria.

## Como funciona (e por que a conversa não é redesenhada)

- A conversa existe como **um único DOM**: o plugin move a coluna que a carrega para o corpo do painel (mesmo documento, mesma raiz React) e a devolve ao fechar ou ao trocar de hospedeiro; se o lugar original sumiu, a coluna central é o recurso.
- **Guardar à esquerda** = uma marca na raiz do flutuante o deixa invisível (`visibility`/`opacity`); o painel **não é fechado**, por isso a coluna central pode ficar vazia.
- **Ancorar à direita** = entrega a aba à barra direita (`openResource(..., { destination: 'sidebar' })`) e deixa o DSH fazer o movimento e a ancoragem.
- **A aba ancorada mantém seu corpo**: o tipo de aba é registrado com `keepMounted`, então passar para outra aba da barra direita deixa a conversa nesse corpo em vez de devolvê-la à coluna central. A coluna segue o corpo retido que estiver na tela enquanto a própria sessão for a atual; para qualquer outra sessão a coluna central volta a ser o lugar, exatamente como antes.

## Desempenho

Cada quadro de animação faz no máximo uma medição; as três faixas são medidas uma vez, no pressionar. O contorno só é redesenhado quando a faixa realmente muda, e se move com `transform`. Versões anteriores mediam o layout e escreviam quatro estilos a cada movimento do mouse — era isso, e não a lógica de soltar, que deixava o arrasto mais pesado que o do DSH.

## Limites conhecidos

- Uma conversa tem exatamente um hospedeiro: a linha da barra esquerda é uma **entrada**, nunca uma segunda cópia viva da conversa.
- O flutuante pertence à sessão que o abriu: trocar de sessão devolve a conversa à coluna central daquela sessão (ou ao flutuante dela, se houver), e voltar traz o flutuante desta sessão de novo.
- A linha da barra esquerda leva o nome da conversa guardada e o mantém enquanto a janela olha outras conversas. Pressioná-la troca para aquela conversa e mostra seu flutuante; ela nunca flutua a conversa que estiver na tela.
- A gaveta guarda **uma** conversa. Guardar outra substitui a residente: o flutuante substituído volta a ser um flutuante comum (perde só a marca da gaveta), então a barra esquerda nunca ganha uma segunda linha.
- Tirar o flutuante da gaveta o devolve **onde foi guardado** (às vezes sobre a barra esquerda); ele não se recentra.
- Isto é um flutuante dentro da janela do DSH, não uma janela separada do sistema.
- Reinicie o DSH e o estado da gaveta some; a conversa volta para a coluna central.

## Mover o flutuante

O flutuante é movido pelo arrasto do próprio DSH. Enquanto uma mão está no painel, o plugin não aplica nenhum lugar próprio — reaplicar o retângulo memorizado no meio do arrasto era o que antes fazia o flutuante saltar no primeiro movimento.

## Instalação

Requer DSH **>= 0.2.2-rc.1** — a versão com que este pacote é desenvolvido e testado.

### Do npm

```bash
npm i dsh-conversation-float
```

Depois registre no **`package.json` do perfil** — os dois passos são necessários:

1. adicione `"dsh-conversation-float": "^0.1.4"` em `dependencies`
2. adicione `"dsh-conversation-float"` em `dsh.profile.bundles` — só um pacote registrado aparece na lista de plugins e pode ser alternado

### Do código-fonte

1. coloque o código onde quiser
2. ligue-o por junction em `<perfil>/node_modules/dsh-conversation-float`
3. no `package.json` do perfil: `dependencies` recebe `"dsh-conversation-float": "link:<caminho>"`, `dsh.profile.bundles` recebe `"dsh-conversation-float"`
4. `client.js` recarrega a quente; a metade de host (`index.js`) é um no-op e só precisa de reinício se você a alterar

## Licença

MIT
