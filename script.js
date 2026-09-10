const appointments = [
  { day: "Lunes", time: "20:10 - 20:40", participants: 0 },
  { day: "Martes", time: "20:10 - 20:40", participants: 0 },
  { day: "Miércoles", time: "20:10 - 20:40", participants: 0 },
  { day: "Jueves", time: "20:10 - 20:40", participants: 0 }
];

const modal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");

function openBooking() {
  modal.style.display = "flex";
}

function closeBooking() {
  modal.style.display = "none";
}

document.querySelectorAll(".book-button").forEach(button => {
  button.addEventListener("click", openBooking);
});

bookingForm.addEventListener("submit", function(event) {
  event.preventDefault();

  alert("Formulario preparado. Próximamente se conectará con Google Sheets.");
  
  bookingForm.reset();
  closeBooking();
});

window.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeBooking();
  }
});
