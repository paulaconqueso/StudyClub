const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyCW2UnABFqozgRKgkTvjc-KX5S-otNG6pM7e8G9IGjf10Cs1p-GsL4UIo2PCwUqPvU_g/exec";


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


let currentWeekOffset = 0;
let selectedAppointment = null;


// ====================================
// FECHAS
// ====================================

function getMonday(offset) {

    const today = new Date();

    const day = today.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

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

    return (
        day +
        "/" +
        month +
        "/" +
        year
    );
}


// ====================================
// ACTUALIZAR SEMANA
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

        const formattedDate =
            formatDate(date);

        const title =
            dayElement.querySelector(".day-title");

        title.textContent =
            dayNames[index] +
            " " +
            formattedDate;

        dayElement.dataset.date =
            formattedDate;

        const appointmentId =
            formattedDate + "_20:10";

        dayElement.dataset.appointmentId =
            appointmentId;

        updateAppointmentDisplay(
            dayElement,
            null
        );

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
// MOSTRAR CITA
// ====================================

function updateAppointmentDisplay(
    dayElement,
    appointment
) {

    const nameElement =
        dayElement.querySelector(
            ".appointment-name"
        );

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


    if (!appointment) {

        nameElement.textContent =
            "Disponible";

        countElement.textContent =
            "0 / 6";

        placesElement.textContent =
            "6 plazas disponibles";

        button.textContent =
            "Apuntarme";

        button.disabled =
            false;

        return;
    }


    const count =
        Number(
            appointment.participantes
        ) || 0;


    if (count === 0) {

        nameElement.textContent =
            "Disponible";

    } else {

        nameElement.textContent =
            appointment.nombre ||
            "Disponible";

    }


    countElement.textContent =
        count + " / 6";


    const places =
        6 - count;


    if (places > 0) {

        placesElement.textContent =
            places +
            " plazas disponibles";

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


// ====================================
// CARGAR CITAS DESDE GOOGLE
// ====================================

function loadAppointmentsFromGoogle() {

    const callbackName =
        "studyClubAppointmentsCallback_" +
        Date.now();


    window[callbackName] =
        function(appointments) {

            console.log(
                "Citas recibidas:",
                appointments
            );


            appointments.forEach(
                function(appointment) {

                    const appointmentId =
                        String(
                            appointment.id
                        );


                    const dayElement =
                        document.querySelector(
                            '.day[data-appointment-id="' +
                            appointmentId +
                            '"]'
                        );


                    if (dayElement) {

                        updateAppointmentDisplay(
                            dayElement,
                            appointment
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
                "No se han podido cargar las citas."
            );

            delete window[callbackName];

            script.remove();

        };


    document.body.appendChild(script);
}


// ====================================
// NAVEGACIÓN
// ====================================

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


// ====================================
// ABRIR RESERVA
// ====================================

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


// ====================================
// CERRAR RESERVA
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
// BOTONES APUNTARME
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

                openBooking(dayElement);

            }
        );

    }
);


// ====================================
// ENVIAR RESERVA
// ====================================

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


        const appointmentId =
            selectedAppointment.id;


        const confirmButton =
            bookingForm.querySelector(
                ".confirm-button"
            );


        confirmButton.disabled =
            true;


        confirmButton.textContent =
            "Guardando...";


        // ====================================
        // IFRAME OCULTO
        // ====================================

        const iframe =
            document.createElement("iframe");


        iframe.name =
            "studyClubBookingFrame_" +
            Date.now();


        iframe.style.display =
            "none";


        document.body.appendChild(iframe);


        // ====================================
        // FORMULARIO OCULTO
        // ====================================

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


        addHiddenField(
            form,
            "appointmentId",
            appointmentId
        );


        addHiddenField(
            form,
            "studentName",
            studentName
        );


        addHiddenField(
            form,
            "email",
            email
        );


        addHiddenField(
            form,
            "phone",
            phone
        );


        addHiddenField(
            form,
            "topic",
            topic
        );


        document.body.appendChild(form);


        // ====================================
        // ENVIAR
        // ====================================

        form.submit();


        // ====================================
        // ESPERAR Y RECARGAR CITAS
        // ====================================

        setTimeout(
            function() {

                checkReservation(
                    appointmentId,
                    studentName,
                    topic,
                    form,
                    iframe,
                    confirmButton
                );

            },
            1500
        );

    }
);


// ====================================
// COMPROBAR RESERVA
// ====================================

function checkReservation(
    appointmentId,
    studentName,
    topic,
    form,
    iframe,
    confirmButton
) {

    const callbackName =
        "studyClubReservationCheck_" +
        Date.now();


    window[callbackName] =
        function(appointments) {

            let appointmentFound =
                null;


            appointments.forEach(
                function(appointment) {

                    if (
                        String(
                            appointment.id
                        ) ===
                        String(
                            appointmentId
                        )
                    ) {

                        appointmentFound =
                            appointment;

                    }

                }
            );


            if (
                appointmentFound &&
                Number(
                    appointmentFound.participantes
                ) > 0
            ) {

                // --------------------------------
                // CERRAR MODAL
                // --------------------------------

                bookingForm.reset();

                closeBooking();


                // --------------------------------
                // ACTUALIZAR INMEDIATAMENTE
                // --------------------------------

                const dayElement =
                    document.querySelector(
                        '.day[data-appointment-id="' +
                        appointmentId +
                        '"]'
                    );


                if (dayElement) {

                    updateAppointmentDisplay(
                        dayElement,
                        appointmentFound
                    );

                }


                // --------------------------------
                // MENSAJE
                // --------------------------------

                alert(
                    "¡Reserva realizada!\n\n" +
                    appointmentId.replace(
                        "_20:10",
                        ""
                    ) +
                    "\n20:10 - 20:40\n\n" +
                    "Alumno: " +
                    studentName +
                    "\n" +
                    "Tema: " +
                    topic
                );


            } else {

                alert(
                    "No se ha podido confirmar la reserva.\n\n" +
                    "La reserva no aparece todavía en Google Sheets."
                );

            }


            // --------------------------------
            // LIMPIAR
            // --------------------------------

            delete window[callbackName];


            const oldScript =
                document.getElementById(
                    callbackName
                );


            if (oldScript) {
                oldScript.remove();
            }


            form.remove();

            iframe.remove();


            confirmButton.disabled =
                false;


            confirmButton.textContent =
                "Confirmar reserva";


            // --------------------------------
            // RECARGAR DATOS REALES
            // --------------------------------

            setTimeout(
                function() {

                    loadAppointmentsFromGoogle();

                },
                300
            );

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

            alert(
                "No se ha podido comprobar la reserva. " +
                "Comprueba Google Sheets."
            );


            delete window[callbackName];

            script.remove();

            form.remove();

            iframe.remove();


            confirmButton.disabled =
                false;


            confirmButton.textContent =
                "Confirmar reserva";

        };


    document.body.appendChild(script);

}


// ====================================
// CAMPO OCULTO
// ====================================

function addHiddenField(
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

loadAppointmentsFromGoogle();
