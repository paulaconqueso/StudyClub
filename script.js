const modal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModalButton = document.getElementById("closeModal");

const previousWeekButton = document.getElementById("previousWeek");
const nextWeekButton = document.getElementById("nextWeek");
const weekTitle = document.getElementById("weekTitle");

let currentWeekOffset = 0;
let selectedAppointment = null;


// -----------------------------
// DATOS DE LAS CITAS
// -----------------------------

const appointmentData = {};


// -----------------------------
// FECHAS
// -----------------------------

function getMonday(offset) {

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

    return day + "/" + month + "/" + year;
}


// -----------------------------
// ACTUALIZAR SEMANA
// -----------------------------

function updateWeek() {

    const monday = getMonday(currentWeekOffset);

    const days = document.querySelectorAll(".day");

    const dayNames = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves"
    ];


    days.forEach(function(dayElement, index) {

        const date = new Date(monday);

        date.setDate(
            monday.getDate() + index
        );


        const formattedDate = formatDate(date);

        const title =
            dayElement.querySelector(".day-title");


        title.textContent =
            dayNames[index] + " " + formattedDate;


        dayElement.dataset.date =
            formattedDate;


        const appointmentId =
            formattedDate + "_20:10";


        dayElement.dataset.appointmentId =
            appointmentId;


        // Crear los datos de la cita si todavía no existen

        if (!appointmentData[appointmentId]) {

            appointmentData[appointmentId] = {

                name: "Disponible",

                participants: []
            };
        }


        updateAppointmentDisplay(dayElement);

    });


    const thursday = new Date(monday);

    thursday.setDate(
        monday.getDate() + 3
    );


    weekTitle.textContent =
        "Semana del " +
        formatDate(monday) +
        " al " +
        formatDate(thursday);
}


// -----------------------------
// ACTUALIZAR TARJETA
// -----------------------------

function updateAppointmentDisplay(dayElement) {

    const appointmentId =
        dayElement.dataset.appointmentId;


    const appointment =
        appointmentData[appointmentId];


    const countElement =
        dayElement.querySelector(
            ".participant-count"
        );


    const placesElement =
        dayElement.querySelector(
            ".places"
        );


    const button =
        dayElement.querySelector(
            ".join-button"
        );


    const count =
        appointment.participants.length;


    // -----------------------------
    // CONTADOR
    // -----------------------------

    countElement.textContent =
        count + " / 6";


    // -----------------------------
    // PLAZAS DISPONIBLES
    // -----------------------------

    const places =
        6 - count;


    if (places > 0) {

        placesElement.textContent =
            places + " plazas disponibles";


        button.textContent =
            "Apuntarme";


        button.disabled =
            false;

    } else {

        placesElement.textContent =
            "Cita completa";


        button.textContent =
            "Completa";


        button.disabled =
            true;
    }
}


// -----------------------------
// NAVEGACIÓN
// -----------------------------

previousWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset--;

        updateWeek();
    }
);


nextWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset++;

        updateWeek();
    }
);


// -----------------------------
// ABRIR RESERVA
// -----------------------------

function openBooking(dayElement) {

    selectedAppointment = {

        date: dayElement.dataset.date,

        time: "20:10 - 20:40",

        id: dayElement.dataset.appointmentId
    };


    document.getElementById(
        "selectedAppointment"
    ).textContent =
        selectedAppointment.date +
        " · " +
        selectedAppointment.time;


    modal.classList.remove("hidden");
}


// -----------------------------
// CERRAR RESERVA
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

document
    .querySelectorAll(".join-button")
    .forEach(function(button) {

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
            document
                .getElementById("studentName")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const topic =
            document
                .getElementById("topic")
                .value
                .trim();


        const appointment =
            appointmentData[
                selectedAppointment.id
            ];


        // -----------------------------
        // COMPROBAR PLAZAS
        // -----------------------------

        if (appointment.participants.length >= 6) {

            alert(
                "Lo sentimos, esta cita está completa."
            );

            closeBooking();

            return;
        }


        // -----------------------------
        // PRIMER TEMA
        // -----------------------------

        if (appointment.participants.length === 0) {

            appointment.name =
                topic;
        }


        // -----------------------------
        // GUARDAR PARTICIPANTE
        // -----------------------------

        appointment.participants.push({

            name: studentName,

            email: email,

            phone: phone,

            topic: topic
        });


        // -----------------------------
        // ACTUALIZAR TARJETA
        // -----------------------------

        const dayElement =
            document.querySelector(
                '.day[data-appointment-id="' +
                selectedAppointment.id +
                '"]'
            );


        updateAppointmentDisplay(
            dayElement
        );


        // -----------------------------
        // GUARDAR DATOS DE CONFIRMACIÓN
        // -----------------------------

        const confirmedDate =
            selectedAppointment.date;


        const confirmedTime =
            selectedAppointment.time;


        // -----------------------------
        // CERRAR
        // -----------------------------

        bookingForm.reset();

        closeBooking();


        // -----------------------------
        // CONFIRMACIÓN
        // -----------------------------

        alert(
            "¡Reserva realizada!\n\n" +
            confirmedDate +
            "\n" +
            confirmedTime +
            "\n\n" +
            "Alumno: " +
            studentName +
            "\n" +
            "Tema: " +
            topic
        );
    }
);


// -----------------------------
// INICIO
// -----------------------------

updateWeek();
