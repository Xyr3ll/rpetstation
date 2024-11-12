import { db, doc, getDoc } from "../firebase/database.js";

document.addEventListener("DOMContentLoaded", function () {
  // Close modal when clicking outside
  window.onclick = function (event) {
    const loginModal = document.getElementById("loginModal");
    if (event.target === loginModal) {
      loginModal.style.display = "none";
    }
  };

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const admin = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="password"]').value;

      try {
        // Retrieve admin document
        const docRef = doc(db, "admins", admin);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Compare the hashed password stored in Firestore
          const storedPassword = docSnap.data().password;

          if (storedPassword === password) {
            // Redirect to the admin panel
            window.location.href = "admin_appointment.html";
          } else {
            alert("Invalid password!");
          }
        } else {
          alert("Admin not found!");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed!");
      }
    });
  }
});
