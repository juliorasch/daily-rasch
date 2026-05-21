// Cartão de visita digital da Rasch Remodeling — dados públicos.
//
// É para aqui que o QR code do cartão de visita físico aponta.
// Esta página é PÚBLICA e não tem qualquer ligação ao Daily Rasch interno.
//
// Para actualizar: editar os campos abaixo. Campos deixados a '' (vazio)
// não aparecem no cartão — preencher só o que existir.

export type CartaoDados = {
  nome: string
  forma: string
  funcao: string
  slogan: string
  sobre: string
  telefone: string
  email: string
  website: string
  morada: string
  instagram: string
  facebook: string
  servicos: string[]
}

export const cartao: CartaoDados = {
  nome: 'Rasch',
  forma: 'Remodeling',
  funcao: 'LDA — Remodelação & Construção',
  slogan: 'Trabalho bem feito constrói reputação sólida.',
  sobre:
    'Remodelação e construção em Portugal. Acabamentos cuidados, orçamentos transparentes e prazos cumpridos.',

  // Contactos — deixar '' nos que ainda não existem.
  telefone: '', // ex: '+351 912 345 678'
  email: 'info@rasch.pt',
  website: 'https://rasch.pt',
  morada: '', // ex: 'Lisboa, Portugal'
  instagram: '', // handle sem @ — ex: 'raschremodeling'
  facebook: '', // nome de utilizador — ex: 'raschremodeling'

  servicos: [
    'Telhados',
    'Impermeabilização',
    'Pavimentos',
    'Remodelação integral',
  ],
}
