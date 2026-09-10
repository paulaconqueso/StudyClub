const modal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModalButton = document.getElementById("closeModal");

const previousWeekButton = document.getElementById("previousWeek");
const nextWeekButton = document.getElementById("nextWeek");
const weekTitle = document.getElementById("weekTitle");

let currentWeekOffset = 0;


// -----------------------------
// FECHAS
// -----------------------------

function getMonday(offset = 0) {
    const today = new Date();

    const day = today.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + difference + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    return monday;
}


function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


function updateWeek() {

    const monday = getMonday(currentWeekOffset);

    const days = document.querySelectorAll(".day");

    const dayNames = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves"
    ];

    days.forEach((dayElement, index) => {

        const date = new Date(monday);
        date.setDate(monday.getDate() + index);

        const title = dayElement.querySelector(".day-title");

        title.textContent =
            `${dayNames[index]} ${formatDate(date)}`;
    });


    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);

    weekTitle.textContent =
        `Semana del ${formatDate(monday)} al ${formatDate(thursday)}`;
}


// -----------------------------
// NAVEGACIÓN
// -----------------------------

previousWeekButton.addEventListener("click", function() {

    currentWeekOffset--;

    updateWeek();
});


nextWeekButton.addEventListener("click", function() {

    currentWeekOffset++;

    updateWeek();
});


// -----------------------------
// MODAL
// -----------------------------

function openBooking() {
    modal.classList.remove("hidden");
}


function closeBooking() {
    modal.classList.add("hidden");
}


document.querySelectorAll(".join-button").forEach(button => {

    button.addEventListener("click", function() {
        openBooking();
    });

});


closeModalButton.addEventListener("click", closeBooking);


window.addEventListener("click", function(event) {

    if (event.target === modal) {
        closeBooking();
    }

});


// -----------------------------
// FORMULARIO
// -----------------------------

bookingForm.addEventListener("submit", function(event) {

    event.preventDefault();

    alert(
        "Formulario preparado. Próximamente se conectará con Google Sheets."
    );

    bookingForm.reset();

    closeBooking();
});


// -----------------------------
// INICIO
// -----------------------------

updateWeek();
