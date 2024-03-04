import { backend } from "../../declarations/backend";

const dbDisplay = document.getElementById("dbDisplay");
const usernameInput = document.getElementById("usernameInput");
const getUserBtn = document.getElementById("getUserBtn");
const addUserBtn = document.getElementById("addUserBtn");

const updateDbDisplay = (users) => {
  dbDisplay.textContent = `Users: ${JSON.stringify(users)}`;
};

const getUsers = async () => {
  try {
    const users = await backend.get_users();
    updateDbDisplay(users.Ok);
  } catch (error) {
    console.error("Failed to get users: ", error);
    dbDisplay.textContent = "Failed to load users.";
  }
};

const addUser = async () => {
  const username = usernameInput.value.trim();
  if (username === "") {
    console.log("Username is required.");
    return; // Ignore empty username
  }

  try {
    const users = await backend.add_user(username);
    if (users.Ok) {
      updateDbDisplay(users.Ok);
    }
    if (users.Err) {
      console.log("There was some error: ", users.Err);
    }
  } catch (error) {
    console.error("Failed to add user: ", error);
  }

  usernameInput.value = ""; // Clear the input field after adding
};

getUserBtn.addEventListener("click", getUsers);
addUserBtn.addEventListener("click", addUser);

// Get references to the new UI elements
const searchInput = document.getElementById("searchInput");
const searchUserBtn = document.getElementById("searchUserBtn");

const searchUsers = async () => {
  const query = searchInput.value.trim();
  if (query === "") {
    console.log("Search query is required.");
    return; // Ignore empty query
  }

  try {
    const users = await backend.search_users(query); // Adjust based on your actual backend function
    if (users.Ok) {
      updateDbDisplay(users.Ok);
    } else if (users.Err) {
      console.log("There was some error: ", users.Err);
    }
  } catch (error) {
    console.error("Failed to search users: ", error);
    dbDisplay.textContent = "Failed to search users.";
  }

  searchInput.value = ""; // Clear the input field after searching
};

// Bind the searchUsers function to the search button
searchUserBtn.addEventListener("click", searchUsers);

getUsers(); // Initial call to populate the users display
