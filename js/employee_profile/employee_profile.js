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
                  <span class="label-profile">Name:</span>
                  <span class="value">${data.name}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Username:</span>
                  <span class="value">${data.username}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Password:</span>
                  <span class="value">${data.password}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Address:</span>
                  <span class="value">${data.address}</span>
              </div>
              <div class="profile-item">
                  <span class="label-profile">Email:</span>
                  <span class="value">${data.email}</span>
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
  fetchUserProfile(username)
    .then((data) => {
      // Populate the modal fields with the fetched data
      document.getElementById("editName").value = data.name || "";
      document.getElementById("editUsername").value = data.username || "";
      document.getElementById("editPassword").value = data.password || "";
      document.getElementById("editAddress").value = data.address || "";
      document.getElementById("editEmail").value = data.email || "";

      // Show the modal
      document.getElementById("editModal").style.display = "block";
    })
    .catch((error) => {
      console.error("Error loading profile data:", error);
      alert("Failed to load profile data.");
    });
}

// Function to fetch the user's profile data from Firebase
async function fetchUserProfile(username) {
  if (!username) {
    console.error("Username is undefined or null");
    return;
  }

  try {
    // Fetch the user profile from Firestore based on username
    const q = query(
      collection(db, "employees"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(q);

    // Check if the query returns any documents
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Assume username is unique
      return userDoc.data(); // Return profile data
    } else {
      throw new Error("No such document found for this username!");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Error fetching user profile: " + error.message);
  }
}

// Save updated profile data back to Firebase
async function saveProfile() {
  // Get input values from the form
  const updatedData = {
    name: document.getElementById("editName").value,
    username: document.getElementById("editUsername").value,
    password: document.getElementById("editPassword").value, 
    address: document.getElementById("editAddress").value,
    email: document.getElementById("editEmail").value,
  };

  try {
    const docRef = doc(db, "employees");

    // Update Firebase with the new data
    await updateDoc(docRef, updatedData);

    console.log("Profile updated successfully!");

    // Optionally, update displayed profile data without refreshing
    updateProfileDisplay(updatedData);

    // Close the modal after saving
    closeEditModal();
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
}

// Update profile display without page refresh
function updateProfileDisplay(data) {
  document.getElementById("employee-name").textContent = data.name || "N/A";
  document.getElementById("employee-username").textContent =
    data.username || "N/A";
  document.getElementById("employee-address").textContent =
    data.address || "N/A";
  document.getElementById("employee-email").textContent = data.email || "N/A";
}
