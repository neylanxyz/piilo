/* Piilo i18n — EN / ES / PT */
;(function () {
  const T = {
    en: {
      /* ── NAV ─────────────────────────────────────────── */
      'nav.docs':   'Docs',
      'nav.github': 'GitHub',

      /* ── HERO ────────────────────────────────────────── */
      'hero.headline':     'Private payments<br>on Stellar.',
      'hero.sub':          'ZK proofs generated in your browser. Balances stored as <strong>Pedersen commitments</strong> — the chain sees a point on a curve, not a number. No one sees your balance.',
      'hero.cta.primary':  'Read the Docs',
      'hero.cta.secondary':'Try the Wallet',

      /* ── HOW IT WORKS ────────────────────────────────── */
      'how.h2':           'Public entry.<br>Private interior.',
      'how.step1.id':     'Deposit',
      'how.step1.title':  'XLM enters the contract',
      'how.step1.body':   'You send XLM publicly. The contract mints a Pedersen commitment — a random blinding factor plus your amount, encoded as a JubJub curve point. This is the only moment the amount is observable.',
      'how.step1.badge':  'amount visible once',
      'how.step2.id':     'Transfer',
      'how.step2.title':  'Proof generated in your browser',
      'how.step2.body':   'The SDK generates a Groth16 proof that you know the opening of your commitment and that you\'re sending a valid amount. The recipient receives an encrypted note — only their key can decrypt it.',
      'how.step2.badge':  'amount hidden forever',
      'how.step3.id':     'Withdraw',
      'how.step3.title':  'Prove ownership, receive XLM',
      'how.step3.body':   'To exit, you generate a withdrawal proof: you know the balance and blinding factor that open your on-chain commitment. The contract verifies the proof and releases XLM to your address.',
      'how.step3.badge':  'balance never revealed',

      /* ── SDK SECTION ─────────────────────────────────── */
      'sdk.h2':   'Four calls.<br>Full lifecycle.',
      'sdk.desc': 'Install the SDK, connect your wallet, and you have confidential payments. Proof generation, note encryption, state management, and Stellar transaction submission are handled for you.',
      'sdk.cta':  'View quickstart guide →',

      /* ── TECH SPEC ───────────────────────────────────── */
      'spec.h2': 'What\'s under the hood.',

      /* ── FOOTER ──────────────────────────────────────── */
      'footer.tagline':        'Private payments on Stellar',
      'footer.links.docs':     'Docs',
      'footer.links.quickstart': 'Quickstart',

      /* ── DOCS SIDEBAR ────────────────────────────────── */
      'docs.group.start':    'Getting Started',
      'docs.group.concepts': 'Concepts',
      'docs.group.api':      'API Reference',
      'docs.group.guides':   'Guides',

      'breadcrumb.start':    'Getting Started',
      'breadcrumb.concepts': 'Concepts',
      'breadcrumb.api':      'API Reference',
      'breadcrumb.guides':   'Guides',

      'nav.introduction': 'Introduction',
      'nav.quickstart':   'Quickstart',
      'nav.architecture': 'Architecture',
      'nav.privacy-model':'Privacy Model',
      'nav.local-state':  'Local State',
      'nav.piilo-class':  'Piilo class',
      'nav.deposit':      'deposit()',
      'nav.transfer':     'transfer()',
      'nav.settle':       'settleIfPending()',
      'nav.withdraw':     'withdraw()',
      'nav.backup':       'exportBackup() / importBackup()',
      'nav.types':        'Types',
      'nav.freighter':    'Freighter Integration',
      'nav.selfhosting':  'Self-hosting Circuits',
      'nav.security':     'Security Guide',

      /* ── DOCS PAGES ──────────────────────────────────── */
      'page.introduction.h1':    'Introduction',
      'page.introduction.intro': 'Piilo is a zero-knowledge private payments protocol built on Stellar. Deposit XLM, transfer it privately, and withdraw — without any observer learning your balance or transfer amounts.',
      'page.quickstart.h1':      'Quickstart',
      'page.quickstart.intro':   'From zero to a working confidential transfer on Stellar testnet in under 5 minutes.',
      'page.architecture.h1':    'Architecture',
      'page.architecture.intro': 'Piilo combines three cryptographic building blocks: Pedersen commitments on the JubJub curve, Groth16 zero-knowledge proofs, and NaCl box encryption.',
      'page.privacy.h1':         'Privacy Model',
      'page.privacy.intro':      'Piilo provides computational privacy: balances and transfer amounts are hidden from all on-chain observers, including validators and block explorers.',
      'page.localstate.h1':      'Local State',
      'page.localstate.intro':   'Piilo stores your plaintext balance and blinding factor locally — in localStorage. Understanding this model is essential for building reliable applications.',
      'page.piiloclass.h1':      'Piilo class',
      'page.piiloclass.intro':   'The main entry point of the SDK. Coordinates local state, proof generation, note encryption, and Stellar transaction submission.',
      'page.types.h1':           'Types',
      'page.types.intro':        'All public types exported from @piilo/sdk.',
      'page.freighter.h1':       'Freighter Integration',
      'page.freighter.intro':    'Freighter is the most widely used browser wallet for Stellar. This guide provides a complete, production-ready WalletAdapter for Freighter.',
      'page.selfhosting.h1':     'Self-hosting Circuit Files',
      'page.selfhosting.intro':  'The Piilo SDK uses two large WASM + zkey file pairs for proof generation. By default, the SDK resolves them relative to /circuits/ on your web server.',
      'page.security.h1':        'Security Guide',
      'page.security.intro':     'The blinding factor r is your private key. This guide covers how to protect it, what to do if it\'s lost, and how to audit your dependencies.',
    },

    es: {
      'nav.docs':   'Docs',
      'nav.github': 'GitHub',

      'hero.headline':     'Pagos privados<br>en la Stellar.',
      'hero.sub':          'Pruebas ZK generadas en tu navegador. Saldos almacenados como <strong>compromisos Pedersen</strong> — la red ve un punto en una curva, no un número. Nadie ve tu saldo.',
      'hero.cta.primary':  'Leer la documentación',
      'hero.cta.secondary':'Probar la cartera',

      'how.h2':           'Entrada pública.<br>Interior privado.',
      'how.step1.id':     'Depositar',
      'how.step1.title':  'XLM entra en el contrato',
      'how.step1.body':   'Envías XLM públicamente. El contrato crea un compromiso Pedersen — un factor de cegamiento aleatorio más tu monto, codificado como un punto en la curva JubJub. Este es el único momento en que el monto es observable.',
      'how.step1.badge':  'monto visible una vez',
      'how.step2.id':     'Transferir',
      'how.step2.title':  'Prueba generada en tu navegador',
      'how.step2.body':   'El SDK genera una prueba Groth16 de que conoces la apertura de tu compromiso y que estás enviando un monto válido. El destinatario recibe una nota cifrada — solo su clave puede descifrarla.',
      'how.step2.badge':  'monto oculto para siempre',
      'how.step3.id':     'Retirar',
      'how.step3.title':  'Prueba de propiedad, recibe XLM',
      'how.step3.body':   'Para salir, generas una prueba de retiro: conoces el saldo y el factor de cegamiento que abren tu compromiso on-chain. El contrato verifica la prueba y libera XLM a tu dirección.',
      'how.step3.badge':  'saldo nunca revelado',

      'sdk.h2':   'Cuatro llamadas.<br>Ciclo completo.',
      'sdk.desc': 'Instala el SDK, conecta tu cartera y tendrás pagos confidenciales. La generación de pruebas, el cifrado de notas, la gestión de estado y el envío de transacciones Stellar se gestionan automáticamente.',
      'sdk.cta':  'Ver guía de inicio rápido →',

      'spec.h2': '¿Qué hay bajo el capó?',

      'footer.tagline':         'Pagos privados en la Stellar',
      'footer.links.docs':      'Docs',
      'footer.links.quickstart':'Inicio rápido',

      'docs.group.start':    'Primeros pasos',
      'docs.group.concepts': 'Conceptos',
      'docs.group.api':      'Referencia API',
      'docs.group.guides':   'Guías',

      'breadcrumb.start':    'Primeros pasos',
      'breadcrumb.concepts': 'Conceptos',
      'breadcrumb.api':      'Referencia API',
      'breadcrumb.guides':   'Guías',

      'nav.introduction': 'Introducción',
      'nav.quickstart':   'Inicio rápido',
      'nav.architecture': 'Arquitectura',
      'nav.privacy-model':'Modelo de privacidad',
      'nav.local-state':  'Estado local',
      'nav.piilo-class':  'Piilo class',
      'nav.deposit':      'deposit()',
      'nav.transfer':     'transfer()',
      'nav.settle':       'settleIfPending()',
      'nav.withdraw':     'withdraw()',
      'nav.backup':       'exportBackup() / importBackup()',
      'nav.types':        'Tipos',
      'nav.freighter':    'Integración Freighter',
      'nav.selfhosting':  'Auto-alojar circuitos',
      'nav.security':     'Guía de seguridad',

      'page.introduction.h1':    'Introducción',
      'page.introduction.intro': 'Piilo es un protocolo de pagos privados de conocimiento cero construido en la Stellar. Deposita XLM, transfiérelo de forma privada y retíralo — sin que ningún observador conozca tu saldo ni los montos transferidos.',
      'page.quickstart.h1':      'Inicio rápido',
      'page.quickstart.intro':   'De cero a una transferencia confidencial funcional en la testnet de Stellar en menos de 5 minutos.',
      'page.architecture.h1':    'Arquitectura',
      'page.architecture.intro': 'Piilo combina tres bloques criptográficos: compromisos Pedersen en la curva JubJub, pruebas de conocimiento cero Groth16 y cifrado NaCl box.',
      'page.privacy.h1':         'Modelo de privacidad',
      'page.privacy.intro':      'Piilo ofrece privacidad computacional: los saldos y montos de transferencia están ocultos para todos los observadores on-chain, incluidos validadores y exploradores de bloques.',
      'page.localstate.h1':      'Estado local',
      'page.localstate.intro':   'Piilo almacena tu saldo en texto plano y el factor de cegamiento localmente — en localStorage. Entender este modelo es esencial para construir aplicaciones confiables.',
      'page.piiloclass.h1':      'Clase Piilo',
      'page.piiloclass.intro':   'El punto de entrada principal del SDK. Coordina el estado local, la generación de pruebas, el cifrado de notas y el envío de transacciones Stellar.',
      'page.types.h1':           'Tipos',
      'page.types.intro':        'Todos los tipos públicos exportados de @piilo/sdk.',
      'page.freighter.h1':       'Integración Freighter',
      'page.freighter.intro':    'Freighter es la cartera de navegador más utilizada para Stellar. Esta guía proporciona un WalletAdapter completo y listo para producción.',
      'page.selfhosting.h1':     'Auto-alojar archivos de circuito',
      'page.selfhosting.intro':  'El SDK de Piilo usa dos pares de archivos WASM + zkey para la generación de pruebas. Por defecto, el SDK los resuelve relativos a /circuits/ en tu servidor web.',
      'page.security.h1':        'Guía de seguridad',
      'page.security.intro':     'El factor de cegamiento r es tu clave privada. Esta guía cubre cómo protegerlo, qué hacer si se pierde y cómo auditar tus dependencias.',
    },

    pt: {
      'nav.docs':   'Docs',
      'nav.github': 'GitHub',

      'hero.headline':     'Pagamentos privados<br>na Stellar.',
      'hero.sub':          'Provas ZK geradas no seu navegador. Saldos armazenados como <strong>compromissos Pedersen</strong> — a rede vê um ponto em uma curva, não um número. Ninguém vê seu saldo.',
      'hero.cta.primary':  'Ler a documentação',
      'hero.cta.secondary':'Experimentar a carteira',

      'how.h2':           'Entrada pública.<br>Interior privado.',
      'how.step1.id':     'Depositar',
      'how.step1.title':  'XLM entra no contrato',
      'how.step1.body':   'Você envia XLM publicamente. O contrato cria um compromisso Pedersen — um fator de ocultação aleatório mais o seu valor, codificado como um ponto na curva JubJub. Este é o único momento em que o valor é observável.',
      'how.step1.badge':  'valor visível uma vez',
      'how.step2.id':     'Transferir',
      'how.step2.title':  'Prova gerada no seu navegador',
      'how.step2.body':   'O SDK gera uma prova Groth16 de que você conhece a abertura do seu compromisso e que está enviando um valor válido. O destinatário recebe uma nota criptografada — somente a chave dele pode descriptografá-la.',
      'how.step2.badge':  'valor oculto para sempre',
      'how.step3.id':     'Sacar',
      'how.step3.title':  'Comprove a propriedade, receba XLM',
      'how.step3.body':   'Para sair, você gera uma prova de saque: você conhece o saldo e o fator de ocultação que abrem seu compromisso on-chain. O contrato verifica a prova e libera XLM para o seu endereço.',
      'how.step3.badge':  'saldo nunca revelado',

      'sdk.h2':   'Quatro chamadas.<br>Ciclo completo.',
      'sdk.desc': 'Instale o SDK, conecte sua carteira e você terá pagamentos confidenciais. Geração de provas, criptografia de notas, gerenciamento de estado e envio de transações Stellar são tratados automaticamente.',
      'sdk.cta':  'Ver guia de início rápido →',

      'spec.h2': 'O que há sob o capô.',

      'footer.tagline':         'Pagamentos privados na Stellar',
      'footer.links.docs':      'Docs',
      'footer.links.quickstart':'Início rápido',

      'docs.group.start':    'Primeiros passos',
      'docs.group.concepts': 'Conceitos',
      'docs.group.api':      'Referência da API',
      'docs.group.guides':   'Guias',

      'breadcrumb.start':    'Primeiros passos',
      'breadcrumb.concepts': 'Conceitos',
      'breadcrumb.api':      'Referência da API',
      'breadcrumb.guides':   'Guias',

      'nav.introduction': 'Introdução',
      'nav.quickstart':   'Início rápido',
      'nav.architecture': 'Arquitetura',
      'nav.privacy-model':'Modelo de privacidade',
      'nav.local-state':  'Estado local',
      'nav.piilo-class':  'Piilo class',
      'nav.deposit':      'deposit()',
      'nav.transfer':     'transfer()',
      'nav.settle':       'settleIfPending()',
      'nav.withdraw':     'withdraw()',
      'nav.backup':       'exportBackup() / importBackup()',
      'nav.types':        'Tipos',
      'nav.freighter':    'Integração Freighter',
      'nav.selfhosting':  'Auto-hospedar circuitos',
      'nav.security':     'Guia de segurança',

      'page.introduction.h1':    'Introdução',
      'page.introduction.intro': 'Piilo é um protocolo de pagamentos privados com conhecimento zero construído na Stellar. Deposite XLM, transfira de forma privada e saque — sem que nenhum observador conheça seu saldo ou os valores transferidos.',
      'page.quickstart.h1':      'Início rápido',
      'page.quickstart.intro':   'Do zero a uma transferência confidencial funcionando na testnet da Stellar em menos de 5 minutos.',
      'page.architecture.h1':    'Arquitetura',
      'page.architecture.intro': 'Piilo combina três blocos criptográficos: compromissos Pedersen na curva JubJub, provas de conhecimento zero Groth16 e cifração NaCl box.',
      'page.privacy.h1':         'Modelo de privacidade',
      'page.privacy.intro':      'Piilo oferece privacidade computacional: saldos e valores de transferência são ocultados de todos os observadores on-chain, incluindo validadores e exploradores de blocos.',
      'page.localstate.h1':      'Estado local',
      'page.localstate.intro':   'Piilo armazena seu saldo em texto simples e o fator de ocultação localmente — no localStorage. Entender esse modelo é essencial para construir aplicações confiáveis.',
      'page.piiloclass.h1':      'Classe Piilo',
      'page.piiloclass.intro':   'O ponto de entrada principal do SDK. Coordena o estado local, a geração de provas, a criptografia de notas e o envio de transações Stellar.',
      'page.types.h1':           'Tipos',
      'page.types.intro':        'Todos os tipos públicos exportados de @piilo/sdk.',
      'page.freighter.h1':       'Integração Freighter',
      'page.freighter.intro':    'Freighter é a carteira de navegador mais usada para Stellar. Este guia fornece um WalletAdapter completo e pronto para produção.',
      'page.selfhosting.h1':     'Auto-hospedar arquivos de circuito',
      'page.selfhosting.intro':  'O SDK do Piilo usa dois pares de arquivos WASM + zkey para geração de provas. Por padrão, o SDK os resolve relativos a /circuits/ no seu servidor web.',
      'page.security.h1':        'Guia de segurança',
      'page.security.intro':     'O fator de ocultação r é sua chave privada. Este guia cobre como protegê-lo, o que fazer se for perdido e como auditar suas dependências.',
    },
  }

  const LANGS = ['en', 'es', 'pt']
  const LS_KEY = 'piilo-lang'

  function getLang() {
    const stored = localStorage.getItem(LS_KEY)
    if (stored && LANGS.includes(stored)) return stored
    const browser = (navigator.language || '').slice(0, 2).toLowerCase()
    if (LANGS.includes(browser)) return browser
    return 'en'
  }

  function applyLang(lang) {
    if (!LANGS.includes(lang)) lang = 'en'
    const dict = T[lang]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      if (dict[key] !== undefined) el.innerHTML = dict[key]
    })
    document.documentElement.setAttribute('lang', lang)
    document.querySelectorAll('.i18n-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang)
    })
  }

  function buildSwitcher() {
    const wrap = document.createElement('div')
    wrap.className = 'i18n-switcher'
    LANGS.forEach(lang => {
      const btn = document.createElement('button')
      btn.className = 'i18n-btn'
      btn.dataset.lang = lang
      btn.textContent = lang.toUpperCase()
      btn.addEventListener('click', () => {
        localStorage.setItem(LS_KEY, lang)
        applyLang(lang)
      })
      wrap.appendChild(btn)
    })
    return wrap
  }

  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.docs-topbar-links')
    if (navLinks) navLinks.appendChild(buildSwitcher())
    applyLang(getLang())
  })

  window.PiiloI18n = { applyLang, getLang, T }
})()
