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
      'page.types.intro':        'All public types exported from @neylanxyz/piilo.',
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
      'page.types.intro':        'Todos los tipos públicos exportados de @neylanxyz/piilo.',
      'page.freighter.h1':       'Integración Freighter',
      'page.freighter.intro':    'Freighter es la cartera de navegador más utilizada para Stellar. Esta guía proporciona un WalletAdapter completo y listo para producción.',
      'page.selfhosting.h1':     'Auto-alojar archivos de circuito',
      'page.selfhosting.intro':  'El SDK de Piilo usa dos pares de archivos WASM + zkey para la generación de pruebas. Por defecto, el SDK los resuelve relativos a /circuits/ en tu servidor web.',
      'page.security.h1':        'Guía de seguridad',
      'page.security.intro':     'El factor de cegamiento r es tu clave privada. Esta guía cubre cómo protegerlo, qué hacer si se pierde y cómo auditar tus dependencias.',

      /* ── DOCS BODY ───────────────────────────────────── */
      'body.introduction': `<h2>Qué hace Piilo</h2>
      <p>Cuando depositas XLM en el contrato Piilo, el monto se registra públicamente <strong>una vez</strong> — esto es inevitable; el XLM tiene que moverse de tu cuenta. A partir de ese momento, todas las operaciones posteriores son privadas:</p>
      <ul>
        <li><strong>Los saldos</strong> se almacenan como <a href="concepts/architecture.html#pedersen-commitments">compromisos Pedersen</a> — puntos de curva elíptica en la curva JubJub. La red ve un punto, no un número.</li>
        <li><strong>Las transferencias</strong> producen una <a href="concepts/architecture.html#groth16-zk-proofs">prueba ZK Groth16</a> generada completamente en el navegador del usuario. El destinatario recibe una nota cifrada — solo su clave puede abrirla.</li>
        <li><strong>Los retiros</strong> requieren que el usuario genere una prueba de conocimiento del saldo. El contrato verifica la prueba y libera XLM. Ninguna parte de confianza ve el saldo en texto plano.</li>
      </ul>
      <h2>Lo que Piilo NO hace</h2>
      <ul>
        <li><strong>Piilo no es un mezclador.</strong> No hay un grupo de anonimato, ni desvinculación entre depositante y retirador. El contrato sabe qué dirección tiene qué compromiso; no sabe el valor.</li>
        <li><strong>Piilo no oculta a quién envías.</strong> La dirección destinataria de una transferencia está on-chain. Piilo oculta el monto, no la contraparte.</li>
        <li><strong>Piilo no provee secreto hacia adelante.</strong> Si tu estado local (factor de cegamiento <code>r</code>) se ve comprometido, un atacante puede calcular tu saldo a partir del compromiso on-chain.</li>
      </ul>
      <p>Consulta <a href="concepts/privacy-model.html">Modelo de privacidad</a> para el modelo de amenazas completo.</p>
      <h2>El SDK</h2>
      <p>El paquete <code>@neylanxyz/piilo</code> expone una única clase, <code>Piilo</code>, con cinco métodos públicos:</p>
      <table>
        <thead><tr><th>Método</th><th>Qué hace</th></tr></thead>
        <tbody>
          <tr><td><code><a href="api/deposit.html">deposit(amount)</a></code></td><td>Deposita XLM, crea un compromiso Pedersen</td></tr>
          <tr><td><code><a href="api/transfer.html">transfer({ to, amount })</a></code></td><td>Envía de forma privada con prueba ZK + nota cifrada</td></tr>
          <tr><td><code><a href="api/settle.html">settleIfPending()</a></code></td><td>Fusiona transferencias entrantes en tu saldo</td></tr>
          <tr><td><code><a href="api/withdraw.html">withdraw()</a></code></td><td>Prueba conocimiento del saldo, recibe XLM</td></tr>
          <tr><td><code><a href="api/backup.html">exportBackup() / importBackup(json)</a></code></td><td>Respalda y restaura el estado local</td></tr>
        </tbody>
      </table>
      <h2>Enlaces rápidos</h2>
      <ul>
        <li><a href="quickstart.html">Inicio rápido</a> — instala, configura, primera transferencia en 5 minutos</li>
        <li><a href="concepts/architecture.html">Arquitectura</a> — cómo funciona el sistema de pruebas ZK y compromisos</li>
        <li><a href="api/piilo-class.html">Referencia API</a> — firmas completas de métodos y opciones</li>
        <li><a href="guides/freighter.html">Integración Freighter</a> — conectar con la cartera Freighter</li>
        <li><a href="guides/security.html">Guía de seguridad</a> — cómo proteger el factor de cegamiento</li>
      </ul>`,
      'body.quickstart': `<h2>Requisitos previos</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Una cuenta testnet de Stellar con XLM (usa <a href="https://lab.stellar.org" target="_blank" rel="noopener">Stellar Laboratory</a> para fondearla)</li>
        <li>Extensión <a href="https://freighter.app" target="_blank" rel="noopener">Freighter</a> para el navegador (o un <code>WalletAdapter</code> personalizado)</li>
      </ul>
      <h2>1. Instalar</h2>
      <pre><code class="language-bash">npm install @neylanxyz/piilo</code></pre>
      <p>El paquete incluye tipos TypeScript. No se requiere instalar <code>@types/</code> por separado.</p>
      <h2>2. Servir los archivos de circuito</h2>
      <p>Piilo genera pruebas ZK en el navegador usando archivos de circuito WASM. Deben servirse desde tu servidor web en <code>/circuits/</code>:</p>
      <pre><code class="language-plaintext">public/
  circuits/
    transfer_1.zkey
    transfer_js/
      transfer.wasm
    withdraw_1.zkey
    withdraw_js/
      withdraw.wasm</code></pre>
      <pre><code class="language-bash">cp -r node_modules/@neylanxyz/piilo/circuits public/circuits</code></pre>
      <h2>3. Configurar e instanciar</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'

const wallet = {
  async publicKey() {
    return window.freighter.getPublicKey()
  },
  async signTransaction(xdr, opts) {
    return window.freighter.signTransaction(xdr, opts)
  },
  async signMessage(message) {
    const result = await window.freighter.signMessage(message)
    return { signature: result.signature }
  },
}

const piilo = new Piilo({
  network:    'testnet',
  contractId: 'C…',
  wallet,
})</code></pre>
      <h2>4. Depositar</h2>
      <p>La primera operación siempre es un depósito. El monto está en <strong>stroops</strong> (1 XLM = 10.000.000 stroops):</p>
      <pre><code class="language-typescript">// Depositar 5 XLM
await piilo.deposit(50_000_000n)

console.log('Saldo:', await piilo.getBalance())
// → 50000000n</code></pre>
      <p>La transacción de depósito es pública. Después de confirmarse, tu saldo se rastrea localmente como un compromiso Pedersen — ninguna operación posterior revela el monto.</p>
      <h2>5. Transferir de forma privada</h2>
      <pre><code class="language-typescript">// Enviar 2 XLM a otra dirección
await piilo.transfer({
  to:     'GABC…recipient',
  amount: 20_000_000n,
})</code></pre>
      <p>Esto hará:</p>
      <ol>
        <li>Generar una prueba Groth16 en tu navegador (~2–5 segundos)</li>
        <li>Cifrar una nota de pago para el destinatario</li>
        <li>Enviar la transacción de transferencia</li>
      </ol>
      <h2>6. Liquidar transferencias entrantes</h2>
      <p>Los destinatarios deben llamar a <code>settleIfPending</code> para incorporar las notas recibidas a su saldo:</p>
      <pre><code class="language-typescript">const result = await piilo.settleIfPending()

if (result) {
  console.log('Recibido:', result.received, 'stroops')
}</code></pre>
      <h2>7. Retirar</h2>
      <pre><code class="language-typescript">await piilo.withdraw()</code></pre>
      <p>Genera una prueba Groth16 de conocimiento del saldo, la envía on-chain y el contrato libera el XLM. El estado local se reinicia a cero.</p>
      <h2>8. Respaldar el estado</h2>
      <p>Tu saldo y factor de cegamiento viven solo en <code>localStorage</code>. Respalda después de cada operación importante:</p>
      <pre><code class="language-typescript">const backup = await piilo.exportBackup()
// Guarda esta cadena de forma segura — trátala como una clave privada.
localStorage.setItem('piilo-backup', backup)

// Para restaurar en otro dispositivo:
const json = localStorage.getItem('piilo-backup')
await piilo.importBackup(json)</code></pre>
      <h2>Ejemplo completo</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'

const piilo = new Piilo({ network: 'testnet', contractId: 'C…', wallet })

// Depositar 10 XLM
await piilo.deposit(100_000_000n)

// Enviar 3 XLM a un amigo
await piilo.transfer({ to: 'GABC…', amount: 30_000_000n })

// Verificar saldo restante (local, sin llamada de red)
const balance = await piilo.getBalance()
console.log(balance) // 70000000n

// Retirar todo
await piilo.withdraw()</code></pre>
      <h2>Próximos pasos</h2>
      <ul>
      </ul>`,
      'body.architecture': `<h2>Visión general del sistema</h2>
      <pre><code class="language-plaintext">User browser                    Stellar / Soroban
────────────────────            ──────────────────────────────
Local state                     Contract storage
  balance: bigint         ↔       balance_commitment: Point
  r: bigint (blinding)            pending_commitment: Point
  pendingNotes: Note[]            note_pubkey: Bytes&lt;32&gt;
                                  pending_notes: Vec&lt;EncNote&gt;

SDK operations
  deposit()      →   Stellar tx: deposit(amount, r, note_pubkey)
  transfer()     →   Stellar tx: transfer(to, C_A, C_new, proof, enc_note)
  settleIfPending() → Stellar tx: settle_pending(user)
  withdraw()     →   Stellar tx: withdraw(amount, proof)</code></pre>

      <h2>Compromisos Pedersen</h2>
      <p>Un compromiso Pedersen a un valor <code>v</code> with blinding factor <code>r</code> is:</p>
      <pre><code class="language-plaintext">C = v·G + r·H</code></pre>
      <p>donde <code>G</code> y <code>H</code> son generadores independientes en la curva twisted Edwards JubJub, y <code>·</code> denota la multiplicación escalar.</p>
      <p><strong>Propiedades:</strong></p>
      <ul>
        <li><strong>Ocultamiento:</strong> <code>C</code> reveals nothing about <code>v</code> without <code>r</code></li>
        <li><strong>Vinculación:</strong> you cannot open the same <code>C</code> to two different <code>(v, r)</code> pairs</li>
        <li><strong>Homomórficamente aditivo:</strong> <code>C(v₁, r₁) + C(v₂, r₂) = C(v₁+v₂, r₁+r₂)</code></li>
      </ul>
      <p>La propiedad homomórfica explica por qué las transferencias pueden acumularse sin descifrado — el contrato suma puntos de compromiso, y el estado local del usuario acumula los factores de cegamiento correspondientes.</p>

      <h3>Curva JubJub</h3>
      <p>Piilo usa una parametrización JubJub personalizada defined in <code>circuits/jubjub.circom</code>:</p>
      <pre><code class="language-plaintext">// Generator G (for value)
G = (
  52011214036797608008763021134739816867182510661071949920602030138765591619595,
  36017543053724001483519641180346241195937746995850157919072206337752529044138
)

// Generator H (for blinding)
H = (
  2641322346204092426446313763048872749581807614122456322352786044536967383341,
  12433362859382302755418372944023213970869823563090304431189761096447391844644
)</code></pre>

      <h2>Pruebas ZK Groth16</h2>
      <p>Piilo usa dos circuitos Circom compilados a SNARKs Groth16:</p>

      <h3>Circuito de transferencia</h3>
      <p><strong>Entradas públicas:</strong> <code>C_B</code>, <code>C_A</code>, <code>C_new</code> (three JubJub points = 6 field elements)</p>
      <p><strong>Entradas privadas:</strong> <code>B</code> (sender's balance), <code>r_B</code> (balance blinding), <code>A</code> (transfer amount), <code>r_A</code> (amount blinding), <code>r_new</code> (new balance blinding)</p>
      <p><strong>Restricciones probadas:</strong></p>
      <ol>
        <li><code>C_B = B·G + r_B·H</code> — the sender knows the opening of their balance commitment</li>
        <li><code>C_A = A·G + r_A·H</code> — the amount commitment is correctly formed</li>
        <li><code>C_new = (B-A)·G + r_new·H</code> — the new balance commitment is correctly formed</li>
        <li><code>B ≥ A</code> — sender has sufficient funds (no underflow)</li>
      </ol>

      <h3>Circuito de retiro</h3>
      <p><strong>Entradas públicas:</strong> <code>C_B</code>, <code>B</code> (the withdrawal amount, which equals the full balance)</p>
      <p><strong>Entradas privadas:</strong> <code>r_B</code> (balance blinding)</p>
      <p><strong>Restricciones probadas:</strong></p>
      <ol>
        <li><code>C_B = B·G + r_B·H</code> — the user knows the opening of their commitment</li>
      </ol>

      <h3>Generación de pruebas</h3>
      <p>Las pruebas se generan del lado del cliente usando <code>snarkjs.groth16.fullProve()</code> con el generador de testigos WASM compilado y el archivo <code>.zkey</code> de la configuración de confianza. La generación tarda aproximadamente <strong>2–5 segundos</strong> en una laptop moderna.</p>

      <h3>Verificación on-chain</h3>
      <p>El contrato Soroban en <code>contracts/verifier/</code> implementa la verificación de pruebas basada en emparejamiento BLS12-381 en Rust. Verifica las pruebas Groth16 contra la clave de verificación (<code>*_vk.json</code>) que se confirmó en el momento del despliegue.</p>

      <h2>Cifrado de notas</h2>
      <p>Cuando Alice envía a Bob, Bob necesita conocer el monto <code>A</code> y el factor de cegamiento <code>r_A</code> para actualizar su saldo local. Esto se transmite mediante una <strong>nota de pago</strong> cifrada.</p>

      <h3>Derivación de clave</h3>
      <pre><code class="language-typescript">// Sign a domain-separation string with the wallet's Ed25519 key
const { signature } = await wallet.signMessage("piilo-note-v1")
// Hash to 32 bytes
const seed = await crypto.subtle.digest("SHA-256", signature)
// Derive NaCl box keypair
const keypair = nacl.box.keyPair.fromSecretKey(seed)</code></pre>

      <h3>Cifrado</h3>
      <pre><code class="language-typescript">const note = nacl.box(
  JSON.stringify({ amount, r_A }),
  nonce,
  recipientPublicKey,
  senderKeypair.secretKey
)</code></pre>
      <p>Usa NaCl box: intercambio de claves X25519 + cifrado de flujo XSalsa20 + MAC Poly1305.</p>

      <h3>Almacenamiento on-chain</h3>
      <p>La nota cifrada se serializa como:</p>
      <pre><code class="language-plaintext">[1 byte version][24 bytes nonce][32 bytes sender_pubkey][N bytes ciphertext]</code></pre>
      <p>Almacenada en la cola <code>pending_notes</code> del contrato para el destinatario, eliminada cuando el destinatario llama a <code>settle_pending</code>.</p>

      <h2>Modelo de estado</h2>
      <h3>On-chain (público)</h3>
      <table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descripción</th></tr></thead>
        <tbody>
          <tr><td><code>balance_commitment</code></td><td><code>Point</code></td><td>Punto JubJub: <code>C(saldo, r)</code></td></tr>
          <tr><td><code>pending_commitment</code></td><td><code>Point</code></td><td>Compromisos de transferencias entrantes acumulados</td></tr>
          <tr><td><code>has_pending</code></td><td><code>bool</code></td><td>Si existen transferencias pendientes</td></tr>
          <tr><td><code>nonce</code></td><td><code>u64</code></td><td>Protección de repetición para pruebas de retiro</td></tr>
          <tr><td><code>note_pubkey</code></td><td><code>Bytes&lt;32&gt;</code></td><td>Clave pública NaCl del destinatario</td></tr>
          <tr><td><code>pending_notes</code></td><td><code>Vec&lt;EncNote&gt;</code></td><td>Notas de pago cifradas de los remitentes</td></tr>
        </tbody>
      </table>

      <h3>Off-chain (local)</h3>
      <table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descripción</th></tr></thead>
        <tbody>
          <tr><td><code>balance</code></td><td><code>bigint</code></td><td>Saldo en texto plano en stroops</td></tr>
          <tr><td><code>r</code></td><td><code>bigint</code></td><td>Factor de cegamiento actual</td></tr>
          <tr><td><code>pendingNotes</code></td><td><code>Note[]</code></td><td>Notas recibidas descifradas pero no liquidadas</td></tr>
        </tbody>
      </table>

      <h2>Flujo de depósito</h2>
      <pre><code class="language-plaintext">1. User calls piilo.deposit(amount)
2. SDK generates random r ← Fr
3. SDK calls PiiloStellar.deposit(wallet, amount, r, notePubkey)
4. Contract: commitment = amount·G + r·H
             if account exists: balance_commitment += commitment
             else: create account with balance_commitment = commitment
5. SDK: saveState(applyDeposit(state, amount, r))
        new_balance = old_balance + amount
        new_r       = (old_r + r) mod JubJub_H_order</code></pre>

      <h2>Flujo de transferencia</h2>
      <pre><code class="language-plaintext">1. User calls piilo.transfer({ to, amount })
2. SDK fetches current on-chain C_B for sender
3. SDK generates r_A, r_new ← Fr
4. SDK computes C_A = amount·G + r_A·H
               C_new = (balance-amount)·G + r_new·H
5. SDK calls snarkjs.groth16.fullProve(...)  → proof π
6. SDK fetches recipient's note_pubkey from contract
7. SDK encrypts note: NaCl.box({ amount, r_A }, recipientPubkey, senderKeypair)
8. SDK submits: contract.transfer(sender, recipient, C_A, C_new, π, encrypted_note)
9. Contract verifies π
   Updates sender's balance_commitment = C_new
   Adds C_A to recipient's pending_commitment
   Stores encrypted_note in recipient's pending_notes
10. SDK: saveState(applySend(state, amount, r_new))</code></pre>

      <h2>Flujo de liquidación</h2>
      <pre><code class="language-plaintext">1. User calls piilo.settleIfPending()
2. SDK checks contract: has_pending?
3. If yes, SDK calls contract.get_pending_notes(address)
4. SDK decrypts each note: { amount, r_A } = NaCl.open(enc_note, ...)
5. SDK calls contract.settle_pending(address)
   Contract: balance_commitment += pending_commitment
             pending_commitment = identity
             has_pending = false
             pending_notes = []
6. SDK: update local state
   new_balance += sum(note.amount)
   new_r = (old_r + sum(note.r_A)) mod JubJub_H_order</code></pre>`,
      'body.privacy-model': `<h2>Qué está oculto</h2>
      <table>
        <thead><tr><th>Información</th><th>Oculta para quién</th></tr></thead>
        <tbody>
          <tr><td>Tu saldo actual</td><td>Todos excepto tú</td></tr>
          <tr><td>Montos de transferencia</td><td>Todos excepto emisor y destinatario</td></tr>
          <tr><td>Tu factor de cegamiento <code>r</code></td><td>Todos excepto tú</td></tr>
        </tbody>
      </table>
      <h2>Qué es visible</h2>
      <table>
        <thead><tr><th>Información</th><th>Visible para</th></tr></thead>
        <tbody>
          <tr><td>Que depositaste XLM</td><td>Público (red Stellar)</td></tr>
          <tr><td>El monto del depósito</td><td>Público (solo el depósito inicial)</td></tr>
          <tr><td>A quién envías</td><td>Público (dirección del destinatario)</td></tr>
          <tr><td>Que ocurrió una transferencia</td><td>Público (tx de transferencia, pero no el monto)</td></tr>
          <tr><td>Que retiraste XLM</td><td>Público</td></tr>
          <tr><td>El monto del retiro</td><td>Público</td></tr>
        </tbody>
      </table>
      <blockquote><p><strong>Los montos de depósito y retiro son públicos.</strong> Si depositas 5 XLM y luego retiras 3 XLM, un observador sabe que enviaste al menos 2 XLM en transferencias privadas — pero no a quién, ni en cuántos pagos separados.</p></blockquote>
      <h2>Modelo de amenazas</h2>
      <h3>Observador de cadena honesto-pero-curioso</h3>
      <p>Un observador que monitorea el ledger de Stellar ve tu dirección, la dirección del contrato inteligente, eventos de "transferencia" sin montos y el punto de compromiso on-chain (un punto de curva elíptica opaco).</p>
      <p><strong>No puede</strong> determinar tu saldo, el monto de ninguna transferencia privada, ni los montos enviados a destinatarios específicos.</p>
      <h3>Colusión del destinatario</h3>
      <p>Si un destinatario colude con un observador, puede revelar el monto recibido. No puede revelar tu saldo ni otras transferencias.</p>
      <h3>Operador del contrato</h3>
      <p>El contrato Soroban de Piilo no tiene clave de administrador, no tiene capacidad de actualización tras el despliegue y no tiene puerta trasera. El operador del contrato no tiene acceso especial a los datos de los usuarios.</p>
      <h3>Pérdida del estado local</h3>
      <p>Si <code>localStorage</code> se borra (o cambias de dispositivo sin copia de seguridad), pierdes tu <code>saldo</code> local y el factor de cegamiento <code>r</code>. El XLM sigue en el contrato — no puedes retirarlo sin <code>r</code>.</p>
      <p>Opciones de recuperación:</p>
      <ol>
        <li><strong>Archivo de respaldo</strong> (recomendado): ver <a href="../api/backup.html">exportBackup</a></li>
        <li><strong>Ventana de eventos RPC</strong>: dentro de ~7 días de tu último depósito, el nodo RPC conserva eventos con tus notas cifradas.</li>
      </ol>
      <h3>Navegador / dispositivo comprometido</h3>
      <p>Si un atacante tiene acceso a tu <code>localStorage</code>, puede leer tu saldo y factor de cegamiento. Piilo no protege contra un entorno de ejecución comprometido.</p>
      <h3>Solidez de las pruebas ZK</h3>
      <p>La seguridad del ocultamiento de montos en Piilo depende de la solidez del sistema de pruebas Groth16 y la dureza del logaritmo discreto en JubJub. La configuración de confianza para los circuitos Groth16 requiere que al menos un participante haya destruido sus residuos tóxicos.</p>
      <h2>Resumen</h2>
      <blockquote>
        <p><strong>Transferencias confidenciales en la Stellar</strong> — los montos de las transferencias individuales y los saldos actuales están ocultos, pero el grafo de quién envía a quién no lo está.</p>
      </blockquote>
      <p>Si necesitas anonimato de emisor/destinatario además de privacidad de montos, Piilo por sí solo no es suficiente.</p>`,
      'body.local-state': `<h2>Por qué es necesario el estado local</h2>
      <p>Un compromiso Pedersen <code>C = v·G + r·H</code> es una función unidireccional. Dado solo <code>C</code> (lo que está on-chain), no puedes recuperar <code>v</code> (tu saldo) ni <code>r</code> (el factor de cegamiento) sin conocer al menos uno de ellos.</p>
      <p>El contrato tiene <code>C</code> — el compromiso. Tú tienes <code>v</code> y <code>r</code> — la apertura. Ambos son necesarios para generar pruebas de transferencia, pruebas de retiro y para conocer tu saldo.</p>
      <h2>Qué se almacena localmente</h2>
      <pre><code class="language-typescript">interface LocalState {
  balance:      bigint    // saldo en texto plano en stroops
  r:            bigint    // factor de cegamiento actual (elemento de campo)
  pendingNotes: Note[]    // notas de transferencia recibidas pero no liquidadas
}</code></pre>
      <p>Almacenado en <code>localStorage</code> bajo la clave <code>piilo:state:&lt;stellar-address&gt;</code>.</p>
      <h2>Cuándo se actualiza el estado local</h2>
      <table>
        <thead><tr><th>Operación</th><th>Cambio de estado</th></tr></thead>
        <tbody>
          <tr><td><code>deposit(amount)</code></td><td><code>balance += amount</code>, <code>r = (r + r_dep) mod JubJub_H_order</code></td></tr>
          <tr><td><code>transfer({ to, amount })</code></td><td><code>balance -= amount</code>, <code>r = r_new</code> (aleatorio nuevo)</td></tr>
          <tr><td><code>importBackup(json)</code></td><td>Sobreescrito con los valores del respaldo (verificados contra la cadena primero)</td></tr>
        </tbody>
      </table>
      <h2>Aritmética del factor de cegamiento</h2>
      <p>Los factores de cegamiento se acumulan mod <code>JUBJUB_H_ORDER</code>:</p>
      <pre><code class="language-plaintext">JUBJUB_H_ORDER = 26217937587563095239723870254092982918823685063489269125461436649568733016796n</code></pre>
      <p>Esto es ~4× más pequeño que el orden del campo BLS12-381. Reducir mod este valor garantiza que el factor de cegamiento acumulado siempre cabe en 255 bits, lo cual es necesario por la descomposición <code>Num2Bits(255)</code> del circuito.</p>
      <h2>Respaldo y recuperación</h2>
      <p>El estado local no se respalda automáticamente. Debes llamar a <code>exportBackup()</code> y almacenar el resultado de forma segura.</p>
      <pre><code class="language-typescript">const json = await piilo.exportBackup()
// {"version":1,"address":"G...","balance":"50000000","r":"1234..."}</code></pre>
      <blockquote><p><strong>Trátalo como una frase semilla.</strong> Cualquiera que obtenga tu respaldo puede conocer tu saldo exacto y abrir tu compromiso. El SDK no cifra el respaldo.</p></blockquote>
      <p><code>importBackup(json)</code> verifica que el respaldo coincide con el compromiso on-chain actual antes de escribir. Si tu saldo cambió desde el respaldo, la importación fallará con un error de discrepancia.</p>
      <h2>Recuperación desde la ventana de eventos</h2>
      <p>Si pierdes tu respaldo, tienes una ventana de ~7 días para recuperar tu estado desde los eventos RPC:</p>
      <ol>
        <li>Todas las notas de transferencias entrantes se almacenan on-chain como blobs cifrados</li>
        <li>Tu par de claves de notas se deriva de forma determinista desde la clave de firma de tu cartera</li>
        <li>Un escaneo de recuperación vuelve a obtener todos los eventos de transferencia dirigidos a tu dirección, descifra las notas y reconstruye tu saldo pendiente</li>
      </ol>
      <p>Esto solo recupera transferencias recibidas dentro de la ventana de retención de eventos RPC (~7 días / 100.000 ledgers). Los saldos más antiguos sin respaldo son <strong>irrecuperables</strong>.</p>
      <h2>Uso en múltiples dispositivos</h2>
      <p>El estado local es por navegador. Para usar Piilo en múltiples dispositivos:</p>
      <ol>
        <li>Exporta un respaldo después de cada operación en el dispositivo A</li>
        <li>Impórtalo en el dispositivo B antes de operar</li>
      </ol>
      <p>No operes desde dos dispositivos simultáneamente — cada dispositivo rastrea su propio factor de cegamiento, y las operaciones concurrentes los harán divergir del estado on-chain.</p>`,
      'body.piilo-class': `<h2>Importar</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'
import type { PiiloConfig, WalletAdapter, Network } from '@neylanxyz/piilo'</code></pre>

      <h2>Constructor</h2>
      <div class="method-sig">new Piilo(config: PiiloConfig)</div>

      <h3>PiiloConfig</h3>
      <pre><code class="language-typescript">interface PiiloConfig {
  /** "testnet" or "mainnet" */
  network: Network

  /** Deployed Piilo contract address (starts with "C") */
  contractId: string

  /** Wallet adapter that provides signing capabilities */
  wallet: WalletAdapter & WalletSigner

  /**
   * Optional relay URL for fee sponsorship.
   * The relay cannot access funds — it only covers fees.
   */
  relayUrl?: string
}</code></pre>

      <h3>WalletAdapter</h3>
      <pre><code class="language-typescript">interface WalletAdapter {
  publicKey(): Promise&lt;string&gt;
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string }
  ): Promise&lt;string&gt;
}</code></pre>

      <h3>WalletSigner</h3>
      <pre><code class="language-typescript">interface WalletSigner {
  signMessage(message: string): Promise&lt;{ signature: Uint8Array }&gt;
}</code></pre>

      <h2>Métodos</h2>

      <h3>getBalance()</h3>
      <div class="method-sig">async getBalance(): Promise&lt;bigint&gt;</div>
      <p>Devuelve el saldo local en texto plano actual en stroops. <strong>No</strong> realiza una llamada de red — lee desde <code>localStorage</code>.</p>
      <pre><code class="language-typescript">const balance = await piilo.getBalance()
console.log(\`\${balance / 10_000_000n} XLM\`)</code></pre>

      <hr>

      <h3data-i18n="nav.deposit">deposit()</h3>
      <div class="method-sig">async deposit(amount: bigint): Promise&lt;void&gt;</div>
      <p>Deposita <code>amount</code> stroops en la cuenta confidencial. El monto del depósito es visible públicamente on-chain.</p>
      <p><a href="deposit.html">→ Documentación completa de deposit()</a></p>

      <hr>

      <h3data-i18n="nav.transfer">transfer()</h3>
      <div class="method-sig">async transfer(params: &#123; to: string; amount: bigint &#125;): Promise&lt;void&gt;</div>
      <p>Envía <code>amount</code> de forma privada a <code>to</code>. Genera una prueba Groth16 (~2–5 segundos) y cifra la nota de pago para el destinatario.</p>
      <p><a href="transfer.html">→ Documentación completa de transfer()</a></p>

      <hr>

      <h3data-i18n="nav.settle">settleIfPending()</h3>
      <div class="method-sig">async settleIfPending(): Promise&lt;&#123; received: bigint &#125; | null&gt;</div>
      <p>Checks for pending incoming transfers. If found, decrypts the payment notes, settles on-chain, and updates local state.</p>
      <p><a href="settle.html">→ Full settleIfPending() docs</a></p>

      <hr>

      <h3data-i18n="nav.withdraw">withdraw()</h3>
      <div class="method-sig">async withdraw(): Promise&lt;void&gt;</div>
      <p>Withdraws the full balance. Generates a Groth16 proof of balance knowledge and resets local state to zero.</p>
      <p><a href="withdraw.html">→ Full withdraw() docs</a></p>

      <hr>

      <h3>exportBackup()</h3>
      <div class="method-sig">async exportBackup(): Promise&lt;string&gt;</div>
      <p>Returns a JSON string containing the current local state. Treat the output like a private key.</p>

      <hr>

      <h3>importBackup()</h3>
      <div class="method-sig">async importBackup(json: string): Promise&lt;&#123; balance: bigint &#125;&gt;</div>
      <p>Restores local state from a backup JSON string. Verifies the backup matches the current on-chain commitment before writing.</p>
      <p><a href="backup.html">→ Full backup docs</a></p>`,
      'body.deposit': `<div class="method-sig">async deposit(amount: bigint): Promise&lt;void&gt;</div>

      <p>Deposita <code>amount</code> stroops en el contrato Piilo. Este es el punto de entrada al sistema confidencial.</p>

      <h2>Qué ocurre</h2>
      <ol>
        <li>Se genera un factor de cegamiento aleatorio <code>r</code>: <code>r ← Fr</code></li>
        <li>El compromiso <code>C = amount·G + r·H</code> se calcula localmente</li>
        <li>Se envía una transacción Stellar llamando a <code>deposit(user, amount, r, note_pubkey)</code> on the contract</li>
        <li>El contrato actualiza (o crea) el <code>balance_commitment</code> del usuario:
          <ul>
            <li><strong>Primer depósito:</strong> <code>balance_commitment = C</code></li>
            <li><strong>Depósitos posteriores:</strong> <code>balance_commitment = old_commitment + C</code> (adición homomórfica)</li>
          </ul>
        </li>
        <li>El estado local se actualiza: <code>balance += amount</code>, <code>r = (old_r + r_dep) mod JubJub_H_order</code></li>
      </ol>

      <h2>Parámetros</h2>
      <table>
        <thead><tr><th>Parámetro</th><th>Tipo</th><th>Descripción</th></tr></thead>
        <tbody>
          <tr><td><code>amount</code></td><td><code>bigint</code></td><td>Monto a depositar, en stroops. Debe ser positivo.</td></tr>
        </tbody>
      </table>

      <h2>Errores</h2>
      <table>
        <thead><tr><th>Error</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"amount must be positive"</code></td><td><code>amount &lt;= 0n</code></td></tr>
          <tr><td>Stellar RPC error</td><td>Saldo XLM insuficiente, falla de simulación, rechazo de transacción</td></tr>
        </tbody>
      </table>

      <h2>Visibilidad</h2>
      <p>El monto del depósito es <strong>públicamente visible</strong> en el ledger de Stellar. Este es el único momento en el ciclo de vida de Piilo donde un monto es observable on-chain. Todas las transferencias posteriores y el saldo final están ocultos.</p>

      <h2>Ejemplo</h2>
      <pre><code class="language-typescript">// Deposit 10 XLM (in stroops)
await piilo.deposit(100_000_000n)

// Multiple deposits accumulate homomorphically
await piilo.deposit(50_000_000n)

const balance = await piilo.getBalance()
// → 150_000_000n (15 XLM)</code></pre>

      <h2>Acumulación del factor de cegamiento</h2>
      <p>Cada depósito genera un nuevo <code>r_dep</code> aleatorio. El factor de cegamiento almacenado se acumula:</p>
      <pre><code class="language-plaintext">new_r = (old_r + r_dep) mod JUBJUB_H_ORDER</code></pre>
      <p>Esto preserva la propiedad homomórfica: el compromiso on-chain siempre es <code>balance·G + r·H</code>, donde <code>r</code> es la suma acumulada de todos los factores de cegamiento de depósitos.</p>

      <h2>Note public key</h2>
      <p>On the first deposit, the SDK registers the user's NaCl note public key on-chain. This key allows others to send encrypted payment notes to this address. The note keypair is derived deterministically from <code>wallet.signMessage("piilo-note-v1")</code>.</p>`,
      'body.transfer': `<div class="method-sig">async transfer(params: &#123; to: string; amount: bigint &#125;): Promise&lt;void&gt;</div>

      <p>Envía <code>amount</code> stroops de forma privada a <code>to</code>. El monto is never revealed on-chain — only a ZK proof attesting to its validity.</p>

      <h2>Qué ocurre</h2>
      <ol>
        <li>The current on-chain commitment <code>C_B</code> is fetched for the sender</li>
        <li>Fresh blinding factors <code>r_A</code> and <code>r_new</code> are generated</li>
        <li>Commitment points are computed: <code>C_A = amount·G + r_A·H</code> and <code>C_new = (balance - amount)·G + r_new·H</code></li>
        <li>A Groth16 proof <code>π</code> is generated in the browser (proves the commitments are valid and <code>balance ≥ amount</code>)</li>
        <li>The recipient's note public key is fetched from the contract</li>
        <li>A payment note <code>&#123; amount, r_A &#125;</code> is encrypted for the recipient via NaCl box</li>
        <li>The transaction is submitted on-chain; the contract verifies <code>π</code>, updates the sender's commitment, and stores the encrypted note for the recipient</li>
        <li>Local state: <code>balance -= amount</code>, <code>r = r_new</code></li>
      </ol>

      <h2>Parámetros</h2>
      <table>
        <thead><tr><th>Parámetro</th><th>Tipo</th><th>Descripción</th></tr></thead>
        <tbody>
          <tr><td><code>to</code></td><td><code>string</code></td><td>Recipient Stellar address (G-address)</td></tr>
          <tr><td><code>amount</code></td><td><code>bigint</code></td><td>Amount in stroops. Must be positive and ≤ balance.</td></tr>
        </tbody>
      </table>

      <h2>Errores</h2>
      <table>
        <thead><tr><th>Error</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"amount must be positive"</code></td><td><code>amount &lt;= 0n</code></td></tr>
          <tr><td><code>"insufficient balance"</code></td><td><code>amount &gt; local balance</code></td></tr>
          <tr><td><code>"no on-chain account — deposit first"</code></td><td>Sender has no on-chain commitment</td></tr>
          <tr><td><code>"Recipient ... has not deposited yet"</code></td><td>Recipient's note pubkey is not on-chain</td></tr>
          <tr><td>snarkjs error</td><td>Proof generation failed</td></tr>
          <tr><td>Stellar RPC error</td><td>Transaction rejected</td></tr>
        </tbody>
      </table>

      <h2>Duration</h2>
      <p>Proof generation takes approximately <strong>2–5 seconds</strong> on a modern laptop and up to 10–15 seconds on a low-end mobile device. The Groth16 proof is computed using WebAssembly in the browser — no server is involved.</p>

      <h2>Ejemplo</h2>
      <pre><code class="language-typescript">// Send 2 XLM to a recipient
await piilo.transfer({
  to:     'GABC123...',
  amount: 20_000_000n,
})

// The recipient must call settleIfPending() to access the funds</code></pre>

      <h2>What the recipient must do</h2>
      <p>The recipient does not automatically receive funds in their local balance. They must call <a href="settle.html"><codedata-i18n="nav.settle">settleIfPending()</code></a> to decrypt the payment note and merge the commitment into their balance.</p>

      <h2>Privacy properties</h2>
      <ul>
        <li><strong>Amount:</strong> hidden. Only the sender and recipient know the amount.</li>
        <li><strong>Recipient address:</strong> visible on-chain.</li>
        <li><strong>Sender address:</strong> visible on-chain.</li>
        <li><strong>Proof:</strong> visible on-chain, but reveals nothing about <code>amount</code>, <code>balance</code>, or blinding factors.</li>
      </ul>`,
      'body.settle': `<div class="method-sig">async settleIfPending(): Promise&lt;&#123; received: bigint &#125; | null&gt;</div>

      <p>Merges incoming transfers into the local balance. Must be called before received funds can be spent or withdrawn.</p>

      <h2>Qué ocurre</h2>
      <ol>
        <li>Checks the on-chain account: is <code>has_pending = true</code>?</li>
        <li>If no pending transfers, returns <code>null</code> immediately (no transaction submitted)</li>
        <li>Fetches all encrypted notes from <code>contract.get_pending_notes(address)</code></li>
        <li>Decrypts each note using the user's note keypair</li>
        <li>Calls <code>contract.settle_pending(address)</code> on-chain:
          <ul>
            <li>Adds <code>pending_commitment</code> to <code>balance_commitment</code></li>
            <li>Clears <code>pending_commitment</code> and <code>pending_notes</code></li>
            <li>Sets <code>has_pending = false</code></li>
          </ul>
        </li>
        <li>Updates local state: <code>balance += sum(note.amount)</code>, <code>r = (r + sum(note.r_A)) mod JubJub_H_order</code></li>
      </ol>

      <h2>Retorna</h2>
      <ul>
        <li><code>&#123; received: bigint &#125;</code> — total stroops received, if there were pending transfers</li>
        <li><code>null</code> — if no transfers were pending</li>
      </ul>

      <h2>Throws</h2>
      <table>
        <thead><tr><th>Error</th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td>Stellar RPC error</td><td>Transaction failed</td></tr>
          <tr><td>Note decryption error</td><td>Malformed or tampered encrypted note (logged, note skipped)</td></tr>
        </tbody>
      </table>

      <h2>Ejemplo</h2>
      <pre><code class="language-typescript">const result = await piilo.settleIfPending()

if (result === null) {
  console.log('No incoming transfers')
} else {
  console.log(\`Received \${result.received / 10_000_000n} XLM\`)
  console.log('New balance:', await piilo.getBalance())
}</code></pre>

      <h2>Polling pattern</h2>
      <pre><code class="language-typescript">async function checkForIncoming() {
  const result = await piilo.settleIfPending()
  if (result) {
    showNotification(\`Received \${result.received / 10_000_000n} XLM\`)
    refreshBalanceDisplay()
  }
}

checkForIncoming()
setInterval(checkForIncoming, 30_000)</code></pre>

      <h2>Note on atomicity</h2>
      <p><code>settle_pending</code> is a single Stellar transaction. Either all pending notes are settled together, or none are. There is no partial settlement.</p>`,
      'body.withdraw': `<div class="method-sig">async withdraw(): Promise&lt;void&gt;</div>

      <p>Withdraws the full balance. Generates a ZK proof of balance knowledge, submits it on-chain, and receives XLM back to the Stellar account.</p>

      <h2>Qué ocurre</h2>
      <ol>
        <li>Reads local <code>balance</code> and <code>r</code> from state</li>
        <li>Fetches the current on-chain commitment <code>C_B</code></li>
        <li>Generates a Groth16 withdrawal proof <code>π</code> proving <code>C_B = balance·G + r·H</code></li>
        <li>Submits <code>contract.withdraw(user, balance, π)</code> on-chain</li>
        <li>The contract verifies <code>π</code>, transfers <code>balance</code> stroops to the user's Stellar account, and deletes the account entry</li>
        <li>Local state is reset: <code>&#123; balance: 0n, r: 0n, pendingNotes: [] &#125;</code></li>
      </ol>

      <h2>Errores</h2>
      <table>
        <thead><tr><th>Error</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"no balance to withdraw"</code></td><td><code>balance === 0n</code></td></tr>
          <tr><td><code>"no on-chain account"</code></td><td>Account entry does not exist on-chain</td></tr>
          <tr><td>snarkjs error</td><td>Proof generation failed</td></tr>
          <tr><td>Stellar RPC error</td><td>Proof verification failed, transaction rejected</td></tr>
        </tbody>
      </table>

      <h2>Ejemplo</h2>
      <pre><code class="language-typescript">const balance = await piilo.getBalance()
console.log(\`Withdrawing \${balance / 10_000_000n} XLM\`)

await piilo.withdraw()

console.log('Done. Balance:', await piilo.getBalance())
// → 0n</code></pre>

      <h2>Partial withdrawal</h2>
      <p>The current implementation withdraws the <strong>full balance</strong> only. To send a partial amount, use <a href="transfer.html"><codedata-i18n="nav.transfer">transfer()</code></a> to send privately to yourself and then <codedata-i18n="nav.withdraw">withdraw()</code> from that second account.</p>

      <h2>Pending transfers</h2>
      <p>If you have pending incoming transfers (<code>has_pending = true</code>), call <a href="settle.html"><codedata-i18n="nav.settle">settleIfPending()</code></a> <strong>before</strong> <codedata-i18n="nav.withdraw">withdraw()</code>. Otherwise you will withdraw only your settled balance and the pending amounts remain locked — but your account entry is deleted.</p>

      <h2>Duration</h2>
      <p>Proof generation takes approximately 2–5 seconds. The withdrawal proof is slightly faster than the transfer proof because it has fewer constraints.</p>`,
      'body.backup': `<h2>exportBackup()</h2>
      <div class="method-sig">async exportBackup(): Promise&lt;string&gt;</div>
      <p>Exporta el estado local actual como una cadena JSON.</p>
      <pre><code class="language-typescript">const json = await piilo.exportBackup()
// → '{"version":1,"address":"G...","balance":"50000000","r":"4291873..."}'</code></pre>

      <h3>Backup format</h3>
      <pre><code class="language-typescript">{
  version: 1
  address: string   // Stellar address this backup belongs to
  balance: string   // balance in stroops (bigint serialized as string)
  r:       string   // blinding factor (bigint serialized as string)
}</code></pre>

      <blockquote><p><strong>Security warning:</strong> The backup contains your plaintext balance and blinding factor. Store it as securely as a private key. Anyone who obtains your backup can determine your balance. The SDK does not encrypt the backup — do so yourself if needed.</p></blockquote>

      <h3>When to export</h3>
      <p>Export after every state-changing operation:</p>
      <ul>
        <li>After <codedata-i18n="nav.deposit">deposit()</code></li>
        <li>After <codedata-i18n="nav.transfer">transfer()</code></li>
        <li>After <codedata-i18n="nav.settle">settleIfPending()</code> (if it returned non-null)</li>
      </ul>
      <p>The <code>pendingNotes</code> array is intentionally excluded from the backup — it is reconstructed from on-chain event data during recovery.</p>

      <hr>

      <h2>importBackup()</h2>
      <div class="method-sig">async importBackup(json: string): Promise&lt;&#123; balance: bigint &#125;&gt;</div>
      <p>Restores local state from a backup string. Verifies the backup matches the current on-chain commitment before writing.</p>

      <h3>Parameters</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>json</code></td><td><code>string</code></td><td>A JSON string previously produced by <code>exportBackup()</code></td></tr>
        </tbody>
      </table>

      <h3>Returns</h3>
      <p><code>&#123; balance: bigint &#125;</code> — the restored balance in stroops.</p>

      <h3>Throws</h3>
      <table>
        <thead><tr><th>Error</th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td><code>"Unknown backup version N"</code></td><td>Unsupported backup format</td></tr>
          <tr><td><code>"Backup belongs to ..., connected wallet is ..."</code></td><td>Address mismatch</td></tr>
          <tr><td><code>"No on-chain account — deposit first, then restore"</code></td><td>No commitment on-chain for verification</td></tr>
          <tr><td><code>"Backup does not match on-chain commitment"</code></td><td>Balance or <code>r</code> in the backup differ from the current on-chain commitment</td></tr>
        </tbody>
      </table>

      <h3>Example</h3>
      <pre><code class="language-typescript">// Export (do this after every operation)
const backup = await piilo.exportBackup()
await secureStorage.save('piilo-backup', backup)

// Import on a new device
const json = await secureStorage.load('piilo-backup')
const { balance } = await piilo.importBackup(json)
console.log(\`Restored balance: \${balance / 10_000_000n} XLM\`)</code></pre>

      <h3>Stale backups</h3>
      <p>If you made operations after exporting the backup, the backup will not match the current on-chain commitment and import will fail. You need the most recent backup.</p>
      <p>If you have no recent backup and no recovery path, see <a href="../concepts/local-state.html#recovery-from-event-window">Local State — Recovery from event window</a>.</p>`,
      'body.types': `<h2>PiiloConfig</h2>
      <pre><code class="language-typescript">interface PiiloConfig {
  network:     Network
  contractId:  string
  wallet:      WalletAdapter & WalletSigner
  relayUrl?:   string
}</code></pre>

      <h2>Network</h2>
      <pre><code class="language-typescript">type Network = 'testnet' | 'mainnet'</code></pre>

      <h2>WalletAdapter</h2>
      <pre><code class="language-typescript">interface WalletAdapter {
  publicKey():    Promise&lt;string&gt;
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise&lt;string&gt;
}</code></pre>

      <h2>WalletSigner</h2>
      <pre><code class="language-typescript">interface WalletSigner {
  signMessage(message: string): Promise&lt;{ signature: Uint8Array }&gt;
}</code></pre>

      <h2>NoteKeypair</h2>
      <pre><code class="language-typescript">interface NoteKeypair {
  publicKey: Uint8Array   // 32 bytes, X25519 public key
  secretKey: Uint8Array   // 64 bytes (NaCl convention: seed || pubkey)
}</code></pre>
      <p>Derived deterministically from the wallet's signing key via <code>deriveNoteKeypair()</code>. Not typically used directly.</p>

      <h2>EncryptedNote</h2>
      <pre><code class="language-typescript">interface EncryptedNote {
  ciphertext:   Uint8Array   // NaCl box ciphertext
  nonce:        Uint8Array   // 24 bytes
  senderPubkey: Uint8Array   // 32 bytes, sender's NaCl public key
}</code></pre>

      <h2>Note</h2>
      <pre><code class="language-typescript">interface Note {
  from:   string   // sender's Stellar address
  amount: bigint   // transfer amount in stroops
  r_A:    bigint   // blinding factor for the amount commitment
}</code></pre>
      <p>Decrypted payment note. Stored in <code>LocalState.pendingNotes</code> until settled.</p>

      <h2>LocalState</h2>
      <pre><code class="language-typescript">interface LocalState {
  balance:      bigint
  r:            bigint
  pendingNotes: Note[]
}</code></pre>
      <p>Stored in <code>localStorage</code> under <code>piilo:state:&lt;address&gt;</code>.</p>

      <h2>JubJubPoint</h2>
      <pre><code class="language-typescript">type JubJubPoint = [string, string]  // [x, y] as decimal strings</code></pre>
      <p>A point on the JubJub twisted Edwards curve. Coordinates are field elements represented as decimal strings.</p>

      <h2>GrothProof</h2>
      <pre><code class="language-typescript">interface GrothProof {
  pi_a: [string, string]
  pi_b: [[string, string], [string, string]]
  pi_c: [string, string]
}</code></pre>
      <p>A Groth16 proof in snarkjs format, serialized for submission to the Soroban contract.</p>

      <h2>TransferInput</h2>
      <pre><code class="language-typescript">interface TransferInput {
  B:     bigint         // sender's plaintext balance
  r_B:   bigint         // sender's balance blinding factor
  A:     bigint         // transfer amount
  r_A:   bigint         // amount blinding factor
  r_new: bigint         // new balance blinding factor
  C_B:   JubJubPoint   // current on-chain balance commitment
  C_A:   JubJubPoint   // amount commitment
  C_new: JubJubPoint   // new sender balance commitment
}</code></pre>
      <p>Input to <code>proveTransfer()</code>. Handled internally by the <code>Piilo</code> class.</p>

      <h2>WithdrawInput</h2>
      <pre><code class="language-typescript">interface WithdrawInput {
  r_B: bigint
  C_B: JubJubPoint
  B:   bigint
}</code></pre>
      <p>Input to <code>proveWithdraw()</code>. Handled internally by the <code>Piilo</code> class.</p>`,
      'body.freighter': `<h2>Instalar</h2>
      <pre><code class="language-bash">npm install @stellar/freighter-api</code></pre>

      <h2>Adaptador completo</h2>
      <pre><code class="language-typescript">import {
  isConnected,
  getPublicKey,
  signTransaction,
  signMessage,
} from '@stellar/freighter-api'
import type { WalletAdapter, WalletSigner } from '@neylanxyz/piilo'

export async function createFreighterAdapter(): Promise&lt;WalletAdapter & WalletSigner&gt; {
  const { isConnected: connected } = await isConnected()
  if (!connected) {
    throw new Error('Freighter is not installed. Install it at freighter.app')
  }

  return {
    async publicKey() {
      const { publicKey, error } = await getPublicKey()
      if (error) throw new Error(error)
      return publicKey
    },

    async signTransaction(xdr, opts) {
      const { signedTransaction, error } = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
      })
      if (error) throw new Error(error)
      return signedTransaction
    },

    async signMessage(message) {
      const { signedMessage, error } = await signMessage(message)
      if (error) throw new Error(error)
      // Freighter returns hex; convert to Uint8Array
      const hex = signedMessage
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i &lt; hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
      }
      return { signature: bytes }
    },
  }
}</code></pre>

      <h2>Uso</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'
import { createFreighterAdapter } from './freighterAdapter'

async function initPiilo() {
  const wallet = await createFreighterAdapter()

  const piilo = new Piilo({
    network:    'testnet',
    contractId: 'C...',
    wallet,
  })

  return piilo
}</code></pre>

      <h2>React hook example</h2>
      <pre><code class="language-tsx">import { useState, useCallback } from 'react'
import { Piilo } from '@neylanxyz/piilo'
import { createFreighterAdapter } from './freighterAdapter'

export function usePiilo(contractId: string) {
  const [piilo, setPiilo] = useState&lt;Piilo | null&gt;(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const wallet = await createFreighterAdapter()
      setPiilo(new Piilo({ network: 'testnet', contractId, wallet }))
    } finally {
      setConnecting(false)
    }
  }, [contractId])

  return { piilo, connect, connecting }
}</code></pre>

      <h2>Network detection</h2>
      <pre><code class="language-typescript">import { getNetworkDetails } from '@stellar/freighter-api'

async function detectNetwork(): Promise&lt;'testnet' | 'mainnet'&gt; {
  const { networkPassphrase } = await getNetworkDetails()
  if (networkPassphrase === 'Test SDF Network ; September 2015') return 'testnet'
  if (networkPassphrase === 'Public Global Stellar Network ; September 2015') return 'mainnet'
  throw new Error(\`Unknown network: \${networkPassphrase}\`)
}</code></pre>

      <h2>Troubleshooting</h2>
      <h3>"signMessage is not a function"</h3>
      <p>Your version of <code>@stellar/freighter-api</code> may be outdated:</p>
      <pre><code class="language-bash">npm install @stellar/freighter-api@latest</code></pre>

      <h3>User sees repeated signing prompts</h3>
      <p>The <code>NoteKeypair</code> is cached in memory on the <code>Piilo</code> instance. Create one <code>Piilo</code> instance per session and reuse it. Do not create a new <code>Piilo</code> on every operation.</p>

      <h3>"account not found"</h3>
      <p>The user's Stellar account may not be funded. Direct them to the <a href="https://lab.stellar.org" target="_blank" rel="noopener">Stellar Laboratory</a> to fund their testnet account.</p>`,
      'body.selfhosting': `<h2>Archivos requeridos</h2>
      <table>
        <thead><tr><th>Archivo</th><th>Tamaño</th><th>Propósito</th></tr></thead>
        <tbody>
          <tr><td><code>transfer_js/transfer.wasm</code></td><td>~2 MB</td><td>Generador de testigos para el circuito de transferencia</td></tr>
          <tr><td><code>transfer_1.zkey</code></td><td>~10 MB</td><td>Clave de prueba para el circuito de transferencia</td></tr>
          <tr><td><code>withdraw_js/withdraw.wasm</code></td><td>~1 MB</td><td>Generador de testigos para el circuito de retiro</td></tr>
          <tr><td><code>withdraw_1.zkey</code></td><td>~6 MB</td><td>Clave de prueba para el circuito de retiro</td></tr>
        </tbody>
      </table>
      <p>Los cuatro archivos están incluidos en el repositorio en <code>circuits/build/</code>.</p>

      <h2>Servir los archivos</h2>

      <h3>Vite / React</h3>
      <pre><code class="language-bash">cp -r circuits/build/transfer_js public/circuits/transfer_js
cp circuits/build/transfer_1.zkey public/circuits/transfer_1.zkey
cp -r circuits/build/withdraw_js public/circuits/withdraw_js
cp circuits/build/withdraw_1.zkey public/circuits/withdraw_1.zkey</code></pre>
      <p>Vite sirve <code>public/</code> en <code>/</code> por defecto. No se requiere configuración adicional.</p>

      <h3>Next.js</h3>
      <p>Coloca los archivos en <code>public/circuits/</code>. Next.js sirve <code>public/</code> de forma estática.</p>

      <h3>Nginx</h3>
      <pre><code class="language-nginx">location /circuits/ {
  root /var/www/your-app/public;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}</code></pre>
      <p>Los archivos son direccionados por contenido — establece TTLs de caché largos ya que nunca cambian sin una nueva versión.</p>

      <h3>Vercel</h3>
      <p>La aplicación de ejemplo está preconfigurada para Vercel mediante <code>vercel.json</code>. Los archivos de circuito en <code>examples/confidential-wallet/public/circuits/</code> se despliegan automáticamente.</p>

      <h2>Rutas de circuito personalizadas</h2>
      <p>In <code>packages/sdk/src/proof.ts</code>, the <code>assetPath</code> function resolves circuit paths:</p>
      <pre><code class="language-typescript">function assetPath(rel: string): string {
  if (typeof window !== 'undefined') return \`/circuits/\${rel}\`
  const repoRoot = new URL('../../../', import.meta.url)
  return new URL(\`circuits/build/\${rel}\`, repoRoot).pathname
}</code></pre>
      <p>Haz un fork del SDK y modifica esta función para servir desde un CDN:</p>
      <pre><code class="language-typescript">function assetPath(rel: string): string {
  if (typeof window !== 'undefined') {
    return \`https://cdn.example.com/piilo-circuits/\${rel}\`
  }
  // ...
}</code></pre>

      <h2>Verificar integridad de archivos</h2>
      <pre><code class="language-bash">sha256sum \\
  public/circuits/transfer_1.zkey \\
  public/circuits/withdraw_1.zkey \\
  public/circuits/transfer_js/transfer.wasm \\
  public/circuits/withdraw_js/withdraw.wasm</code></pre>
      <p>Compara con los checksums en <code>circuits/build/CHECKSUMS.sha256</code> del repositorio.</p>

      <h2>Performance considerations</h2>
      <p>The <code>.zkey</code> files are loaded into memory once per proof generation call. On a cold load:</p>
      <ul>
        <li>First call: download + load (~10–16 MB total) + proof generation</li>
        <li>Subsequent calls: load from browser cache + proof generation</li>
      </ul>
      <p><strong>Recommendations:</strong></p>
      <ul>
        <li>Preload the <code>.zkey</code> files on application startup (before the user initiates a transfer)</li>
        <li>Use HTTP/2 for parallel download of both zkey files</li>
        <li>Set <code>Cache-Control: immutable</code> — the files are versioned and never change</li>
        <li>Consider a Service Worker to cache the files across sessions</li>
      </ul>`,
      'body.security': `<h2>El factor de cegamiento es tu clave privada</h2>
      <p>La información más crítica en Piilo es el factor de cegamiento <code>r</code>. Es lo único necesario para:</p>
      <ul>
        <li>Abrir tu compromiso on-chain (revelar tu saldo)</li>
        <li>Participar en futuras transferencias (generar pruebas válidas)</li>
      </ul>
      <blockquote>
        <p>Si <code>r</code> se <strong>pierde</strong> → tu XLM queda bloqueado (hasta la recuperación vía ventana de eventos)<br>
        Si <code>r</code> es <strong>robado</strong> → tu saldo queda expuesto (pero el XLM permanece seguro — solo tú puedes firmar transacciones)</p>
      </blockquote>
      <p><strong>Trata los respaldos de <code>localStorage</code> como frases semilla.</strong></p>
      <h2>Riesgos por categoría</h2>
      <h3>Pérdida del estado local</h3>
      <p><strong>Riesgo:</strong> <code>localStorage</code> se borra (reinicio del navegador, sesión incógnito, reinstalación del SO)<br>
      <strong>Impacto:</strong> No se pueden generar pruebas → no se puede retirar ni transferir<br>
      <strong>Mitigación:</strong> Llama a <code>exportBackup()</code> después de cada depósito, transferencia y liquidación. Almacena el respaldo cifrado, fuera del dispositivo.</p>
      <h3>Respaldo robado</h3>
      <p><strong>Riesgo:</strong> El JSON de respaldo es leído por un atacante<br>
      <strong>Impacto:</strong> El atacante conoce tu saldo en texto plano y el factor de cegamiento<br>
      <strong>Mitigación:</strong></p>
      <pre><code class="language-typescript">const backup = await piilo.exportBackup()
const encrypted = await encryptWithPassword(backup, userPassword)
// almacena \`encrypted\`, no \`backup\`</code></pre>
      <h3>Extensión de navegador comprometida</h3>
      <p><strong>Riesgo:</strong> Una extensión de navegador maliciosa lee <code>localStorage</code><br>
      <strong>Impacto:</strong> El atacante aprende <code>r</code> y el saldo<br>
      <strong>Mitigación:</strong> Usa un perfil de navegador dedicado a aplicaciones financieras; audita las extensiones instaladas.</p>
      <h3>Ataque man-in-the-middle en archivos de circuito</h3>
      <p><strong>Riesgo:</strong> Los archivos <code>.zkey</code> o <code>.wasm</code> se sirven desde un CDN comprometido<br>
      <strong>Impacto:</strong> Los circuitos modificados maliciosamente podrían permitir la falsificación de pruebas</p>
      <h3>Respaldo desactualizado que lleva a fondos bloqueados</h3>
      <p><strong>Impacto:</strong> <code>importBackup()</code> lanza error; el respaldo no coincide con el compromiso on-chain<br>
      <strong>Mitigación:</strong> Exporta inmediatamente después de cada operación, reemplaza los respaldos anteriores.</p>
      <h3>Sesiones concurrentes en múltiples dispositivos</h3>
      <p><strong>Riesgo:</strong> Dos dispositivos operan simultáneamente<br>
      <strong>Impacto:</strong> Solo el estado de un dispositivo será válido; el otro queda permanentemente desincronizado<br>
      <strong>Mitigación:</strong> Nunca operes desde dos dispositivos al mismo tiempo. Siempre importa un respaldo actualizado antes de usar un segundo dispositivo.</p>
      <h2>Flujo de trabajo de respaldo recomendado</h2>
      <pre><code class="language-typescript">async function safeDeposit(
  piilo: Piilo,
  amount: bigint,
  saveBackup: (json: string) => Promise&lt;void&gt;
) {
  await piilo.deposit(amount)
  const backup = await piilo.exportBackup()
  await saveBackup(backup)
}</code></pre>`,
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
      'page.types.intro':        'Todos os tipos públicos exportados de @neylanxyz/piilo.',
      'page.freighter.h1':       'Integração Freighter',
      'page.freighter.intro':    'Freighter é a carteira de navegador mais usada para Stellar. Este guia fornece um WalletAdapter completo e pronto para produção.',
      'page.selfhosting.h1':     'Auto-hospedar arquivos de circuito',
      'page.selfhosting.intro':  'O SDK do Piilo usa dois pares de arquivos WASM + zkey para geração de provas. Por padrão, o SDK os resolve relativos a /circuits/ no seu servidor web.',
      'page.security.h1':        'Guia de segurança',
      'page.security.intro':     'O fator de ocultação r é sua chave privada. Este guia cobre como protegê-lo, o que fazer se for perdido e como auditar suas dependências.',

      /* ── DOCS BODY ───────────────────────────────────── */
      'body.introduction': `<h2>O que a Piilo faz</h2>
      <p>Quando você deposita XLM no contrato Piilo, o valor é registrado publicamente <strong>uma vez</strong> — isso é inevitável; o XLM precisa sair da sua conta. A partir desse momento, todas as operações subsequentes são privadas:</p>
      <ul>
        <li><strong>Saldos</strong> são armazenados como <a href="concepts/architecture.html#pedersen-commitments">compromissos Pedersen</a> — pontos de curva elíptica na curva JubJub. A rede vê um ponto, não um número.</li>
        <li><strong>Transferências</strong> produzem uma <a href="concepts/architecture.html#groth16-zk-proofs">prova ZK Groth16</a> gerada inteiramente no navegador do usuário. O destinatário recebe uma nota criptografada — somente a chave dele pode abri-la.</li>
        <li><strong>Saques</strong> exigem que o usuário gere uma prova de conhecimento do saldo. O contrato verifica a prova e libera XLM. Nenhuma parte confiável vê o saldo em texto simples.</li>
      </ul>
      <h2>O que a Piilo NÃO faz</h2>
      <ul>
        <li><strong>Piilo não é um mixer.</strong> Não há pool de anonimato, nem desvinculação entre depositante e sacador. O contrato sabe qual endereço detém qual compromisso; não sabe o valor.</li>
        <li><strong>Piilo não oculta para quem você envia.</strong> O endereço do destinatário de uma transferência fica on-chain. A Piilo oculta o valor, não a contraparte.</li>
        <li><strong>Piilo não oferece sigilo futuro.</strong> Se o seu estado local (fator de ocultação <code>r</code>) for comprometido, um invasor pode calcular seu saldo a partir do compromisso on-chain.</li>
      </ul>
      <p>Veja <a href="concepts/privacy-model.html">Modelo de privacidade</a> para o modelo completo de ameaças.</p>
      <h2>O SDK</h2>
      <p>O pacote <code>@neylanxyz/piilo</code> expõe uma única classe, <code>Piilo</code>, com cinco métodos públicos:</p>
      <table>
        <thead><tr><th>Método</th><th>O que faz</th></tr></thead>
        <tbody>
          <tr><td><code><a href="api/deposit.html">deposit(amount)</a></code></td><td>Deposita XLM, cria um compromisso Pedersen</td></tr>
          <tr><td><code><a href="api/transfer.html">transfer({ to, amount })</a></code></td><td>Envia privadamente com prova ZK + nota criptografada</td></tr>
          <tr><td><code><a href="api/settle.html">settleIfPending()</a></code></td><td>Incorpora transferências recebidas ao seu saldo</td></tr>
          <tr><td><code><a href="api/withdraw.html">withdraw()</a></code></td><td>Prova conhecimento do saldo, recebe XLM</td></tr>
          <tr><td><code><a href="api/backup.html">exportBackup() / importBackup(json)</a></code></td><td>Exporta e restaura o estado local</td></tr>
        </tbody>
      </table>
      <h2>Links rápidos</h2>
      <ul>
        <li><a href="quickstart.html">Início rápido</a> — instale, configure, primeira transferência em 5 minutos</li>
        <li><a href="concepts/architecture.html">Arquitetura</a> — como o sistema de provas ZK e compromissos funciona</li>
        <li><a href="api/piilo-class.html">Referência da API</a> — assinaturas completas de métodos e opções</li>
        <li><a href="guides/freighter.html">Integração Freighter</a> — conectar à carteira Freighter</li>
        <li><a href="guides/security.html">Guia de segurança</a> — como proteger o fator de ocultação</li>
      </ul>`,
      'body.quickstart': `<h2>Pré-requisitos</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Uma conta testnet da Stellar com XLM (use o <a href="https://lab.stellar.org" target="_blank" rel="noopener">Stellar Laboratory</a> para financiá-la)</li>
        <li>Extensão <a href="https://freighter.app" target="_blank" rel="noopener">Freighter</a> para o navegador (ou um <code>WalletAdapter</code> personalizado)</li>
      </ul>
      <h2>1. Instalar</h2>
      <pre><code class="language-bash">npm install @neylanxyz/piilo</code></pre>
      <p>O pacote já inclui tipos TypeScript. Não é necessário instalar <code>@types/</code> separadamente.</p>
      <h2>2. Servir os arquivos de circuito</h2>
      <p>A Piilo gera provas ZK no navegador usando arquivos de circuito WASM. Eles devem ser servidos pelo seu servidor web em <code>/circuits/</code>:</p>
      <pre><code class="language-plaintext">public/
  circuits/
    transfer_1.zkey
    transfer_js/
      transfer.wasm
    withdraw_1.zkey
    withdraw_js/
      withdraw.wasm</code></pre>
      <pre><code class="language-bash">cp -r node_modules/@neylanxyz/piilo/circuits public/circuits</code></pre>
      <h2>3. Configurar e instanciar</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'

const wallet = {
  async publicKey() {
    return window.freighter.getPublicKey()
  },
  async signTransaction(xdr, opts) {
    return window.freighter.signTransaction(xdr, opts)
  },
  async signMessage(message) {
    const result = await window.freighter.signMessage(message)
    return { signature: result.signature }
  },
}

const piilo = new Piilo({
  network:    'testnet',
  contractId: 'C…',
  wallet,
})</code></pre>
      <h2>4. Depositar</h2>
      <p>A primeira operação é sempre um depósito. O valor está em <strong>stroops</strong> (1 XLM = 10.000.000 stroops):</p>
      <pre><code class="language-typescript">// Depositar 5 XLM
await piilo.deposit(50_000_000n)

console.log('Saldo:', await piilo.getBalance())
// → 50000000n</code></pre>
      <p>A transação de depósito é pública. Após ser confirmada, seu saldo é rastreado localmente como um compromisso Pedersen — nenhuma operação posterior revela o valor.</p>
      <h2>5. Transferir de forma privada</h2>
      <pre><code class="language-typescript">// Enviar 2 XLM para outro endereço
await piilo.transfer({
  to:     'GABC…recipient',
  amount: 20_000_000n,
})</code></pre>
      <p>Isso vai:</p>
      <ol>
        <li>Gerar uma prova Groth16 no seu navegador (~2–5 segundos)</li>
        <li>Criptografar uma nota de pagamento para o destinatário</li>
        <li>Enviar a transação de transferência</li>
      </ol>
      <h2>6. Liquidar transferências recebidas</h2>
      <p>Os destinatários devem chamar <code>settleIfPending</code> para incorporar as notas recebidas ao seu saldo:</p>
      <pre><code class="language-typescript">const result = await piilo.settleIfPending()

if (result) {
  console.log('Recebido:', result.received, 'stroops')
}</code></pre>
      <h2>7. Sacar</h2>
      <pre><code class="language-typescript">await piilo.withdraw()</code></pre>
      <p>Gera uma prova Groth16 de conhecimento do saldo, envia on-chain e o contrato libera o XLM. O estado local é redefinido para zero.</p>
      <h2>8. Fazer backup do estado</h2>
      <p>Seu saldo e fator de ocultação vivem apenas no <code>localStorage</code>. Faça backup após cada operação importante:</p>
      <pre><code class="language-typescript">const backup = await piilo.exportBackup()
// Armazene esta string com segurança — trate-a como uma chave privada.
localStorage.setItem('piilo-backup', backup)

// Para restaurar em outro dispositivo:
const json = localStorage.getItem('piilo-backup')
await piilo.importBackup(json)</code></pre>
      <h2>Exemplo completo</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'

const piilo = new Piilo({ network: 'testnet', contractId: 'C…', wallet })

// Depositar 10 XLM
await piilo.deposit(100_000_000n)

// Enviar 3 XLM para um amigo
await piilo.transfer({ to: 'GABC…', amount: 30_000_000n })

// Verificar saldo restante (local, sem chamada de rede)
const balance = await piilo.getBalance()
console.log(balance) // 70000000n

// Sacar tudo
await piilo.withdraw()</code></pre>
      <h2>Próximos passos</h2>
      <ul>
      </ul>`,
      'body.architecture': `<h2>Visão geral do sistema</h2>
      <pre><code class="language-plaintext">User browser                    Stellar / Soroban
────────────────────            ──────────────────────────────
Local state                     Contract storage
  balance: bigint         ↔       balance_commitment: Point
  r: bigint (blinding)            pending_commitment: Point
  pendingNotes: Note[]            note_pubkey: Bytes&lt;32&gt;
                                  pending_notes: Vec&lt;EncNote&gt;

SDK operations
  deposit()      →   Stellar tx: deposit(amount, r, note_pubkey)
  transfer()     →   Stellar tx: transfer(to, C_A, C_new, proof, enc_note)
  settleIfPending() → Stellar tx: settle_pending(user)
  withdraw()     →   Stellar tx: withdraw(amount, proof)</code></pre>

      <h2>Compromissos Pedersen</h2>
      <p>Um compromisso Pedersen a um valor <code>v</code> with blinding factor <code>r</code> is:</p>
      <pre><code class="language-plaintext">C = v·G + r·H</code></pre>
      <p>onde <code>G</code> e <code>H</code> são geradores independentes na curva twisted Edwards JubJub, e <code>·</code> denota a multiplicação escalar.</p>
      <p><strong>Propriedades:</strong></p>
      <ul>
        <li><strong>Ocultamento:</strong> <code>C</code> reveals nothing about <code>v</code> without <code>r</code></li>
        <li><strong>Vinculação:</strong> you cannot open the same <code>C</code> to two different <code>(v, r)</code> pairs</li>
        <li><strong>Homomorficamente aditivo:</strong> <code>C(v₁, r₁) + C(v₂, r₂) = C(v₁+v₂, r₁+r₂)</code></li>
      </ul>
      <p>A propriedade homomórfica explica por que as transferências podem se acumular sem descriptografia — o contrato soma pontos de compromisso, e o estado local do usuário acumula os fatores de ocultação correspondentes.</p>

      <h3>Curva JubJub</h3>
      <p>Piilo usa uma parametrização JubJub personalizada defined in <code>circuits/jubjub.circom</code>:</p>
      <pre><code class="language-plaintext">// Generator G (for value)
G = (
  52011214036797608008763021134739816867182510661071949920602030138765591619595,
  36017543053724001483519641180346241195937746995850157919072206337752529044138
)

// Generator H (for blinding)
H = (
  2641322346204092426446313763048872749581807614122456322352786044536967383341,
  12433362859382302755418372944023213970869823563090304431189761096447391844644
)</code></pre>

      <h2>Provas ZK Groth16</h2>
      <p>Piilo usa dois circuitos Circom compilados para SNARKs Groth16:</p>

      <h3>Circuito de transferência</h3>
      <p><strong>Entradas públicas:</strong> <code>C_B</code>, <code>C_A</code>, <code>C_new</code> (three JubJub points = 6 field elements)</p>
      <p><strong>Entradas privadas:</strong> <code>B</code> (sender's balance), <code>r_B</code> (balance blinding), <code>A</code> (transfer amount), <code>r_A</code> (amount blinding), <code>r_new</code> (new balance blinding)</p>
      <p><strong>Restrições provadas:</strong></p>
      <ol>
        <li><code>C_B = B·G + r_B·H</code> — the sender knows the opening of their balance commitment</li>
        <li><code>C_A = A·G + r_A·H</code> — the amount commitment is correctly formed</li>
        <li><code>C_new = (B-A)·G + r_new·H</code> — the new balance commitment is correctly formed</li>
        <li><code>B ≥ A</code> — sender has sufficient funds (no underflow)</li>
      </ol>

      <h3>Circuito de saque</h3>
      <p><strong>Entradas públicas:</strong> <code>C_B</code>, <code>B</code> (the withdrawal amount, which equals the full balance)</p>
      <p><strong>Entradas privadas:</strong> <code>r_B</code> (balance blinding)</p>
      <p><strong>Restrições provadas:</strong></p>
      <ol>
        <li><code>C_B = B·G + r_B·H</code> — the user knows the opening of their commitment</li>
      </ol>

      <h3>Geração de provas</h3>
      <p>As provas são geradas no lado do cliente usando <code>snarkjs.groth16.fullProve()</code> com o gerador de testemunhas WASM compilado e o arquivo <code>.zkey</code> da configuração de confiança. A geração leva aproximadamente <strong>2–5 segundos</strong> num laptop moderno.</p>

      <h3>Verificação on-chain</h3>
      <p>O contrato Soroban em <code>contracts/verifier/</code> implementa a verificação de provas baseada em emparelhamento BLS12-381 em Rust. Verifica as provas Groth16 contra a chave de verificação (<code>*_vk.json</code>) que foi confirmada no momento do deploy.</p>

      <h2>Criptografia de notas</h2>
      <p>Quando Alice envia para Bob, Bob precisa conhecer o valor <code>A</code> e o fator de ocultação <code>r_A</code> para atualizar seu saldo local. Isso é transmitido por uma <strong>nota de pagamento</strong> criptografada.</p>

      <h3>Derivação de chave</h3>
      <pre><code class="language-typescript">// Sign a domain-separation string with the wallet's Ed25519 key
const { signature } = await wallet.signMessage("piilo-note-v1")
// Hash to 32 bytes
const seed = await crypto.subtle.digest("SHA-256", signature)
// Derive NaCl box keypair
const keypair = nacl.box.keyPair.fromSecretKey(seed)</code></pre>

      <h3>Criptografia</h3>
      <pre><code class="language-typescript">const note = nacl.box(
  JSON.stringify({ amount, r_A }),
  nonce,
  recipientPublicKey,
  senderKeypair.secretKey
)</code></pre>
      <p>Usa NaCl box: troca de chaves X25519 + cifra de fluxo XSalsa20 + MAC Poly1305.</p>

      <h3>Armazenamento on-chain</h3>
      <p>A nota criptografada é serializada como:</p>
      <pre><code class="language-plaintext">[1 byte version][24 bytes nonce][32 bytes sender_pubkey][N bytes ciphertext]</code></pre>
      <p>Armazenada na fila <code>pending_notes</code> do contrato para o destinatário, removida quando o destinatário chama <code>settle_pending</code>.</p>

      <h2>Modelo de estado</h2>
      <h3>On-chain (público)</h3>
      <table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody>
          <tr><td><code>balance_commitment</code></td><td><code>Point</code></td><td>Ponto JubJub: <code>C(saldo, r)</code></td></tr>
          <tr><td><code>pending_commitment</code></td><td><code>Point</code></td><td>Compromissos de transferências recebidas acumulados</td></tr>
          <tr><td><code>has_pending</code></td><td><code>bool</code></td><td>Se existem transferências pendentes</td></tr>
          <tr><td><code>nonce</code></td><td><code>u64</code></td><td>Proteção contra replay para provas de saque</td></tr>
          <tr><td><code>note_pubkey</code></td><td><code>Bytes&lt;32&gt;</code></td><td>Chave pública NaCl do destinatário</td></tr>
          <tr><td><code>pending_notes</code></td><td><code>Vec&lt;EncNote&gt;</code></td><td>Notas de pagamento criptografadas dos remetentes</td></tr>
        </tbody>
      </table>

      <h3>Off-chain (local)</h3>
      <table>
        <thead><tr><th>Campo</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody>
          <tr><td><code>balance</code></td><td><code>bigint</code></td><td>Saldo em texto simples em stroops</td></tr>
          <tr><td><code>r</code></td><td><code>bigint</code></td><td>Fator de ocultação atual</td></tr>
          <tr><td><code>pendingNotes</code></td><td><code>Note[]</code></td><td>Notas recebidas descriptografadas mas não liquidadas</td></tr>
        </tbody>
      </table>

      <h2>Fluxo de depósito</h2>
      <pre><code class="language-plaintext">1. User calls piilo.deposit(amount)
2. SDK generates random r ← Fr
3. SDK calls PiiloStellar.deposit(wallet, amount, r, notePubkey)
4. Contract: commitment = amount·G + r·H
             if account exists: balance_commitment += commitment
             else: create account with balance_commitment = commitment
5. SDK: saveState(applyDeposit(state, amount, r))
        new_balance = old_balance + amount
        new_r       = (old_r + r) mod JubJub_H_order</code></pre>

      <h2>Fluxo de transferência</h2>
      <pre><code class="language-plaintext">1. User calls piilo.transfer({ to, amount })
2. SDK fetches current on-chain C_B for sender
3. SDK generates r_A, r_new ← Fr
4. SDK computes C_A = amount·G + r_A·H
               C_new = (balance-amount)·G + r_new·H
5. SDK calls snarkjs.groth16.fullProve(...)  → proof π
6. SDK fetches recipient's note_pubkey from contract
7. SDK encrypts note: NaCl.box({ amount, r_A }, recipientPubkey, senderKeypair)
8. SDK submits: contract.transfer(sender, recipient, C_A, C_new, π, encrypted_note)
9. Contract verifies π
   Updates sender's balance_commitment = C_new
   Adds C_A to recipient's pending_commitment
   Stores encrypted_note in recipient's pending_notes
10. SDK: saveState(applySend(state, amount, r_new))</code></pre>

      <h2>Fluxo de liquidação</h2>
      <pre><code class="language-plaintext">1. User calls piilo.settleIfPending()
2. SDK checks contract: has_pending?
3. If yes, SDK calls contract.get_pending_notes(address)
4. SDK decrypts each note: { amount, r_A } = NaCl.open(enc_note, ...)
5. SDK calls contract.settle_pending(address)
   Contract: balance_commitment += pending_commitment
             pending_commitment = identity
             has_pending = false
             pending_notes = []
6. SDK: update local state
   new_balance += sum(note.amount)
   new_r = (old_r + sum(note.r_A)) mod JubJub_H_order</code></pre>`,
      'body.privacy-model': `<h2>O que está oculto</h2>
      <table>
        <thead><tr><th>Informação</th><th>Oculta para quem</th></tr></thead>
        <tbody>
          <tr><td>Seu saldo atual</td><td>Todos exceto você</td></tr>
          <tr><td>Valores de transferência</td><td>Todos exceto remetente e destinatário</td></tr>
          <tr><td>Seu fator de ocultação <code>r</code></td><td>Todos exceto você</td></tr>
        </tbody>
      </table>
      <h2>O que é visível</h2>
      <table>
        <thead><tr><th>Informação</th><th>Visível para</th></tr></thead>
        <tbody>
          <tr><td>Que você depositou XLM</td><td>Público (rede Stellar)</td></tr>
          <tr><td>O valor do depósito</td><td>Público (somente o depósito inicial)</td></tr>
          <tr><td>Para quem você envia</td><td>Público (endereço do destinatário)</td></tr>
          <tr><td>Que uma transferência ocorreu</td><td>Público (tx de transferência, mas não o valor)</td></tr>
          <tr><td>Que você sacou XLM</td><td>Público</td></tr>
          <tr><td>O valor do saque</td><td>Público</td></tr>
        </tbody>
      </table>
      <blockquote><p><strong>Os valores de depósito e saque são públicos.</strong> Se você depositar 5 XLM e depois sacar 3 XLM, um observador sabe que você enviou pelo menos 2 XLM em transferências privadas — mas não para quem, e não em quantos pagamentos separados.</p></blockquote>
      <h2>Modelo de ameaças</h2>
      <h3>Observador de cadeia honesto-mas-curioso</h3>
      <p>Um observador monitorando o ledger da Stellar vê seu endereço, o endereço do contrato inteligente, eventos de "transferência" sem valores e o ponto de compromisso on-chain (um ponto de curva elíptica opaco).</p>
      <p><strong>Não pode</strong> determinar seu saldo, o valor de qualquer transferência privada, nem os valores enviados a destinatários específicos.</p>
      <h3>Conluio do destinatário</h3>
      <p>Se um destinatário conluia com um observador, pode revelar o valor recebido. Não pode revelar seu saldo nem outras transferências.</p>
      <h3>Operador do contrato</h3>
      <p>O contrato Soroban da Piilo não tem chave de administrador, não tem capacidade de atualização após o deploy e não tem backdoor. O operador do contrato não tem acesso especial aos dados dos usuários.</p>
      <h3>Perda do estado local</h3>
      <p>Se o <code>localStorage</code> for apagado (ou você trocar de dispositivo sem backup), você perde seu <code>saldo</code> local e o fator de ocultação <code>r</code>. O XLM ainda está no contrato — você não pode sacá-lo sem <code>r</code>.</p>
      <p>Opções de recuperação:</p>
      <ol>
        <li><strong>Arquivo de backup</strong> (recomendado): ver <a href="../api/backup.html">exportBackup</a></li>
        <li><strong>Janela de eventos RPC</strong>: dentro de ~7 dias do seu último depósito, o nó RPC retém eventos com suas notas criptografadas.</li>
      </ol>
      <h3>Navegador / dispositivo comprometido</h3>
      <p>Se um invasor tiver acesso ao seu <code>localStorage</code>, pode ler seu saldo e fator de ocultação. A Piilo não protege contra um ambiente de execução comprometido.</p>
      <h3>Solidez das provas ZK</h3>
      <p>A segurança do ocultamento de valores na Piilo depende da solidez do sistema de provas Groth16 e da dureza do logaritmo discreto no JubJub. A configuração de confiança para os circuitos Groth16 requer que pelo menos um participante tenha destruído seus resíduos tóxicos.</p>
      <h2>Resumo</h2>
      <blockquote>
        <p><strong>Transferências confidenciais na Stellar</strong> — os valores das transferências individuais e os saldos atuais estão ocultos, mas o grafo de quem envia para quem não está.</p>
      </blockquote>
      <p>Se você precisa de anonimato de remetente/destinatário além da privacidade de valores, a Piilo sozinha não é suficiente.</p>`,
      'body.local-state': `<h2>Por que o estado local é necessário</h2>
      <p>Um compromisso Pedersen <code>C = v·G + r·H</code> é uma função de mão única. Dado apenas <code>C</code> (o que está on-chain), você não pode recuperar <code>v</code> (seu saldo) nem <code>r</code> (o fator de ocultação) sem já conhecer pelo menos um deles.</p>
      <p>O contrato tem <code>C</code> — o compromisso. Você tem <code>v</code> e <code>r</code> — a abertura. Ambos são necessários para gerar provas de transferência, provas de saque e para conhecer seu saldo.</p>
      <h2>O que é armazenado localmente</h2>
      <pre><code class="language-typescript">interface LocalState {
  balance:      bigint    // saldo em texto simples em stroops
  r:            bigint    // fator de ocultação atual (elemento de campo)
  pendingNotes: Note[]    // notas de transferência recebidas mas não liquidadas
}</code></pre>
      <p>Armazenado no <code>localStorage</code> sob a chave <code>piilo:state:&lt;stellar-address&gt;</code>.</p>
      <h2>Quando o estado local é atualizado</h2>
      <table>
        <thead><tr><th>Operação</th><th>Mudança de estado</th></tr></thead>
        <tbody>
          <tr><td><code>deposit(amount)</code></td><td><code>balance += amount</code>, <code>r = (r + r_dep) mod JubJub_H_order</code></td></tr>
          <tr><td><code>transfer({ to, amount })</code></td><td><code>balance -= amount</code>, <code>r = r_new</code> (novo aleatório)</td></tr>
          <tr><td><code>importBackup(json)</code></td><td>Sobrescrito com os valores do backup (verificados contra a cadeia primeiro)</td></tr>
        </tbody>
      </table>
      <h2>Aritmética do fator de ocultação</h2>
      <p>Os fatores de ocultação se acumulam mod <code>JUBJUB_H_ORDER</code>:</p>
      <pre><code class="language-plaintext">JUBJUB_H_ORDER = 26217937587563095239723870254092982918823685063489269125461436649568733016796n</code></pre>
      <p>Isso é ~4× menor que a ordem do campo BLS12-381. Reduzir mod esse valor garante que o fator de ocultação acumulado sempre caiba em 255 bits, o que é exigido pela decomposição <code>Num2Bits(255)</code> do circuito.</p>
      <h2>Backup e recuperação</h2>
      <p>O estado local não é salvo automaticamente. Você deve chamar <code>exportBackup()</code> e armazenar o resultado com segurança.</p>
      <pre><code class="language-typescript">const json = await piilo.exportBackup()
// {"version":1,"address":"G...","balance":"50000000","r":"1234..."}</code></pre>
      <blockquote><p><strong>Trate isso como uma frase semente.</strong> Qualquer pessoa que obtiver seu backup pode conhecer seu saldo exato e abrir seu compromisso. O SDK não criptografa o backup.</p></blockquote>
      <p><code>importBackup(json)</code> verifica que o backup abre para o compromisso on-chain atual antes de escrever. Se seu saldo mudou desde o backup, a importação falhará com um erro de incompatibilidade.</p>
      <h2>Recuperação pela janela de eventos</h2>
      <p>Se você perder seu backup, tem uma janela de ~7 dias para recuperar seu estado a partir dos eventos RPC:</p>
      <ol>
        <li>Todas as notas de transferências recebidas são armazenadas on-chain como blobs criptografados</li>
        <li>Seu par de chaves de notas é derivado deterministicamente da chave de assinatura da sua carteira</li>
        <li>Uma varredura de recuperação refaz a busca de todos os eventos de transferência direcionados ao seu endereço, descriptografa as notas e reconstrói seu saldo pendente</li>
      </ol>
      <p>Isso recupera apenas transferências recebidas dentro da janela de retenção de eventos RPC (~7 dias / 100.000 ledgers). Saldos mais antigos sem backup são <strong>irrecuperáveis</strong>.</p>
      <h2>Uso em múltiplos dispositivos</h2>
      <p>O estado local é por navegador. Para usar a Piilo em múltiplos dispositivos:</p>
      <ol>
        <li>Exporte um backup após cada operação no dispositivo A</li>
        <li>Importe-o no dispositivo B antes de operar</li>
      </ol>
      <p>Não opere de dois dispositivos simultaneamente — cada dispositivo rastreia seu próprio fator de ocultação, e operações concorrentes farão com que eles divirjam do estado on-chain.</p>`,
      'body.piilo-class': `<h2>Importar</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'
import type { PiiloConfig, WalletAdapter, Network } from '@neylanxyz/piilo'</code></pre>

      <h2>Constructor</h2>
      <div class="method-sig">new Piilo(config: PiiloConfig)</div>

      <h3>PiiloConfig</h3>
      <pre><code class="language-typescript">interface PiiloConfig {
  /** "testnet" or "mainnet" */
  network: Network

  /** Deployed Piilo contract address (starts with "C") */
  contractId: string

  /** Wallet adapter that provides signing capabilities */
  wallet: WalletAdapter & WalletSigner

  /**
   * Optional relay URL for fee sponsorship.
   * The relay cannot access funds — it only covers fees.
   */
  relayUrl?: string
}</code></pre>

      <h3>WalletAdapter</h3>
      <pre><code class="language-typescript">interface WalletAdapter {
  publicKey(): Promise&lt;string&gt;
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string }
  ): Promise&lt;string&gt;
}</code></pre>

      <h3>WalletSigner</h3>
      <pre><code class="language-typescript">interface WalletSigner {
  signMessage(message: string): Promise&lt;{ signature: Uint8Array }&gt;
}</code></pre>

      <h2>Métodos</h2>

      <h3>getBalance()</h3>
      <div class="method-sig">async getBalance(): Promise&lt;bigint&gt;</div>
      <p>Retorna o saldo local em texto simples atual em stroops. <strong>Não</strong> faz uma chamada de rede — lê do <code>localStorage</code>.</p>
      <pre><code class="language-typescript">const balance = await piilo.getBalance()
console.log(\`\${balance / 10_000_000n} XLM\`)</code></pre>

      <hr>

      <h3data-i18n="nav.deposit">deposit()</h3>
      <div class="method-sig">async deposit(amount: bigint): Promise&lt;void&gt;</div>
      <p>Deposita <code>amount</code> stroops na conta confidencial. O valor do depósito é visível publicamente on-chain.</p>
      <p><a href="deposit.html">→ Documentação completa de deposit()</a></p>

      <hr>

      <h3data-i18n="nav.transfer">transfer()</h3>
      <div class="method-sig">async transfer(params: &#123; to: string; amount: bigint &#125;): Promise&lt;void&gt;</div>
      <p>Envia <code>amount</code> de forma privada para <code>to</code>. Gera uma prova Groth16 (~2–5 segundos) e criptografa a nota de pagamento para o destinatário.</p>
      <p><a href="transfer.html">→ Documentação completa de transfer()</a></p>

      <hr>

      <h3data-i18n="nav.settle">settleIfPending()</h3>
      <div class="method-sig">async settleIfPending(): Promise&lt;&#123; received: bigint &#125; | null&gt;</div>
      <p>Checks for pending incoming transfers. If found, decrypts the payment notes, settles on-chain, and updates local state.</p>
      <p><a href="settle.html">→ Full settleIfPending() docs</a></p>

      <hr>

      <h3data-i18n="nav.withdraw">withdraw()</h3>
      <div class="method-sig">async withdraw(): Promise&lt;void&gt;</div>
      <p>Withdraws the full balance. Generates a Groth16 proof of balance knowledge and resets local state to zero.</p>
      <p><a href="withdraw.html">→ Full withdraw() docs</a></p>

      <hr>

      <h3>exportBackup()</h3>
      <div class="method-sig">async exportBackup(): Promise&lt;string&gt;</div>
      <p>Returns a JSON string containing the current local state. Treat the output like a private key.</p>

      <hr>

      <h3>importBackup()</h3>
      <div class="method-sig">async importBackup(json: string): Promise&lt;&#123; balance: bigint &#125;&gt;</div>
      <p>Restores local state from a backup JSON string. Verifies the backup matches the current on-chain commitment before writing.</p>
      <p><a href="backup.html">→ Full backup docs</a></p>`,
      'body.deposit': `<div class="method-sig">async deposit(amount: bigint): Promise&lt;void&gt;</div>

      <p>Deposita <code>amount</code> stroops no contrato Piilo. Este é o ponto de entrada no sistema confidencial.</p>

      <h2>O que acontece</h2>
      <ol>
        <li>Um fator de ocultação aleatório <code>r</code> é gerado: <code>r ← Fr</code></li>
        <li>O compromisso <code>C = amount·G + r·H</code> é calculado localmente</li>
        <li>Uma transação Stellar é enviada chamando <code>deposit(user, amount, r, note_pubkey)</code> on the contract</li>
        <li>O contrato atualiza (ou cria) o <code>balance_commitment</code> do usuário:
          <ul>
            <li><strong>Primeiro depósito:</strong> <code>balance_commitment = C</code></li>
            <li><strong>Depósitos subsequentes:</strong> <code>balance_commitment = old_commitment + C</code> (adição homomórfica)</li>
          </ul>
        </li>
        <li>O estado local é atualizado: <code>balance += amount</code>, <code>r = (old_r + r_dep) mod JubJub_H_order</code></li>
      </ol>

      <h2>Parâmetros</h2>
      <table>
        <thead><tr><th>Parâmetro</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody>
          <tr><td><code>amount</code></td><td><code>bigint</code></td><td>Valor a depositar, em stroops. Deve ser positivo.</td></tr>
        </tbody>
      </table>

      <h2>Erros</h2>
      <table>
        <thead><tr><th>Erro</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"amount must be positive"</code></td><td><code>amount &lt;= 0n</code></td></tr>
          <tr><td>Stellar RPC error</td><td>Saldo XLM insuficiente, falha de simulação, rejeição de transação</td></tr>
        </tbody>
      </table>

      <h2>Visibilidade</h2>
      <p>O valor do depósito é <strong>publicamente visível</strong> no ledger da Stellar. Este é o único momento no ciclo de vida da Piilo onde um valor é observável on-chain. Todas as transferências subsequentes e o saldo final estão ocultos.</p>

      <h2>Exemplo</h2>
      <pre><code class="language-typescript">// Deposit 10 XLM (in stroops)
await piilo.deposit(100_000_000n)

// Multiple deposits accumulate homomorphically
await piilo.deposit(50_000_000n)

const balance = await piilo.getBalance()
// → 150_000_000n (15 XLM)</code></pre>

      <h2>Acumulação do fator de ocultação</h2>
      <p>Cada depósito gera um novo <code>r_dep</code> aleatório. O fator de ocultação armazenado se acumula:</p>
      <pre><code class="language-plaintext">new_r = (old_r + r_dep) mod JUBJUB_H_ORDER</code></pre>
      <p>Isso preserva a propriedade homomórfica: o compromisso on-chain é sempre <code>balance·G + r·H</code>, onde <code>r</code> é a soma acumulada de todos os fatores de ocultação de depósitos.</p>

      <h2>Note public key</h2>
      <p>On the first deposit, the SDK registers the user's NaCl note public key on-chain. This key allows others to send encrypted payment notes to this address. The note keypair is derived deterministically from <code>wallet.signMessage("piilo-note-v1")</code>.</p>`,
      'body.transfer': `<div class="method-sig">async transfer(params: &#123; to: string; amount: bigint &#125;): Promise&lt;void&gt;</div>

      <p>Envia <code>amount</code> stroops de forma privada para <code>to</code>. O valor is never revealed on-chain — only a ZK proof attesting to its validity.</p>

      <h2>O que acontece</h2>
      <ol>
        <li>The current on-chain commitment <code>C_B</code> is fetched for the sender</li>
        <li>Fresh blinding factors <code>r_A</code> and <code>r_new</code> are generated</li>
        <li>Commitment points are computed: <code>C_A = amount·G + r_A·H</code> and <code>C_new = (balance - amount)·G + r_new·H</code></li>
        <li>A Groth16 proof <code>π</code> is generated in the browser (proves the commitments are valid and <code>balance ≥ amount</code>)</li>
        <li>The recipient's note public key is fetched from the contract</li>
        <li>A payment note <code>&#123; amount, r_A &#125;</code> is encrypted for the recipient via NaCl box</li>
        <li>The transaction is submitted on-chain; the contract verifies <code>π</code>, updates the sender's commitment, and stores the encrypted note for the recipient</li>
        <li>Local state: <code>balance -= amount</code>, <code>r = r_new</code></li>
      </ol>

      <h2>Parâmetros</h2>
      <table>
        <thead><tr><th>Parâmetro</th><th>Tipo</th><th>Descrição</th></tr></thead>
        <tbody>
          <tr><td><code>to</code></td><td><code>string</code></td><td>Recipient Stellar address (G-address)</td></tr>
          <tr><td><code>amount</code></td><td><code>bigint</code></td><td>Amount in stroops. Must be positive and ≤ balance.</td></tr>
        </tbody>
      </table>

      <h2>Erros</h2>
      <table>
        <thead><tr><th>Erro</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"amount must be positive"</code></td><td><code>amount &lt;= 0n</code></td></tr>
          <tr><td><code>"insufficient balance"</code></td><td><code>amount &gt; local balance</code></td></tr>
          <tr><td><code>"no on-chain account — deposit first"</code></td><td>Sender has no on-chain commitment</td></tr>
          <tr><td><code>"Recipient ... has not deposited yet"</code></td><td>Recipient's note pubkey is not on-chain</td></tr>
          <tr><td>snarkjs error</td><td>Proof generation failed</td></tr>
          <tr><td>Stellar RPC error</td><td>Transaction rejected</td></tr>
        </tbody>
      </table>

      <h2>Duration</h2>
      <p>Proof generation takes approximately <strong>2–5 seconds</strong> on a modern laptop and up to 10–15 seconds on a low-end mobile device. The Groth16 proof is computed using WebAssembly in the browser — no server is involved.</p>

      <h2>Exemplo</h2>
      <pre><code class="language-typescript">// Send 2 XLM to a recipient
await piilo.transfer({
  to:     'GABC123...',
  amount: 20_000_000n,
})

// The recipient must call settleIfPending() to access the funds</code></pre>

      <h2>What the recipient must do</h2>
      <p>The recipient does not automatically receive funds in their local balance. They must call <a href="settle.html"><codedata-i18n="nav.settle">settleIfPending()</code></a> to decrypt the payment note and merge the commitment into their balance.</p>

      <h2>Privacy properties</h2>
      <ul>
        <li><strong>Amount:</strong> hidden. Only the sender and recipient know the amount.</li>
        <li><strong>Recipient address:</strong> visible on-chain.</li>
        <li><strong>Sender address:</strong> visible on-chain.</li>
        <li><strong>Proof:</strong> visible on-chain, but reveals nothing about <code>amount</code>, <code>balance</code>, or blinding factors.</li>
      </ul>`,
      'body.settle': `<div class="method-sig">async settleIfPending(): Promise&lt;&#123; received: bigint &#125; | null&gt;</div>

      <p>Merges incoming transfers into the local balance. Must be called before received funds can be spent or withdrawn.</p>

      <h2>O que acontece</h2>
      <ol>
        <li>Checks the on-chain account: is <code>has_pending = true</code>?</li>
        <li>If no pending transfers, returns <code>null</code> immediately (no transaction submitted)</li>
        <li>Fetches all encrypted notes from <code>contract.get_pending_notes(address)</code></li>
        <li>Decrypts each note using the user's note keypair</li>
        <li>Calls <code>contract.settle_pending(address)</code> on-chain:
          <ul>
            <li>Adds <code>pending_commitment</code> to <code>balance_commitment</code></li>
            <li>Clears <code>pending_commitment</code> and <code>pending_notes</code></li>
            <li>Sets <code>has_pending = false</code></li>
          </ul>
        </li>
        <li>Updates local state: <code>balance += sum(note.amount)</code>, <code>r = (r + sum(note.r_A)) mod JubJub_H_order</code></li>
      </ol>

      <h2>Retorna</h2>
      <ul>
        <li><code>&#123; received: bigint &#125;</code> — total stroops received, if there were pending transfers</li>
        <li><code>null</code> — if no transfers were pending</li>
      </ul>

      <h2>Throws</h2>
      <table>
        <thead><tr><th>Error</th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td>Stellar RPC error</td><td>Transaction failed</td></tr>
          <tr><td>Note decryption error</td><td>Malformed or tampered encrypted note (logged, note skipped)</td></tr>
        </tbody>
      </table>

      <h2>Exemplo</h2>
      <pre><code class="language-typescript">const result = await piilo.settleIfPending()

if (result === null) {
  console.log('No incoming transfers')
} else {
  console.log(\`Received \${result.received / 10_000_000n} XLM\`)
  console.log('New balance:', await piilo.getBalance())
}</code></pre>

      <h2>Polling pattern</h2>
      <pre><code class="language-typescript">async function checkForIncoming() {
  const result = await piilo.settleIfPending()
  if (result) {
    showNotification(\`Received \${result.received / 10_000_000n} XLM\`)
    refreshBalanceDisplay()
  }
}

checkForIncoming()
setInterval(checkForIncoming, 30_000)</code></pre>

      <h2>Note on atomicity</h2>
      <p><code>settle_pending</code> is a single Stellar transaction. Either all pending notes are settled together, or none are. There is no partial settlement.</p>`,
      'body.withdraw': `<div class="method-sig">async withdraw(): Promise&lt;void&gt;</div>

      <p>Withdraws the full balance. Generates a ZK proof of balance knowledge, submits it on-chain, and receives XLM back to the Stellar account.</p>

      <h2>O que acontece</h2>
      <ol>
        <li>Reads local <code>balance</code> and <code>r</code> from state</li>
        <li>Fetches the current on-chain commitment <code>C_B</code></li>
        <li>Generates a Groth16 withdrawal proof <code>π</code> proving <code>C_B = balance·G + r·H</code></li>
        <li>Submits <code>contract.withdraw(user, balance, π)</code> on-chain</li>
        <li>The contract verifies <code>π</code>, transfers <code>balance</code> stroops to the user's Stellar account, and deletes the account entry</li>
        <li>Local state is reset: <code>&#123; balance: 0n, r: 0n, pendingNotes: [] &#125;</code></li>
      </ol>

      <h2>Erros</h2>
      <table>
        <thead><tr><th>Erro</th><th>Causa</th></tr></thead>
        <tbody>
          <tr><td><code>"no balance to withdraw"</code></td><td><code>balance === 0n</code></td></tr>
          <tr><td><code>"no on-chain account"</code></td><td>Account entry does not exist on-chain</td></tr>
          <tr><td>snarkjs error</td><td>Proof generation failed</td></tr>
          <tr><td>Stellar RPC error</td><td>Proof verification failed, transaction rejected</td></tr>
        </tbody>
      </table>

      <h2>Exemplo</h2>
      <pre><code class="language-typescript">const balance = await piilo.getBalance()
console.log(\`Withdrawing \${balance / 10_000_000n} XLM\`)

await piilo.withdraw()

console.log('Done. Balance:', await piilo.getBalance())
// → 0n</code></pre>

      <h2>Partial withdrawal</h2>
      <p>The current implementation withdraws the <strong>full balance</strong> only. To send a partial amount, use <a href="transfer.html"><codedata-i18n="nav.transfer">transfer()</code></a> to send privately to yourself and then <codedata-i18n="nav.withdraw">withdraw()</code> from that second account.</p>

      <h2>Pending transfers</h2>
      <p>If you have pending incoming transfers (<code>has_pending = true</code>), call <a href="settle.html"><codedata-i18n="nav.settle">settleIfPending()</code></a> <strong>before</strong> <codedata-i18n="nav.withdraw">withdraw()</code>. Otherwise you will withdraw only your settled balance and the pending amounts remain locked — but your account entry is deleted.</p>

      <h2>Duration</h2>
      <p>Proof generation takes approximately 2–5 seconds. The withdrawal proof is slightly faster than the transfer proof because it has fewer constraints.</p>`,
      'body.backup': `<h2>exportBackup()</h2>
      <div class="method-sig">async exportBackup(): Promise&lt;string&gt;</div>
      <p>Exporta o estado local atual como uma string JSON.</p>
      <pre><code class="language-typescript">const json = await piilo.exportBackup()
// → '{"version":1,"address":"G...","balance":"50000000","r":"4291873..."}'</code></pre>

      <h3>Backup format</h3>
      <pre><code class="language-typescript">{
  version: 1
  address: string   // Stellar address this backup belongs to
  balance: string   // balance in stroops (bigint serialized as string)
  r:       string   // blinding factor (bigint serialized as string)
}</code></pre>

      <blockquote><p><strong>Security warning:</strong> The backup contains your plaintext balance and blinding factor. Store it as securely as a private key. Anyone who obtains your backup can determine your balance. The SDK does not encrypt the backup — do so yourself if needed.</p></blockquote>

      <h3>When to export</h3>
      <p>Export after every state-changing operation:</p>
      <ul>
        <li>After <codedata-i18n="nav.deposit">deposit()</code></li>
        <li>After <codedata-i18n="nav.transfer">transfer()</code></li>
        <li>After <codedata-i18n="nav.settle">settleIfPending()</code> (if it returned non-null)</li>
      </ul>
      <p>The <code>pendingNotes</code> array is intentionally excluded from the backup — it is reconstructed from on-chain event data during recovery.</p>

      <hr>

      <h2>importBackup()</h2>
      <div class="method-sig">async importBackup(json: string): Promise&lt;&#123; balance: bigint &#125;&gt;</div>
      <p>Restores local state from a backup string. Verifies the backup matches the current on-chain commitment before writing.</p>

      <h3>Parameters</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>json</code></td><td><code>string</code></td><td>A JSON string previously produced by <code>exportBackup()</code></td></tr>
        </tbody>
      </table>

      <h3>Returns</h3>
      <p><code>&#123; balance: bigint &#125;</code> — the restored balance in stroops.</p>

      <h3>Throws</h3>
      <table>
        <thead><tr><th>Error</th><th>Cause</th></tr></thead>
        <tbody>
          <tr><td><code>"Unknown backup version N"</code></td><td>Unsupported backup format</td></tr>
          <tr><td><code>"Backup belongs to ..., connected wallet is ..."</code></td><td>Address mismatch</td></tr>
          <tr><td><code>"No on-chain account — deposit first, then restore"</code></td><td>No commitment on-chain for verification</td></tr>
          <tr><td><code>"Backup does not match on-chain commitment"</code></td><td>Balance or <code>r</code> in the backup differ from the current on-chain commitment</td></tr>
        </tbody>
      </table>

      <h3>Example</h3>
      <pre><code class="language-typescript">// Export (do this after every operation)
const backup = await piilo.exportBackup()
await secureStorage.save('piilo-backup', backup)

// Import on a new device
const json = await secureStorage.load('piilo-backup')
const { balance } = await piilo.importBackup(json)
console.log(\`Restored balance: \${balance / 10_000_000n} XLM\`)</code></pre>

      <h3>Stale backups</h3>
      <p>If you made operations after exporting the backup, the backup will not match the current on-chain commitment and import will fail. You need the most recent backup.</p>
      <p>If you have no recent backup and no recovery path, see <a href="../concepts/local-state.html#recovery-from-event-window">Local State — Recovery from event window</a>.</p>`,
      'body.types': `<h2>PiiloConfig</h2>
      <pre><code class="language-typescript">interface PiiloConfig {
  network:     Network
  contractId:  string
  wallet:      WalletAdapter & WalletSigner
  relayUrl?:   string
}</code></pre>

      <h2>Network</h2>
      <pre><code class="language-typescript">type Network = 'testnet' | 'mainnet'</code></pre>

      <h2>WalletAdapter</h2>
      <pre><code class="language-typescript">interface WalletAdapter {
  publicKey():    Promise&lt;string&gt;
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise&lt;string&gt;
}</code></pre>

      <h2>WalletSigner</h2>
      <pre><code class="language-typescript">interface WalletSigner {
  signMessage(message: string): Promise&lt;{ signature: Uint8Array }&gt;
}</code></pre>

      <h2>NoteKeypair</h2>
      <pre><code class="language-typescript">interface NoteKeypair {
  publicKey: Uint8Array   // 32 bytes, X25519 public key
  secretKey: Uint8Array   // 64 bytes (NaCl convention: seed || pubkey)
}</code></pre>
      <p>Derived deterministically from the wallet's signing key via <code>deriveNoteKeypair()</code>. Not typically used directly.</p>

      <h2>EncryptedNote</h2>
      <pre><code class="language-typescript">interface EncryptedNote {
  ciphertext:   Uint8Array   // NaCl box ciphertext
  nonce:        Uint8Array   // 24 bytes
  senderPubkey: Uint8Array   // 32 bytes, sender's NaCl public key
}</code></pre>

      <h2>Note</h2>
      <pre><code class="language-typescript">interface Note {
  from:   string   // sender's Stellar address
  amount: bigint   // transfer amount in stroops
  r_A:    bigint   // blinding factor for the amount commitment
}</code></pre>
      <p>Decrypted payment note. Stored in <code>LocalState.pendingNotes</code> until settled.</p>

      <h2>LocalState</h2>
      <pre><code class="language-typescript">interface LocalState {
  balance:      bigint
  r:            bigint
  pendingNotes: Note[]
}</code></pre>
      <p>Stored in <code>localStorage</code> under <code>piilo:state:&lt;address&gt;</code>.</p>

      <h2>JubJubPoint</h2>
      <pre><code class="language-typescript">type JubJubPoint = [string, string]  // [x, y] as decimal strings</code></pre>
      <p>A point on the JubJub twisted Edwards curve. Coordinates are field elements represented as decimal strings.</p>

      <h2>GrothProof</h2>
      <pre><code class="language-typescript">interface GrothProof {
  pi_a: [string, string]
  pi_b: [[string, string], [string, string]]
  pi_c: [string, string]
}</code></pre>
      <p>A Groth16 proof in snarkjs format, serialized for submission to the Soroban contract.</p>

      <h2>TransferInput</h2>
      <pre><code class="language-typescript">interface TransferInput {
  B:     bigint         // sender's plaintext balance
  r_B:   bigint         // sender's balance blinding factor
  A:     bigint         // transfer amount
  r_A:   bigint         // amount blinding factor
  r_new: bigint         // new balance blinding factor
  C_B:   JubJubPoint   // current on-chain balance commitment
  C_A:   JubJubPoint   // amount commitment
  C_new: JubJubPoint   // new sender balance commitment
}</code></pre>
      <p>Input to <code>proveTransfer()</code>. Handled internally by the <code>Piilo</code> class.</p>

      <h2>WithdrawInput</h2>
      <pre><code class="language-typescript">interface WithdrawInput {
  r_B: bigint
  C_B: JubJubPoint
  B:   bigint
}</code></pre>
      <p>Input to <code>proveWithdraw()</code>. Handled internally by the <code>Piilo</code> class.</p>`,
      'body.freighter': `<h2>Instalar</h2>
      <pre><code class="language-bash">npm install @stellar/freighter-api</code></pre>

      <h2>Adaptador completo</h2>
      <pre><code class="language-typescript">import {
  isConnected,
  getPublicKey,
  signTransaction,
  signMessage,
} from '@stellar/freighter-api'
import type { WalletAdapter, WalletSigner } from '@neylanxyz/piilo'

export async function createFreighterAdapter(): Promise&lt;WalletAdapter & WalletSigner&gt; {
  const { isConnected: connected } = await isConnected()
  if (!connected) {
    throw new Error('Freighter is not installed. Install it at freighter.app')
  }

  return {
    async publicKey() {
      const { publicKey, error } = await getPublicKey()
      if (error) throw new Error(error)
      return publicKey
    },

    async signTransaction(xdr, opts) {
      const { signedTransaction, error } = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
      })
      if (error) throw new Error(error)
      return signedTransaction
    },

    async signMessage(message) {
      const { signedMessage, error } = await signMessage(message)
      if (error) throw new Error(error)
      // Freighter returns hex; convert to Uint8Array
      const hex = signedMessage
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i &lt; hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
      }
      return { signature: bytes }
    },
  }
}</code></pre>

      <h2>Uso</h2>
      <pre><code class="language-typescript">import { Piilo } from '@neylanxyz/piilo'
import { createFreighterAdapter } from './freighterAdapter'

async function initPiilo() {
  const wallet = await createFreighterAdapter()

  const piilo = new Piilo({
    network:    'testnet',
    contractId: 'C...',
    wallet,
  })

  return piilo
}</code></pre>

      <h2>React hook example</h2>
      <pre><code class="language-tsx">import { useState, useCallback } from 'react'
import { Piilo } from '@neylanxyz/piilo'
import { createFreighterAdapter } from './freighterAdapter'

export function usePiilo(contractId: string) {
  const [piilo, setPiilo] = useState&lt;Piilo | null&gt;(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const wallet = await createFreighterAdapter()
      setPiilo(new Piilo({ network: 'testnet', contractId, wallet }))
    } finally {
      setConnecting(false)
    }
  }, [contractId])

  return { piilo, connect, connecting }
}</code></pre>

      <h2>Network detection</h2>
      <pre><code class="language-typescript">import { getNetworkDetails } from '@stellar/freighter-api'

async function detectNetwork(): Promise&lt;'testnet' | 'mainnet'&gt; {
  const { networkPassphrase } = await getNetworkDetails()
  if (networkPassphrase === 'Test SDF Network ; September 2015') return 'testnet'
  if (networkPassphrase === 'Public Global Stellar Network ; September 2015') return 'mainnet'
  throw new Error(\`Unknown network: \${networkPassphrase}\`)
}</code></pre>

      <h2>Troubleshooting</h2>
      <h3>"signMessage is not a function"</h3>
      <p>Your version of <code>@stellar/freighter-api</code> may be outdated:</p>
      <pre><code class="language-bash">npm install @stellar/freighter-api@latest</code></pre>

      <h3>User sees repeated signing prompts</h3>
      <p>The <code>NoteKeypair</code> is cached in memory on the <code>Piilo</code> instance. Create one <code>Piilo</code> instance per session and reuse it. Do not create a new <code>Piilo</code> on every operation.</p>

      <h3>"account not found"</h3>
      <p>The user's Stellar account may not be funded. Direct them to the <a href="https://lab.stellar.org" target="_blank" rel="noopener">Stellar Laboratory</a> to fund their testnet account.</p>`,
      'body.selfhosting': `<h2>Arquivos necessários</h2>
      <table>
        <thead><tr><th>Arquivo</th><th>Tamanho</th><th>Propósito</th></tr></thead>
        <tbody>
          <tr><td><code>transfer_js/transfer.wasm</code></td><td>~2 MB</td><td>Gerador de testemunhas para o circuito de transferência</td></tr>
          <tr><td><code>transfer_1.zkey</code></td><td>~10 MB</td><td>Chave de prova para o circuito de transferência</td></tr>
          <tr><td><code>withdraw_js/withdraw.wasm</code></td><td>~1 MB</td><td>Gerador de testemunhas para o circuito de saque</td></tr>
          <tr><td><code>withdraw_1.zkey</code></td><td>~6 MB</td><td>Chave de prova para o circuito de saque</td></tr>
        </tbody>
      </table>
      <p>Os quatro arquivos estão incluídos no repositório em <code>circuits/build/</code>.</p>

      <h2>Servir os arquivos</h2>

      <h3>Vite / React</h3>
      <pre><code class="language-bash">cp -r circuits/build/transfer_js public/circuits/transfer_js
cp circuits/build/transfer_1.zkey public/circuits/transfer_1.zkey
cp -r circuits/build/withdraw_js public/circuits/withdraw_js
cp circuits/build/withdraw_1.zkey public/circuits/withdraw_1.zkey</code></pre>
      <p>O Vite serve <code>public/</code> em <code>/</code> por padrão. Nenhuma configuração adicional é necessária.</p>

      <h3>Next.js</h3>
      <p>Coloque os arquivos em <code>public/circuits/</code>. O Next.js serve <code>public/</code> estaticamente.</p>

      <h3>Nginx</h3>
      <pre><code class="language-nginx">location /circuits/ {
  root /var/www/your-app/public;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}</code></pre>
      <p>Os arquivos são endereçados por conteúdo — defina TTLs de cache longos pois nunca mudam sem uma nova versão.</p>

      <h3>Vercel</h3>
      <p>O aplicativo de exemplo está pré-configurado para Vercel via <code>vercel.json</code>. Os arquivos de circuito em <code>examples/confidential-wallet/public/circuits/</code> são deployados automaticamente.</p>

      <h2>Caminhos de circuito personalizados</h2>
      <p>In <code>packages/sdk/src/proof.ts</code>, the <code>assetPath</code> function resolves circuit paths:</p>
      <pre><code class="language-typescript">function assetPath(rel: string): string {
  if (typeof window !== 'undefined') return \`/circuits/\${rel}\`
  const repoRoot = new URL('../../../', import.meta.url)
  return new URL(\`circuits/build/\${rel}\`, repoRoot).pathname
}</code></pre>
      <p>Faça um fork do SDK e modifique esta função para servir a partir de um CDN:</p>
      <pre><code class="language-typescript">function assetPath(rel: string): string {
  if (typeof window !== 'undefined') {
    return \`https://cdn.example.com/piilo-circuits/\${rel}\`
  }
  // ...
}</code></pre>

      <h2>Verificar integridade dos arquivos</h2>
      <pre><code class="language-bash">sha256sum \\
  public/circuits/transfer_1.zkey \\
  public/circuits/withdraw_1.zkey \\
  public/circuits/transfer_js/transfer.wasm \\
  public/circuits/withdraw_js/withdraw.wasm</code></pre>
      <p>Compare com os checksums em <code>circuits/build/CHECKSUMS.sha256</code> do repositório.</p>

      <h2>Performance considerations</h2>
      <p>The <code>.zkey</code> files are loaded into memory once per proof generation call. On a cold load:</p>
      <ul>
        <li>First call: download + load (~10–16 MB total) + proof generation</li>
        <li>Subsequent calls: load from browser cache + proof generation</li>
      </ul>
      <p><strong>Recommendations:</strong></p>
      <ul>
        <li>Preload the <code>.zkey</code> files on application startup (before the user initiates a transfer)</li>
        <li>Use HTTP/2 for parallel download of both zkey files</li>
        <li>Set <code>Cache-Control: immutable</code> — the files are versioned and never change</li>
        <li>Consider a Service Worker to cache the files across sessions</li>
      </ul>`,
      'body.security': `<h2>O fator de ocultação é sua chave privada</h2>
      <p>A informação mais crítica na Piilo é o fator de ocultação <code>r</code>. É a única coisa necessária para:</p>
      <ul>
        <li>Abrir seu compromisso on-chain (revelar seu saldo)</li>
        <li>Participar de futuras transferências (gerar provas válidas)</li>
      </ul>
      <blockquote>
        <p>Se <code>r</code> for <strong>perdido</strong> → seu XLM fica bloqueado (até a recuperação pela janela de eventos)<br>
        Se <code>r</code> for <strong>roubado</strong> → seu saldo fica exposto (mas o XLM permanece seguro — somente você pode assinar transações)</p>
      </blockquote>
      <p><strong>Trate os backups do <code>localStorage</code> como frases semente.</strong></p>
      <h2>Riscos por categoria</h2>
      <h3>Perda do estado local</h3>
      <p><strong>Risco:</strong> <code>localStorage</code> é apagado (reset do navegador, sessão anônima, reinstalação do SO)<br>
      <strong>Impacto:</strong> Não é possível gerar provas → não é possível sacar ou transferir<br>
      <strong>Mitigação:</strong> Chame <code>exportBackup()</code> após cada depósito, transferência e liquidação. Armazene o backup criptografado, fora do dispositivo.</p>
      <h3>Backup roubado</h3>
      <p><strong>Risco:</strong> O JSON de backup é lido por um invasor<br>
      <strong>Impacto:</strong> O invasor conhece seu saldo em texto simples e o fator de ocultação<br>
      <strong>Mitigação:</strong></p>
      <pre><code class="language-typescript">const backup = await piilo.exportBackup()
const encrypted = await encryptWithPassword(backup, userPassword)
// armazene \`encrypted\`, não \`backup\`</code></pre>
      <h3>Extensão de navegador comprometida</h3>
      <p><strong>Risco:</strong> Uma extensão de navegador maliciosa lê o <code>localStorage</code><br>
      <strong>Impacto:</strong> O invasor aprende <code>r</code> e o saldo<br>
      <strong>Mitigação:</strong> Use um perfil de navegador dedicado a aplicações financeiras; audite as extensões instaladas.</p>
      <h3>Ataque man-in-the-middle nos arquivos de circuito</h3>
      <p><strong>Risco:</strong> Arquivos <code>.zkey</code> ou <code>.wasm</code> são servidos a partir de um CDN comprometido<br>
      <strong>Impacto:</strong> Circuitos modificados maliciosamente poderiam permitir falsificação de provas</p>
      <h3>Backup desatualizado levando a fundos bloqueados</h3>
      <p><strong>Impacto:</strong> <code>importBackup()</code> lança erro; o backup não coincide com o compromisso on-chain<br>
      <strong>Mitigação:</strong> Exporte imediatamente após cada operação, substitua backups antigos.</p>
      <h3>Sessões simultâneas em múltiplos dispositivos</h3>
      <p><strong>Risco:</strong> Dois dispositivos operam simultaneamente<br>
      <strong>Impacto:</strong> Apenas o estado de um dispositivo será válido; o outro fica permanentemente dessincronizado<br>
      <strong>Mitigação:</strong> Nunca opere de dois dispositivos ao mesmo tempo. Sempre importe um backup atualizado antes de usar um segundo dispositivo.</p>
      <h2>Fluxo de trabalho de backup recomendado</h2>
      <pre><code class="language-typescript">async function safeDeposit(
  piilo: Piilo,
  amount: bigint,
  saveBackup: (json: string) => Promise&lt;void&gt;
) {
  await piilo.deposit(amount)
  const backup = await piilo.exportBackup()
  await saveBackup(backup)
}</code></pre>`,
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
