import { backend } from '../../declarations/backend';
import { Principal } from '@dfinity/principal';

document.addEventListener("DOMContentLoaded", async () => {
  const dbDisplay = document.getElementById("dbDisplay");
  const usernameInput = document.getElementById("usernameInput");
  const getUserBtn = document.getElementById("getUserBtn");
  const addUserBtn = document.getElementById("addUserBtn");

  const updateDbDisplay = (users) => {
    dbDisplay.textContent = `Users: ${JSON.stringify(users)}`;
  };

  const getUsers = async () => {
    try {
      const principal = Principal.fromText("your-principal-id");
      const users = await backend.get_users(principal);
      updateDbDisplay(users);
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
      const principal = Principal.fromText("your-principal-id");
      const users = await backend.add_user(principal, username);
      updateDbDisplay(users);
    } catch (error) {
      console.error("Failed to add user: ", error);
    }

    usernameInput.value = ""; // Clear the input field after adding
  };

  getUserBtn.addEventListener("click", getUsers);
  addUserBtn.addEventListener("click", addUser);

  getUsers(); // Initial call to populate the users display
});
