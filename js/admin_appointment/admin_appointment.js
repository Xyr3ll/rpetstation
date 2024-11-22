import {
  db,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from "../firebase/database.js";

// Search function
function filterAppointments() {
  const searchTerm = document.getElementById("searchBar").value.toLowerCase();
  const appointmentRows = document.querySelectorAll("#appointmentTableBody tr");

  // Loop through each row and filter based on the search term
  appointmentRows.forEach((row) => {
    const customerName = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase(); // Get the customer name
    const appointmentID = row
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase(); // Get the appointment ID
    const customerEmail = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase(); // Get the customer email

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

document
  .getElementById("searchBar")
  .addEventListener("input", filterAppointments);

// Function to update the appointment status and send SMS (including reminder)
async function changeAppointmentStatus(appointmentId, customerName, newStatus) {
  try {
    const appointmentRef = doc(db, "customerBooking", appointmentId); // Reference to the appointment document

    // Fetch the customer data (including the phone number and appointment date/time)
    const appointmentDoc = await getDoc(appointmentRef); // Use getDoc() instead of get()

    if (!appointmentDoc.exists()) {
      console.error("Appointment document not found.");
      return;
    }

    const customerData = appointmentDoc.data();
    const customerPhone = customerData.customerPhone;
    const scheduledDate = customerData.scheduledDate;
    const scheduledTime = customerData.scheduledTime;

    // Combine scheduledDate and scheduledTime into a full Date object
    const fullDateTimeStr = `${scheduledDate} ${scheduledTime}`;
    const scheduledDateTime = new Date(fullDateTimeStr); // Create a Date object from the string

    // Update the status in Firestore
    await updateDoc(appointmentRef, {
      status: newStatus, 
    });

    console.log(
      `Status for appointment with ID: ${appointmentId} has been updated to "${newStatus}" for ${customerName}.`
    );

    // Send SMS notification using Infobip API after status change
    sendSmsNotification(customerPhone, customerName, newStatus, scheduledDate, scheduledTime);

    // Send reminder if the appointment is today and within a specific reminder window
    sendAppointmentReminder(customerPhone, customerName, scheduledDate, scheduledTime);
  } catch (error) {
    console.error("Error updating appointment status: ", error);
  }
}

// Function to send reminder SMS 30 minutes before the appointment using Semaphore
async function sendAppointmentReminder(customerPhone, customerName, scheduledTime, appointmentDate) {
  const currentTime = new Date();
  
  // Convert the appointment date and scheduled time to a Date object (PHT)
  const appointmentDateTime = new Date(`${appointmentDate}T${scheduledTime}:00+08:00`); // PHT is UTC+8

  // Calculate the reminder window (30 minutes before the appointment)
  const reminderWindow = 30 * 60 * 1000;

  // Check if the current time is exactly 12:00 AM on the day of the appointment
  const isMidnight = currentTime.getHours() === 0 && currentTime.getMinutes() === 0;

  // If it's midnight and the appointment is today
  if (isMidnight && appointmentDateTime.toDateString() === currentTime.toDateString()) {
    // 30 minutes reminder
    const reminderTime = new Date(appointmentDateTime.getTime() - reminderWindow);

    // If it's within the reminder window (30 minutes before the appointment time)
    if (currentTime >= reminderTime && currentTime < appointmentDateTime) {
      const apiKey = "d854e321e04d8e87704d1650a53001d2";
      const senderName = "Rpet";

      const message = `Hello ${customerName}, this is a reminder that you have an appointment scheduled today at ${scheduledTime}. Please make sure to be on time. For more information: https://rpetstation.vercel.app/#about`;

      const formattedPhone = formatPhoneNumber(customerPhone); // Format the phone number if needed

      try {
        const response = await fetch("https://api.semaphore.co/api/v4/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apikey: apiKey,
            number: formattedPhone,
            message: message,
            sendername: senderName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === "Queued") {
            console.log(`Reminder SMS sent to ${customerPhone}`);
          } else {
            console.error("Error sending reminder SMS: ", data);
          }
        } else {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          const errorText = await response.text();
          console.error("Response text:", errorText);
        }
      } catch (error) {
        console.error("Error sending reminder SMS: ", error);
      }
    } else {
      console.log("Reminder time has passed or appointment is in the future.");
    }
  } else {
    console.log("No reminder needed, it's not midnight or it's not the appointment day yet.");
  }
}

// Function to format the phone number in international format
function formatPhoneNumber(phone) {
  if (phone && !phone.startsWith("+")) {
    if (phone.startsWith("09")) {
      return `+63${phone.slice(1)}`;
    }
    return `+${phone.replace(/[^0-9]/g, "")}`;
  }
  return phone;
}

async function sendSmsNotification(customerPhone, customerName, status, scheduleDate, scheduleTime) {
  const response = await fetch('https://rpetstationserver.vercel.app/send-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerPhone,
      customerName,
      status,
      scheduleDate,
      scheduleTime,
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('SMS sent successfully');
  } else {
    console.error('Error sending SMS:', data.error);
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
             <td>${data.scheduledDate}</td>
             <td>${data.scheduledTime}</td>
            <td>${
              proofOfPaymentURL
                ? `<img src="${proofOfPaymentURL}" alt="Proof of Payment" width="100" height="100" style="border-radius: 6px; cursor: pointer;"/>`
                : "Not Available"
            }</td>
            <td>${data.status || "Pending"}</td>
            <select class="status-select" data-order-id="${doc.id}">
              <option value="pending" ${
                data.status === "pending" ? "selected" : ""
              }>Pending</option>
              <option value="complete" ${
                data.status === "complete" ? "selected" : ""
              }>Complete</option>
              <option value="decline" ${
                data.status === "decline" ? "selected" : ""
              }>Decline</option>
            </select>
          </tr>
        `;

        // Add event listener to the select element
        const select = row.querySelector(".status-select");
        select.addEventListener("change", (e) => {
          changeAppointmentStatus(doc.id, data.customerName, e.target.value);
        });

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
