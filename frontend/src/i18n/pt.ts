import type { I18nKey } from './en'

const pt: Record<I18nKey, string> = {
  'nav.docs':   'Docs',
  'nav.github': 'GitHub',

  'hero.headline':      'Pagamentos privados<br>na Stellar.',
  'hero.sub':           'Provas ZK geradas no seu navegador. Saldos armazenados como <strong>compromissos Pedersen</strong> — a rede vê um ponto em uma curva, não um número. Ninguém vê seu saldo.',
  'hero.cta.primary':   'Ler a documentação',
  'hero.cta.secondary': 'Experimentar a carteira',

  'how.h2':          'Entrada pública.<br>Interior privado.',
  'how.step1.id':    'Depositar',
  'how.step1.title': 'XLM entra no contrato',
  'how.step1.body':  'Você envia XLM publicamente. O contrato cria um compromisso Pedersen — um fator de ocultação aleatório mais o seu valor, codificado como um ponto na curva JubJub. Este é o único momento em que o valor é observável.',
  'how.step1.badge': 'valor visível uma vez',
  'how.step2.id':    'Transferir',
  'how.step2.title': 'Prova gerada no seu navegador',
  'how.step2.body':  'O SDK gera uma prova Groth16 de que você conhece a abertura do seu compromisso e que está enviando um valor válido. O destinatário recebe uma nota criptografada — somente a chave dele pode descriptografá-la.',
  'how.step2.badge': 'valor oculto para sempre',
  'how.step3.id':    'Sacar',
  'how.step3.title': 'Comprove a propriedade, receba XLM',
  'how.step3.body':  'Para sair, você gera uma prova de saque: você conhece o saldo e o fator de ocultação que abrem seu compromisso on-chain. O contrato verifica a prova e libera XLM para o seu endereço.',
  'how.step3.badge': 'saldo nunca revelado',

  'sdk.h2':   'Quatro chamadas.<br>Ciclo completo.',
  'sdk.desc': 'Instale o SDK, conecte sua carteira e você terá pagamentos confidenciais. Geração de provas, criptografia de notas, gerenciamento de estado e envio de transações Stellar são tratados automaticamente.',
  'sdk.cta':  'Ver guia de início rápido →',

  'spec.h2': 'O que há sob o capô.',

  'footer.tagline':          'Pagamentos privados na Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Início rápido',
}

export default pt
