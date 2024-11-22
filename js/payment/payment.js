// Function to change the QR code based on the selected payment method
function changeQR() {
  const paymentMethod = document.getElementById("paymentMethod").value;
  const qrImage = document.getElementById("qrImage");

  // Set QR code image source based on selected payment method
  if (paymentMethod === "gcash") {
    qrImage.src = "../images/gcash.jpg";  
  } else if (paymentMethod === "paymaya") {
    qrImage.src = "../images/paymaya.jpg"; 
  }
}

// Function to handle QR code download
function downloadQR() {
  const qrImage = document.getElementById("qrImage");
  const link = document.createElement("a");
  link.href = qrImage.src;
  link.download = "../images/gcash.jpg";
  link.click();
}

// Function to validate image file types for file upload
function validateImageFile() {
  const fileInput = document.getElementById("proofOfPayment");
  const file = fileInput.files[0];

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF).");
      fileInput.value = ""; // Clear the input if invalid file
    }
  }
}