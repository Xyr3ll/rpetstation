import {
  db,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "../firebase/database.js";

// Search function
function filterAppointments() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();
  const appointmentRows = document.querySelectorAll("#appointmentTableBody tr");

  // Loop through each row and filter based on the search term
  appointmentRows.forEach((row) => {
    const customerName = row.querySelector("td:nth-child(3)").textContent.toLowerCase(); // Get the customer name
    const appointmentID = row.querySelector("td:nth-child(1)").textContent.toLowerCase(); // Get the appointment ID
    const customerEmail = row.querySelector("td:nth-child(2)").textContent.toLowerCase(); // Get the customer email

    // If the search term matches any of the columns, show the row, otherwise hide it
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

document.getElementById("searchBar").addEventListener("input", filterAppointments); 

// Function to update the appointment status
async function changeAppointmentStatus(appointmentId, customerName, newStatus) {
  try {
    const appointmentRef = doc(db, "customerBooking", appointmentId); // Reference to the appointment document

    // Update the status in Firestore
    await updateDoc(appointmentRef, {
      status: newStatus, // Update the status with the new value
    });

    console.log(
      `Status for appointment with ID: ${appointmentId} has been updated to "${newStatus}" for ${customerName}.`
    );
  } catch (error) {
    console.error("Error updating appointment status: ", error);
  }
}

// Function to fetch and display data in real-time
function fetchAppointments() {
  const appointmentTableBody = document.getElementById("appointmentTableBody");

  if (!appointmentTableBody) {
    console.error("appointmentTableBody element not found.");
    return;
  }

  const appointmentsQuery = query(
    collection(db, "customerBooking"),
    orderBy("timestamp", "desc")
  );

  try {
    onSnapshot(appointmentsQuery, (querySnapshot) => {
      appointmentTableBody.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");

        // Get the proofOfPaymentURL field
        const proofOfPaymentURL = data.paymentProof;

        row.innerHTML = `
          <tr data-id="${doc.id}">
            <td>${data.appointmentID}</td>
            <td>${data.customerEmail}</td>
            <td>${data.customerName}</td>
            <td>${data.customerPhone}</td>
            <td>${data.petType}</td>
            <td>${data.price}</td>
            <td>${data.selectedService}</td>
            <td>${data.selectedSize}</td>
            <td>${data.serviceType}</td>
            <td>${new Date(data.timestamp.seconds * 1000).toLocaleString(
              "en-GB",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false, // Use 24-hour format
              }
            )}</td>
             <td>${new Date(
               data.scheduledDateTime.seconds * 1000
             ).toLocaleString("en-GB", {
               year: "numeric",
               month: "2-digit",
               day: "2-digit",
               hour: "2-digit",
               minute: "2-digit",
               second: "2-digit",
               hour12: false, // Use 24-hour format
             })}</td>
            <td>${proofOfPaymentURL ? `<img src="${proofOfPaymentURL}" alt="Proof of Payment" width="100" height="100" style="border-radius: 6px; cursor: pointer;"/>` : "Not Available"}</td>
            <td>${data.status || "Pending"}</td>
            <select class="status-select" data-order-id="${doc.id}">
              <option value="pending" ${
                data.status === "pending" ? "selected" : ""
              }>Pending</option>
              <option value="complete" ${
                data.status === "complete" ? "selected" : ""
              }>Complete</option>
            </select>
          </tr>
        `;

        // Add event listener to the select element
        const select = row.querySelector(".status-select");
        select.addEventListener("change", (e) => {
          changeAppointmentStatus(doc.id, data.customerName, e.target.value);
        });

        console.log("ID: " + doc.id);
        appointmentTableBody.appendChild(row);
      });

      setupImageClickHandler();
    });
  } catch (error) {
    console.error("Error fetching appointments: ", error);
  }
}

// Call the function to fetch and display data when the page loads
window.onload = fetchAppointments;

// Light box
function setupImageClickHandler() {
  const imageElements = document.querySelectorAll("td img");

  imageElements.forEach((img) => {
    img.addEventListener("click", function () {
      openLightbox(this.src); 
    });
  });
}


// Function to open the lightbox modal with the clicked image
function openLightbox(imageSrc) {
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");

  lightboxImage.src = imageSrc;
  lightboxModal.style.display = "flex";
}

// Function to close the lightbox modal
function closeLightbox() {
  const lightboxModal = document.getElementById("lightboxModal");
  lightboxModal.style.display = "none";
}

// Event listener for closing the lightbox modal when clicking outside the image
window.onclick = function (event) {
  const lightboxModal = document.getElementById("lightboxModal");
  if (event.target === lightboxModal) {
    closeLightbox();
  }
};