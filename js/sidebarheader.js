const activePage = window.location.pathname;
document.querySelectorAll('#sidebar a').forEach(link => {
  if (link.href.includes(`${activePage}`)) {
    link.classList.add('active');
    console.log(link);
  }
});

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "block";
  
  setTimeout(() => {
    sidebar.classList.add("active");
  }, 10);

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "overlay active";
  overlay.onclick = closeSidebar;
  document.body.appendChild(overlay);
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("active");

  setTimeout(() => {
    // Only hide sidebar if still in mobile view (less than 992px).
    if (window.innerWidth <= 992) {
      sidebar.style.display = "none";
    }
  }, 300);

  const overlay = document.querySelector(".overlay");
  if (overlay) overlay.remove();
}

// Track screen resizing to reset sidebar visibility.
window.addEventListener("resize", () => {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth > 992) {
    // Ensure the sidebar is visible on larger screens.
    sidebar.style.display = "block";
  } else {
    // Hide the sidebar in smaller screens if not active.
    if (!sidebar.classList.contains("active")) {
      sidebar.style.display = "none";
    }
  }
});

// Event listener for the menu icon.
document.querySelector(".menu-icon").addEventListener("click", openSidebar);
