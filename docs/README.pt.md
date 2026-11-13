# Conversation Float

**dsh-conversation-float** transforma a conversa do DSH numa verdadeira janela flutuante dentro do DSH — não numa segunda janela do sistema. A janela pode ficar por cima da aplicação, ser minimizada na barra lateral esquerda como uma linha da barra de tarefas, ou ser ancorada na barra lateral direita. Mantém a conversa utilizável enquanto abre páginas de plugins, páginas de automatizações e outras entradas da barra lateral esquerda.

[English](../README.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Русский](README.ru.md)

## O que obtém

- **Um clique** a partir do pequeno ícone de janela à direita da barra de título da sessão.
- **A conversa real**, não uma cópia redesenhada: escrever, deslocar, os separadores Conversation/Trajectory, o compositor, os anexos e o seletor de persona continuam nativos.
- **Vários flutuantes**, um por sessão, cada um com a sua própria linha na barra lateral esquerda.
- **Uma barra de tarefas que apenas traz janelas para a frente**: clicar numa linha de sessão traz esse flutuante para a frente e nunca altera a página por trás.
- **Uma conversa completa em páginas que não são de conversa**: abrir Plugins, Automations, Settings ou outra entrada da barra lateral esquerda deixa o flutuante da conversa ativa no ecrã, com o seu cabeçalho, separadores View e compositor. A página fica na coluna central, por trás do flutuante.
- **Um botão de entrada com três estados**: abrir o flutuante, ocultar o resto do DSH, ou trazer o resto do DSH de volta.
- **Linhas de menu que sabem quando desaparecer**: “Guardar a conversa aqui” desaparece quando a janela é minimizada, e “Mover a conversa para aqui” desaparece quando está ancorada à direita.

## Abrir, minimizar, fechar

Clique no ícone de janela na barra de título da sessão. O flutuante abre grande (cerca de 920×720, ajustado à janela), com o resto do DSH ainda visível e ambas as barras laterais no espaço que ele deixa.

O mesmo botão percorre três estados:

1. abrir o flutuante;
2. ocultar a interface do DSH e deixar apenas o flutuante;
3. mostrar novamente a interface do DSH.

Fechar o flutuante, minimizá-lo na barra lateral esquerda ou ancorá-lo na barra lateral direita repõe as barras laterais na disposição captada quando o flutuante abriu. A captura é feita uma vez e não é substituída enquanto a janela estiver aberta. As alterações que fizer nas barras laterais enquanto o flutuante está aberto não são acompanhadas.

O botão **—** da janela minimiza-a: a janela desaparece, mas a sua linha na barra de tarefas da barra lateral esquerda mantém-se. Clique nessa linha para a trazer de volta. O botão **✕** fecha-a de vez: a janela e a sua linha desaparecem, e a conversa volta para a coluna central.

Enquanto o DSH está oculto, **Escape** traz a interface de volta.

## Mover a conversa

Segure na barra de título da janela e arraste. Manter-se parado durante **1,2 segundos** arma as faixas de destino; a barra de título tinge-se, um contorno acompanha a faixa sob o ponteiro, e soltar deixa a conversa cair aí. Soltar antes de terminar a espera não faz nada. Em ecrã tátil, mover mais de 10 px antes de a espera terminar mantém o gesto como um movimento normal da janela.

| Largar sobre | Resultado |
| --- | --- |
| **Barra lateral esquerda** | A janela é minimizada na barra lateral esquerda. Não é fechada; a sua linha na barra de tarefas é o caminho de volta. A coluna central fica vazia. |
| **Centro** | A janela fecha e a conversa volta para a coluna central. |
| **Barra lateral direita** | A conversa é ancorada como página nativa na barra lateral direita, com os próprios controlos de retorno e de fecho do DSH. |

A linha da barra lateral esquerda mostra o título da conversa, não o nome do plugin. Mantém esse título enquanto a janela está a ver outras conversas. Clicar na linha apenas mostra e traz essa janela para a frente; nunca seleciona o painel principal do plugin e nunca retira uma página de plugin ou de automatização.

**Ou dispense o arrasto.** O menu *Mais* da barra lateral esquerda tem **Guardar a conversa aqui**. O guia da barra lateral direita tem **Mover a conversa para aqui**. Cada linha esconde-se quando a conversa já está nesse lugar.

## Páginas fora da conversa

Quando abre Plugins, Automations, Settings ou outra entrada da barra lateral esquerda, a coluna da conversa volta para a coluna central para que a página possa usar o quadro normal de três colunas. O flutuante da sessão ativa fica no ecrã e passa a uma **conversa local completa**: cabeçalho da sessão, separadores Conversation/Trajectory e compositor. Não é uma transcrição só de leitura.

A página fica **por trás do flutuante**. Arraste o flutuante para o lado para trabalhar na página. Clicar na linha da barra de tarefas da sessão apenas traz o flutuante para a frente; a página continua aberta e inalterada. Fechar a página, ou voltar normalmente à conversa, devolve a coluna real da conversa ao flutuante.

Uma janela de uma sessão que **não** é a ativa mostra ainda uma transcrição só de leitura. Uma conversa tem um único compositor ativo; o compositor e os separadores View pertencem à sessão ativa.

## Várias janelas e a barra de tarefas

Cada sessão pode ter um flutuante. Cada flutuante ganha uma linha na barra lateral esquerda, ordenada como uma barra de tarefas. As linhas têm o nome das respetivas sessões.

- Clicar numa linha **traz essa janela para a frente**. Não muda a sessão atual nem altera o painel principal.
- Uma janela que não está ativa mostra um chip **Mudar para esta conversa** quando está por cima. Clicá-lo torna essa sessão ativa; a janela passa então a ocupar a coluna real da conversa.
- Fechar uma janela não afeta as outras.
- Uma linha de sessão na barra de tarefas é uma entrada, nunca uma segunda cópia ativa da conversa.

## Ancorar na barra lateral direita

Arrastar para a direita, ou usar **Mover a conversa para aqui**, entrega o separador à barra lateral direita do DSH. O tipo de separador é registado com `keepMounted`, pelo que mudar para outro separador da barra direita deixa a conversa no corpo do seu próprio separador. A coluna segue o corpo retido que estiver no ecrã enquanto a sua sessão está ativa; para qualquer outra sessão, a coluna central volta a ser o lugar.

## Rascunho e compositor

Uma sessão tem uma única estrutura de entrada e um único editor, e o editor só pode estar numa raiz DOM de cada vez. Quando a conversa se move entre a coluna central, uma janela e uma página da barra lateral direita, o plugin volta a ligar o editor ao compositor no ecrã e repõe o escritor de rascunhos num espaço vazio. O rascunho que vê é o rascunho que é enviado.

Fechar o flutuante já não clica noutro separador View para forçar uma remontagem. O plugin repara o editor diretamente, pelo que a janela volta à conversa sem piscar Trajectory ou qualquer outra View.

## Desempenho

Cada frame de animação faz, no máximo, uma medição de layout. As três faixas de destino são medidas uma vez, ao premir. As esperas que dependem de o DSH confirmar uma alteração são conduzidas por frames; o plugin **não mantém nenhum intervalo** e faz as suas reparações nas passagens de layout que o DSH já provoca. O contorno só é repintado quando a faixa muda e move-se com `transform`.

## Limites conhecidos

- O flutuante está **dentro da janela do DSH**, não é uma janela separada do sistema operativo.
- Uma conversa tem exatamente **um anfitrião**. Uma linha da barra de tarefas é uma entrada, nunca uma segunda cópia ativa.
- Uma janela cuja sessão não está ativa mostra uma **transcrição só de leitura**: sem separadores View, sem compositor. Mude-a para a sessão ativa para escrever.
- O flutuante ativo mantém uma conversa local completa enquanto uma página que não é de conversa está aberta, mas essa página fica **atrás da janela**. O flutuante não encolhe para uma barra lateral nem se ancora automaticamente.
- O flutuante pertence à sessão que o abriu. Mudar de sessão entrega a conversa à coluna central da nova sessão ou ao flutuante dela; voltar atrás traz o flutuante antigo de volta.
- Reiniciar o DSH limpa os flutuantes e as linhas da barra de tarefas. A conversa volta para a coluna central.
- A reparação do compositor usa algumas formas internas do DSH (o editor por trás da caixa do compositor, a estrutura de entrada da conversa e o seu espaço de rascunho). Uma versão futura do DSH que as renomeie degrada para o comportamento antigo em vez de falhar.

## Instalação

Requer DSH **>= 0.2.2-rc.1**.

### A partir do npm

    npm i dsh-conversation-float@0.3.0

Depois registe-o no **`package.json` do perfil** — ambos os passos são necessários:

1. adicione `"dsh-conversation-float": "^0.3.0"` a `dependencies`;
2. adicione `"dsh-conversation-float"` à lista `dsh.profile.bundles` do perfil.

Apenas um bundle registado aparece na lista de plugins e pode ser alternado.

### A partir de um tarball

    dsh plugin add <path-to>/dsh-conversation-float-0.3.0.tgz

Ou coloque o tarball no perfil e use uma dependência `file:`, depois adicione o nome à lista de bundles.

### A partir do código-fonte

1. coloque o código-fonte onde quiser;
2. ligue-o em `<profile>/node_modules/dsh-conversation-float`;
3. adicione uma dependência `link:` e o nome do bundle ao perfil.

O bundle é montado no arranque, por isso reinicie o DSH depois de instalar ou atualizar.

## Licença

MIT
