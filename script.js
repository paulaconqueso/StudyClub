const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCW2UnABFqozgRKgkTvjc-KX5S-otNG6pM7e8G9IGjf10Cs1p-GsL4UIo2PCwUqPvU_g/exec";

const modal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModalButton = document.getElementById("closeModal");

const previousWeekButton = document.getElementById("previousWeek");
const nextWeekButton = document.getElementById("nextWeek");
const weekTitle = document.getElementById("weekTitle");

let currentWeekOffset = 0;
let selectedAppointment = null;

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


    const nameElement =
        dayElement.querySelector(".appointment-name");


    const countElement =
        dayElement.querySelector(".participant-count");


    const placesElement =
        dayElement.querySelector(".places");


    const button =
        dayElement.querySelector(".join-button");


    const count =
        appointment.participants.length;


    if (count === 0) {

        nameElement.textContent =
            "Disponible";

    } else {

        nameElement.textContent =
            appointment.name;
    }


    countElement.textContent =
        count + " / 6";


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
// LEER CITAS DE GOOGLE SHEETS
// -----------------------------

function loadAppointmentsFromGoogle() {

    const url =
        APPS_SCRIPT_URL +
        "?action=getAppointments";


    fetch(url)

        .then(function(response) {

            return response.json();
        })

        .then(function(appointments) {

            appointments.forEach(
                function(appointment) {

                    const appointmentId =
                        String(appointment.id);


                    appointmentData[
                        appointmentId
                    ] = {

                        name:
                            appointment.nombre ||
                            "Disponible",

                        participants:
                            createParticipants(
                                Number(
                                    appointment.participantes
                                ) || 0
                            )
                    };


                    const dayElement =
                        document.querySelector(
                            '.day[data-appointment-id="' +
                            appointmentId +
                            '"]'
                        );


                    if (dayElement) {

                        updateAppointmentDisplay(
                            dayElement
                        );
                    }
                }
            );

        })

        .catch(function(error) {

            console.error(
                "Error al cargar las citas:",
                error
            );
        });
}


// -----------------------------
// CREAR PARTICIPANTES
// -----------------------------

function createParticipants(count) {

    const participants = [];


    for (let i = 0; i < count; i++) {

        participants.push({});
    }


    return participants;
}


// -----------------------------
// NAVEGACIÓN
// -----------------------------

previousWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset--;

        updateWeek();

        loadAppointmentsFromGoogle();
    }
);


nextWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset++;

        updateWeek();

        loadAppointmentsFromGoogle();
    }
);


// -----------------------------
// ABRIR RESERVA
// -----------------------------

function openBooking(dayElement) {

    selectedAppointment = {

        date:
            dayElement.dataset.date,

        time:
            "20:10 - 20:40",

        id:
            dayElement.dataset.appointmentId
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
// ENVIAR RESERVA A GOOGLE SHEETS
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


        if (
            appointment.participants.length >= 6
        ) {

            alert(
                "Lo sentimos, esta cita está completa."
            );

            closeBooking();

            return;
        }


        const reservationData = {

            appointmentId:
                selectedAppointment.id,

            studentName:
                studentName,

            email:
                email,

            phone:
                phone,

            topic:
                topic
        };


        const confirmButton =
            bookingForm.querySelector(
                ".confirm-button"
            );


        confirmButton.disabled = true;

        confirmButton.textContent =
            "Guardando...";


        fetch(
            APPS_SCRIPT_URL,
            {
                method: "POST",

                body:
                    JSON.stringify(
                        reservationData
                    )
            }
        )

        .then(function(response) {

            return response.json();
        })

        .then(function(result) {

            if (!result.success) {

                alert(
                    result.message ||
                    "No se ha podido realizar la reserva."
                );

                return;
            }


            // Actualizar contador local

            appointment.participants.push({

                name:
                    studentName,

                email:
                    email,

                phone:
                    phone,

                topic:
                    topic
            });


            // Primer tema = nombre público de la cita

            if (
                appointment.participants.length === 1
            ) {

                appointment.name =
                    topic;
            }


            const dayElement =
                document.querySelector(
                    '.day[data-appointment-id="' +
                    selectedAppointment.id +
                    '"]'
                );


            updateAppointmentDisplay(
                dayElement
            );


            const confirmedDate =
                selectedAppointment.date;


            const confirmedTime =
                selectedAppointment.time;


            bookingForm.reset();

            closeBooking();


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


            // Volver a leer los datos reales de Google Sheets

            loadAppointmentsFromGoogle();

        })

        .catch(function(error) {

            console.error(
                "Error al guardar la reserva:",
                error
            );


            alert(
                "Ha ocurrido un error al guardar la reserva. " +
                "Por favor, inténtalo de nuevo."
            );

        })

        .finally(function() {

            confirmButton.disabled = false;

            confirmButton.textContent =
                "Confirmar reserva";
        });
    });


// -----------------------------
// INICIO
// -----------------------------

updateWeek();

loadAppointmentsFromGoogle();
