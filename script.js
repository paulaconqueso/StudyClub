const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCW2UnABFqozgRKgkTvjc-KX5S-otNG6pM7e8G9IGjf10Cs1p-GsL4UIo2PCwUqPvU_g/exec";


// ====================================
// ELEMENTOS
// ====================================

const modal =
    document.getElementById("bookingModal");

const bookingForm =
    document.getElementById("bookingForm");

const closeModalButton =
    document.getElementById("closeModal");

const previousWeekButton =
    document.getElementById("previousWeek");

const nextWeekButton =
    document.getElementById("nextWeek");

const weekTitle =
    document.getElementById("weekTitle");


// ====================================
// VARIABLES
// ====================================

let currentWeekOffset = 0;
let selectedAppointment = null;


// ====================================
// FECHAS
// ====================================

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

    return `${day}/${month}/${year}`;
}


// ====================================
// MOSTRAR SEMANA
// ====================================

function updateWeek() {

    const monday =
        getMonday(currentWeekOffset);

    const days =
        document.querySelectorAll(".day");

    const dayNames = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves"
    ];

    days.forEach(function(dayElement, index) {

        const date =
            new Date(monday);

        date.setDate(
            monday.getDate() + index
        );

        const dateString =
            formatDate(date);

        const appointmentId =
            dateString + "_20:10";

        const title =
            dayElement.querySelector(".day-title");

        title.textContent =
            dayNames[index] +
            " " +
            dateString;

        dayElement.dataset.date =
            dateString;

        dayElement.dataset.appointmentId =
            appointmentId;

    });


    const thursday =
        new Date(monday);

    thursday.setDate(
        monday.getDate() + 3
    );

    weekTitle.textContent =
        "Semana del " +
        formatDate(monday) +
        " al " +
        formatDate(thursday);

}


// ====================================
// MOSTRAR DATOS DE UNA CITA
// ====================================

function showAppointment(
    dayElement,
    appointment
) {

    const name =
        dayElement.querySelector(
            ".appointment-name"
        );

    const count =
        dayElement.querySelector(
            ".participant-count"
        );

    const places =
        dayElement.querySelector(
            ".places"
        );

    const button =
        dayElement.querySelector(
            ".join-button"
        );


    const participants =
        Number(
            appointment.participantes
        ) || 0;


    name.textContent =
        appointment.nombre ||
        "Disponible";


    count.textContent =
        participants + " / 6";


    const available =
        6 - participants;


    if (available > 0) {

        places.textContent =
            available +
            " plazas disponibles";

        button.textContent =
            "Apuntarme";

        button.disabled =
            false;

    } else {

        places.textContent =
            "Cita completa";

        button.textContent =
            "Completa";

        button.disabled =
            true;

    }

}


// ====================================
// CARGAR GOOGLE SHEETS
// ====================================

function loadAppointments() {

    console.log(
        "StudyClub: cargando citas..."
    );


    const callbackName =
        "studyClubCallback_" +
        Date.now();


    window[callbackName] =
        function(appointments) {

            console.log(
                "StudyClub: datos recibidos",
                appointments
            );


            appointments.forEach(
                function(appointment) {

                    const id =
                        String(
                            appointment.id
                        );


                    console.log(
                        "Cita recibida:",
                        id,
                        appointment
                    );


                    const dayElement =
                        document.querySelector(
                            `.day[data-appointment-id="${id}"]`
                        );


                    if (dayElement) {

                        console.log(
                            "Cita encontrada en pantalla:",
                            id
                        );


                        showAppointment(
                            dayElement,
                            appointment
                        );

                    } else {

                        console.log(
                            "NO encontrada en pantalla:",
                            id
                        );

                    }

                }
            );


            delete window[callbackName];


            const script =
                document.getElementById(
                    callbackName
                );

            if (script) {
                script.remove();
            }

        };


    const script =
        document.createElement("script");


    script.id =
        callbackName;


    script.src =
        APPS_SCRIPT_URL +
        "?action=getAppointments" +
        "&callback=" +
        callbackName +
        "&t=" +
        Date.now();


    script.onerror =
        function() {

            console.error(
                "StudyClub: ERROR cargando Google Apps Script"
            );

            delete window[callbackName];

            script.remove();

        };


    document.body.appendChild(script);

}


// ====================================
// ABRIR MODAL
// ====================================

function openBooking(dayElement) {

    selectedAppointment = {

        id:
            dayElement.dataset.appointmentId,

        date:
            dayElement.dataset.date,

        time:
            "20:10 - 20:40"

    };


    document.getElementById(
        "selectedAppointment"
    ).textContent =
        selectedAppointment.date +
        " · " +
        selectedAppointment.time;


    modal.classList.remove("hidden");

}


// ====================================
// CERRAR MODAL
// ====================================

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


// ====================================
// BOTONES
// ====================================

document.querySelectorAll(
    ".join-button"
).forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                if (button.disabled) {
                    return;
                }

                const dayElement =
                    button.closest(".day");

                openBooking(
                    dayElement
                );

            }
        );

    }
);


// ====================================
// NAVEGACIÓN
// ====================================

previousWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset--;

        updateWeek();

        loadAppointments();

    }
);


nextWeekButton.addEventListener(
    "click",
    function() {

        currentWeekOffset++;

        updateWeek();

        loadAppointments();

    }
);


// ====================================
// RESERVA
// ====================================

bookingForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (!selectedAppointment) {
            return;
        }


        const confirmButton =
            bookingForm.querySelector(
                ".confirm-button"
            );


        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "Guardando...";


        const iframe =
            document.createElement("iframe");


        iframe.name =
            "studyClubFrame_" +
            Date.now();


        iframe.style.display =
            "none";


        document.body.appendChild(
            iframe
        );


        const form =
            document.createElement("form");


        form.method =
            "POST";

        form.action =
            APPS_SCRIPT_URL;

        form.target =
            iframe.name;

        form.style.display =
            "none";


        addField(
            form,
            "appointmentId",
            selectedAppointment.id
        );

        addField(
            form,
            "studentName",
            document.getElementById(
                "studentName"
            ).value.trim()
        );

        addField(
            form,
            "email",
            document.getElementById(
                "email"
            ).value.trim()
        );

        addField(
            form,
            "phone",
            document.getElementById(
                "phone"
            ).value.trim()
        );

        addField(
            form,
            "topic",
            document.getElementById(
                "topic"
            ).value.trim()
        );


        document.body.appendChild(form);

        form.submit();


        setTimeout(
            function() {

                const confirmedDate =
                    selectedAppointment.date;

                const confirmedTime =
                    selectedAppointment.time;

                const studentName =
                    document.getElementById(
                        "studentName"
                    ).value.trim();

                const topic =
                    document.getElementById(
                        "topic"
                    ).value.trim();


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


                form.remove();

                iframe.remove();

                confirmButton.disabled =
                    false;

                confirmButton.textContent =
                    "Confirmar reserva";


                loadAppointments();

            },
            2000
        );

    }
);


// ====================================
// CAMPO OCULTO
// ====================================

function addField(
    form,
    name,
    value
) {

    const input =
        document.createElement("input");

    input.type =
        "hidden";

    input.name =
        name;

    input.value =
        value;

    form.appendChild(input);

}


// ====================================
// INICIO
// ====================================

updateWeek();

loadAppointments();
