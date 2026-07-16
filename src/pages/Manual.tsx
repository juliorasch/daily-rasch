import { useState } from 'react'
import { Link } from 'react-router-dom'

type Guia = {
  numero: string
  titulo: string
  italico: string
  resumo: string
  corpo: React.ReactNode
}

export default function Manual() {
  const [aberto, setAberto] = useState<string | null>('02')

  const guias: Guia[] = [
    {
      numero: '01',
      titulo: 'Começar',
      italico: 'aqui.',
      resumo: 'Entrar na aplicação e escolher onde trabalhar.',
      corpo: (
        <>
          <Passos
            passos={[
              'Abre dailyrasch.com no telemóvel e entra com o teu email e palavra-passe.',
              'No Hub, escolhe Empresa (negócio) ou Família (casa).',
              'Para voltares ao Hub em qualquer altura, toca no logótipo Rasch no topo.',
            ]}
          />
          <Dica>
            Os dois utilizadores (Rasch e esposa) veem exactamente o mesmo — não há
            números escondidos. Guarda a página no ecrã inicial do telemóvel para
            abrir como uma app.
          </Dica>
        </>
      ),
    },
    {
      numero: '02',
      titulo: 'Capturar',
      italico: 'faturas.',
      resumo: 'O gesto mais importante: foto → IA lê → guardado.',
      corpo: (
        <>
          <p className="text-muted text-sm leading-relaxed mb-4">
            Sempre que pagares algo — Leroy Merlin, IKEA, combustível, seja o que for —
            fotografa a fatura no momento. A IA trata do resto.
          </p>
          <Passos
            passos={[
              <>
                No <Link to="/painel" className="text-gold hover:underline">Painel</Link>{' '}
                (despesas da empresa) ou na{' '}
                <Link to="/familia" className="text-gold hover:underline">Família</Link>{' '}
                (despesas de casa), toca no cartão grande «Capturar fatura».
              </>,
              'A câmara abre sozinha — tira a foto da fatura (ou escolhe uma da galeria).',
              'A IA lê fornecedor, NIF, data, valor e itens, e sugere a obra a que pertence.',
              'Confirma a obra sugerida ou escolhe outra da lista antes de guardar.',
              'Pronto. A despesa fica registada com a foto anexada.',
            ]}
          />
          <Dica>
            Se a IA não conseguir ler a fatura (foto tremida, talão apagado), a
            aplicação abre o formulário normal para preencheres à mão. Boa luz e
            fatura esticada ajudam muito.
          </Dica>
        </>
      ),
    },
    {
      numero: '03',
      titulo: 'Painel da',
      italico: 'empresa.',
      resumo: 'Visão geral do negócio e alertas do dia.',
      corpo: (
        <>
          <p className="text-muted text-sm leading-relaxed mb-4">
            O <Link to="/painel" className="text-gold hover:underline">Painel</Link> mostra
            os números vivos da Rasch Remodeling: orçamentos abertos, obras em curso,
            despesas do mês e o saldo familiar ao lado.
          </p>
          <Passos
            passos={[
              'A secção «Atenção» junta o que precisa de acção: follow-ups de orçamentos, decisões pendentes e obras com prazo próximo.',
              'Toca em qualquer alerta para ir directo ao sítio certo.',
              'O cartão «Capturar fatura» está sempre no topo — é o atalho mais usado.',
            ]}
          />
        </>
      ),
    },
    {
      numero: '04',
      titulo: 'Clientes e',
      italico: 'orçamentos.',
      resumo: 'Do primeiro contacto à adjudicação.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                Cria o cliente em{' '}
                <Link to="/clientes" className="text-gold hover:underline">Clientes</Link>{' '}
                — nome, telefone, NIF, morada.
              </>,
              <>
                Em{' '}
                <Link to="/orcamentos" className="text-gold hover:underline">Orçamentos</Link>,
                cria o orçamento ligado ao cliente, com valor e data de envio.
              </>,
              'O pipeline tem 4 colunas: Enviado → Em análise → Aceite / Recusado. Move o orçamento conforme a conversa avança.',
              'Marca a data do próximo follow-up — quando chegar, aparece na secção «Atenção» do Painel para não esquecer.',
              'Quando o cliente aceitar, cria a obra a partir do orçamento aceite.',
            ]}
          />
        </>
      ),
    },
    {
      numero: '05',
      titulo: 'Obras em',
      italico: 'curso.',
      resumo: 'Acompanhar cada obra do arranque à conclusão.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                Em <Link to="/obras" className="text-gold hover:underline">Obras</Link>,
                cada obra passa por 3 fases: Por arrancar → Em curso → Concluída.
              </>,
              'Toca numa obra para abrir a vista dedicada: valor contratado, total de despesas, margem, prazos.',
              'As despesas fotografadas ficam automaticamente ligadas à obra — a margem actualiza-se sozinha.',
              'As decisões ligadas à obra também aparecem aqui, para tudo estar num só sítio.',
            ]}
          />
          <Dica>
            A margem da obra é: valor contratado menos despesas ligadas. Se estiver a
            apertar, vês logo — antes de ser tarde.
          </Dica>
        </>
      ),
    },
    {
      numero: '06',
      titulo: 'Despesas e',
      italico: 'confirmações.',
      resumo: 'Rever o que a IA leu e manter as contas certas.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                Em{' '}
                <Link to="/despesas" className="text-gold hover:underline">Despesas</Link>,
                vês tudo organizado por mês, com filtros por obra e estado.
              </>,
              'As despesas lidas pela IA ficam marcadas «por confirmar» até alguém as rever.',
              'Abre a despesa, verifica fornecedor, valor e obra, corrige se preciso, e guarda — fica confirmada.',
              'O Painel mostra quantas despesas estão por confirmar, para nada ficar para trás.',
            ]}
          />
        </>
      ),
    },
    {
      numero: '07',
      titulo: 'Decisões',
      italico: 'pendentes.',
      resumo: 'O que precisa de ser decidido, por prioridade.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                Em{' '}
                <Link to="/decisoes" className="text-gold hover:underline">Decisões</Link>,
                aponta tudo o que precisa de resposta: «confirmar azulejo com cliente»,
                «responder ao fornecedor», etc.
              </>,
              'Dá prioridade (alta, média, baixa) e, se houver, um prazo e a obra a que diz respeito.',
              'As de prioridade alta e as com prazo próximo aparecem na secção «Atenção» do Painel.',
              'Quando resolvida, marca como tal — sai da lista mas fica no histórico.',
            ]}
          />
        </>
      ),
    },
    {
      numero: '08',
      titulo: 'Contas da',
      italico: 'família.',
      resumo: 'Entradas, despesas fixas e variáveis, saldo do mês.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                Em{' '}
                <Link to="/familia" className="text-gold hover:underline">Família</Link>,
                regista as entradas (salários, outros) e as despesas de casa.
              </>,
              'Despesas fixas (renda, seguros, subscrições) repetem-se sozinhas todos os meses — registas uma vez e pronto.',
              'Despesas variáveis (supermercado, farmácia) registam-se no mês em que acontecem — a foto da fatura também funciona aqui.',
              'O saldo do mês (entradas menos despesas) aparece no topo e no Hub.',
            ]}
          />
          <Dica>
            Se uma fixa mudar de valor (ex.: renda sobe), edita-a — o novo valor passa
            a contar daí em diante.
          </Dica>
        </>
      ),
    },
    {
      numero: '09',
      titulo: 'Relatório',
      italico: 'semanal.',
      resumo: 'A semana que passou e os próximos 7 dias.',
      corpo: (
        <>
          <Passos
            passos={[
              <>
                O{' '}
                <Link to="/relatorio" className="text-gold hover:underline">Relatório</Link>{' '}
                resume a semana: orçamentos enviados e aceites, obras iniciadas e
                concluídas, despesas e saldo familiar.
              </>,
              'A secção «Próximos 7 dias» mostra follow-ups, prazos de obras e decisões que vêm aí.',
              'Às segundas de manhã chega o mesmo resumo por email — começa a semana já com o retrato completo.',
            ]}
          />
        </>
      ),
    },
    {
      numero: '10',
      titulo: 'Dúvidas',
      italico: 'comuns.',
      resumo: 'Pequenos problemas e como resolvê-los.',
      corpo: (
        <div className="space-y-5">
          <Duvida
            pergunta="Enganei-me numa despesa. E agora?"
            resposta="Abre a despesa em Despesas (ou Família), corrige os campos e guarda. Se for para apagar de vez, usa o botão de eliminar dentro da própria despesa."
          />
          <Duvida
            pergunta="A IA ligou a fatura à obra errada."
            resposta="Antes de guardar, podes sempre trocar a obra sugerida. Se já guardaste, abre a despesa e muda a obra — a margem das duas obras acerta-se sozinha."
          />
          <Duvida
            pergunta="Onde ficam as fotos das faturas?"
            resposta="Guardadas em segurança na nuvem, ligadas a cada despesa. Abre a despesa para voltar a ver a foto original — útil para garantias e devoluções."
          />
          <Duvida
            pergunta="Esqueci-me da palavra-passe."
            resposta="Ainda não há recuperação automática no ecrã de entrada. A palavra-passe muda-se no painel do Supabase — fala com o Rasch, que trata disso num minuto."
          />
          <Duvida
            pergunta="Os números do Hub não batem com os da Família."
            resposta="Batem — usam a mesma conta: entradas do mês menos variáveis do mês menos fixas activas. Se algo parecer estranho, vê se há uma fixa duplicada com nomes diferentes."
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="block h-px w-7 bg-gold" />
        <span className="text-gold text-[11px] tracking-editorial-wide uppercase">
          10 — Manual
        </span>
      </div>
      <h1 className="font-display text-4xl text-cream-bright leading-tight mb-2">
        Como usar o <span className="italic text-gold">Daily Rasch.</span>
      </h1>
      <p className="text-muted text-sm italic mb-12 max-w-prose">
        Um guia curto para os dois. Cada secção abre com um toque — começa pela
        captura de faturas, que é o coração de tudo.
      </p>

      <div className="space-y-3">
        {guias.map((g) => {
          const estaAberto = aberto === g.numero
          return (
            <section
              key={g.numero}
              className={`bg-bg-card border rounded-editorial transition-colors ${
                estaAberto ? 'border-gold' : 'border-line'
              }`}
            >
              <button
                type="button"
                onClick={() => setAberto(estaAberto ? null : g.numero)}
                aria-expanded={estaAberto}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <span
                  className={`font-display text-2xl shrink-0 transition-colors ${
                    estaAberto ? 'text-gold' : 'text-gold-dim'
                  }`}
                >
                  {g.numero}
                </span>
                <span className="block h-px w-7 bg-gold-dim shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl text-cream-bright leading-snug">
                    {g.titulo} <span className="italic text-gold">{g.italico}</span>
                  </span>
                  <span className="block text-muted text-xs mt-0.5 leading-relaxed">
                    {g.resumo}
                  </span>
                </span>
                <span
                  className={`text-gold text-xl shrink-0 transition-transform ${
                    estaAberto ? 'rotate-90' : ''
                  }`}
                >
                  →
                </span>
              </button>
              {estaAberto && (
                <div className="px-5 pb-6 pt-1 border-t border-line">
                  <div className="pt-4">{g.corpo}</div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p className="font-display italic text-muted text-sm mt-16 text-center tracking-wide">
        Trabalho bem feito constrói reputação sólida.
      </p>
    </div>
  )
}

function Passos({ passos }: { passos: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {passos.map((p, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-display text-gold-dim text-sm tabular-nums shrink-0 pt-0.5">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="text-cream text-sm leading-relaxed">{p}</span>
        </li>
      ))}
    </ol>
  )
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-gold-dim pl-4">
      <div className="text-[11px] tracking-editorial-wide uppercase text-gold-dim mb-1">
        Dica
      </div>
      <p className="text-muted text-sm leading-relaxed">{children}</p>
    </div>
  )
}

function Duvida({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  return (
    <div>
      <p className="text-cream-bright text-sm mb-1">{pergunta}</p>
      <p className="text-muted text-sm leading-relaxed">{resposta}</p>
    </div>
  )
}
