```javascript
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


// ========================================
// FECHAS
// ========================================

function getMonday(offset) {

    const today = new Date();
    const day = today.getDay();

    const difference =
        day === 0 ? -6 : 1 - day;

    const monday = new Date(today);

    monday.setDate(
        today.getDate() +
        difference +
        (offset * 7)
    );

    monday.setHours(0, 0, 0, 0);

    return monday;
}


function formatDate(date) {

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();

    return day + "/" + month + "/" + year;
}


// ========================================
// ACTUALIZAR SEMANA
// ========================================

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

        const dateString = formatDate(date);

        const appointmentId =
            dateString + "_20:10";

        const title =
            dayElement.querySelector(".day-title");

        title.textContent =
            dayNames[index] + " " + dateString;

        dayElement.dataset.date =
            dateString;

        dayElement.dataset.appointmentId =
            appointmentId;
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


// ========================================
// MOSTRAR CITA
// ========================================

function showAppointment(dayElement, appointment) {

    const name =
        dayElement.querySelector(".appointment-name");

    const count =
        dayElement.querySelector(".participant-count");

    const places =
        dayElement.querySelector(".places");

    const button =
        dayElement.querySelector(".join-button");


    const participants =
        Number(appointment.participantes) || 0;


    name.textContent =
        appointment.nombre || "Disponible";


    count.textContent =
        participants + " / 6";


    const available =
        6 - participants;


    if (available > 0) {

        places.textContent =
            available + " plazas disponibles";

        button.textContent =
            "Apuntarme";

        button.disabled = false;

    } else {

        places.textContent =
            "Cita completa";

        button.textContent =
            "Completa";

        button.disabled = true;
    }
}


// ========================================
// BUSCAR DÍA EN PANTALLA
// ========================================

function findDayElement(appointmentId) {

    const days =
        document.querySelectorAll(".day");

    let result = null;


    days.forEach(function(day) {

        if (
            day.dataset.appointmentId ===
            appointmentId
        ) {
            result = day;
        }
    });


    return result;
}


// ========================================
// CARGAR CITAS
// ========================================

function loadAppointments() {

    console.log(
        "StudyClub: cargando citas..."
    );


    const url =
        APPS_SCRIPT_URL +
        "?action=getAppointments&t=" +
        Date.now();


    fetch(url)

        .then(function(response) {

            console.log(
                "StudyClub: respuesta recibida",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "HTTP " + response.status
                );
            }


            return response.json();
        })


        .then(function(appointments) {

            console.log(
                "StudyClub: datos recibidos",
                appointments
            );


            appointments.forEach(
                function(appointment) {

                    const id =
                        String(appointment.id);


                    console.log(
                        "Cita recibida:",
                        id,
                        appointment
                    );


                    const dayElement =
                        findDayElement(id);


                    if (dayElement) {

                        console.log(
                            "Cita encontrada:",
                            id
                        );


                        showAppointment(
                            dayElement,
                            appointment
                        );

                    } else {

                        console.log(
                            "Cita NO encontrada:",
                            id
                        );
                    }
                }
            );
        })


        .catch(function(error) {

            console.error(
                "StudyClub: ERROR cargando citas:",
                error
            );
        });
}


// ========================================
// ABRIR MODAL
// ========================================

function openBookingModal(dayElement) {

    const appointmentId =
        dayElement.dataset.appointmentId;

    const date =
        dayElement.dataset.date;


    const appointmentName =
        dayElement.querySelector(
            ".appointment-name"
        ).textContent;


    selectedAppointment = {

        id: appointmentId,

        date: date
    };


    document.getElementById(
        "selectedAppointment"
    ).textContent =
        appointmentName +
        " · " +
        date +
        " · 20:10 - 20:40";


    modal.classList.remove("hidden");
}


// ========================================
// CERRAR MODAL
// ========================================

function closeBookingModal() {

    modal.classList.add("hidden");

    bookingForm.reset();

    selectedAppointment = null;
}


// ========================================
// BOTONES APUNTARME
// ========================================

document.querySelectorAll(
    ".join-button"
).forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            const dayElement =
                button.closest(".day");

            openBookingModal(
                dayElement
            );
        }
    );
});


// ========================================
// CERRAR MODAL
// ========================================

closeModalButton.addEventListener(
    "click",
    closeBookingModal
);


modal.addEventListener(
    "click",
    function(event) {

        if (event.target === modal) {

            closeBookingModal();
        }
    }
);


// ========================================
// RESERVA
// ========================================

bookingForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (!selectedAppointment) {

            return;
        }


        const studentName =
            document.getElementById(
                "studentName"
            ).value.trim();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const topic =
            document.getElementById(
                "topic"
            ).value.trim();


        if (
            !studentName ||
            !email ||
            !phone ||
            !topic
        ) {

            alert(
                "Por favor, completa todos los campos."
            );

            return;
        }


        const iframe =
            document.createElement("iframe");


        iframe.name =
            "studyClubSubmitFrame";


        iframe.style.display =
            "none";


        document.body.appendChild(
            iframe
        );


        const form =
            document.createElement("form");


        form.method = "POST";

        form.action =
            APPS_SCRIPT_URL;

        form.target =
            "studyClubSubmitFrame";

        form.style.display =
            "none";


        const fields = {

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


        Object.keys(fields).forEach(
            function(key) {

                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "hidden";


                input.name =
                    key;


                input.value =
                    fields[key];


                form.appendChild(
                    input
                );
            }
        );


        document.body.appendChild(
            form
        );


        form.submit();


        setTimeout(
            function() {

                alert(
                    "¡Reserva realizada!"
                );


                form.remove();

                iframe.remove();

                closeBookingModal();


                setTimeout(
                    function() {

                        loadAppointments();

                    },
                    1000
                );

            },
            2000
        );
    }
);


// ========================================
// SEMANA ANTERIOR
// ========================================

previousWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset--;

        updateWeek();

        loadAppointments();
    }
);


// ========================================
// SEMANA SIGUIENTE
// ========================================

nextWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset++;

        updateWeek();

        loadAppointments();
    }
);


// ========================================
// INICIO
// ========================================

updateWeek();

loadAppointments();
```
