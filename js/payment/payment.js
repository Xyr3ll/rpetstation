// QR Function
function changeQR() {
  const paymentMethod = document.getElementById("paymentMethod").value;
  const qrImage = document.getElementById("qrImage");

  // Update the src based on selected payment method
  if (paymentMethod === "gcash") {
    qrImage.src = "/images/gcash.jpg";
  } else if (paymentMethod === "paymaya") {
    qrImage.src = "/images/paymaya.jpg";
  }
}

function validateImageFile() {
  const fileInput = document.getElementById("proofOfPayment");
  const file = fileInput.files[0];

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or GIF).");
      fileInput.value = ""; // Clear the input
    }
  }
}

