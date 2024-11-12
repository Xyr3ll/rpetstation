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

// Close the modal when clicking outside of the modal content
window.onclick = function (event) {
  const appointmentModal = document.getElementById("appointmentModal");
  const paymentModal = document.getElementById("paymentModal");
  
  if (event.target === appointmentModal) {
    appointmentModal.style.display = "none";
  } else if (event.target === paymentModal) {
    paymentModal.style.display = "none";
  }
};

// For veterinary and grooming combo box
document.addEventListener("DOMContentLoaded", function () {
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

  // Prices data for grooming and veterinary services
  const groomingPrices = {
    "fullgroom-short": { s: 320, m: 450, l: 600, xl: 720, xxl: 800 },
    "fullgroom-long": { s: 350, m: 480, l: 630, xl: 750, xxl: 850 },
    "sanitary-trim": { s: 380, m: 500, l: 650, xl: 800, xxl: 900 },
    "semi-puppy": { s: 400, m: 520, l: 670, xl: 820, xxl: 920 },
    "puppy-poole": { s: 450, m: 630, l: 800, xl: 880, xxl: 950 },
    "haircut-only": { s: 300, m: 400, l: 500, xl: 600, xxl: 700 },
  };
  const veterinaryPrices = {
    "5in1": 420,
    "6in1": 600,
    "8in1": 750,
    "anti-rabies": 300,
    "kennel-cough": 550,
    "4in1": 850,
  };

  // Show appropriate options based on selected service type
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

  // Update grooming price display
  function updateGroomingPrice() {
    const selectedService = groomingService.value;
    const selectedSize = size.value;
    const servicePrices = groomingPrices[selectedService];
    if (servicePrices && servicePrices[selectedSize]) {
      const price = servicePrices[selectedSize];
      priceText.textContent = "Price: ₱" + price;
      priceDisplay.style.display = "block";
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Update veterinary price display
  function updateVeterinaryPrice() {
    const selectedService = veterinaryService.value;
    const price = veterinaryPrices[selectedService];
    if (price) {
      priceText.textContent = "Price: ₱" + price;
      priceDisplay.style.display = "block";
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Attach change listeners
  groomingService.addEventListener("change", updateGroomingPrice);
  size.addEventListener("change", updateGroomingPrice);
  veterinaryService.addEventListener("change", updateVeterinaryPrice);

  // Confirm button click event to handle booking and show payment modal
  confirmButton.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!validateBookingForm()) {
      return;
    }

    const customerName = document.getElementById("ownerName").value;
    const customerPhone = document.getElementById("contactNumber").value;
    const customerEmail = document.getElementById("email").value;
    const petType = document.querySelector('input[name="petType"]:checked').value;
    const serviceType = document.querySelector('input[name="service"]:checked').value;
    const selectedServiceElement = document.getElementById(serviceType + "Service");
    const selectedService = selectedServiceElement.value;
    const selectedSize = serviceType === "grooming" ? document.getElementById("size").value : null;
    const priceTextContent = document.getElementById("price").textContent;
    const priceNumeric = parseInt(priceTextContent.replace(/[^\d]/g, ""));
    const scheduleDate = document.getElementById("schedule-date").value;
    const scheduleTime = document.getElementById("schedule-time").value;
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
    const status = "pending";

    try {
      const appointmentID = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "bookingCounter");
        const counterSnap = await transaction.get(counterRef);

        if (!counterSnap.exists()) {
          transaction.set(counterRef, { count: 0 });
          return "00001";
        }

        const newCount = counterSnap.data().count + 1;
        transaction.update(counterRef, { count: newCount });
        return String(newCount).padStart(5, "0");
      });

      const customerBookingData = {
        customerName,
        customerPhone,
        customerEmail,
        petType,
        serviceType,
        selectedService,
        selectedSize,
        price: priceNumeric,
        status,
        appointmentID,
        timestamp: new Date(),
        scheduledDateTime: scheduleDateTime,
      };

      const bookingsRef = collection(db, "customerBooking");
      await addDoc(bookingsRef, customerBookingData);
      console.log("Booking added with ID: ", appointmentID);

      alert("Your booking has been confirmed with appointment ID: " + appointmentID);
      document.getElementById("appointmentModal").style.display = "none";
      
      // Show payment modal
      showPaymentModal();

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error with your booking.");
    }
  });

  // Validate booking form fields
  function validateBookingForm() {
    const customerName = document.getElementById("ownerName").value;
    const customerPhone = document.getElementById("contactNumber").value;
    const customerEmail = document.getElementById("email").value;
    const petType = document.querySelector('input[name="petType"]:checked');
    const serviceType = document.querySelector('input[name="service"]:checked');
    const scheduleDate = document.getElementById("schedule-date").value;
    const scheduleTime = document.getElementById("schedule-time").value;

    if (!customerName || !customerPhone || !customerEmail || !petType || !serviceType || !scheduleDate || !scheduleTime) {
      alert("Please fill in all required fields.");
      return false;
    }

    const selectedServiceElement = document.getElementById(serviceType.value + "Service");
    if (!selectedServiceElement || !selectedServiceElement.value) {
      alert("Please select a service type and specify the details.");
      return false;
    }

    if (serviceType.value === "grooming" && !document.getElementById("size").value) {
      alert("Please select a size for grooming services.");
      return false;
    }

    return true;
  }

  // Show the payment modal
  function showPaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.style.display = "block";
  }
});
