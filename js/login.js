function openLoginModal() {
    document.getElementById("loginModal").style.display = "block";
  }
  
  function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
  }
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    const loginModal = document.getElementById("loginModal");
    if (event.target === loginModal) {
      loginModal.style.display = "none";
    }
  };
  