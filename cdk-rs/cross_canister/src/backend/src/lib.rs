use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api::call::call, api::call::CallResult};
use ic_cdk_macros::*;
use serde::Serialize;
use std::cell::RefCell;

thread_local! {
    static USERNAMES: RefCell<Vec<String>> = RefCell::new(Vec::new());
}

#[derive(CandidType, Deserialize, Serialize)]
struct QueryResponse {
    users: Vec<String>,
}

#[derive(CandidType, Deserialize, Serialize)]
struct InsertResponse {
    users: Vec<String>,
}

#[derive(CandidType, Deserialize, Serialize)]
struct Error {
    message: String,
}

const DATABASE_CANISTER_ID: &str = "bd3sg-teaaa-aaaaa-qaaba-cai";

#[update]
async fn add_user(username: String) -> Result<Vec<String>, String> {
    let database_principal = Principal::from_text(DATABASE_CANISTER_ID).expect("Invalid principal");
    let call_result: CallResult<(InsertResponse,)> =
        call(database_principal, "insert", (username.clone(),)).await;

    match call_result {
        Ok(response) => {
            USERNAMES.with(|usernames| {
                let mut usernames = usernames.borrow_mut();
                *usernames = response.0.users.clone();
            });
            Ok(response.0.users)
        }
        Err((_, msg)) => Err(msg),
    }
}

#[query]
async fn get_users() -> Result<Vec<String>, String> {
    USERNAMES.with(|usernames| Ok(usernames.borrow().clone()))
}

// Enable Candid export
ic_cdk::export_candid!();
