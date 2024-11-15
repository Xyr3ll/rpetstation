// Get modal elements
const termsModal = document.getElementById("termsModal");
const paymentModal = document.getElementById("paymentModal");

// Get button elements
const showTermsButton = document.getElementById("showTermsButton");
const acceptTermsButton = document.getElementById("acceptTermsButton");
const declineTermsButton = document.getElementById("declineTermsButton");

// Show Terms Modal when clicking "Show Terms and Conditions" button
showTermsButton.onclick = function() {
  termsModal.style.display = "block";
};

// Show Payment Modal when "Accept" button is clicked in Terms Modal
acceptTermsButton.onclick = function() {
  termsModal.style.display = "none"; // Close Terms Modal
  paymentModal.style.display = "block"; // Show Payment Modal
};

// Close Terms Modal when "Decline" button is clicked
declineTermsButton.onclick = function() {
  termsModal.style.display = "none"; // Close Terms Modal
};

// Optionally, you can also close the Payment Modal when canceling
const paymentCancelButton = document.getElementById("paymentCancelButton");
paymentCancelButton.onclick = function() {
  paymentModal.style.display = "none"; // Close Payment Modal
};

// Optional: Close the modal when clicking outside of it
window.onclick = function(event) {
  if (event.target == termsModal) {
    termsModal.style.display = "none";
  } else if (event.target == paymentModal) {
    paymentModal.style.display = "none";
  }
};
