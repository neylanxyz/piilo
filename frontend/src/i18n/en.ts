const en = {
  'nav.docs':   'Docs',
  'nav.github': 'GitHub',

  'hero.headline':      'Private payments<br>on Stellar.',
  'hero.sub':           'ZK proofs generated in your browser. Balances stored as <strong>Pedersen commitments</strong> — the chain sees a point on a curve, not a number. No one sees your balance.',
  'hero.cta.primary':   'Read the Docs',
  'hero.cta.secondary': 'Try the Wallet',

  'how.h2':          'Public entry.<br>Private interior.',
  'how.step1.id':    'Deposit',
  'how.step1.title': 'XLM enters the contract',
  'how.step1.body':  'You send XLM publicly. The contract mints a Pedersen commitment — a random blinding factor plus your amount, encoded as a JubJub curve point. This is the only moment the amount is observable.',
  'how.step1.badge': 'amount visible once',
  'how.step2.id':    'Transfer',
  'how.step2.title': 'Proof generated in your browser',
  'how.step2.body':  "The SDK generates a Groth16 proof that you know the opening of your commitment and that you're sending a valid amount. The recipient receives an encrypted note — only their key can decrypt it.",
  'how.step2.badge': 'amount hidden forever',
  'how.step3.id':    'Withdraw',
  'how.step3.title': 'Prove ownership, receive XLM',
  'how.step3.body':  'To exit, you generate a withdrawal proof: you know the balance and blinding factor that open your on-chain commitment. The contract verifies the proof and releases XLM to your address.',
  'how.step3.badge': 'balance never revealed',

  'sdk.h2':   'Four calls.<br>Full lifecycle.',
  'sdk.desc': 'Install the SDK, connect your wallet, and you have confidential payments. Proof generation, note encryption, state management, and Stellar transaction submission are handled for you.',
  'sdk.cta':  'View quickstart guide →',

  'spec.h2': "What's under the hood.",

  'footer.tagline':          'Private payments on Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Quickstart',
} as const

export type I18nKey = keyof typeof en
export default en
