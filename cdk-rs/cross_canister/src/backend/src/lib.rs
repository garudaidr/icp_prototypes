use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api::call::call, api::call::CallResult};
use ic_cdk_macros::*;
use serde::Serialize;

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

const DATABASE_CANISTER_ID: &str = "your-database-canister-id";

#[update]
async fn add_user(username: String) -> Result<Vec<String>, String> {
    let database_principal = Principal::from_text(DATABASE_CANISTER_ID).expect("Invalid principal");
    let call_result: CallResult<(InsertResponse,)> =
        call(database_principal, "insert", (username,)).await;

    match call_result {
        Ok(response) => Ok(response.0.users),
        Err((_, msg)) => Err(msg),
    }
}

#[query]
async fn get_users() -> Result<Vec<String>, String> {
    let database_principal = Principal::from_text(DATABASE_CANISTER_ID).expect("Invalid principal");
    let call_result: CallResult<(QueryResponse,)> = call(database_principal, "query", ()).await;

    match call_result {
        Ok(response) => Ok(response.0.users),
        Err((_, msg)) => Err(msg),
    }
}

// Enable Candid export
ic_cdk::export_candid!();
