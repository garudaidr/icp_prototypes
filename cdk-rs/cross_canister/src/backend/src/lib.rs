use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api::call::call, api::call::CallResult};
use ic_cdk_macros::*;
use serde::Serialize;
use std::cell::RefCell;

thread_local! {
    static USERNAMES: RefCell<String> = RefCell::new("[]".to_string());
}

#[derive(CandidType, Deserialize, Serialize)]
struct QueryResponse(Result<String, String>);

#[derive(Debug, CandidType, Deserialize, Serialize)]
struct InsertResponse(Result<String, String>);

#[derive(CandidType, Deserialize, Serialize)]
struct Error {
    message: String,
}

const DATABASE_CANISTER_ID: &str = "bd3sg-teaaa-aaaaa-qaaba-cai";

#[update]
async fn add_user(username: String) -> Result<String, String> {
    let database_principal = Principal::from_text(DATABASE_CANISTER_ID).expect("Invalid principal");
    let call_result: CallResult<(InsertResponse,)> =
        call(database_principal, "insert", (username.clone(),)).await;

    match call_result {
        Ok(response) => match response.0 .0 {
            Ok(usernames) => {
                USERNAMES.with(|state| *state.borrow_mut() = usernames.clone());
                Ok(usernames)
            }
            Err(e) => Err(e),
        },
        Err((_, msg)) => Err(msg),
    }
}

#[query]
async fn get_users() -> Result<String, String> {
    USERNAMES.with(|usernames| Ok(usernames.borrow().clone()))
}

// Enable Candid export
ic_cdk::export_candid!();
