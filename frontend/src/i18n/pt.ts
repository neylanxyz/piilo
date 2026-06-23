import type { I18nKey } from './en'

const pt: Record<I18nKey, string> = {
  'nav.docs':   'Docs',
  'nav.github': 'GitHub',

  'hero.headline':      'Pagamentos privados<br>na Stellar.',
  'hero.sub':           'Provas ZK geradas no seu navegador. Saldos armazenados como <strong>compromissos Pedersen</strong> — a rede vê um ponto em uma curva, não um número. Funciona com XLM e USDC.',
  'hero.cta.primary':   'Ler a documentação',
  'hero.cta.secondary': 'Experimentar a carteira',
  'hero.cta.payroll':   'Demo de folha de pagamento',

  'how.h2':          'Entrada pública.<br>Interior privado.',
  'how.step1.id':    'Depositar',
  'how.step1.title': 'Fundos entram no contrato',
  'how.step1.body':  'Você envia XLM ou USDC publicamente. O contrato cria um compromisso Pedersen — um fator de ocultação aleatório mais o seu valor, codificado como um ponto na curva JubJub. Este é o único momento em que o valor é observável.',
  'how.step1.badge': 'valor visível uma vez',
  'how.step2.id':    'Transferir',
  'how.step2.title': 'Prova gerada no seu navegador',
  'how.step2.body':  'O SDK gera uma prova Groth16 de que você conhece a abertura do seu compromisso e que está enviando um valor válido. O destinatário recebe uma nota criptografada — somente a chave dele pode descriptografá-la.',
  'how.step2.badge': 'valor oculto para sempre',
  'how.step3.id':    'Sacar',
  'how.step3.title': 'Comprove a propriedade, saia da privacidade',
  'how.step3.body':  'Para sair, você gera uma prova de saque: você conhece o saldo e o fator de ocultação que abrem seu compromisso on-chain. O contrato verifica a prova e libera os fundos para o seu endereço. O saldo é revelado como parte desta saída voluntária.',
  'how.step3.badge': 'saída voluntária de privacidade',

  'sdk.h2':   'Quatro chamadas.<br>Ciclo completo.',
  'sdk.desc': 'Instale o SDK, conecte sua carteira e você terá pagamentos confidenciais. Funciona com qualquer token. Geração de provas, criptografia de notas, gerenciamento de estado e envio de transações Stellar são tratados automaticamente.',
  'sdk.cta':  'Ver guia de início rápido →',

  'spec.h2': 'O que há sob o capô.',

  'spec.auditor.term': 'Hook de Auditoria de Conformidade',
  'spec.auditor.sub':  'JubJub ECDH · por transferência',
  'spec.auditor.def':  'Cada transferência criptografa o valor sob uma chave pública de auditor registrada usando JubJub ECDH: o remetente computa um segredo compartilhado com a chave do auditor e mascara o valor como A_enc = A + S.x. O auditor pode descriptografar todos os valores de transferência usando seu escalar privado — mais ninguém pode. Os endereços são sempre públicos por design; apenas os valores são ocultados.',

  'footer.tagline':          'Pagamentos privados na Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Início rápido',
}

export default pt
