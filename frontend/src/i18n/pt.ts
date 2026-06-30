import type { I18nKey } from './en'

const pt: Record<I18nKey, string> = {
  'nav.docs':     'Docs',
  'nav.examples': 'Exemplos',
  'nav.github':   'GitHub',

  'hero.headline':      'Confidencialidade<br>financeira na Stellar.',
  'hero.sub':           'SDK plug-and-play. Provas ZK geradas no seu navegador. Saldos armazenados como <strong>compromissos Pedersen</strong> — a rede vê um ponto em uma curva, não um número.<img src="/xlm.png" alt="XLM" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;"><img src="/usdc.png" alt="USDC" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;">',
  'hero.cta.primary':   'Ler a documentação',
  'hero.cta.secondary': 'Ver exemplos →',
  'hero.cta.payroll':   'Demo de folha de pagamento',

  'examples.h1':  'Demos ao vivo<br>na Stellar Testnet.',
  'examples.sub': 'Conecte o Freighter, financie uma conta testnet e experimente pagamentos confidenciais de verdade. Sem configuração necessária.',

  'examples.wallet.title': 'Carteira Confidencial',
  'examples.wallet.desc':  'Demo individual do ciclo completo de privacidade: depositar, transferir com privacidade, liquidar transferências recebidas e sacar.',
  'examples.wallet.f1':    'Depositar XLM ou USDC',
  'examples.wallet.f2':    'Enviar com prova ZK — valor oculto on-chain',
  'examples.wallet.f3':    'Receber e liquidar transferências recebidas',
  'examples.wallet.f4':    'Console de auditoria para descriptografar valores',
  'examples.wallet.cta':   'Abrir carteira →',

  'examples.payroll.title': 'Folha de Pagamento Confidencial',
  'examples.payroll.desc':  'Execução de folha de pagamento para múltiplos destinatários: adicione funcionários, defina valores e envie todas as transferências de forma confidencial — aprove cada uma no Freighter.',
  'examples.payroll.f1':    'Adicionar destinatários com nome e endereço',
  'examples.payroll.f2':    'Definir valores por destinatário em XLM ou USDC',
  'examples.payroll.f3':    'Transferências sequenciais — uma aprovação no Freighter por cada',
  'examples.payroll.f4':    'Status ao vivo por linha durante a execução',
  'examples.payroll.cta':   'Abrir folha de pagamento →',

  'examples.note': 'Ambas as demos usam contratos da Stellar Testnet. Obtenha XLM testnet do Stellar Friendbot e USDC testnet do emissor USDC testnet.',

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

  'roadmap.label': 'roadmap',
  'roadmap.h2':   'Construído para durar.<br>Lançado em etapas.',
  'roadmap.now':  'agora',

  'roadmap.v01.version': 'v0.1',
  'roadmap.v01.title':   'Lançamento',
  'roadmap.v01.body':    'SDK publicado no npm como @neylanxyz/piilo. Git tag v0.1.0. Contratos na testnet ativos. Docs completos, quickstart e dois demos funcionais.',

  'roadmap.v02.version': 'v0.2',
  'roadmap.v02.title':   'Reforço',
  'roadmap.v02.body':    'Auditoria de segurança de terceiros. UI de recuperação de estado para estado local perdido. Guia de onboarding institucional.',

  'roadmap.v03.version': 'v0.3',
  'roadmap.v03.title':   'Mainnet',
  'roadmap.v03.body':    'Deploy do contrato em produção. Alinhamento com o padrão de token confidencial da OpenZeppelin.',

  'roadmap.v10.version': 'v1.0',
  'roadmap.v10.title':   'Ecossistema',
  'roadmap.v10.body':    'Engajamento ativo com SDF. Suporte a integração com Fireblocks e Anchorage. Proposta SEP de token confidencial submetida.',

  'roadmap.v20.version': 'v2.0',
  'roadmap.v20.title':   'Integração OZ',
  'roadmap.v20.body':    'Adoção da interface de token confidencial da OpenZeppelin como padrão canônico. Piilo se torna a implementação de referência na Stellar.',

  'footer.tagline':          'Pagamentos privados na Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Início rápido',
}

export default pt
