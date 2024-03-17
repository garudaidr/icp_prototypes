use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk_macros::*;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::BTreeMap;

type UserStore = BTreeMap<usize, User>;

thread_local! {
    static USERS: RefCell<UserStore> = RefCell::default();
    static INTERVAL_IN_SECONDS: RefCell<u64> = RefCell::default();
    static TIMERS: RefCell<ic_cdk_timers::TimerId> = RefCell::default();
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct User {
    principal: Principal,
    balance: u128,
}

#[derive(CandidType, Deserialize, Serialize)]
struct Error {
    message: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct BalanceOfQueryRequest {
    owner: Principal,
}

fn count_instructions(start_counter: u64, function_name: String) {
    ic_cdk::println!(
        "Running from {:?}, cycles used: {}",
        function_name,
        ic_cdk::api::instruction_counter() - start_counter
    );
}

fn call_context_count_instructions(start_counter: u64, function_name: String) {
    ic_cdk::println!(
        "Running from {:?}, cycles used: {}",
        function_name,
        ic_cdk::api::call_context_instruction_counter() - start_counter
    );
}

const LEDGER_CANISTER_ID: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";

async fn update_users(user: User) {
    let start_instructions = ic_cdk::api::call_context_instruction_counter();
    let ledger_principal = Principal::from_text(LEDGER_CANISTER_ID).expect("Invalid principal");

    let call_start_instructions = ic_cdk::api::call_context_instruction_counter();
    let req = BalanceOfQueryRequest {
        owner: user.principal.clone(),
    };
    let call_result: CallResult<(u128,)> =
        ic_cdk::call(ledger_principal, "icrc1_balance_of", (req,)).await;

    call_context_count_instructions(
        call_start_instructions,
        "ic_cdk::call icrc1_balance_of".to_string(),
    );

    USERS.with(|_users| {
        let mut mutable_users = _users.borrow_mut();
        let old_user = mutable_users
            .clone()
            .into_iter() // This gives us an iterator over the key-value pairs
            .find(|(_key, _user)| {
                _user
                    .principal
                    .to_string()
                    .contains(&user.principal.to_string())
            }); // Find the first user that matches the condition

        if let Some((key, _user)) = old_user {
            let response = call_result.map_err(|e| {
                ic_cdk::println!("An error occurred: {:?}", e);
            });

            let mut new_user = _user;
            match response {
                Ok(response) => {
                    new_user.balance = response.0;
                    mutable_users.remove(&key.clone());
                    mutable_users.insert(key, new_user);
                } // Update new value of icrc1 balance for each user
                _ => ic_cdk::println!("An error occurred while getting balance"),
            };
        } else {
            ic_cdk::println!("No matching user found.");
        }
    });

    call_context_count_instructions(start_instructions, "update_users".to_string());
}

#[ic_cdk::init]
async fn init() {
    let start_instructions = ic_cdk::api::instruction_counter();

    let seconds = 5;
    INTERVAL_IN_SECONDS.with(|interval_ref| {
        interval_ref.replace(seconds);
    });

    let interval = std::time::Duration::from_secs(seconds);
    ic_cdk::println!("Starting a periodic task with interval {:?}", interval);
    let timer_id = ic_cdk_timers::set_timer_interval(interval, || {
        USERS.with(|_users| {
            for user in _users.borrow().values() {
                ic_cdk::println!("Running from init: {:?}", user.principal);
                ic_cdk::spawn(update_users(user.clone()));
            }
        });
    });

    TIMERS.with(|timers_ref| {
        timers_ref.replace(timer_id);
    });

    count_instructions(start_instructions, "init".to_string());
}

#[query]
fn get_interval() -> Result<u64, Error> {
    let start_instructions = ic_cdk::api::instruction_counter();

    let res = INTERVAL_IN_SECONDS.with(|interval_ref| Ok(interval_ref.borrow().clone()));

    count_instructions(start_instructions, "get_interval".to_string());

    res
}

#[update]
fn set_interval(seconds: u64) -> Result<u64, Error> {
    let start_instructions = ic_cdk::api::instruction_counter();

    TIMERS.with(|timers_ref| {
        let timer_id = timers_ref.borrow().clone();
        ic_cdk_timers::clear_timer(timer_id);
    });

    let interval = std::time::Duration::from_secs(seconds);
    ic_cdk::println!("Starting a periodic task with interval {:?}", interval);
    let new_timer_id = ic_cdk_timers::set_timer_interval(interval, || {
        USERS.with(|_users| {
            for user in _users.borrow().values() {
                ic_cdk::println!("Running from set_interval: {:?}", user.principal);
                ic_cdk::spawn(update_users(user.clone()));
            }
        });
    });
    TIMERS.with(|timers_ref| {
        timers_ref.replace(new_timer_id);
    });

    INTERVAL_IN_SECONDS.with(|seconds_ref| {
        seconds_ref.replace(seconds);
    });

    count_instructions(start_instructions, "set_interval".to_string());

    Ok(seconds)
}

#[update]
async fn add_user(principal: String) -> Result<String, Error> {
    let start_instructions = ic_cdk::api::instruction_counter();

    let res = USERS.with(|users| {
        let mut users = users.borrow_mut();

        let new_id = users.len() + 1; // Simple way to generate a new ID
        let user = User {
            principal: Principal::from_text(&principal).unwrap(),
            balance: 1,
        };
        users.insert(new_id, user);

        let principals: Vec<User> = users.values().cloned().collect();
        let res = serde_json::to_string(&principals).unwrap();
        Ok(res)
    });

    count_instructions(start_instructions, "add_user".to_string());

    res
}

#[query]
fn get_users() -> Result<String, String> {
    let start_instructions = ic_cdk::api::instruction_counter();

    let res = USERS.with(|users| {
        let users = users.borrow();

        let principals: Vec<User> = users.values().cloned().collect();
        let res = serde_json::to_string(&principals).unwrap();
        Ok(res)
    });

    count_instructions(start_instructions, "get_users".to_string());

    res
}

#[query]
fn search_users(query: String) -> Result<String, String> {
    let start_instructions = ic_cdk::api::instruction_counter();

    let res = USERS.with(|users| {
        let users = users.borrow();

        // Filter the users whose principals contain the query string
        let filtered_principals: Vec<User> = users
            .values()
            .filter(|user| {
                user.principal
                    .to_string()
                    .to_lowercase()
                    .contains(&query.to_lowercase())
            })
            .cloned()
            .collect();

        // Convert the filtered list of principals to a JSON string
        match serde_json::to_string(&filtered_principals) {
            Ok(res) => Ok(res),
            Err(e) => Err(format!("Failed to serialize principals: {}", e)),
        }
    });

    count_instructions(start_instructions, "search_users".to_string());

    res
}

// Enable Candid export
ic_cdk::export_candid!();
