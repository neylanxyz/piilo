#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

// ~1 year at 5s/ledger
const TTL_EXTEND_TO: u32 = 6_307_200;
const TTL_THRESHOLD: u32 = 100_000;

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Piilo(Address), // token → piilo contract
}

#[contract]
pub struct Registry;

#[contractimpl]
impl Registry {
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Register or update a token → Piilo contract mapping. Admin only.
    pub fn set(env: Env, token: Address, piilo: Address) {
        require_admin(&env);
        env.storage()
            .persistent()
            .set(&DataKey::Piilo(token.clone()), &piilo);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Piilo(token), TTL_THRESHOLD, TTL_EXTEND_TO);
    }

    /// Remove a token from the registry. Admin only.
    pub fn remove(env: Env, token: Address) {
        require_admin(&env);
        env.storage().persistent().remove(&DataKey::Piilo(token));
    }

    /// Returns the Piilo contract address for a token, or None if not registered.
    pub fn get(env: Env, token: Address) -> Option<Address> {
        env.storage().persistent().get(&DataKey::Piilo(token))
    }

    /// Transfer admin to a new address.
    pub fn set_admin(env: Env, new_admin: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}

fn require_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn set_and_get() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let piilo = Address::generate(&env);

        let id = env.register(Registry, (admin.clone(),));
        let client = RegistryClient::new(&env, &id);

        assert_eq!(client.get(&token), None);
        client.set(&token, &piilo);
        assert_eq!(client.get(&token), Some(piilo.clone()));
    }

    #[test]
    fn remove() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let piilo = Address::generate(&env);

        let id = env.register(Registry, (admin.clone(),));
        let client = RegistryClient::new(&env, &id);

        client.set(&token, &piilo);
        client.remove(&token);
        assert_eq!(client.get(&token), None);
    }

    #[test]
    fn update_admin() {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let new_admin = Address::generate(&env);

        let id = env.register(Registry, (admin.clone(),));
        let client = RegistryClient::new(&env, &id);

        client.set_admin(&new_admin);
        assert_eq!(client.get_admin(), new_admin);
    }
}
