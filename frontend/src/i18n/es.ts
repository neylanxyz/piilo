import type { I18nKey } from './en'

const es: Record<I18nKey, string> = {
  'nav.docs':   'Docs',
  'nav.github': 'GitHub',

  'hero.headline':      'Pagos privados<br>en la Stellar.',
  'hero.sub':           'Pruebas ZK generadas en tu navegador. Saldos almacenados como <strong>compromisos Pedersen</strong> — la red ve un punto en una curva, no un número. Nadie ve tu saldo.',
  'hero.cta.primary':   'Leer la documentación',
  'hero.cta.secondary': 'Probar la cartera',

  'how.h2':          'Entrada pública.<br>Interior privado.',
  'how.step1.id':    'Depositar',
  'how.step1.title': 'XLM entra en el contrato',
  'how.step1.body':  'Envías XLM públicamente. El contrato crea un compromiso Pedersen — un factor de cegamiento aleatorio más tu monto, codificado como un punto en la curva JubJub. Este es el único momento en que el monto es observable.',
  'how.step1.badge': 'monto visible una vez',
  'how.step2.id':    'Transferir',
  'how.step2.title': 'Prueba generada en tu navegador',
  'how.step2.body':  'El SDK genera una prueba Groth16 de que conoces la apertura de tu compromiso y que estás enviando un monto válido. El destinatario recibe una nota cifrada — solo su clave puede descifrarla.',
  'how.step2.badge': 'monto oculto para siempre',
  'how.step3.id':    'Retirar',
  'how.step3.title': 'Prueba de propiedad, recibe XLM',
  'how.step3.body':  'Para salir, generas una prueba de retiro: conoces el saldo y el factor de cegamiento que abren tu compromiso on-chain. El contrato verifica la prueba y libera XLM a tu dirección.',
  'how.step3.badge': 'saldo nunca revelado',

  'sdk.h2':   'Cuatro llamadas.<br>Ciclo completo.',
  'sdk.desc': 'Instala el SDK, conecta tu cartera y tendrás pagos confidenciales. La generación de pruebas, el cifrado de notas, la gestión de estado y el envío de transacciones Stellar se gestionan automáticamente.',
  'sdk.cta':  'Ver guía de inicio rápido →',

  'spec.h2': '¿Qué hay bajo el capó?',

  'footer.tagline':          'Pagos privados en la Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Inicio rápido',
}

export default es
