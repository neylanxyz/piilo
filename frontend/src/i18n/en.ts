const en = {
  'nav.docs':   'Docs',
  'nav.github': 'GitHub',

  'hero.headline':      'Private payments<br>on Stellar.',
  'hero.sub':           'ZK proofs generated in your browser. Balances stored as <strong>Pedersen commitments</strong> — the chain sees a point on a curve, not a number. Works with XLM and USDC.',
  'hero.cta.primary':   'Read the Docs',
  'hero.cta.secondary': 'Try the Wallet',
  'hero.cta.payroll':   'Try Payroll Demo',

  'how.h2':          'Public entry.<br>Private interior.',
  'how.step1.id':    'Deposit',
  'how.step1.title': 'Funds enter the contract',
  'how.step1.body':  'You send XLM or USDC publicly. The contract mints a Pedersen commitment — a random blinding factor plus your amount, encoded as a JubJub curve point. This is the only moment the amount is observable.',
  'how.step1.badge': 'amount visible once',
  'how.step2.id':    'Transfer',
  'how.step2.title': 'Proof generated in your browser',
  'how.step2.body':  "The SDK generates a Groth16 proof that you know the opening of your commitment and that you're sending a valid amount. The recipient receives an encrypted note — only their key can decrypt it.",
  'how.step2.badge': 'amount hidden forever',
  'how.step3.id':    'Withdraw',
  'how.step3.title': 'Prove ownership, exit privacy',
  'how.step3.body':  'To exit, you generate a withdrawal proof: you know the balance and blinding factor that open your on-chain commitment. The contract verifies the proof and releases funds to your address. The balance is revealed as part of this voluntary exit.',
  'how.step3.badge': 'voluntary privacy exit',

  'sdk.h2':   'Four calls.<br>Full lifecycle.',
  'sdk.desc': 'Install the SDK, connect your wallet, and you have confidential payments. Works with any token. Proof generation, note encryption, state management, and Stellar transaction submission are handled for you.',
  'sdk.cta':  'View quickstart guide →',

  'spec.h2': "What's under the hood.",

  'spec.auditor.term': 'Compliance Auditor Hook',
  'spec.auditor.sub':  'JubJub ECDH · per-transfer',
  'spec.auditor.def':  'Every transfer encrypts the amount under a registered auditor public key using JubJub ECDH: the sender computes a shared secret with the auditor\'s key and masks the amount as A_enc = A + S.x. The auditor can decrypt all transfer amounts using their private scalar — nobody else can. Addresses are always public by design; only amounts are hidden.',

  'footer.tagline':          'Private payments on Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Quickstart',
} as const

export type I18nKey = keyof typeof en
export default en
