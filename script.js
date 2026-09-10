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

const appointmentData = {};


// ====================================
// FECHAS
// ====================================

function getMonday(offset) {

    const today = new Date();

    const day =
        today.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    const monday =
        new Date(today);

    monday.setDate(
        today.getDate() +
        difference +
        (offset * 7)
    );

    monday.setHours(
        0,
        0,
        0,
        0
    );

    return monday;
}


function formatDate(date) {

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

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
        getMonday(
            currentWeekOffset
        );


    const days =
        document.querySelectorAll(
            ".day"
        );


    const dayNames = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves"
    ];


    days.forEach(
        function(
            dayElement,
            index
        ) {

            const date =
                new Date(monday);


            date.setDate(
                monday.getDate() +
                index
            );


            const formattedDate =
                formatDate(date);


            const title =
                dayElement.querySelector(
                    ".day-title"
                );


            title.textContent =
                dayNames[index] +
                " " +
                formattedDate;


            dayElement.dataset.date =
                formattedDate;


            const appointmentId =
                formattedDate +
                "_20:10";


            dayElement.dataset.appointmentId =
                appointmentId;


            if (
                !appointmentData[
                    appointmentId
                ]
            ) {

                appointmentData[
                    appointmentId
                ] = {

                    name:
                        "Disponible",

                    participants:
                        []

                };

            }


            updateAppointmentDisplay(
                dayElement
            );

        }
    );


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
    dayElement
) {

    const appointmentId =
        dayElement.dataset.appointmentId;


    const appointment =
        appointmentData[
            appointmentId
        ];


    if (!appointment) {
        return;
    }


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
        count +
        " / 6";


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
        "studyClubAppointmentsCallback";


    window[callbackName] =
        function(appointments) {

            appointments.forEach(
                function(appointment) {

                    const appointmentId =
                        String(
                            appointment.id
                        );


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


            delete window[
                callbackName
            ];


            const oldScript =
                document.getElementById(
                    "studyClubDataScript"
                );


            if (oldScript) {

                oldScript.remove();

            }

        };


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "studyClubDataScript";


    script.src =
        APPS_SCRIPT_URL +
        "?action=getAppointments" +
        "&callback=" +
        callbackName +
        "&t=" +
        new Date().getTime();


    script.onerror =
        function() {

            console.error(
                "No se han podido cargar las citas."
            );


            delete window[
                callbackName
            ];


            script.remove();

        };


    document.body.appendChild(
        script
    );
}


function createParticipants(count) {

    const participants = [];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        participants.push({});

    }


    return participants;
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

function openBooking(
    dayElement
) {

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


    modal.classList.remove(
        "hidden"
    );
}


// ====================================
// CERRAR RESERVA
// ====================================

function closeBooking() {

    modal.classList.add(
        "hidden"
    );

    selectedAppointment =
        null;
}


closeModalButton.addEventListener(
    "click",
    closeBooking
);


window.addEventListener(
    "click",
    function(event) {

        if (
            event.target === modal
        ) {

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

                const dayElement =
                    button.closest(
                        ".day"
                    );

                openBooking(
                    dayElement
                );

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


        const appointment =
            appointmentData[
                appointmentId
            ];


        // ----------------------------
        // COMPROBAR PLAZAS
        // ----------------------------

        if (
            appointment &&
            appointment.participants.length >= 6
        ) {

            alert(
                "Lo sentimos, esta cita está completa."
            );

            closeBooking();

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


        // ----------------------------
        // CREAR IFRAME OCULTO
        // ----------------------------

        const iframe =
            document.createElement(
                "iframe"
            );


        iframe.name =
            "studyClubBookingFrame";


        iframe.style.display =
            "none";


        document.body.appendChild(
            iframe
        );


        // ----------------------------
        // CREAR FORMULARIO OCULTO
        // ----------------------------

        const form =
            document.createElement(
                "form"
            );


        form.method =
            "POST";


        form.action =
            APPS_SCRIPT_URL;


        form.target =
            "studyClubBookingFrame";


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


        document.body.appendChild(
            form
        );


        // ----------------------------
        // ENVIAR
        // ----------------------------

        form.submit();


        // ----------------------------
        // COMPROBAR DESPUÉS
        // ----------------------------

        setTimeout(
            function() {

                checkReservationSaved(
                    appointmentId,
                    studentName,
                    topic,
                    form,
                    iframe,
                    confirmButton
                );

            },
            2000
        );

    }
);


// ====================================
// COMPROBAR QUE SE GUARDÓ
// ====================================

function checkReservationSaved(
    appointmentId,
    studentName,
    topic,
    form,
    iframe,
    confirmButton
) {

    const callbackName =
        "studyClubCheckCallback";


    window[callbackName] =
        function(appointments) {

            let savedAppointment =
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

                        savedAppointment =
                            appointment;

                    }

                }
            );


            const savedCount =
                savedAppointment
                    ? Number(
                        savedAppointment.participantes
                    )
                    : 0;


            // --------------------------------
            // RESERVA CONFIRMADA
            // --------------------------------

            if (
                savedCount > 0
            ) {

                if (
                    !appointmentData[
                        appointmentId
                    ]
                ) {

                    appointmentData[
                        appointmentId
                    ] = {

                        name:
                            topic,

                        participants:
                            []

                    };

                }


                appointmentData[
                    appointmentId
                ].participants.push({

                    name:
                        studentName,

                    topic:
                        topic

                });


                appointmentData[
                    appointmentId
                ].name =
                    savedAppointment.nombre ||
                    topic;


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

            } else {

                // --------------------------------
                // NO SE HA GUARDADO
                // --------------------------------

                alert(
                    "No se ha podido confirmar la reserva.\n\n" +
                    "La reserva no aparece todavía en Google Sheets."
                );

            }


            // --------------------------------
            // LIMPIAR
            // --------------------------------

            delete window[
                callbackName
            ];


            const oldScript =
                document.getElementById(
                    "studyClubCheckScript"
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


            // Actualizar datos reales

            setTimeout(
                function() {

                    loadAppointmentsFromGoogle();

                },
                500
            );

        };


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "studyClubCheckScript";


    script.src =
        APPS_SCRIPT_URL +
        "?action=getAppointments" +
        "&callback=" +
        callbackName +
        "&t=" +
        new Date().getTime();


    script.onerror =
        function() {

            console.error(
                "No se ha podido comprobar la reserva."
            );


            alert(
                "No se ha podido comprobar la reserva. " +
                "Comprueba Google Sheets."
            );


            delete window[
                callbackName
            ];


            script.remove();

            form.remove();

            iframe.remove();


            confirmButton.disabled =
                false;


            confirmButton.textContent =
                "Confirmar reserva";

        };


    document.body.appendChild(
        script
    );
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
        document.createElement(
            "input"
        );


    input.type =
        "hidden";


    input.name =
        name;


    input.value =
        value;


    form.appendChild(
        input
    );
}


// ====================================
// INICIO
// ====================================

updateWeek();

loadAppointmentsFromGoogle();
