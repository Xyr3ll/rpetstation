import {
  db,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  runTransaction,
} from "../firebase/database.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "../firebase/database.js";

// Close modal when clicking outside modal content
window.onclick = function (event) {
  const modal = document.getElementById("appointmentModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

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

  let groomingPrices = {};
  let veterinaryPrices = {};

  const groomingRef = collection(db, "services/grooming/servicesList");
  const veterinaryRef = collection(db, "services/veterinary/servicesList");

  try {
    // Fetch grooming services
    const groomingSnapshot = await getDocs(groomingRef);
    groomingSnapshot.forEach((doc) => {
      const data = doc.data();
      groomingPrices[doc.id] = data.prices || {};

      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = data.name;
      groomingService.appendChild(option);
    });

    // Populate sizes based on the first grooming service’s available sizes
    const firstServicePrices = groomingSnapshot.docs[0]?.data().prices;
    if (firstServicePrices) {
      Object.keys(firstServicePrices).forEach((sizeCategory) => {
        const option = document.createElement("option");
        option.value = sizeCategory;
        option.textContent = sizeCategory;
        size.appendChild(option);
      });
    }

    // Fetch veterinary services
    const veterinarySnapshot = await getDocs(veterinaryRef);
    veterinarySnapshot.forEach((doc) => {
      const data = doc.data();
      veterinaryPrices[doc.id] = data.price;

      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = data.name;
      veterinaryService.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching services: ", error);
    alert("Failed to load services. Please try again later.");
  }

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

  // Update grooming price based on selected service and size
  function updateGroomingPrice() {
    const selectedService = groomingService.value;
    const selectedSize = size.value;
    const servicePrices = groomingPrices[selectedService] || {};

    if (servicePrices[selectedSize] !== undefined) {
      const price = servicePrices[selectedSize];
      priceText.textContent = "Price: ₱" + price;
      priceDisplay.style.display = "block";
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Update veterinary price based on selected service
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

  groomingService.addEventListener("change", updateGroomingPrice);
  size.addEventListener("change", updateGroomingPrice);
  veterinaryService.addEventListener("change", updateVeterinaryPrice);

  const termsModal = document.getElementById("termsModal");
  const acceptTermsButton = document.getElementById("acceptTermsButton");
  const declineTermsButton = document.getElementById("declineTermsButton");

  // Confirm booking
  confirmButton.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!validateBookingForm()) {
      return;
    }

    // Show the terms modal
    termsModal.style.display = "block";

    // Wait for the user to accept or decline the terms
    acceptTermsButton.addEventListener("click", async function () {
      // Proceed with the booking after accepting terms
      const customerName = document.getElementById("ownerName").value;
      const customerPhone = document.getElementById("contactNumber").value;
      const customerEmail = document.getElementById("email").value;
      const petType = document.querySelector(
        'input[name="petType"]:checked'
      ).value;
      const serviceType = document.querySelector(
        'input[name="service"]:checked'
      ).value;

      // Ensure serviceType is valid before fetching the selected service
      const serviceElement = document.getElementById(serviceType + "Service");
      let selectedService = "";

      // Check if the service element is available
      if (serviceElement) {
        const selectedServiceID = serviceElement.value; // Get the service ID
        try {
          let collectionPath = "";
          if (serviceType === "veterinary") {
            collectionPath = "services/veterinary/servicesList";
          } else if (serviceType === "grooming") {
            collectionPath = "services/grooming/servicesList";
          } else {
            console.error("Invalid service type");
            alert("Invalid service type.");
            return;
          }

          const serviceDocRef = doc(db, collectionPath, selectedServiceID);
          const serviceDoc = await getDoc(serviceDocRef);
          if (serviceDoc.exists()) {
            selectedService = serviceDoc.data().name;
          } else {
            console.error("No such service!");
            alert("Selected service not found.");
            return;
          }
        } catch (error) {
          console.error("Error fetching service name: ", error);
          alert("Error fetching service details.");
          return;
        }
      } else {
        console.error(
          "Service element not found for serviceType:",
          serviceType
        );
        alert("Selected service is not valid.");
        return;
      }

      const selectedSize = serviceType === "grooming" ? size.value : null;
      const priceNumeric = parseInt(
        priceText.textContent.replace(/[^\d]/g, "")
      );
      const scheduleDate = document.getElementById("schedule-date").value;
      const timeRange = document.getElementById("time-range").value;

      if (!scheduleDate || !timeRange) {
        alert("Please fill out the date and time completely.");
        return;
      }

      try {
        const appointmentID = await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, "counters", "bookingCounter");
          const counterSnap = await transaction.get(counterRef);
          const newCount = counterSnap.exists()
            ? counterSnap.data().count + 1
            : 1;
          transaction.set(counterRef, { count: newCount });
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
          status: "pending",
          appointmentID,
          timestamp: new Date(),
          scheduledDate: scheduleDate,
          scheduledTime: timeRange,
        };

        console.log("Customer Booking Data:", customerBookingData);

        const bookingsRef = collection(db, "customerBooking");
        const docRef = await addDoc(bookingsRef, customerBookingData);

        alert(
          "Your booking has been confirmed with appointment ID: " +
            appointmentID
        );
        document.getElementById("appointmentModal").style.display = "none";
        resetForm();

        // Now show the payment modal after accepting terms
        showPaymentModal(docRef.id);
      } catch (error) {
        console.error("Error adding booking: ", error);
        alert("There was an error with your booking.");
      }

      // Close the terms modal after accepting
      termsModal.style.display = "none";
    });

    declineTermsButton.addEventListener("click", function () {
      // Close the terms modal if the user declines
      termsModal.style.display = "none";
      alert("You must accept the terms and conditions to proceed.");
    });
  });

  // Form validation
  function validateBookingForm() {
    const requiredFields = [
      "ownerName",
      "contactNumber",
      "email",
      "schedule-date",
    ];

    for (const field of requiredFields) {
      const fieldElement = document.getElementById(field);
      if (!fieldElement.value) {
        alert("Please fill in all required fields.");
        return false;
      }
    }

    // Validate contact number as numeric
    const contactNumber = document.getElementById("contactNumber").value;
    if (!/^09\d{9}$/.test(contactNumber)) {
      alert(
        "Please enter a valid contact number starting with '09' and having 11 digits."
      );
      return false;
    }

    // Validate email format
    const email = document.getElementById("email").value;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    const petType = document.querySelector('input[name="petType"]:checked');
    const serviceType = document.querySelector('input[name="service"]:checked');

    if (!petType || !serviceType) {
      alert("Please select a pet type and service type.");
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
      const size = document.getElementById("size");
      if (!size || !size.value) {
        alert("Please select a size for grooming services.");
        return false;
      }
    }

    return true;
  }

  function resetForm() {
    // Reset text inputs
    document.getElementById("ownerName").value = "";
    document.getElementById("contactNumber").value = "";
    document.getElementById("email").value = "";
    document.getElementById("breed").value = "";
    document.getElementById("age").value = "";
    document.getElementById("address").value = "";
    document.getElementById("schedule-date").value = "";

    // Reset radio buttons
    const petTypeRadios = document.getElementsByName("petType");
    petTypeRadios.forEach((radio) => (radio.checked = false));

    const serviceRadios = document.getElementsByName("service");
    serviceRadios.forEach((radio) => (radio.checked = false));

    // Hide the grooming and veterinary options
    document.getElementById("grooming-options").style.display = "none";
    document.getElementById("veterinary-options").style.display = "none";

    // Reset dropdowns
    document.getElementById("groomingService").selectedIndex = 0;
    document.getElementById("size").selectedIndex = 0;
    document.getElementById("veterinaryService").selectedIndex = 0;

    // Reset price display
    document.getElementById("price").textContent = "Price:";
  }

  // Payment modal handling
  function showPaymentModal(appointmentID) {
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.style.display = "block";

    fetchPartialPayment(appointmentID);

    const confirmPaymentButton = document.getElementById("confirmPayment");
    confirmPaymentButton.onclick = async (event) => {
      event.preventDefault();
      await uploadProofOfPayment(appointmentID);
    };
  }
});

async function fetchPartialPayment(appointmentID) {
  try {
    // Fetch the document from Firestore
    const docRef = doc(db, "customerBooking", appointmentID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const price = docSnap.data().price; // Retrieve the price field
      const partialPayment = price * 0.25; // Calculate 25% of the price

      // Display the partial payment in the designated element
      const partialPaymentElement = document.getElementById("partial-payment");
      partialPaymentElement.textContent = `Partial Payment (25%): ₱${partialPayment.toFixed(
        2
      )}`;
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error fetching partial payment:", error);
  }
}

// Upload proof of payment
async function uploadProofOfPayment(appointmentID) {
  try {
    const paymentProof = document.getElementById("proofOfPayment").files[0];
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
