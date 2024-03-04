use candid::{CandidType, Deserialize};
use ic_cdk_macros::*;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::BTreeMap;

type UserStore = BTreeMap<usize, String>;

thread_local! {
    static USERS: RefCell<UserStore> = RefCell::default();
}

#[derive(CandidType, Deserialize, Serialize)]
struct Error {
    message: String,
}

#[update]
async fn add_user(username: String) -> Result<String, String> {
    USERS.with(|users| {
        let mut users = users.borrow_mut();

        let new_id = users.len() + 1; // Simple way to generate a new ID. Consider a more robust method for production.
        users.insert(new_id, username.clone());

        let usernames: Vec<String> = users.values().cloned().collect();
        let res = serde_json::to_string(&usernames).unwrap();
        Ok(res)
    })
}

#[query]
fn get_users() -> Result<String, String> {
    USERS.with(|users| {
        let users = users.borrow();

        let usernames: Vec<String> = users.values().cloned().collect();
        let res = serde_json::to_string(&usernames).unwrap();
        Ok(res)
    })
}

#[query]
fn search_users(query: String) -> Result<String, String> {
    USERS.with(|users| {
        let users = users.borrow();

        // Filter the users whose usernames contain the query string
        let filtered_usernames: Vec<String> = users
            .values()
            .filter(|username| username.to_lowercase().contains(&query.to_lowercase()))
            .cloned()
            .collect();

        // Convert the filtered list of usernames to a JSON string
        match serde_json::to_string(&filtered_usernames) {
            Ok(res) => Ok(res),
            Err(e) => Err(format!("Failed to serialize usernames: {}", e)),
        }
    })
}

// Enable Candid export
ic_cdk::export_candid!();
