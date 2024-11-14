// Open the modal
function openModal() {
    document.getElementById("appointmentModal").style.display = "block";
  }
  
  // Close the modal
  function closeModal() {
    document.getElementById("appointmentModal").style.display = "none";
  }
  
  // Close the modal when clicking outside of the modal content
  window.onclick = function(event) {
    var modal = document.getElementById("appointmentModal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  