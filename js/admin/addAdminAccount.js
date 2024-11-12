import {
  doc,
  setDoc,
  db,
} from "../firebase/database.js";

// Function to add an admin account
async function addAdminAccount(adminId, username, password) {
    try {
        // Create or overwrite the document in the 'admins' collection
        await setDoc(doc(db, "admins", adminId), { username, password });
        console.log(`Admin account '${username}' created successfully with ID '${adminId}'.`);
    } catch (error) {
        console.error("Error adding admin account:", error);
    }
}

// Example admin accounts
addAdminAccount("admin", "admin1", "admin1");