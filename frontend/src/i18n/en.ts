const en = {
  'nav.docs':      'Docs',
  'nav.examples':  'Examples',
  'nav.github':    'GitHub',

  'hero.headline':      'Financial confidentiality<br>on Stellar.',
  'hero.sub':           'Plug-and-play SDK. ZK proofs generated in your browser. Balances stored as <strong>Pedersen commitments</strong> — the chain sees a point on a curve, not a number.<img src="/xlm.png" alt="XLM" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;"><img src="/usdc.png" alt="USDC" style="width:1.5em;height:1.5em;vertical-align:middle;border-radius:6px;margin-left:0.4em;display:inline-block;">',
  'hero.cta.primary':   'Read the Docs',
  'hero.cta.secondary': 'See Examples →',
  'hero.cta.payroll':   'Try Payroll Demo',

  'examples.h1':  'Live demos<br>on Stellar Testnet.',
  'examples.sub': 'Connect Freighter, fund a testnet account, and try confidential payments for real. No setup required.',

  'examples.wallet.title': 'Confidential Wallet',
  'examples.wallet.desc':  'Single-user demo of the full privacy lifecycle: deposit, transfer privately, settle incoming transfers, and withdraw.',
  'examples.wallet.f1':    'Deposit XLM or USDC',
  'examples.wallet.f2':    'Send with ZK proof — amount hidden on-chain',
  'examples.wallet.f3':    'Receive and settle incoming transfers',
  'examples.wallet.f4':    'Auditor console to decrypt amounts',
  'examples.wallet.cta':   'Launch wallet →',

  'examples.payroll.title': 'Confidential Payroll',
  'examples.payroll.desc':  'Multi-recipient payroll run: add employees, set amounts, and send all transfers privately in one click.',
  'examples.payroll.f1':    'Add recipients with name and address',
  'examples.payroll.f2':    'Set per-recipient amounts in XLM or USDC',
  'examples.payroll.f3':    'Run payroll — transfers execute sequentially',
  'examples.payroll.f4':    'Live per-row status during the run',
  'examples.payroll.cta':   'Launch payroll →',

  'examples.note': 'Both demos use Stellar Testnet contracts. Get testnet XLM from the Stellar Friendbot, and testnet USDC from the USDC testnet issuer.',

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

  'roadmap.label': 'roadmap',
  'roadmap.h2':   'Built to last.<br>Shipped in stages.',
  'roadmap.now':  'now',

  'roadmap.v01.version': 'v0.1',
  'roadmap.v01.title':   'Ship',
  'roadmap.v01.body':    'Public SDK release on npm. Git tag v0.1.0. Testnet contracts live. Full docs, quickstart, and two working demos.',

  'roadmap.v02.version': 'v0.2',
  'roadmap.v02.title':   'Harden',
  'roadmap.v02.body':    'Third-party security audit. State recovery UI for lost local state. Institutional onboarding guide.',

  'roadmap.v03.version': 'v0.3',
  'roadmap.v03.title':   'Mainnet',
  'roadmap.v03.body':    'Production contract deployment. Alignment with OpenZeppelin confidential token standard interface.',

  'roadmap.v10.version': 'v1.0',
  'roadmap.v10.title':   'Ecosystem',
  'roadmap.v10.body':    'Active SDF engagement. Fireblocks and Anchorage integration support. Confidential token SEP proposal submitted.',

  'roadmap.v20.version': 'v2.0',
  'roadmap.v20.title':   'OZ Integration',
  'roadmap.v20.body':    'Adopt OpenZeppelin confidential token interface as the canonical standard. Piilo becomes the reference implementation on Stellar.',

  'footer.tagline':          'Private payments on Stellar',
  'footer.links.docs':       'Docs',
  'footer.links.quickstart': 'Quickstart',
} as const

export type I18nKey = keyof typeof en
export default en
