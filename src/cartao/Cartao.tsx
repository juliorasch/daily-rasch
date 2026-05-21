import RaschMark from '@/components/RaschMark'
import { cartao } from '@/cartao/dados'

// Página pública — cartão de visita digital. Destino do QR code do cartão
// de visita físico. Sem autenticação, sem ligação ao Daily Rasch interno.

type Contacto = {
  label: string
  valor: string
  href: string
  externo: boolean
}

function construirContactos(): Contacto[] {
  const lista: Contacto[] = []
  if (cartao.telefone) {
    lista.push({
      label: 'Telefone',
      valor: cartao.telefone,
      href: `tel:${cartao.telefone.replace(/\s+/g, '')}`,
      externo: false,
    })
  }
  if (cartao.email) {
    lista.push({
      label: 'Email',
      valor: cartao.email,
      href: `mailto:${cartao.email}`,
      externo: false,
    })
  }
  if (cartao.website) {
    lista.push({
      label: 'Website',
      valor: cartao.website.replace(/^https?:\/\//, ''),
      href: cartao.website,
      externo: true,
    })
  }
  if (cartao.instagram) {
    lista.push({
      label: 'Instagram',
      valor: `@${cartao.instagram}`,
      href: `https://instagram.com/${cartao.instagram}`,
      externo: true,
    })
  }
  if (cartao.facebook) {
    lista.push({
      label: 'Facebook',
      valor: cartao.facebook,
      href: `https://facebook.com/${cartao.facebook}`,
      externo: true,
    })
  }
  if (cartao.morada) {
    lista.push({
      label: 'Morada',
      valor: cartao.morada,
      href: `https://maps.google.com/?q=${encodeURIComponent(cartao.morada)}`,
      externo: true,
    })
  }
  return lista
}

const contactos = construirContactos()

function construirVCard(): string {
  const nomeCompleto = `${cartao.nome} ${cartao.forma}`.trim()
  const linhas = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${nomeCompleto}`, `ORG:${nomeCompleto}`]
  if (cartao.funcao) linhas.push(`TITLE:${cartao.funcao}`)
  if (cartao.telefone) linhas.push(`TEL;TYPE=WORK,VOICE:${cartao.telefone}`)
  if (cartao.email) linhas.push(`EMAIL;TYPE=WORK:${cartao.email}`)
  if (cartao.website) linhas.push(`URL:${cartao.website}`)
  if (cartao.morada) linhas.push(`ADR;TYPE=WORK:;;${cartao.morada};;;;`)
  if (cartao.sobre) linhas.push(`NOTE:${cartao.sobre}`)
  linhas.push('END:VCARD')
  return linhas.join('\r\n')
}

function guardarContacto() {
  const blob = new Blob([construirVCard()], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const ancora = document.createElement('a')
  ancora.href = url
  ancora.download = 'Rasch-Remodeling.vcf'
  document.body.appendChild(ancora)
  ancora.click()
  ancora.remove()
  URL.revokeObjectURL(url)
}

export default function Cartao() {
  const ano = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-6 py-12">
      <main className="w-full max-w-sm">
        {/* topo — marca */}
        <header className="flex flex-col items-center text-center">
          <RaschMark size={60} className="mb-9" />
          <div className="flex items-center gap-3 mb-5">
            <span className="block h-px w-7 bg-gold" />
            <span className="text-gold text-[10px] tracking-editorial-wide uppercase">
              {cartao.funcao}
            </span>
            <span className="block h-px w-7 bg-gold" />
          </div>
          <h1 className="font-display text-[2.75rem] leading-[1.02] text-cream-bright">
            {cartao.nome} <span className="italic text-gold">{cartao.forma}.</span>
          </h1>
          <p className="font-display italic text-gold-soft text-base mt-4 leading-snug">
            {cartao.slogan}
          </p>
          <p className="text-muted text-sm leading-relaxed mt-4">{cartao.sobre}</p>
        </header>

        {/* acção principal — guardar contacto */}
        <button
          type="button"
          onClick={guardarContacto}
          className="mt-9 w-full bg-gold text-bg font-semibold text-[11px] tracking-editorial-wide uppercase py-4 rounded-editorial hover:bg-gold-soft transition-colors"
        >
          Guardar contacto
        </button>

        {/* contactos */}
        {contactos.length > 0 && (
          <div className="mt-4 space-y-2">
            {contactos.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.externo ? '_blank' : undefined}
                rel={c.externo ? 'noreferrer' : undefined}
                className="group flex items-center justify-between gap-4 bg-bg-card border border-line hover:border-gold rounded-editorial px-5 py-4 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block text-[10px] tracking-editorial-wide uppercase text-gold-dim group-hover:text-gold transition-colors">
                    {c.label}
                  </span>
                  <span className="block text-cream-bright text-sm mt-1 truncate">
                    {c.valor}
                  </span>
                </span>
                <span className="text-gold text-lg shrink-0 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            ))}
          </div>
        )}

        {/* serviços */}
        {cartao.servicos.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="block h-px w-7 bg-gold" />
              <span className="text-gold text-[10px] tracking-editorial-wide uppercase">
                Serviços
              </span>
              <span className="block h-px w-7 bg-gold" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {cartao.servicos.map((s) => (
                <span
                  key={s}
                  className="text-muted text-[10px] tracking-editorial uppercase border border-line rounded-editorial px-3 py-1.5"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 text-center">
          <p className="text-muted text-[10px] tracking-editorial-wide uppercase">
            © {ano} Rasch Remodeling LDA
          </p>
        </footer>
      </main>
    </div>
  )
}
