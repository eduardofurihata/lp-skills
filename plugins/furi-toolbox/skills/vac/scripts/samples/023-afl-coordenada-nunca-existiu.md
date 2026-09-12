---
cmd: "check-artifact"
expect: "block"
must: ["0198_contract_prices_into_table.sql:19"]
class: "positivo-verdadeiro"
note: "mina labzz-afl 2026-09-12 — coordenada para arquivo que nunca existiu no repositório (git log --all --diff-filter=A vazio)"
origin: "labzz-afl artefato docs/01-problem/custo-verificavel.md — coord: 0198_contract_prices_into_table.sql:19"
artifact: "docs/01-problem/custo-verificavel.md"
---
# Problema — o gasto é calculado, mas não é verificável

## Problema

**O AFL calcula o gasto e não consegue provar nenhum número: o preço do provider default está 3× a 6× errado sem que qualquer controle possa detectá-lo, a voz padrão não desconta cota, tentativa que falhou é cobrada — e as 22 migrations que consertariam parte disso nunca rodaram contra o banco live.**

## Contexto

Oito ciclos de `/method` (`motor-de-custo`, `custo-fora-do-motor`, `residuos-de-custo`, `consumo-nao-cobrado`, `cota-pessoal`, `descontinuar-heygen`, `sincronizacao-de-precos`, `transcricao-de-mensagem`) corrigiram **valores**: preço com unidade, custo em nano, escritor único, cota que barra, reconciliação que detecta.

O que nenhum deles fechou é a camada seguinte: **prova**. Um preço que ninguém conferiu, uma medida contada por tentativa em vez de por entrega, um provider inteiro fora do contador que bloqueia e um painel que reporta "sem divergência" para 99,9% do gasto que ninguém checou — todos passam nos controles atuais, porque os controles verificam **forma**, não **procedência**.

É a terceira vez neste épico que o mesmo padrão aparece (a guarda que vigiava `SUM(` em vez da coluna; o regex que não casava com template literal; os dois padrões escritos em sintaxe JS que casavam com nada no `git grep`). Aqui ele aparece na dimensão do dado, não do código.

## Afetados

- **Cliente pagante** — paga 3× a 6× a mais em toda síntese de voz do provider default; e é cobrado por tentativas que falharam.
- **Eduzz (receita)** — a voz padrão não entra no contador que bloqueia: um teto de gasto não vê o consumo mais frequente do produto.
- **FinOps / plantão** — o painel de reconciliação afirma "sem divergência" sobre uma amostra de 0,1% do gasto.
- **Todos os usuários do app em produção** — o deploy que entrega os consertos carrega três operações que travam a escrita na tabela mais quente do produto.

---

## A. ElevenLabs: um preço para três modelos, de 3× a 6× acima do praticado

`0198_contract_prices_into_table.sql:19-28` grava **um único** `unit_price = 0,0003/caractere` para `WHERE provider_id = 3` — os três modelos de uma vez. A tabela pública do fornecedor (consultada em 2026-08-08):

| modelo | nosso | fornecedor | erro |
|---|---|---|---|
| `eleven_multilingual_v2` | 0,0003/char | US$ 0,10/1k = **0,0001** | **3×** |
| `eleven_turbo_v2_5` | 0,0003/char | US$ 0,05/1k = **0,00005** | **6×** |
| `eleven_flash_v2_5` | 0,0003/char | US$ 0,05/1k = **0,00005** | **6×** |

Flash e Turbo consomem **metade** dos créditos por caractere ("50% lower price per character for API generations", doc de modelos do fornecedor). Aplicar a mesma tarifa aos três é errado em **qualquer** plano, independente de qual seja o contratado.

Sobre o valor em si: 0,0003 é exatamente a taxa efetiva do plano **Starter** (US$ 6 ÷ 20.000 chars). Nos demais: Creator 0,0001 · Pro 0,000225 · Scale 0,000151 · Business 0,000166. Ou seja — o número tem uma origem plausível, e nada no banco diz qual é.

## B. A procedência está carimbada, e é falsa

A mesma migration grava `price_source='manual'`, `price_source_ref='contrato ElevenLabs'` e `price_checked_at = NOW()`.

O cabeçalho da própria migration diz o que aconteceu de fato: o valor foi **migrado de uma constante de código** (`PROVIDER_FLAT_PRICING`). Ninguém abriu contrato nenhum. `price_checked_at` passou a significar "a data em que este preço foi movido de lugar" — e é o campo que qualquer pessoa lê para decidir se pode confiar na linha.

É a doença que o épico existe para eliminar (`unmeasured` disfarçado de `unpriced`; zero medido indistinguível de zero por ausência de medição), agora na coluna que atesta confiança.

## C. E ele é imune aos dois detectores

- **A sincronização não o toca**: `price-decision.ts:212` — `if (current.source === 'manual') return { kind: 'keep' }`. Preço manual nunca é sobrescrito, por decisão correta (contrato > catálogo).
- **A reconciliação não o vê**: `monthly-cost-reconciliation.job.ts:271,314` filtra `llm_provider = 'bedrock'`.

Um preço manual errado no ElevenLabs, portanto, **não tem quem pegue** — nem o job que confere contra o catálogo, nem o que confere contra a fatura. É o único ponto do motor com essa propriedade, e calhou de ser o provider default.

## D. A voz padrão não desconta cota

`openai-tts.service.ts:115` faz as duas coisas que o épico definiu como obrigatórias: `metering.recordUnits({ characters })` (contador que **bloqueia**) e `trackTtsUsage` (relatório).

`elevenlabs.service.ts:94` faz **só a segunda**. Não há metering no orquestrador (`text-to-speech.service.ts:60-64`, que injeta apenas os dois serviços de TTS e o seletor de modelo) nem no controller (`media.controller.ts:114`, que só delega).

E o ElevenLabs é o default em dois lugares independentes: `agents.schema.ts:191` (`voice_provider` default `'elevenlabs'`) e a ordem do orquestrador, onde o OpenAI só entra como reserva. **O caminho de voz mais executado do produto é invisível para o teto que barra.**

É o F5 do HeyGen espelhado — lá era cota sem relatório, aqui é relatório sem cota. O ledger daquele ciclo já registrou a lição: *"metade do buraco fechado é buraco aberto"*.

## E. Tentativa que falhou é precificada, e o retry multiplica

`elevenlabs.service.ts:98` publica `trackTtsUsage(text.length, …, success: false)` de dentro do `retryWithBackoff` — `maxRetries = 3` (linha 23).

Do outro lado, `llm-usage-batch-buffer.service.ts:107` precifica **incondicionalmente**: `success` vira apenas `status: 'failed'` (linha 155), e **nenhuma leitura de custo filtra status** — `0206_cost_events_view.sql` expõe `SELECT m.*`, e `0201_cost_read_view.sql` filtra só por data.

Uma síntese que falha duas vezes e acerta na terceira grava **três linhas cobradas** e entrega um áudio. O fornecedor não cobra por 401/429/402. O mesmo padrão existe no caminho OpenAI (`openai-tts.service.ts:138`), então não é defeito de um provider: é a regra de "o que é cobrável" nunca ter sido escrita.

## F. As 22 migrations nunca rodaram contra o banco live — e três travam a tabela mais quente

`main` para na `0189`. A branch acumula **22** migrations pendentes (0190-0211, mais a `fx_rates` que foi renomeada para 0209 e nunca esteve no journal). O app está em produção com usuários reais.

Auditadas uma a uma contra `CLAUDE.md` §9.1.1 e a semântica do PostgreSQL 16 (`terraform/modules/database/main.tf:90`), **19 são seguras** — `ADD COLUMN` nullable e `ADD COLUMN NOT NULL DEFAULT` são metadata-only no PG 11+; views são catálogo; `CREATE TABLE`/`CREATE INDEX` sobre tabelas nascidas na própria migration são instantâneos; `UPDATE` em `llm_models`/`llm_usage_limits`/`llm_api_keys` pega lock de linha em tabelas pequenas.

**Três não são**, e todas caem em `api_usage_monitoring` — a tabela que recebe uma linha por chamada de LLM e que, segundo o cabeçalho da 0192, *"já derrubou produção duas vezes"*:

| # | operação | lock real | efeito em live |
|---|---|---|---|
| 1 | `0192:27-29` — `ADD CONSTRAINT … CHECK (…)` **sem `NOT VALID`** | `ACCESS EXCLUSIVE` + **varredura completa** para validar as linhas existentes | bloqueia **tudo**, inclusive `SELECT`, pelo tempo da varredura |
| 2 | `0192:36-38` — `CREATE INDEX` parcial, **sem `CONCURRENTLY`** | `SHARE` + **varredura completa do heap** | bloqueia toda **escrita** na tabela pelo tempo da varredura |
| 3 | `0204:22-26` — `DROP` + `ADD` do mesmo CHECK | `ACCESS EXCLUSIVE` + **segunda varredura completa** | idem #1, de novo |

O detalhe que torna isto instrutivo: a 0192 **raciocina sobre lock no próprio comentário** e acerta em duas decisões (`ADD COLUMN` nullable é instantâneo; `CHECK` em vez de enum evita `ALTER TYPE`) — e erra na terceira, que está na linha seguinte. E o comentário do índice diz textualmente *"CONCURRENTLY não é usado aqui porque a coluna acabou de nascer — não há linha antiga para varrer"*: **um índice parcial varre o heap inteiro para descobrir quais linhas satisfazem o predicado.** O índice nasce vazio; a varredura acontece do mesmo jeito.

Amplificador estrutural: `migrate:prod` roda a cadeia inteira em **transação única** (`CLAUDE.md` §9.1.1), então os três locks não são três janelas curtas — são uma janela só, mantida até o commit, com as tasks ECS empilhando atrás.

## G. A reconciliação confere 0,1% e o painel não diz isso

`monthly-cost-reconciliation.job.ts:305-306` registra, no próprio código: *"neste banco, 99,9% do gasto é OpenAI e 0,1% é Bedrock"*. O job filtra `llm_provider = 'bedrock'`.

O ciclo `sincronizacao-de-precos` já corrigiu a versão grave deste defeito (o job conferia 10,9% da fatura Bedrock e reportava o resto como acordo). O que restou é a mesma classe uma camada acima: a **cobertura da amostra** não é reportada, então "sem divergência" continua sendo lido como "o gasto está certo".

**Decisão do usuário (2026-08-08)**: OpenAI se baseia **apenas no catálogo LiteLLM**. Isso é legítimo como fonte de **preço** — mas LiteLLM é catálogo, não fatura: ele responde "o preço unitário está certo?", nunca "o total cobrado bate com o registrado?". Com a decisão tomada, o problema deixa de ser "integrar a fatura" e passa a ser **declarar honestamente o que está e o que não está sob verificação** — e substituir a verificação externa que não haverá por um invariante interno que valha tanto quanto.

## O que amarra os sete

Todos são **cobertura falsa** — a mesma tese do épico, na camada que faltava:

- A/B/C — um preço que aparenta procedência e não tem, sem detector.
- D — um relatório que aparenta cobrar, e um teto que não vê.
- E — uma cobrança que aparenta consumo, e é tentativa descartada.
- F — um comentário de migration que aparenta ter raciocinado sobre lock, e parou uma linha antes.
- G — um controle que aparenta conferir a conta, e confere um milésimo dela.

O épico preferiu, do primeiro commit ao último, **a ausência declarada à presença fingida**. Estes sete são o que sobrou de presença fingida.

## Fora de escopo (declarado)

- **Push, PR, merge e deploy** — decisão explícita do usuário (2026-08-08): o trabalho fica local, commit na branch atual. Consequência aceita: nada disto alcança o usuário final neste ciclo, e a dimensão "entrega" permanece em zero por decisão, não por omissão.
- **Integrar a API de faturamento da OpenAI** — decisão explícita do usuário: OpenAI se baseia apenas no LiteLLM. O ciclo entrega o substituto (invariante + cobertura declarada), não a integração.
- **Aplicar as migrations em produção.** Sem acesso live (sem chave SSH carregada, sem profile AWS), este ciclo entrega os consertos das migrations e a **guarda que reprova a classe**, além do pré-voo que roda contra o prod na hora do deploy — não a aplicação.
- **Dropar colunas/tabelas legadas** de qualquer área tocada.

