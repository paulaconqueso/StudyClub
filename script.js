const modal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModalButton = document.getElementById("closeModal");

const previousWeekButton = document.getElementById("previousWeek");
const nextWeekButton = document.getElementById("nextWeek");
const weekTitle = document.getElementById("weekTitle");

let currentWeekOffset = 0;
let selectedAppointment = null;


// -----------------------------
// FECHAS
// -----------------------------

function getMonday(offset = 0) {
    const today = new Date();

    const day = today.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);

    monday.setDate(
        today.getDate() + difference + (offset * 7)
    );

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

        date.setDate(
            monday.getDate() + index
        );

        const title = dayElement.querySelector(".day-title");

        title.textContent =
            `${dayNames[index]} ${formatDate(date)}`;

        dayElement.dataset.date =
            formatDate(date);
    });


    const thursday = new Date(monday);

    thursday.setDate(
        monday.getDate() + 3
    );

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
// ABRIR RESERVA
// -----------------------------

function openBooking(dayElement) {

    const date = dayElement.dataset.date;

    selectedAppointment = {
        date: date,
        time: "20:10 - 20:40"
    };

    document.getElementById("selectedAppointment").textContent =
        `${date} · 20:10 - 20:40`;

    modal.classList.remove("hidden");
}


// -----------------------------
// CERRAR MODAL
// -----------------------------

function closeBooking() {

    modal.classList.add("hidden");

    selectedAppointment = null;
}


closeModalButton.addEventListener(
    "click",
    closeBooking
);


window.addEventListener(
    "click",
    function(event) {

        if (event.target === modal) {
            closeBooking();
        }

    }
);


// -----------------------------
// BOTONES APUNTARME
// -----------------------------

document.querySelectorAll(".join-button").forEach(button => {

    button.addEventListener(
        "click",
        function() {

            const dayElement =
                button.closest(".day");

            openBooking(dayElement);

        }
    );

});


// -----------------------------
// FORMULARIO
// -----------------------------

bookingForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const studentName =
            document.getElementById("studentName").value;

        const email =
            document.getElementById("email").value;

        const phone =
            document.getElementById("phone").value;

        const topic =
            document.getElementById("topic").value;


        alert(
            `Reserva preparada para ${studentName}\n\n` +
            `${selectedAppointment.date}\n` +
            `${selectedAppointment.time}\n\n` +
            `Tema: ${topic}`
        );


        console.log({
            date: selectedAppointment.date,
            time: selectedAppointment.time,
            studentName: studentName,
            email: email,
            phone: phone,
            topic: topic
        });


        bookingForm.reset();

        closeBooking();
    }
);


// -----------------------------
// INICIO
// -----------------------------

updateWeek();
