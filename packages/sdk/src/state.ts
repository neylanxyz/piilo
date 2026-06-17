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

function storageKey(address: string): string {
  return `piilo:state:${address}`;
}

export function loadState(address: string): LocalState {
  if (typeof localStorage === "undefined") return { ...EMPTY, pendingNotes: [] };
  const raw = localStorage.getItem(storageKey(address));
  if (!raw) return { ...EMPTY, pendingNotes: [] };
  const parsed = JSON.parse(raw);
  return {
    balance: BigInt(parsed.balance),
    r: BigInt(parsed.r),
    pendingNotes: (parsed.pendingNotes ?? []).map((n: { from: string; amount: string; r_A: string }) => ({
      from: n.from,
      amount: BigInt(n.amount),
      r_A: BigInt(n.r_A),
    })),
  };
}

export function saveState(address: string, state: LocalState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    storageKey(address),
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
  if (state.balance === 0n && state.r === 0n) {
    // First deposit: r is just r_dep.
    return { ...state, balance: state.balance + amount, r: r_dep };
  }
  // Subsequent deposit: blinding factors add (homomorphism — C_old + C_new = C(B+amount, r+r_dep)).
  return { ...state, balance: state.balance + amount, r: state.r + r_dep };
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
    r: state.r + totalR,
    pendingNotes: [],
  };
}
