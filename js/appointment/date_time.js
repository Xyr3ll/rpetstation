import {
  db,
  collection,
  getDocs,
  query,
  where
} from "../firebase/database.js";

// Function to convert the selected date and time to a Date object
const getSelectedDateTime = (date, time) => {
  const [startHour, startPeriod] = time.split(' - ')[0].split(' ');
  let hour = parseInt(startHour);
  if (startPeriod === 'PM' && hour !== 12) hour += 12; // Adjust hour for PM
  if (startPeriod === 'AM' && hour === 12) hour = 0; // Adjust for 12 AM

  // Ensure the date format is correct for JavaScript Date parsing (e.g., YYYY-MM-DD)
  const formattedDate = date.split("-").join("/");

  // Construct the full date and time string
  const dateTimeString = `${formattedDate} ${hour}:${'00'}:00 UTC+8`;
  
  // Create a JavaScript Date object from the formatted string
  const dateObject = new Date(dateTimeString);

  // Check if the dateObject is invalid
  if (isNaN(dateObject)) {
    console.error("Invalid date value:", dateTimeString);
    return null; // Return null if the date is invalid
  }

  return dateObject;
};

// Query Firestore for existing bookings at the selected date and time
const checkBookingAvailability = async (date, timeRange) => {
  try {
    const customerBookingRef = collection(db, "customerBooking");

    // Query Firestore for matching date and time range
    const q = query(
      customerBookingRef,
      where("scheduledDate", "==", date), // Match selected date
      where("scheduledTime", "==", timeRange) // Match selected time range
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.empty; // True if no bookings found
  } catch (error) {
    console.error("Error checking booking availability: ", error);
    return false; // Assume unavailable in case of error
  }
};

const generateTimeRanges = () => {
  const startHour = 9; // Starting time (9AM)
  const endHour = 18; // Ending time (6PM in 24-hour format)
  const timeRanges = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const startPeriod = hour < 12 ? "AM" : "PM";
    const endPeriod = hour + 1 < 12 ? "AM" : "PM";
    const startHourFormatted = hour <= 12 ? hour : hour - 12;
    const endHourFormatted = hour + 1 <= 12 ? hour + 1 : hour - 11;
    timeRanges.push(
      `${startHourFormatted}${startPeriod} - ${endHourFormatted}${endPeriod}`
    );
  }

  return timeRanges;
};

// Populate the select element with the generated time ranges
const populateTimeRanges = async () => {
  const timeRangeSelect = document.getElementById("time-range");
  const timeRanges = generateTimeRanges();
  const selectedDate = document.getElementById("schedule-date").value;

  for (const range of timeRanges) {
    const isAvailable = await checkBookingAvailability(selectedDate, range);

    const option = document.createElement("option");
    option.value = range; // Value is plain text, e.g., "9AM - 10AM"
    option.textContent = range;

    if (!isAvailable) {
      option.disabled = true; // Disable unavailable slots
      option.title = "This time slot is already booked"; // Tooltip
    }

    timeRangeSelect.appendChild(option);
  }
};


// Event listener to handle date change
document.getElementById("schedule-date").addEventListener("change", async () => {
  const timeRangeSelect = document.getElementById("time-range");
  timeRangeSelect.innerHTML = ""; // Clear existing options
  await populateTimeRanges(); // Re-populate based on the new selected date
});

// Call the function to populate the time ranges when the page loads
window.onload = async () => {
  // Format the date to YYYY-MM-DD for the `min` attribute
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  document.getElementById("schedule-date").setAttribute("min", minDate);

  // Initially populate the time ranges
  await populateTimeRanges();
};
