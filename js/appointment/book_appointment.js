import {
  app,
  db,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from "../firebase/database.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "../firebase/database.js";

// Close the modal when clicking outside of the modal content
window.onclick = function (event) {
  var modal = document.getElementById("appointmentModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// For veterinary and Grooming function combo box
document.addEventListener("DOMContentLoaded", async function () {
  const groomingRadio = document.getElementById("grooming");
  const veterinaryRadio = document.getElementById("veterinary");
  const groomingOptions = document.getElementById("grooming-options");
  const veterinaryOptions = document.getElementById("veterinary-options");
  const priceDisplay = document.getElementById("price-display");
  const groomingService = document.getElementById("groomingService");
  const size = document.getElementById("size");
  const veterinaryService = document.getElementById("veterinaryService");
  const priceText = document.getElementById("price");
  const confirmButton = document.getElementById("confirmButton");

  // Fetch services and prices from Firestore
  let groomingPrices = {};
  let veterinaryPrices = {};
  
  const groomingRef = collection(db, "services/grooming");
  const veterinaryRef = collection(db, "services/veterinary");

  // Fetch grooming services and prices
  const groomingSnapshot = await getDocs(groomingRef);
  groomingSnapshot.forEach(doc => {
    groomingPrices[doc.id] = doc.data();
  });

  // Fetch veterinary services and prices
  const veterinarySnapshot = await getDocs(veterinaryRef);
  veterinarySnapshot.forEach(doc => {
    veterinaryPrices[doc.id] = doc.data().price;
  });

  // Show options based on selected service
  groomingRadio.addEventListener("change", function () {
    groomingOptions.style.display = "block";
    veterinaryOptions.style.display = "none";
    priceDisplay.style.display = "none";
  });

  veterinaryRadio.addEventListener("change", function () {
    veterinaryOptions.style.display = "block";
    groomingOptions.style.display = "none";
    priceDisplay.style.display = "none";
  });

  // Update the price display for grooming services
  function updateGroomingPrice() {
    const selectedService = groomingService.value;
    const selectedSize = size.value;
    const servicePrices = groomingPrices[selectedService];
    if (servicePrices && servicePrices[selectedSize]) {
      const price = servicePrices[selectedSize];
      priceText.textContent = "Price: ₱" + price;
      priceDisplay.style.display = "block";

      const numericPrice = price; // This is already a number, no need for conversion
      console.log("Numeric Price:", numericPrice);
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Update price when veterinary service changes
  function updateVeterinaryPrice() {
    const selectedService = veterinaryService.value;
    const price = veterinaryPrices[selectedService];
    if (price) {
      priceText.textContent = "Price: ₱" + price;
      priceDisplay.style.display = "block";

      const numericPrice = price; // This is already a number, no need for conversion
      console.log("Numeric Price:", numericPrice);
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Attach change listeners
  groomingService.addEventListener("change", updateGroomingPrice);
  size.addEventListener("change", updateGroomingPrice);
  veterinaryService.addEventListener("change", updateVeterinaryPrice);

  // Function to handle the Confirm button click event and save the booking to Firestore
  confirmButton.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent form submission

    if (!validateBookingForm()) {
      return; // Stop if validation fails
    }

    const customerName = document.getElementById("ownerName").value;
    const customerPhone = document.getElementById("contactNumber").value;
    const customerEmail = document.getElementById("email").value;
    const petType = document.querySelector(
      'input[name="petType"]:checked'
    ).value;
    const serviceType = document.querySelector(
      'input[name="service"]:checked'
    ).value;

    const selectedServiceElement = document.getElementById(
      serviceType + "Service"
    );
    const selectedService = selectedServiceElement.value;
    const selectedSize =
      serviceType === "grooming" ? document.getElementById("size").value : null;
    const priceTextContent = document.getElementById("price").textContent;
    const priceNumeric = parseInt(priceTextContent.replace(/[^\d]/g, ""));
    const scheduleDate = document.getElementById("schedule-date").value;
    const scheduleTime = document.getElementById("schedule-time").value;

    const status = "pending";

    // Combine date and time
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);

    // Use a transaction to get and increment the booking counter
    try {
      const appointmentID = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "bookingCounter");
        const counterSnap = await transaction.get(counterRef);

        if (!counterSnap.exists()) {
          transaction.set(counterRef, { count: 0 });
          return "00001"; // Start with the first ID
        }

        const newCount = counterSnap.data().count + 1;
        transaction.update(counterRef, { count: newCount });

        return String(newCount).padStart(5, "0");
      });

      const customerBookingData = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        petType: petType,
        serviceType: serviceType,
        selectedService: selectedService,
        selectedSize: selectedSize,
        price: priceNumeric,
        status: status,
        appointmentID: appointmentID,
        timestamp: new Date(), // current timestamp for tracking
        scheduledDateTime: scheduleDateTime, // store the combined date and time
      };

      const bookingsRef = collection(db, "customerBooking");
      const docRef = await addDoc(bookingsRef, customerBookingData);
      console.log("Booking added with ID: ", docRef.id);

      alert(
        "Your booking has been confirmed with appointment ID: " + appointmentID
      );
      const modal = document.getElementById("appointmentModal");
      modal.style.display = "none";

      // Show payment modal
      showPaymentModal(docRef.id); // Pass the appointmentID to the payment modal
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error with your booking.");
    }
  });

  // Function to validate booking form fields
  function validateBookingForm() {
    const customerName = document.getElementById("ownerName").value;
    const customerPhone = document.getElementById("contactNumber").value;
    const customerEmail = document.getElementById("email").value;
    const petType = document.querySelector('input[name="petType"]:checked');
    const serviceType = document.querySelector('input[name="service"]:checked');
    const scheduleDate = document.getElementById("schedule-date").value;
    const scheduleTime = document.getElementById("schedule-time").value;

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !petType ||
      !serviceType ||
      !scheduleDate ||
      !scheduleTime
    ) {
      alert("Please fill in all required fields.");
      return false;
    }

    const selectedServiceElement = document.getElementById(
      serviceType.value + "Service"
    );
    if (!selectedServiceElement || !selectedServiceElement.value) {
      alert("Please select a service type and specify the details.");
      return false;
    }

    if (serviceType.value === "grooming") {
      const selectedSize = document.getElementById("size").value;
      if (!selectedSize) {
        alert("Please select a size for grooming services.");
        return false;
      }
    }
    return true;
  }

  // Payment modal
  function showPaymentModal(appointmentID) {
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.style.display = "block";

    const confirmPaymentButton = document.getElementById("confirmPayment");
    confirmPaymentButton.onclick = async (event) => {
      event.preventDefault();
      await uploadProofOfPayment(appointmentID); // Pass appointmentID directly
    };
  }
});

// Upload proof of payment
async function uploadProofOfPayment(appointmentID) {
  try {
    const paymentProof = document.getElementById("paymentProof").files[0];
    if (!paymentProof) {
      alert("Please select a payment proof file.");
      return;
    }

    const storage = getStorage();
    const paymentRef = ref(storage, "paymentProofs/" + appointmentID);
    await uploadBytes(paymentRef, paymentProof);

    const downloadURL = await getDownloadURL(paymentRef);
    await updateDoc(doc(db, "customerBooking", appointmentID), {
      paymentProof: downloadURL,
    });

    alert("Payment proof uploaded successfully.");
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.style.display = "none";
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    alert("Failed to upload payment proof.");
  }
}
