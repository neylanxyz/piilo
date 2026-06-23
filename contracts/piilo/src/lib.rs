#![no_std]

mod commitment;
mod verifier;

#[cfg(test)]
mod test;

use commitment::Point;
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Bytes,
    BytesN, Env, Vec, U256,
};
use verifier::{Proof, VerificationKey, VerifierClient};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    G,
    H,
    Verifier,
    TransferVk,
    WithdrawVk,
    Token,
    VaultBalance,
    AuditorKey,
    Admin,
    Treasury,
    DepositFeeBps,
    WithdrawFeeBps,
    TransferFlatFee,
    Account(Address),
    NotePubkey(Address),
    PendingNotes(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct PendingNote {
    pub encrypted_note: Bytes,
    pub from: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ConfidentialAccount {
    pub balance_commitment: Point,
    pub pending_commitment: Point,
    pub has_pending: bool,
    pub nonce: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PiiloError {
    NotInitialized = 1,
    InvalidAmount = 2,
    InvalidProof = 3,
    NoPendingBalance = 4,
    InsufficientVault = 5,
}

#[contractevent(topics = ["deposit"])]
pub struct DepositEvent {
    pub user: Address,
    pub amount: i128, // credited (after fee)
    pub fee: i128,
}

#[contractevent(topics = ["transfer"])]
pub struct TransferEvent {
    pub from: Address,
    pub to: Address,
    pub encrypted_note: Bytes,
    /// Ephemeral JubJub public key R_e = r_e * H. Auditor ECDH: k_aud * R_e
    /// gives the same shared secret the prover used, letting the auditor
    /// recover A = a_enc_field - S.x (mod Fr).
    pub r_e: Point,
    /// A_enc = A + (r_e * K_aud).x — encrypted transfer amount, readable
    /// only by whoever holds the auditor private key k_aud.
    pub a_enc: BytesN<32>,
}

#[contractevent(topics = ["settle"])]
pub struct SettleEvent {
    pub user: Address,
}

#[contractevent(topics = ["withdraw"])]
pub struct WithdrawEvent {
    pub user: Address,
    pub amount: i128,  // proved amount (full)
    pub payout: i128,  // net to user after fee
    pub fee: i128,
}

const TTL_THRESHOLD: u32 = 100;
const TTL_EXTEND_TO: u32 = 518_400; // ~30 days at 5s ledgers

fn empty_account(env: &Env) -> ConfidentialAccount {
    let id = commitment::identity(env);
    ConfidentialAccount {
        balance_commitment: id.clone(),
        pending_commitment: id,
        has_pending: false,
        nonce: 0,
    }
}

fn load_account(env: &Env, owner: &Address) -> Result<ConfidentialAccount, PiiloError> {
    env.storage()
        .persistent()
        .get(&DataKey::Account(owner.clone()))
        .ok_or(PiiloError::NotInitialized)
}

fn save_account(env: &Env, owner: &Address, account: &ConfidentialAccount) {
    let key = DataKey::Account(owner.clone());
    env.storage().persistent().set(&key, account);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

/// Commitment coordinates are already Fr elements (that's the whole point
/// of moving to JubJub — see commitment.rs), so this is now the final,
/// correct public-input encoding, not a placeholder. Cross-contract, the
/// verifier's `Vec<Fr>` parameter is indistinguishable from `Vec<U256>` on
/// the wire — `Fr` is a host-side-only wrapper that doesn't survive into
/// the contract spec.
fn points_to_inputs(env: &Env, parts: &[&Point]) -> Vec<U256> {
    let mut inputs = Vec::new(env);
    for p in parts {
        inputs.push_back(p.x_fr().to_u256());
        inputs.push_back(p.y_fr().to_u256());
    }
    inputs
}

fn amount_to_input(env: &Env, amount: i128) -> U256 {
    commitment::fr_from_i128(env, amount).to_u256()
}

/// Calls the verifier and collapses every non-success outcome (rejected
/// proof, malformed inputs, host-level error) into a single InvalidProof —
/// callers shouldn't have to distinguish "proof was wrong" from "proof was
/// garbage".
fn verify(
    env: &Env,
    verifier: &Address,
    vk: &VerificationKey,
    proof: &Proof,
    inputs: &Vec<U256>,
) -> Result<(), PiiloError> {
    let result = VerifierClient::new(env, verifier).try_verify_proof(vk, proof, inputs);
    if result == Ok(Ok(true)) {
        Ok(())
    } else {
        Err(PiiloError::InvalidProof)
    }
}

#[contract]
pub struct Piilo;

#[contractimpl]
impl Piilo {
    pub fn __constructor(
        env: Env,
        g: Point,
        h: Point,
        verifier: Address,
        transfer_vk: VerificationKey,
        withdraw_vk: VerificationKey,
        token: Address,
        auditor_key: Point,
        admin: Address,
        treasury: Address,
        deposit_fee_bps: i128,
        withdraw_fee_bps: i128,
        transfer_flat_fee: i128,
    ) {
        env.storage().instance().set(&DataKey::G, &g);
        env.storage().instance().set(&DataKey::H, &h);
        env.storage().instance().set(&DataKey::Verifier, &verifier);
        env.storage().instance().set(&DataKey::TransferVk, &transfer_vk);
        env.storage().instance().set(&DataKey::WithdrawVk, &withdraw_vk);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::VaultBalance, &0i128);
        env.storage().instance().set(&DataKey::AuditorKey, &auditor_key);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::DepositFeeBps, &deposit_fee_bps);
        env.storage().instance().set(&DataKey::WithdrawFeeBps, &withdraw_fee_bps);
        env.storage().instance().set(&DataKey::TransferFlatFee, &transfer_flat_fee);
    }

    /// User sends `amount` of the native asset into the vault and supplies
    /// the blinding factor for its commitment. The amount is public here —
    /// deposit is the voluntary, visible entry point. No ZK proof needed:
    /// the contract computes C = amount*G + r*H itself, so there's nothing
    /// to verify it against (a redundant "verify the user's own commitment"
    /// step would just be extra surface for a bad replicated computation).
    pub fn deposit(env: Env, user: Address, amount: i128, blinding: BytesN<32>, note_pubkey: BytesN<32>) -> Result<(), PiiloError> {
        user.require_auth();
        if amount <= 0 {
            return Err(PiiloError::InvalidAmount);
        }

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).transfer(&user, &env.current_contract_address(), &amount);

        let fee_bps: i128 = env.storage().instance().get(&DataKey::DepositFeeBps).unwrap_or(0);
        let fee = amount * fee_bps / 10_000;
        if fee > 0 {
            let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
            token::Client::new(&env, &token).transfer(&env.current_contract_address(), &treasury, &fee);
        }
        let credited = amount - fee;

        let g: Point = env.storage().instance().get(&DataKey::G).unwrap();
        let h: Point = env.storage().instance().get(&DataKey::H).unwrap();
        let value_fr = commitment::fr_from_i128(&env, credited);
        let blinding_fr = soroban_sdk::crypto::bls12_381::Fr::from_bytes(blinding);
        let c = commitment::commit(&env, &value_fr, &blinding_fr, &g, &h);

        let mut account = env
            .storage()
            .persistent()
            .get(&DataKey::Account(user.clone()))
            .unwrap_or_else(|| empty_account(&env));
        account.balance_commitment = commitment::add(&env, &account.balance_commitment, &c);
        save_account(&env, &user, &account);

        let note_key = DataKey::NotePubkey(user.clone());
        env.storage().persistent().set(&note_key, &note_pubkey);
        env.storage().persistent().extend_ttl(&note_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        let vault: i128 = env.storage().instance().get(&DataKey::VaultBalance).unwrap();
        env.storage().instance().set(&DataKey::VaultBalance, &(vault + credited));

        DepositEvent { user, amount: credited, fee }.publish(&env);
        Ok(())
    }

    /// Moves a hidden amount from sender to recipient. `c_a` is the amount
    /// commitment (added to recipient.pending_commitment); `c_new` is the
    /// sender's post-transfer balance commitment. `proof` attests, without
    /// revealing the amount, that sender owned >= the transferred amount,
    /// that c_new opens to (old_balance - amount), and that `r_e`/`a_enc`
    /// are correctly formed for the registered auditor key. `encrypted_note`
    /// carries (amount, r_A) encrypted for the recipient.
    ///
    /// `r_e` is the ephemeral JubJub public key; `a_enc` is the transfer
    /// amount encrypted for the auditor (A + S.x in Fr, where S = r_e * K_aud
    /// in-circuit). Both are emitted as event data so the auditor can scan
    /// and decrypt offline — the contract never reads them beyond forwarding
    /// them into the proof's public inputs.
    pub fn transfer(
        env: Env,
        sender: Address,
        recipient: Address,
        c_a: Point,
        c_new: Point,
        proof: Proof,
        encrypted_note: Bytes,
        r_e: Point,
        a_enc: BytesN<32>,
    ) -> Result<(), PiiloError> {
        sender.require_auth();

        let mut sender_account = load_account(&env, &sender)?;

        let flat_fee: i128 = env.storage().instance().get(&DataKey::TransferFlatFee).unwrap_or(0);
        if flat_fee > 0 {
            let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
            let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            token::Client::new(&env, &token).transfer(&sender, &treasury, &flat_fee);
        }

        let auditor_key: Point = env.storage().instance().get(&DataKey::AuditorKey).unwrap();
        let a_enc_fr = soroban_sdk::crypto::bls12_381::Fr::from_bytes(a_enc.clone());
        let verifier_addr: Address = env.storage().instance().get(&DataKey::Verifier).unwrap();
        let vk: VerificationKey = env.storage().instance().get(&DataKey::TransferVk).unwrap();
        let mut inputs = points_to_inputs(
            &env,
            &[&sender_account.balance_commitment, &c_a, &c_new, &auditor_key, &r_e],
        );
        inputs.push_back(a_enc_fr.to_u256());
        verify(&env, &verifier_addr, &vk, &proof, &inputs)?;

        sender_account.balance_commitment = c_new;
        sender_account.nonce += 1;
        save_account(&env, &sender, &sender_account);

        let mut recipient_account = env
            .storage()
            .persistent()
            .get(&DataKey::Account(recipient.clone()))
            .unwrap_or_else(|| empty_account(&env));
        recipient_account.pending_commitment = commitment::add(&env, &recipient_account.pending_commitment, &c_a);
        recipient_account.has_pending = true;
        save_account(&env, &recipient, &recipient_account);

        let notes_key = DataKey::PendingNotes(recipient.clone());
        let mut notes: soroban_sdk::Vec<PendingNote> = env
            .storage()
            .persistent()
            .get(&notes_key)
            .unwrap_or_else(|| soroban_sdk::Vec::new(&env));
        notes.push_back(PendingNote { from: sender.clone(), encrypted_note: encrypted_note.clone() });
        env.storage().persistent().set(&notes_key, &notes);
        env.storage().persistent().extend_ttl(&notes_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        TransferEvent {
            from: sender,
            to: recipient,
            encrypted_note,
            r_e,
            a_enc,
        }
        .publish(&env);
        Ok(())
    }

    /// Owner-only. Merges pending_commitment into balance_commitment via EC
    /// addition — no proof needed, homomorphism handles correctness. This
    /// is the only thing allowed to mutate balance_commitment besides the
    /// owner's own transfer/withdraw, so an outgoing proof in flight can
    /// never be invalidated by someone else's incoming transfer.
    pub fn settle_pending(env: Env, user: Address) -> Result<(), PiiloError> {
        user.require_auth();
        let mut account = load_account(&env, &user)?;
        if !account.has_pending {
            return Err(PiiloError::NoPendingBalance);
        }

        account.balance_commitment = commitment::add(&env, &account.balance_commitment, &account.pending_commitment);
        account.pending_commitment = commitment::identity(&env);
        account.has_pending = false;
        account.nonce += 1;
        save_account(&env, &user, &account);

        env.storage().persistent().remove(&DataKey::PendingNotes(user.clone()));

        SettleEvent { user }.publish(&env);
        Ok(())
    }

    /// Voluntary privacy exit: proves ownership of the hidden balance, then
    /// reveals and pays it out. `amount` is public from here on.
    pub fn withdraw(env: Env, user: Address, amount: i128, proof: Proof) -> Result<(), PiiloError> {
        user.require_auth();
        if amount <= 0 {
            return Err(PiiloError::InvalidAmount);
        }

        let mut account = load_account(&env, &user)?;

        let vault: i128 = env.storage().instance().get(&DataKey::VaultBalance).unwrap();
        if amount > vault {
            return Err(PiiloError::InsufficientVault);
        }

        let verifier_addr: Address = env.storage().instance().get(&DataKey::Verifier).unwrap();
        let vk: VerificationKey = env.storage().instance().get(&DataKey::WithdrawVk).unwrap();
        let mut inputs = points_to_inputs(&env, &[&account.balance_commitment]);
        inputs.push_back(amount_to_input(&env, amount));
        verify(&env, &verifier_addr, &vk, &proof, &inputs)?;

        account.balance_commitment = commitment::identity(&env);
        account.nonce += 1;
        save_account(&env, &user, &account);

        env.storage().instance().set(&DataKey::VaultBalance, &(vault - amount));

        let fee_bps: i128 = env.storage().instance().get(&DataKey::WithdrawFeeBps).unwrap_or(0);
        let fee = amount * fee_bps / 10_000;
        let payout = amount - fee;

        let token: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        token::Client::new(&env, &token).transfer(&env.current_contract_address(), &user, &payout);
        if fee > 0 {
            let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
            token::Client::new(&env, &token).transfer(&env.current_contract_address(), &treasury, &fee);
        }

        WithdrawEvent { user, amount, payout, fee }.publish(&env);
        Ok(())
    }

    pub fn get_account(env: Env, user: Address) -> Option<ConfidentialAccount> {
        env.storage().persistent().get(&DataKey::Account(user))
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }

    pub fn get_auditor_key(env: Env) -> Point {
        env.storage().instance().get(&DataKey::AuditorKey).unwrap()
    }

    pub fn get_note_pubkey(env: Env, user: Address) -> Option<BytesN<32>> {
        env.storage().persistent().get(&DataKey::NotePubkey(user))
    }

    pub fn get_pending_notes(env: Env, user: Address) -> soroban_sdk::Vec<PendingNote> {
        env.storage()
            .persistent()
            .get(&DataKey::PendingNotes(user))
            .unwrap_or_else(|| soroban_sdk::Vec::new(&env))
    }

    pub fn get_vault_balance(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::VaultBalance).unwrap()
    }

    /// Admin-only: update protocol fee rates. deposit_fee_bps and
    /// withdraw_fee_bps are basis points (100 = 1%). transfer_flat_fee is
    /// in the native asset's smallest unit (stroops for XLM).
    pub fn set_fees(
        env: Env,
        deposit_fee_bps: i128,
        withdraw_fee_bps: i128,
        transfer_flat_fee: i128,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::DepositFeeBps, &deposit_fee_bps);
        env.storage().instance().set(&DataKey::WithdrawFeeBps, &withdraw_fee_bps);
        env.storage().instance().set(&DataKey::TransferFlatFee, &transfer_flat_fee);
    }

    pub fn get_fees(env: Env) -> (i128, i128, i128) {
        let deposit_fee_bps: i128 = env.storage().instance().get(&DataKey::DepositFeeBps).unwrap_or(0);
        let withdraw_fee_bps: i128 = env.storage().instance().get(&DataKey::WithdrawFeeBps).unwrap_or(0);
        let transfer_flat_fee: i128 = env.storage().instance().get(&DataKey::TransferFlatFee).unwrap_or(0);
        (deposit_fee_bps, withdraw_fee_bps, transfer_flat_fee)
    }

    pub fn get_treasury(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Treasury).unwrap()
    }
}
