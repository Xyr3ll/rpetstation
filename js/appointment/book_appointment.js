import { app } from "../firebase/database.js";

// Close the modal when clicking outside of the modal content
window.onclick = function (event) {
  var modal = document.getElementById("appointmentModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// For veterinary and Grooming function combo box
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

  // Prices data for grooming services and sizes
  const groomingPrices = {
    "fullgroom-short": { s: 320, m: 450, l: 600, xl: 720, xxl: 800 },
    "fullgroom-long": { s: 350, m: 480, l: 630, xl: 750, xxl: 850 },
    "sanitary-trim": { s: 380, m: 500, l: 650, xl: 800, xxl: 900 },
    "semi-puppy": { s: 400, m: 520, l: 670, xl: 820, xxl: 920 },
    "puppy-poole": { s: 450, m: 630, l: 800, xl: 880, xxl: 950 },
    "haircut-only": { s: 300, m: 400, l: 500, xl: 600, xxl: 700 },
  };

  // Prices for veterinary services
  const veterinaryPrices = {
    "5in1": 420,
    "6in1": 600,
    "8in1": 750,
    "anti-rabies": 300,
    "kennel-cough": 550,
    "4in1": 850,
  };

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

  // Update price when grooming service or size changes
  function updateGroomingPrice() {
    const selectedService = groomingService.value;
    const selectedSize = size.value;
    const servicePrices = groomingPrices[selectedService];
    if (servicePrices && servicePrices[selectedSize]) {
      priceText.textContent = "Price: ₱" + servicePrices[selectedSize];
      priceDisplay.style.display = "block";
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Update price when veterinary service changes
  function updateVeterinaryPrice() {
    const selectedService = veterinaryService.value;
    const price = veterinaryPrices[selectedService];
    if (price) {
      priceText.textContent = "Price: $" + price;
      priceDisplay.style.display = "block";
    } else {
      priceDisplay.style.display = "none";
    }
  }

  // Attach change listeners
  groomingService.addEventListener("change", updateGroomingPrice);
  size.addEventListener("change", updateGroomingPrice);
  veterinaryService.addEventListener("change", updateVeterinaryPrice);
});
