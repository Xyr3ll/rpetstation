import { db, collection, query, where, getDocs } from "../firebase/database.js";

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

      // Get user type (admin or employee)
      const userType = document.getElementById("userType").value;
      const username = document.querySelector('input[name="username"]').value;
      const password = document.querySelector('input[name="password"]').value;

      // Determine Firestore collection based on user type
      const collectionName = userType === "admin" ? "admins" : "employees";

      try {
        // Query the employees collection to find the document with the matching username field
        const employeesRef = collection(db, collectionName);
        const q = query(employeesRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const employeeDoc = querySnapshot.docs[0];
          const storedPassword = employeeDoc.data().password;

          if (storedPassword === password) {
            // Redirect based on user type
            if (userType === "admin") {
              window.location.href = "admin_appointment.html";
            } else {
              window.location.href = "employee_appointment.html"; // Change to the employee dashboard URL
            }
          } else {
            alert("Invalid password!");
          }
        } else {
          alert(`${userType === "admin" ? "Admin" : "Employee"} not found!`);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Login failed!");
      }
    });
  }
});

const