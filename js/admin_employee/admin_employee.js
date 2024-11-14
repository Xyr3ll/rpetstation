import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "../firebase/database.js";

// Initialize Firestore
const db = getFirestore();

// Open the modal when clicking the "Add Employee" button
document.querySelector(".add-product-btn").addEventListener("click", function () {
  document.getElementById("addEmployeeModal").style.display = "block";
});

// Close the modal when clicking the close button
function closeModal() {
  document.getElementById("addEmployeeModal").style.display = "none";
  document.getElementById("editEmployeeModal").style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
  const modal = document.getElementById("addEmployeeModal");
  if (event.target === modal) {
    closeModal();
  }
  const editModal = document.getElementById("editEmployeeModal");
  if (event.target === editModal) {
    closeModal();
  }
};

// Handle form submission for adding an employee
document.getElementById('addEmployeeForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('employeeName').value;
  const username = document.getElementById('employeeUsername').value;
  const password = document.getElementById('employeePassword').value;
  const email = document.getElementById('employeeEmail').value;
  const address = document.getElementById('employeeAddress').value;

  if (!name || !username || !password || !email || !address) {
    alert('Please fill in both username and password');
    return;
  }

  try {
    // Add a new document with a generated ID to the 'employees' collection
    const docRef = await addDoc(collection(db, 'employees'), {
      name: name,
      username: username,
      password: password,
      email: email,
      address: address,
    });

    console.log('Employee added with ID: ', docRef.id);

    // Show success message
    alert('Employee added successfully!');

    // Fetch and display employees after adding a new one
    fetchEmployees();

    // Close the modal after submission
    closeModal();

  } catch (error) {
    console.error('Error adding employee: ', error);
    alert('Error adding employee!');
  }
});

// Function to fetch employees and display them in the table
async function fetchEmployees() {
  try {
    // Fetch employees from Firestore
    const querySnapshot = await getDocs(collection(db, "employees"));
    
    // Get the table body where the data will be inserted
    const tableBody = document.querySelector("tbody");
    
    // Clear any existing rows
    tableBody.innerHTML = "";

    // Loop through the fetched documents and create table rows
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");

      // Create and append cells for each 
      const nameCell = document.createElement("td");
      nameCell.textContent = data.name;
      row.appendChild(nameCell);

      const usernameCell = document.createElement("td");
      usernameCell.textContent = data.username;
      row.appendChild(usernameCell);

      const passwordCell = document.createElement("td");
      passwordCell.textContent = data.password;
      row.appendChild(passwordCell);

      
      const addressCell = document.createElement("td");
      addressCell.textContent = data.address;
      row.appendChild(addressCell);

      
      const emailCell = document.createElement("td");
      emailCell.textContent = data.email;
      row.appendChild(emailCell);

      // Add action buttons or edit/remove options
      const actionCell = document.createElement("td");

      // Delete button
      const deleteButton = document.createElement("button");
      const deleteImg = document.createElement("img");
      deleteImg.src = "../images/delete.png"; // Add the path to your delete image
      deleteImg.alt = "Delete";
      deleteButton.appendChild(deleteImg);
      deleteButton.classList.add("delete-button");
      deleteButton.onclick = () => deleteEmployee(doc.id); // Handle delete employee
      actionCell.appendChild(deleteButton);

      // Edit button
      const editButton = document.createElement("button");
      const editImg = document.createElement("img");
      editImg.src = "../images/edit.png"; // Add the path to your edit image
      editImg.alt = "Edit";
      editButton.appendChild(editImg);
      editButton.classList.add("edit-button");
      editButton.onclick = () => editEmployee(doc.id, data.name, data.username, data.password, data.address, data.email);
      actionCell.appendChild(editButton);

      row.appendChild(actionCell);

      // Append the row to the table body
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching employees: ", error);
  }
}

// Function to delete employee from Firestore
async function deleteEmployee(employeeId) {
  try {
    // Delete the employee document by ID
    await deleteDoc(doc(db, "employees", employeeId));
    console.log("Employee deleted: ", employeeId);
    
    // Fetch and update the employee list after deletion
    fetchEmployees();
  } catch (error) {
    console.error("Error deleting employee: ", error);
  }
}

// Function to edit employee details
function editEmployee(employeeId, currentName, currentUsername, currentPassword, currentAddress, currentEmail) {
  // Populate the modal form with current employee data
  document.getElementById("editEmployeeName").value = currentName;
  document.getElementById("editEmployeeUsername").value = currentUsername;
  document.getElementById("editEmployeePassword").value = currentPassword;
  document.getElementById("editEmployeeAddress").value = currentAddress;
  document.getElementById("editEmployeeEmail").value = currentEmail;

  
  // Change the form's submit handler to update the employee instead of adding a new one
  const form = document.getElementById('editEmployeeForm');
  form.onsubmit = async function (e) {
    e.preventDefault();

    const name = document.getElementById('editEmployeeName').value;
    const username = document.getElementById('editEmployeeUsername').value;
    const password = document.getElementById('editEmployeePassword').value;
    const address = document.getElementById('editEmployeeAddress').value;
    const email = document.getElementById('editEmployeeEmail').value;

    if (!name || !username || !password || !email || !address) {
      alert('Please fill all the fields');
      return;
    }

    try {
      // Update the employee document with the new data
      await updateDoc(doc(db, "employees", employeeId), {
        name: name,
        username: username,
        password: password,
        address: address,
        email: email,
      });

      console.log('Employee updated with ID: ', employeeId);

      // Show success message
      alert('Employee updated successfully!');

      // Fetch and display updated employees
      fetchEmployees();

      // Close the modal after submission
      closeModal();
    } catch (error) {
      console.error('Error updating employee: ', error);
      alert('Error updating employee!');
    }
  };

  // Open the modal for editing
  document.getElementById("editEmployeeModal").style.display = "block";
}

// Call fetchEmployees when the page loads to populate the table
fetchEmployees();
