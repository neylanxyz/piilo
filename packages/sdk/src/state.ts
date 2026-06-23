// Local plaintext state: balance and blinding factor.
// The contract stores only commitments — the user must keep these locally to
// open them (for proof generation) and to know their balance.
//
// Recovery: if state is lost, the user cannot re-open their commitment without
// r. They need either a backup or relay-assisted recovery within the 7-day RPC
// event window.

export interface Note {
  from: string;
  amount: bigint;
  r_A: bigint;
}

export interface LocalState {
  balance: bigint;
  r: bigint;
  pendingNotes: Note[];
}

const EMPTY: LocalState = { balance: 0n, r: 0n, pendingNotes: [] };

// JubJub H generator has group order 4*r_J, not FR_Q.
// Blinding factors accumulate mod this value so the circuit (Num2Bits(255)) can
// always accept the accumulated value: 4*r_J < FR_Q < 2^255.
// r_J = ZCash JubJub prime-order subgroup order.
const JUBJUB_H_ORDER = 26217937587563095239723870254092982918823685063489269125461436649568733016796n;

function addBlindMod(a: bigint, b: bigint): bigint {
  return (a + b) % JUBJUB_H_ORDER;
}

// contractId is included so XLM and USDC instances for the same wallet don't collide.
function storageKey(address: string, contractId: string): string {
  return `piilo:state:${address}:${contractId}`;
}

export function loadState(address: string, contractId: string): LocalState {
  if (typeof localStorage === "undefined") return { ...EMPTY, pendingNotes: [] };
  const raw = localStorage.getItem(storageKey(address, contractId));
  if (!raw) return { ...EMPTY, pendingNotes: [] };
  const parsed = JSON.parse(raw);
  const rawR = BigInt(parsed.r);
  return {
    balance: BigInt(parsed.balance),
    r: rawR % JUBJUB_H_ORDER,
    pendingNotes: (parsed.pendingNotes ?? []).map((n: { from: string; amount: string; r_A: string }) => ({
      from: n.from,
      amount: BigInt(n.amount),
      r_A: BigInt(n.r_A),
    })),
  };
}

export function saveState(address: string, contractId: string, state: LocalState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    storageKey(address, contractId),
    JSON.stringify({
      balance: state.balance.toString(),
      r: state.r.toString(),
      pendingNotes: state.pendingNotes.map((n) => ({
        from: n.from,
        amount: n.amount.toString(),
        r_A: n.r_A.toString(),
      })),
    })
  );
}

export function applyDeposit(state: LocalState, amount: bigint, r_dep: bigint): LocalState {
  // Blinding factors add homomorphically (C_old + C_dep = C(B+amount, r+r_dep)).
  // Reduce mod the group order of H so the accumulated r stays in [0, 4*r_J)
  // and the circuit's Num2Bits(255) can always decompose it.
  return { ...state, balance: state.balance + amount, r: addBlindMod(state.r, r_dep) };
}

export function applySend(state: LocalState, amount: bigint, r_new: bigint): LocalState {
  return { ...state, balance: state.balance - amount, r: r_new };
}

export function applyReceiveNote(state: LocalState, note: Note): LocalState {
  return { ...state, pendingNotes: [...state.pendingNotes, note] };
}

export function applySettle(state: LocalState): LocalState {
  const totalAmount = state.pendingNotes.reduce((s, n) => s + n.amount, 0n);
  const totalR = state.pendingNotes.reduce((s, n) => s + n.r_A, 0n);
  return {
    balance: state.balance + totalAmount,
    r: addBlindMod(state.r, totalR),
    pendingNotes: [],
  };
}
