import { db, collection, getDocs } from "../firebase/database.js"; // Make sure db is properly initialized

document.addEventListener("DOMContentLoaded", async () => {
    const profileContainer = document.getElementById("profile-container");

    async function fetchEmployeeProfiles() {
        try {
            const querySnapshot = await getDocs(collection(db, "employees"));
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Create a profile card for each employee
                const profileCard = document.createElement("div");
                profileCard.classList.add("profile-card");

                profileCard.innerHTML = `
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


function openEditModal() {
    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

function saveProfile() {
    // Get input values from the form
    const name = document.getElementById("editName").value;
    const username = document.getElementById("editUsername").value;
    const password = document.getElementById("editPassword").value;
    const address = document.getElementById("editAddress").value;
    const email = document.getElementById("editEmail").value;

    // Implement save functionality, e.g., update Firebase or local data
    console.log("Profile updated:", { name, username, password, address, email });

    // Close the modal after saving
    closeEditModal();
}

// Close modal when clicking outside the modal content
window.onclick = function(event) {
    const modal = document.getElementById("editModal");
    if (event.target === modal) {
        closeEditModal();
    }
}
