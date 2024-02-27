use candid::CandidType;
use ic_cdk_macros::*;
use serde::Deserialize;
use std::cell::RefCell;

thread_local! {
    static RUNTIME_STATE: RefCell<RuntimeState> = RefCell::default();
}

#[derive(CandidType, Deserialize, Default)]
struct RuntimeState {
    data: Data
}

#[derive(CandidType, Deserialize, Default)]
struct Data {
    account: AccountItem
}

#[derive(CandidType, Deserialize, Clone, Default)]
struct AccountItem {
    account_id: String,
    balance: f64,
}

#[pre_upgrade]
fn pre_upgrade() {
    RUNTIME_STATE.with(|state| ic_cdk::storage::stable_save((&state.borrow().data,)).unwrap()); // passing tuple ( (x,) )
}

#[post_upgrade]
fn post_upgrade() {
    let (data,): (Data,) = ic_cdk::storage::stable_restore().unwrap();
    let runtime_state = RuntimeState {
        data
    };

    RUNTIME_STATE.with(|state| *state.borrow_mut() = runtime_state)
}

#[query]
fn check_balance() -> f64 {
    RUNTIME_STATE.with(|state| check_balance_impl(&state.borrow_mut()))
}

fn check_balance_impl(runtime_state: &RuntimeState) -> f64 {
    runtime_state.data.account.balance.clone()
}

#[update]
fn top_up(amount: f64) {
    RUNTIME_STATE.with(|state| top_up_impl(&mut state.borrow_mut(), amount))
}

fn top_up_impl(runtime_state: &mut RuntimeState, amount: f64) {
    runtime_state.data.account.balance += amount;
}

#[update]
fn withdraw(amount: f64) {
    RUNTIME_STATE.with(|state| withdraw_impl(&mut state.borrow_mut(), amount))
}

fn withdraw_impl(runtime_state: &mut RuntimeState, amount: f64) {
    runtime_state.data.account.balance -= amount;
}