import type { I18nKey } from './en'

const es: Record<I18nKey, string> = {
  'nav.docs':     'Docs',
  'nav.examples': 'Ejemplos',
  'nav.github':   'GitHub',

  'hero.headline':      'Confidencialidad financiera<br>en Stellar.',
  'hero.sub':           'SDK plug-and-play. Pruebas ZK generadas en tu navegador. Saldos almacenados como <strong>compromisos Pedersen</strong> — la red ve un punto en una curva, no un número.<img src="/xlm.png" alt="XLM" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;"><img src="/usdc.png" alt="USDC" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;">',
  'hero.cta.primary':   'Leer la documentación',
  'hero.cta.secondary': 'Ver ejemplos →',
  'hero.cta.payroll':   'Demo de nómina',

  'examples.h1':  'Demos en vivo<br>en Stellar Testnet.',
  'examples.sub': 'Conecta Freighter, financia una cuenta testnet y prueba los pagos confidenciales de verdad. Sin configuración necesaria.',

  'examples.wallet.title': 'Cartera Confidencial',
  'examples.wallet.desc':  'Demo individual del ciclo completo de privacidad: depositar, transferir de forma privada, liquidar transferencias recibidas y retirar.',
  'examples.wallet.f1':    'Depositar XLM o USDC',
  'examples.wallet.f2':    'Enviar con prueba ZK — monto oculto on-chain',
  'examples.wallet.f3':    'Recibir y liquidar transferencias entrantes',
  'examples.wallet.f4':    'Consola de auditoría para descifrar montos',
  'examples.wallet.cta':   'Abrir cartera →',

  'examples.payroll.title': 'Nómina Confidencial',
  'examples.payroll.desc':  'Ejecución de nómina para múltiples destinatarios: agrega empleados, establece montos y envía todas las transferencias de forma confidencial — aprueba cada una en Freighter.',
  'examples.payroll.f1':    'Agregar destinatarios con nombre y dirección',
  'examples.payroll.f2':    'Establecer montos por destinatario en XLM o USDC',
  'examples.payroll.f3':    'Transferencias secuenciales — una aprobación en Freighter por cada una',
  'examples.payroll.f4':    'Estado en vivo por fila durante la ejecución',
  'examples.payroll.cta':   'Abrir nómina →',

  'examples.note': 'Ambas demos usan contratos de Stellar Testnet. Obtén XLM testnet del Stellar Friendbot y USDC testnet del emissor USDC testnet.',

  'how.h2':          'Entrada pública.<br>Interior privado.',
  'how.step1.id':    'Depositar',
  'how.step1.title': 'Los fondos entran al contrato',
  'how.step1.body':  'Envías XLM o USDC públicamente. El contrato crea un compromiso Pedersen — un factor de cegamiento aleatorio más tu monto, codificado como un punto en la curva JubJub. Este es el único momento en que el monto es observable.',
  'how.step1.badge': 'monto visible una vez',
  'how.step2.id':    'Transferir',
  'how.step2.title': 'Prueba generada en tu navegador',
  'how.step2.body':  'El SDK genera una prueba Groth16 de que conoces la apertura de tu compromiso y que estás enviando un monto válido. El destinatario recibe una nota cifrada — solo su clave puede descifrarla.',
  'how.step2.badge': 'monto oculto para siempre',
  'how.step3.id':    'Retirar',
  'how.step3.title': 'Prueba de propiedad, sal de la privacidad',
  'how.step3.body':  'Para salir, generas una prueba de retiro: conoces el saldo y el factor de cegamiento que abren tu compromiso on-chain. El contrato verifica la prueba y libera los fondos a tu dirección. El saldo se revela como parte de esta salida voluntaria.',
  'how.step3.badge': 'salida voluntaria de privacidad',

  'sdk.h2':   'Cuatro llamadas.<br>Ciclo completo.',
  'sdk.desc': 'Instala el SDK, conecta tu cartera y tendrás pagos confidenciales. Compatible con cualquier token. La generación de pruebas, el cifrado de notas, la gestión de estado y el envío de transacciones Stellar se gestionan automáticamente.',
  'sdk.cta':  'Ver guía de inicio rápido →',

  'spec.h2': '¿Qué hay bajo el capó?',

  'spec.auditor.term': 'Hook de auditoría de cumplimiento',
  'spec.auditor.sub':  'JubJub ECDH · por transferencia',
  'spec.auditor.def':  'Cada transferencia cifra el monto bajo una clave pública de auditor registrada mediante JubJub ECDH: el emisor calcula un secreto compartido con la clave del auditor y enmascara el monto como A_enc = A + S.x. El auditor puede descifrar todos los montos de transferencia usando su escalar privado — nadie más puede. Las direcciones son siempre públicas por diseño; solo los montos están ocultos.',

  'roadmap.label': 'roadmap',
  'roadmap.h2':   'Construido para durar.<br>Lanzado por etapas.',
  'roadmap.now':  'ahora',

  'roadmap.v01.version': 'v0.1',
  'roadmap.v01.title':   'Lanzamiento',
  'roadmap.v01.body':    'SDK publicado en npm como @neylanxyz/piilo. Git tag v0.1.0. Contratos en testnet activos. Docs completos, quickstart y dos demos funcionales.',

  'roadmap.v02.version': 'v0.2',
  'roadmap.v02.title':   'Refuerzo',
  'roadmap.v02.body':    'Auditoría de seguridad de terceros. UI de recuperación de estado para estado local perdido. Guía de onboarding institucional.',

  'roadmap.v03.version': 'v0.3',
  'roadmap.v03.title':   'Mainnet',
  'roadmap.v03.body':    'Despliegue del contrato en producción. Alineación activa con el estándar OpenZeppelin Confidential Token — ahora disponible en testnet de Stellar.',

  'roadmap.v10.version': 'v1.0',
  'roadmap.v10.title':   'Ecosistema',
  'roadmap.v10.body':    'Colaboración activa con SDF. Soporte de integración con Fireblocks y Anchorage. Propuesta SEP de token confidencial enviada.',

  'roadmap.v20.version': 'v2.0',
  'roadmap.v20.title':   'Integración OZ',
  'roadmap.v20.body':    'Piilo se convierte en la implementación SPP de referencia en Stellar — ocultando partes y montos — complementando los Confidential Tokens de OpenZeppelin (en testnet desde junio 2026), que ocultan solo montos. Dos niveles de privacidad reconocidos, un ecosistema.',

  'fees.label': 'tarifas',
  'fees.h2': 'Simple.<br>Predecible.',
  'fees.sub': 'Sin suscripción. Sin mínimos mensuales. Solo pagas cuando el valor se mueve.',
  'fees.deposit.label': 'Depósito',
  'fees.deposit.fee': '0.1%',
  'fees.deposit.desc': 'Tarifa única de entrada cuando los fondos ingresan al pool privado.',
  'fees.transfer.label': 'Transferencia',
  'fees.transfer.fee': '0.1 token',
  'fees.transfer.desc': 'Tarifa fija por transferencia privada en el token utilizado — 0.1 XLM o 0.1 USDC.',
  'fees.withdraw.label': 'Retiro',
  'fees.withdraw.fee': '0.3%',
  'fees.withdraw.desc': 'Tarifa de salida al retirar del pool privado.',

  'footer.tagline':          'Pagos privados en Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Inicio rápido',
}

export default es
