import {
  db,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "../firebase/database.js";

// Function to map selectedSize to human-readable text
function getSizeText(size) {
  switch (size) {
    case "s":
      return "Small";
    case "m":
      return "Medium";
    case "l":
      return "Large";
    case "xl":
      return "XL";
    case "xxl":
      return "XXL";
    default:
      return "Unknown";
  }
}

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

        row.innerHTML = `
          <tr data-id="${doc.id}">
            <td>${data.appointmentID}</td>
            <td>${data.customerEmail}</td>
            <td>${data.customerName}</td>
            <td>${data.customerPhone}</td>
            <td>${data.petType}</td>
            <td>${data.price}</td>
            <td>${data.selectedService}</td>
            <td>${getSizeText(data.selectedSize)}</td>
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
             <td>${new Date(data.scheduledDateTime.seconds * 1000).toLocaleString(
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
    });
  } catch (error) {
    console.error("Error fetching appointments: ", error);
  }
}

// Call the function to fetch and display data when the page loads
window.onload = fetchAppointments;
