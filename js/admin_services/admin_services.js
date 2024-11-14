import {
  db,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "../firebase/database.js";

// Search function for filtering appointments in both tables
function filterAppointments() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();

  // Get all rows from both grooming and veterinary tables
  const groomingRows = document.querySelectorAll("#groomingTableBody tr");
  const veterinaryRows = document.querySelectorAll("#veterinaryTableBody tr");

  // Combine rows from both tables into one array
  const allRows = [...groomingRows, ...veterinaryRows];

  // Loop through each row in both tables and filter based on the search term
  allRows.forEach((row) => {
    const customerName = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();
    const appointmentID = row
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase();
    const customerEmail = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();

    // Show row if any column matches the search term, otherwise hide it
    if (
      customerName.includes(searchTerm) ||
      appointmentID.includes(searchTerm) ||
      customerEmail.includes(searchTerm)
    ) {
      row.style.display = ""; // Show row if it matches the search term
    } else {
      row.style.display = "none"; // Hide row if it doesn't match
    }
  });
}

document
  .getElementById("searchBar")
  .addEventListener("input", filterAppointments);

// Open the modal for groom
document
  .querySelector("#groomAddServices")
  .addEventListener("click", function () {
    document.getElementById("addGroomModal").style.display = "block";
  });

// Open the model for veterinary
document
  .querySelector("#veterinaryAddServices")
  .addEventListener("click", function () {
    document.getElementById("addVeterinaryModal").style.display = "block";
  });

// Close the modal when clicking the close button
function closeModal() {
  document.getElementById("addGroomModal").style.display = "none";
  document.getElementById("editGroomModal").style.display = "none";
  document.getElementById("addVeterinaryModal").style.display = "none";
  document.getElementById("editVeterinaryModal").style.display = "none";
}

// Close the modal if the user clicks outside of it
window.onclick = function (event) {
  const modal = document.getElementById("addGroomModal");
  if (event.target === modal) {
    closeModal();
  }
  const editModal = document.getElementById("editGroomModal");
  if (event.target === editModal) {
    closeModal();
  }
  const addVeterinaryModal = document.getElementById("addVeterinaryModal");
  if (event.target === addVeterinaryModal) {
    closeModal();
  }
  const editVeterinaryModal = document.getElementById("editVeterinaryModal");
  if (event.target === editVeterinaryModal) {
    closeModal();
  }
};

// For adding services (Groom)
document
  .getElementById("addGroomForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    // Get values from the form
    const serviceName = document.getElementById("serviceName").value;
    const smallPrice = document.getElementById("serviceSizeSmall").value;
    const mediumPrice = document.getElementById("serviceSizeMedium").value;
    const largePrice = document.getElementById("serviceSizeLarge").value;
    const xlPrice = document.getElementById("serviceSizeXL").value;
    const xxlPrice = document.getElementById("serviceSizeXXL").value;

    // Create a new service object
    const newService = {
      name: serviceName,
      prices: {
        small: parseFloat(smallPrice),
        medium: parseFloat(mediumPrice),
        large: parseFloat(largePrice),
        xl: parseFloat(xlPrice),
        xxl: parseFloat(xxlPrice),
      },
      createdAt: serverTimestamp(), // Using serverTimestamp to create timestamp
    };

    try {
      // Save the service to the Firestore database under "services/grooming" collection
      const docRef = await addDoc(
        collection(db, "services", "grooming", "servicesList"),
        newService
      );
      console.log("Document written with ID: ", docRef.id);
      alert("Service added successfully!");
      document.getElementById("addGroomForm").reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error adding service: ", error);
      alert("Error adding service. Please try again.");
    }
  });

// For edit services (Groom)
document
  .getElementById("editGroomForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    // Get the service ID (stored in the form attribute)
    const serviceId = document
      .getElementById("editGroomForm")
      .getAttribute("data-id");

    // Get values from the form
    const serviceName = document.getElementById("editserviceName").value;
    const smallPrice = document.getElementById("editserviceSizeSmall").value;
    const mediumPrice = document.getElementById("editserviceSizeMedium").value;
    const largePrice = document.getElementById("editserviceSizeLarge").value;
    const xlPrice = document.getElementById("editserviceSizeXL").value;
    const xxlPrice = document.getElementById("editserviceSizeXXL").value;

    // Create a new service object
    const updatedService = {
      name: serviceName,
      prices: {
        small: parseFloat(smallPrice),
        medium: parseFloat(mediumPrice),
        large: parseFloat(largePrice),
        xl: parseFloat(xlPrice),
        xxl: parseFloat(xxlPrice),
      },
      createdAt: serverTimestamp(), // Using serverTimestamp to create timestamp
    };

    try {
      // Update the service in Firestore (using doc() to specify the document to update)
      await updateDoc(
        doc(db, "services", "grooming", "servicesList", serviceId),
        updatedService
      );

      console.log("Service updated successfully!");
      alert("Service updated successfully!");

      // Close the modal after the update
      closeModal();

      // Optionally, reset the form
      document.getElementById("editGroomForm").reset();

      // You might want to refresh the data in the table after the update
      // You can re-fetch the data from Firestore or update the row dynamically
    } catch (error) {
      console.error("Error updating service: ", error);
      alert("Error updating service. Please try again.");
    }
  });

// For adding services (Veterinary)
document
  .getElementById("addVeterinaryForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get values from the form
    const serviceName = document.getElementById("serviceVeterinaryName").value;
    const servicePrice = document.getElementById("price").value;

    // Create a new service object
    const newService = {
      name: serviceName,
      price: servicePrice,
      createdAt: serverTimestamp(),
    };

    try {
      // Save the service to the Firestore database under "services/veterinary" collection
      const docRef = await addDoc(
        collection(db, "services", "veterinary", "servicesList"),
        newService
      );
      console.log("Document written with ID: ", docRef.id);
      alert("Service added successfully!");
      document.getElementById("addVeterinaryForm").reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error adding service: ", error);
      alert("Error adding service. Please try again.");
    }
  });

// For edit services (Veterinary)
document
  .getElementById("editVeterinaryForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    // Get the service ID (stored in the form attribute)
    const serviceId = document
      .getElementById("editVeterinaryForm")
      .getAttribute("data-id");

    // Get values from the form
    const serviceName = document.getElementById(
      "editserviceVeterinaryName"
    ).value;
    const prices = document.getElementById("editprice").value;

    // Create a new service object
    const updatedService = {
      name: serviceName,
      price: prices,
      createdAt: serverTimestamp(), // Using serverTimestamp to create timestamp
    };

    try {
      // Update the service in Firestore (using doc() to specify the document to update)
      await updateDoc(
        doc(db, "services", "veterinary", "servicesList", serviceId),
        updatedService
      );

      console.log("Service updated successfully!");
      alert("Service updated successfully!");

      // Close the modal after the update
      closeModal();

      // Optionally, reset the form
      document.getElementById("editVeterinaryForm").reset();
    } catch (error) {
      console.error("Error updating service: ", error);
      alert("Error updating service. Please try again.");
    }
  });

// Function for combo box
document.addEventListener("DOMContentLoaded", function () {
  const serviceCategory = document.getElementById("serviceCategory");
  const servicesTitle = document.getElementById("servicesTitle");
  const groomingTable = document.getElementById("groomingTable");
  const groomAddButton = document.getElementById("groomAddServices");
  const veterinaryTable = document.getElementById("veterinaryTable");
  const veterinaryAddButton = document.getElementById("veterinaryAddServices");

  // Define the filterServices function
  window.filterServices = function () {
    const selectedCategory = serviceCategory.value;

    if (selectedCategory === "grooming") {
      // Groom
      servicesTitle.textContent = "Grooming Services";
      groomingTable.style.display = "block";
      groomAddButton.style.display = "block";
      // Veterinary
      veterinaryTable.style.display = "none";
      veterinaryAddButton.style.display = "none";
      fetchGroom();
    } else if (selectedCategory === "veterinary") {
      // Veterinary
      servicesTitle.textContent = "Veterinary Services";
      veterinaryTable.style.display = "block";
      veterinaryAddButton.style.display = "block";
      // Groom
      groomingTable.style.display = "none";
      groomAddButton.style.display = "none";
      fetchVeterinary();
    } else {
      servicesTitle.textContent = "Services";
      groomingTable.style.display = "none";
      groomAddButton.style.display = "none";
      veterinaryTable.style.display = "none";
      veterinaryAddButton.style.display = "none";
    }
  };

  // Optional: Set initial view
  filterServices();
});

function fetchGroom() {
  // Reference to the table body where the data will be inserted
  const groomingTableBody = document.getElementById("groomingTableBody");

  // Listen for real-time updates on the grooming services collection
  const unsubscribe = onSnapshot(
    collection(db, "services", "grooming", "servicesList"),
    (querySnapshot) => {
      // Clear the table before re-rendering the data
      groomingTableBody.innerHTML = "";

      // Define the correct order of sizes
      const sizeOrder = ["small", "medium", "large", "xl", "xxl"];

      // Loop through each document in the collection
      querySnapshot.forEach((doc) => {
        const service = doc.data(); // Get the service data
        const serviceName = service.name; // "Test Service"
        const prices = service.prices; // prices map: {small: 1, medium: 2, large: 3, xl: 4, xxl: 5}

        // Sort the prices based on the sizeOrder
        const sortedPrices = sizeOrder.map((size) => prices[size]);

        // Create a single row for this service
        const row = document.createElement("tr");

        // Add the service name, sizes, and prices as columns in the same row
        row.innerHTML = `
                <td>${serviceName}</td>
                <td>${sizeOrder.join(", ")}</td>
                <td>${sortedPrices.join(", ")}</td>
                <td>
                  <button class="action-btn edit-btn" id="gEditBtn" data-id="${
                    doc.id
                  }">
                      <img src="../images/edit.png" alt="Edit" />
                  </button>
                  <button class="action-btn delete-btn" data-id="${doc.id}">
                      <img src="../images/delete.png" alt="Delete" />
                  </button>
                </td>
              `;

        // Append the row to the table body
        groomingTableBody.appendChild(row);
      });

      // Display the grooming table once data is fetched
      document.getElementById("groomingTable").style.display = "block";

      // Add event listeners for all delete buttons
      const deleteButtons = document.querySelectorAll(".delete-btn");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          const serviceId = event.target
            .closest("button")
            .getAttribute("data-id");
          deleteGroomService(serviceId); // Call the deleteService function
        });
      });
    },
    (error) => {
      console.error("Error fetching real-time updates: ", error);
    }
  );
}

function fetchVeterinary() {
  // Reference to the table body where the data will be inserted
  const veterinaryTableBody = document.getElementById("veterinaryTableBody");

  // Listen for real-time updates on the veterinary services collection
  const unsubscribe = onSnapshot(
    collection(db, "services", "veterinary", "servicesList"),
    (querySnapshot) => {
      // Clear the table before re-rendering the data
      veterinaryTableBody.innerHTML = "";

      // Loop through each document in the collection
      querySnapshot.forEach((doc) => {
        const service = doc.data(); // Get the service data
        const serviceName = service.name; // "Test Service"
        const prices = service.price;

        // Create a single row for this service
        const row = document.createElement("tr");

        // Add the service name, sizes, and prices as columns in the same row
        row.innerHTML = `
                  <td>${serviceName}</td>
                  <td>${prices}</td>
                  <td>
                    <button class="action-btn edit-btn" id="vEditBtn" data-id="${doc.id}">
                        <img src="../images/edit.png" alt="Edit" />
                    </button>
                    <button class="action-btn delete-btn" data-id="${doc.id}">
                        <img src="../images/delete.png" alt="Delete" />
                    </button>
                  </td>
                `;

        // Append the row to the table body
        veterinaryTableBody.appendChild(row);
      });

      // Display the veterinary table once data is fetched
      document.getElementById("veterinaryTable").style.display = "block";

      // Add event listeners for all delete buttons
      const deleteButtons = document.querySelectorAll(".delete-btn");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          const serviceId = event.target
            .closest("button")
            .getAttribute("data-id");
          deleteVeterinaryService(serviceId); // Call the deleteService function
        });
      });
    },
    (error) => {
      console.error("Error fetching real-time updates: ", error);
    }
  );
}

// Function to edit a grooming service
function editGroom(serviceId) {
  // Fetch the service details from Firestore
  getDoc(doc(db, "services", "grooming", "servicesList", serviceId))
    .then((docSnap) => {
      if (docSnap.exists()) {
        const service = docSnap.data();

        // Pre-fill the modal form fields with the current data
        document.getElementById("editserviceName").value = service.name;
        document.getElementById("editserviceSizeSmall").value =
          service.prices.small;
        document.getElementById("editserviceSizeMedium").value =
          service.prices.medium;
        document.getElementById("editserviceSizeLarge").value =
          service.prices.large;
        document.getElementById("editserviceSizeXL").value = service.prices.xl;
        document.getElementById("editserviceSizeXXL").value =
          service.prices.xxl;

        // Open the edit modal
        document.getElementById("editGroomModal").style.display = "block";

        // Store the service ID for later use when submitting the form
        document
          .getElementById("editGroomForm")
          .setAttribute("data-id", serviceId);
      } else {
        console.log("No such service!");
      }
    })
    .catch((error) => {
      console.error("Error fetching document: ", error);
    });
}

// Function to edit a vetirinary service
function editVetirinary(serviceId) {
  // Fetch the service details from Firestore
  getDoc(doc(db, "services", "veterinary", "servicesList", serviceId))
    .then((docSnap) => {
      if (docSnap.exists()) {
        const service = docSnap.data();

        // Pre-fill the modal form fields with the current data
        document.getElementById("editserviceVeterinaryName").value =
          service.name;
        document.getElementById("editprice").value = service.price;

        // Open the edit modal
        document.getElementById("editVeterinaryModal").style.display = "block";

        // Store the service ID for later use when submitting the form
        document
          .getElementById("editVeterinaryForm")
          .setAttribute("data-id", serviceId);
      } else {
        console.log("No such service!");
      }
    })
    .catch((error) => {
      console.error("Error fetching document: ", error);
    });
}

// Event listener for the edit groom button clicks
document.addEventListener("click", function (event) {
  const editButton = event.target.closest("#gEditBtn");
  if (editButton) {
    const serviceId = editButton.getAttribute("data-id");
    if (serviceId) {
      editGroom(serviceId);
    }
  }
});

// Event listener for the edit veterinary button clicks
document.addEventListener("click", function (event) {
  const editButton = event.target.closest("#vEditBtn");
  if (editButton) {
    const serviceId = editButton.getAttribute("data-id");
    if (serviceId) {
      editVetirinary(serviceId);
    }
  }
});

// Delete function for groom
function deleteGroomService(serviceId) {
  const serviceRef = doc(db, "services", "grooming", "servicesList", serviceId);

  // Delete the service from the Firestore collection
  deleteDoc(serviceRef)
    .then(() => {
      console.log("Service successfully deleted!");
    })
    .catch((error) => {
      console.error("Error deleting service: ", error);
    });
}

// Delete function for veterinary
function deleteVeterinaryService(serviceId) {
  const serviceRef = doc(
    db,
    "services",
    "veterinary",
    "servicesList",
    serviceId
  );

  // Delete the service from the Firestore collection
  deleteDoc(serviceRef)
    .then(() => {
      console.log("Service successfully deleted!");
    })
    .catch((error) => {
      console.error("Error deleting service: ", error);
    });
}
