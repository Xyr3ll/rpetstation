import {
  db,
  collection,
  getDocs,
  doc,
  query,
  updateDoc,
  where,
} from "../firebase/database.js"; // Import the necessary Firestore methods

// Declare openEditModal function globally
window.openEditModal = openEditModal;

document.addEventListener("DOMContentLoaded", () => {
  const profileContainer = document.getElementById("profile-container");

  // Function to fetch and display employee profiles from Firestore
  async function fetchEmployeeProfiles() {
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data); // Log the profile data to check for the presence of 'username'

        // Ensure 'username' exists before creating the profile card
        if (!data.username) {
          console.error(
            "Username is missing in Firestore data for document:",
            doc.id
          );
        }

        // Create a profile card for each employee
        const profileCard = document.createElement("div");
        profileCard.classList.add("profile-card");

        profileCard.innerHTML = `
        <span class="edit-icon" onclick="openEditModal('${data.username}')">
          <span class="material-icons-outlined">edit</span>
        </span>
          <h2>Employee Profile</h2>
          <div class="profile-icon">
              <img src="../images/defaultProfile.png" alt="Profile Icon">
          </div>
          <div class="profile-details">
              <div class="profile-item">
                  <span class="label-profile"">Name:</span>
                  <span class="value" id="employee-name">${data.name}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Username:</span>
                  <span class="value" id="employee-username">${data.username}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Password:</span>
                  <span class="value" id="employee-password">${data.password}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Address:</span>
                  <span class="value" id="employee-address">${data.address}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Email:</span>
                  <span class="value" id="employee-email">${data.email}</span>
              </div>
          </div>

        `;

        // Append the profile card to the main container
        profileContainer.appendChild(profileCard);
      });
    } catch (error) {
      console.log("Error getting documents:", error);
    }
  }

  // Call the function to fetch and display employee profiles
  fetchEmployeeProfiles();
});

// Function to open the edit modal
function openEditModal(username) {
  console.log("Opening modal for username:", username); // Log to check if the username is passed correctly
  if (!username) {
    console.error("Invalid username in openEditModal");
    alert("Invalid username.");
    return;
  }

  fetchUserProfile(username)
    .then((data) => {
      document.getElementById("editName").value = data.name || "";
      document.getElementById("editUsername").value = data.username || "";
      document.getElementById("editPassword").value = data.password || "";
      document.getElementById("editAddress").value = data.address || "";
      document.getElementById("editEmail").value = data.email || "";
      document.getElementById("editModal").style.display = "block";
    })
    .catch((error) => {
      console.error("Error loading profile data:", error);
      alert("Failed to load profile data.");
    });
}



// Function to fetch the user's profile data from Firebase
async function fetchUserProfile(username) {
  console.log("Fetching profile for username:", username); // Log username to ensure it's being passed correctly
  
  if (!username) {
    console.error("Username is undefined or null");
    return;
  }

  try {
    const q = query(
      collection(db, "employees"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data();
    } else {
      throw new Error("No such document found for this username!");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Error fetching user profile: " + error.message);
  }
}


// Save updated profile data back to Firebase
function saveProfile() {
  const username = document.getElementById("editUsername").value;
  if (!username) {
    console.error("Username is undefined or null");
    alert("Invalid username, cannot save profile.");
    return;
  }
  
  // Continue with the saving logic
  const updatedData = {
    name: document.getElementById("editName").value,
    username: username,
    password: document.getElementById("editPassword").value,
    address: document.getElementById("editAddress").value,
    email: document.getElementById("editEmail").value,
  };

  // Ensure that other fields are also correctly populated before saving
  updateFirestore(updatedData, username);
}


async function updateFirestore(updatedData, username) {
  try {
    const q = query(collection(db, "employees"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No such document found for this username!");
      alert("No such document found for this username!");
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const docRef = doc(db, "employees", userDoc.id);

    await updateDoc(docRef, updatedData);
    console.log("Profile updated successfully!");
    updateProfileDisplay(updatedData);
    closeEditModal();
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
}

// Update profile display without page refresh
function updateProfileDisplay(data) {
  document.getElementById("employee-name").textContent = data.name || "N/A";
  document.getElementById("employee-password").textContent = data.password || "N/A";
  document.getElementById("employee-username").textContent =
    data.username || "N/A";
  document.getElementById("employee-address").textContent =
    data.address || "N/A";
  document.getElementById("employee-email").textContent = data.email || "N/A";
}

window.saveProfile = saveProfile;
