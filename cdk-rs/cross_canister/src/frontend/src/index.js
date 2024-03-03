import { backend } from "../../declarations/backend";

document.addEventListener("DOMContentLoaded", async () => {
  const principalId = "bkyz2-fmaaa-aaaaa-qaaaq-cai";

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
      updateDbDisplay(users.Ok);
    } catch (error) {
      console.error("Failed to add user: ", error);
    }

    usernameInput.value = ""; // Clear the input field after adding
  };

  getUserBtn.addEventListener("click", getUsers);
  addUserBtn.addEventListener("click", addUser);

  getUsers(); // Initial call to populate the users display
});
