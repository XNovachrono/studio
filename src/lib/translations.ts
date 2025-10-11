

export const translations = {
    es: {
        editor: {
            initialHint: "Toca para continuar con una página vacía o elige una tarjeta",
            placeholders: {
                default: "Escribe o importa archivos...",
                heading: "Título",
            },
            ai: {
                trigger: "Pregúntale a la IA...",
                placeholder: "Tu pregunta o instrucción...",
                satisfied: "¿Satisfecho con el resultado?",
                accept: "Aceptar",
                regenerate: "Regenerar",
                modify: "Modificar",
            },
            bubbleMenu: {
                explain: "Explica",
                askAI: "Pregúntale a la IA",
                comment: "Comentar",
            }
        },
        dashboardHeader: {
            dashboard: "Panel",
            banks: "Bancos",
            themes: "Temas",
            logout: "Cerrar sesión",
            dataSettings: "Ajuste de datos",
        },
        banksDashboard: {
            title: "Bancos de Contenido",
            tabs: {
                objectives: "Banco de Objetivos",
                homework: "Banco de Tareas",
                images: "Banco de Imágenes",
                videos: "Banco de Vídeos",
                audios: "Banco de Audios",
            },
            cardBank: {
                objective: {
                    title: "Banco de Objetivos",
                    description: "Crea, edita y gestiona tarjetas de objetivos reutilizables para tus clases.",
                },
                homework: {
                    title: "Banco de Tareas",
                    description: "Crea, edita y gestiona tarjetas de tareas reutilizables.",
                },
                newCard: "Nueva Tarjeta",
                editCard: "Editar Tarjeta",
                createdAt: "Creado",
                author: "Autor",
                noCards: "Aún no se han creado tarjetas en este banco.",
                cardName: "Nombre de la tarjeta",
                cardContent: "Contenido",
                cancel: "Cancelar",
                save: "Guardar",
                toasts: {
                    nameRequired: "El nombre de la tarjeta es obligatorio.",
                    createSuccessTitle: "Tarjeta creada",
                    updateSuccessTitle: "Tarjeta actualizada",
                    deleteSuccessTitle: "Tarjeta eliminada",
                },
                errors: {
                    errorTitle: "Error",
                    loadError: "No se pudieron cargar las tarjetas.",
                    saveError: "No se pudo guardar la tarjeta.",
                    deleteError: "No se pudo eliminar la tarjeta.",
                }
            },
            fileBank: {
                image: {
                    title: "Banco de Imágenes",
                    description: "Sube y gestiona imágenes para usar en tus clases.",
                },
                video: {
                     title: "Banco de Vídeos",
                    description: "Sube y gestiona vídeos para usar en tus clases.",
                },
                audio: {
                    title: "Banco de Audios",
                    description: "Sube y gestiona audios para usar en tus clases.",
                },
                common: {
                    createdAt: "Subido",
                    noFiles: "Aún no se han subido archivos a este banco.",
                    uploadButton: "Subir archivo",
                    retry: "Reintentar",
                    uploading: "Subiendo... {progress}%",
                    toasts: {
                        uploadSuccessTitle: "Archivo subido",
                        deleteSuccessTitle: "Archivo eliminado",
                    },
                    errors: {
                        errorTitle: "Error",
                        loadError: "No se pudieron cargar los archivos.",
                        uploadError: "No se pudo subir el archivo.",
                        deleteError: "No se pudo eliminar el archivo.",
                    }
                }
            }
        },
        adminDashboard: {
            title: "Panel de Administrador",
            tabs: {
                students: "Estudiantes",
                groups: "Grupos",
                pqrs: "PQRS",
                teachers: "Docentes",
            },
            students: {
                title: "Lista de Estudiantes Individuales",
                description: "Selecciona estudiantes para crear y asignar un nuevo grupo.",
                createGroupButton: "Crear Grupo",
                table: {
                    name: "Nombre",
                    email: "Email",
                    phone: "Teléfono",
                    level: "Nivel",
                    plan: "Plan",
                    availability: "Disponibilidad",
                    startDate: "Fecha Inicio",
                    duration: "Duración (sem)",
                    currentWeek: "Semana Actual",
                    actions: "Acciones",
                    classesPerWeek: "Clases/Sem"
                }
            },
            groups: {
                title: "Grupos Creados",
                description: "Gestiona los grupos existentes, asigna docentes y administra los integrantes.",
                noGroups: "Aún no se han creado grupos.",
            },
            teachers: {
                title: "Lista de Docentes",
                description: "Gestiona los docentes, revisa sus grupos, bancos de contenido y PQRS.",
                table: {
                    name: "Nombre",
                    groups: "Grupos Asignados",
                    actions: "Acciones",
                },
                details: {
                    title: "Detalles del Docente",
                    tabs: {
                        groups: "Grupos",
                        banks: "Bancos",
                        pqrs: "PQRS",
                    },
                    contact: "Información de Contacto",
                    email: "Email",
                    phone: "Teléfono",
                    noPhone: "No registrado",
                }
            },
            pqrs: {
                title: "Gestión de PQRS",
                description: "Revisa y gestiona los mensajes enviados por los estudiantes.",
                noPqrs: "Aún no se han recibido mensajes PQRS.",
                detailsTitle: "Mensajes de {studentName}",
                teacherLabel: "Para",
                anonymous: "Anónimo",
                table: {
                    student: "Estudiante",
                    email: "Email",
                    messages: "Mensajes"
                },
                deleteDialog: {
                    title: "¿Estás seguro?",
                    description: "Esta acción no se puede deshacer. El mensaje PQRS será eliminado permanentemente.",
                    cancel: "Cancelar",
                    confirm: "Eliminar",
                }
            },
            createGroupDialog: {
                title: "Asignar Docente al Grupo",
                description: "Selecciona un docente para el nuevo grupo. Los estudiantes seleccionados serán asignados a este docente.",
                teacherLabel: "Docente",
                teacherPlaceholder: "Seleccionar un docente",
                cancel: "Cancelar",
                confirm: "Crear y Asignar Grupo",
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "No se pudieron cargar los datos.",
                 createGroupErrorTitle: "Error al crear grupo",
                 noStudentsSelectedError: "Debes seleccionar al menos un estudiante.",
                 planMismatchError: "Todos los estudiantes seleccionados deben tener el mismo plan.",
                 noTeacherSelectedError: "Debes seleccionar un docente.",
                 teacherNotFoundError: "El docente seleccionado no fue encontrado.",
                 groupCreatedTitle: "Grupo Creado y Asignado",
                 groupCreatedDescription: "El grupo ha sido creado y asignado al docente.",
                 createGroupError: "No se pudo crear el grupo.",
                 pqrsDeletedTitle: "PQRS Eliminado",
                 pqrsDeleteError: "No se pudo eliminar el mensaje PQRS.",
            }
        },
        themeCustomizer: {
            title: "Personaliza tu Experiencia",
            description: "Modifica la apariencia de Uncoverly. Los cambios se aplican en tiempo real.",
            colorThemes: "Temas de Color",
            typography: "Tipografía",
            bodyFont: "Fuente de Texto",
            headlineFont: "Fuente de Títulos",
            languageSettings: "Configuración de Idioma",
            selectLanguage: "Seleccionar Idioma de la Aplicación",
            selectPlaceholder: "Seleccionar fuente",
        },
        loginForm: {
            title: "Iniciar Sesión",
            emailLabel: "Email",
            emailPlaceholder: "tu@email.com",
            passwordLabel: "Contraseña",
            passwordPlaceholder: "••••••••",
            submitButton: "Acceder",
            successTitle: "Inicio de sesión exitoso",
            successDescription: "Bienvenido/a a Uncoverly.",
            errorTitle: "Error de autenticación",
            errorInvalidCredentials: "Usuario o contraseña incorrectos.",
            errorInvalidEmail: "El formato del correo electrónico no es válido.",
            errorUserNotFound: "No se encontró el perfil de usuario.",
            errorUnexpected: "Ha ocurrido un error inesperado.",
        },
        dataSettings: {
            title: "Ajuste de Datos",
            description: "Actualiza tu información personal y credenciales.",
            tabs: {
                personalInfo: "Información Personal",
                credentials: "Credenciales",
            },
            phoneLabel: "Número de Teléfono",
            emailLabel: "Correo Electrónico",
            newPasswordLabel: "Nueva Contraseña",
            currentPasswordLabel: "Contraseña Actual (para confirmar)",
            credentialsNotice: "Para cambiar tu correo o contraseña, debes confirmar tu contraseña actual.",
            cancelButton: "Cancelar",
            saveButton: "Guardar Cambios",
            validations: {
                phoneRequired: "El teléfono es requerido.",
                emailInvalid: "Por favor, introduce un correo válido.",
                passwordLength: "La contraseña debe tener al menos 6 caracteres.",
                currentPasswordRequired: "La contraseña actual es requerida.",
            },
            toasts: {
                infoSuccessTitle: "Información Actualizada",
                infoSuccessDescription: "Tu número de teléfono ha sido guardado.",
                credentialsSuccessTitle: "Credenciales Actualizadas",
                credentialsSuccessDescription: "Tu correo y contraseña han sido actualizados.",
                errorTitle: "Error",
                credentialsError: "No se pudieron actualizar las credenciales. Error: {message}",
            }
        },
        studentDashboard: {
            title: "Panel de Estudiante",
            nextClass: {
                title: "Próxima Clase",
                joinButton: "Unirse a la Clase",
                noClass: "Tu profesor aún no ha programado la próxima clase."
            },
            calendar: {
                title: "Calendario",
                description: "Selecciona tus días y horas preferidas para las clases.",
                button: "Abrir Calendario"
            },
            goals: {
                title: "Objetivos",
                mainObjective: "Objetivos del programa",
                weeklyObjectives: "Contenidos semanales",
            },
            lessons: {
                title: "Mis Lecciones",
                description: "Aquí encontrarás todas las lecciones de tu grupo.",
                noLessons: "Aún no hay lecciones disponibles para tu grupo.",
                recording: "Recording",
                viewRecording: "Ver Grabación",
                noRecording: "La grabación aún no está disponible.",
                content: "Contenido",
                homework: "Homework",
                instructions: "Instrucciones",
                noInstructions: "No hay instrucciones para esta tarea.",
                yourSubmission: "Tu Entrega",
                noSubmission: "Aún no has entregado esta tarea.",
                attendance: "Asistencia",
                yourStatus: "Tu estado",
                notRegistered: "No registrado"
            },
            notes: {
                title: "Class Note",
                noNotes: "No hay notas para esta clase."
            },
            pqrs: {
                title: "PQRS",
                description: "Contacta a tus profesores.",
                contactButton: "Contactar",
                noInteractions: "Aún no tienes un profesor asignado."
            },
            pqrsDialog: {
                title: "Enviar PQRS a {teacherName}",
                description: "Tu mensaje será enviado directamente a tu profesor.",
                messageLabel: "Tu mensaje",
                messagePlaceholder: "Escribe tu petición, queja, reclamo o sugerencia aquí...",
                anonymousLabel: "Enviar como anónimo",
                cancelButton: "Cancelar",
                submitButton: "Enviar Mensaje",
                teacherPrefix: "Profesor",
            },
            toasts: {
                emptyMessage: "El mensaje no puede estar vacío.",
                pqrsSentTitle: "Mensaje enviado",
                pqrsSentDescription: "Tu PQRS ha sido enviado correctamente.",
                errorTitle: "Error",
                errorDescription: "No se pudo enviar tu mensaje."
            }
        },
        teacherDashboard: {
            title: "Panel de Docente",
            groups: {
                title: "Grupos Asignados",
                history: "Historial de Grupos",
                private: "Grupos Privados",
                small: "Grupos Pequeños",
                large: "Grupos Grandes",
                noGroups: "Aún no se te han asignado grupos.",
                noHistory: "No tienes grupos en tu historial.",
                members: "Miembros",
                unknown: "Desconocido",
                viewData: "Ver datos",
                viewGroup: "Ver lecciones",
                editGroup: "Gestionar miembros",
            },
            banks: {
                title: "Bancos de Contenido",
                description: "Gestiona tu material reutilizable para clases, tareas y objetivos.",
                button: "Gestionar Bancos"
            },
            program: {
                title: "Programa",
                mainObjective: "Objetivos del programa",
                weeklyObjectives: "Contenidos semanales",
                mainPlaceholder: "Define el objetivo general para este grupo...",
                weeklyPlaceholder: "Define los objetivos específicos para esta semana...",
                saveButton: "Guardar",
            },
            meetings: {
                title: "Reuniones",
                nextClass: {
                    title: "Próxima Clase",
                    joinButton: "Unirse",
                    noClass: "No hay clases programadas."
                },
                upcomingClasses: {
                    title: "Próximas Clases",
                    description: "Aquí puedes ver todas las clases programadas para este grupo.",
                    noClasses: "No hay más clases programadas."
                },
                sendReminder: {
                    title: "Enviar Recordatorio",
                    description: "Envía un mensaje rápido a todos los miembros del grupo.",
                    placeholder: "Funcionalidad de recordatorios próximamente."
                }
            },
            lessons: {
                title: "Lecciones",
                newLesson: "Nueva Lección",
                saveChanges: "Guardar Cambios",
                noLessons: "No hay lecciones para este grupo. ¡Crea la primera!",
                recording: "Grabación",
                objective: "Objetivo",
                classNote: "Notas de clase",
                homework: "Autoestudio",
                attendance: "Asistencia",
                comments: "Comentarios",
                generalComment: "Comentario General (Solo Docentes/Admin)",
                studentComments: "Comentarios por Estudiante",
                attendanceStates: {
                    presente: "Asistió",
                    ausente: "No asistió",
                    tarde: "Tarde",
                    na: "N/A"
                },
                attendancePopover: {
                    title: "Registrar Tardanza",
                    description: "Hora de inicio de clase: {time}",
                    minutesLate: "Minutos tarde",
                    arrivalTime: "Hora de llegada",
                    saveButton: "Guardar",
                    classTimeTitle: "Hora de la Clase",
                    classTimeDescription: "La hora de inicio registrada para esta clase es: {time}.",
                    notStartedError: "La clase aún no ha empezado.",
                    noTimeError: "No se puede registrar la tardanza porque no hay una hora de inicio de clase programada."
                },
                importFromBank: "Importar de Banco",
                importFile: "Importar Archivo",
                retry: "Reintentar",
                placeholders: {
                     objective: "Define el objetivo para esta clase específica...",
                     classNote: "Escribe tus notas de clase aquí...",
                     homework: "Detalla las instrucciones para el autoestudio here...",
                     comments: "Añade comentarios privados generales para la clase...",
                     studentComment: "Añade un comentario privado para",
                },
                recordingPlaceholder: "Pega aquí el enlace de la grabación...",
            },
            bankImporter: {
                title: "Importar desde Banco",
                import: "Importar",
                noCards: "No hay tarjetas en este banco."
            },
             fileImporter: {
                title: "Importar desde Banco de Archivos",
                import: "Importar",
                noFiles: "No hay archivos en este banco.",
                 tabs: {
                    images: "Imágenes",
                    videos: "Vídeos",
                    audios: "Audios",
                }
            },
            studentDataDialog: {
                title: "Datos de {studentName}",
                name: "Nombre",
                age: "Edad",
                email: "Email",
                phone: "Teléfono",
                plan: "Plan",
                level: "Nivel",
                interests: "Intereses",
                objective: "Objetivo",
                availability: "Disponibilidad",
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "No se pudieron cargar los datos.",
                 lessonError: "No se pudieron cargar las lecciones.",
                 lessonCreatedTitle: "Lección Creada",
                 lessonCreatedDescription: "La nueva lección ha sido añadida al grupo.",
                 createLessonError: "No se pudo crear la lección.",
                 lessonSavedTitle: "Lección Guardada",
                 lessonSavedDescription: "Los cambios han sido guardados.",
                 saveLessonError: "No se pudo guardar la lección.",
                 scheduleClassSuccessTitle: "Clase Programada",
                 scheduleClassSuccessDescription: "La clase ha sido programada y se ha creado una nueva lección.",
                 genericError: "Ocurrió un error. Por favor, inténtalo de nuevo.",
                 objectivesSavedTitle: "Objetivos Guardados",
                 saveObjectivesError: "No se pudieron guardar los objetivos.",
            }
        },
        onboardingWizard: {
            backButton: "Atrás",
            continueButton: "Continuar",
            finishButton: "Finalizar",
            steps: {
                welcome: {
                    title: "Bienvenido/a a Uncoverly",
                    description1: "Tienes el plan {plan}.",
                    description2: "Vamos a configurar tu perfil para personalizar tu aprendizaje."
                },
                email: { title: "Tu correo electrónico" },
                phone: { title: "Tu número de teléfono" },
                age: { title: "¿Cuál es tu edad?" },
                interests: { title: "Tus intereses", description: "Selecciona de 1 a 3 categorías." },
                availability: { 
                    title: "Disponibilidad horaria", 
                    daysLabel: "Seleccionar días", 
                    hoursLabel: "Seleccionar horas", 
                    startTimePlaceholder: "Hora de inicio",
                    summary: "Tienes una disponibilidad horaria de {days} entre las {startTime} - {endTime}"
                },
                objective: { title: "Tu objetivo al aprender inglés", otherPlaceholder: "Describe tu objetivo" },
                finish: { title: "¡Todo listo!", description: "Estás a un paso de comenzar tu aventura con Uncoverly." }
            },
            toasts: {
                selectOneInterest: "Por favor, selecciona al menos un interés.",
                selectMaxThreeInterests: "Puedes seleccionar hasta 3 intereses.",
                selectOneDay: "Por favor, selecciona al menos un día.",
                profileCompleteTitle: "¡Perfil completado!",
                profileCompleteDescription: "Tu configuración ha sido guardada.",
                errorTitle: "Error",
                errorDescription: "No se pudo guardar tu perfil. Inténtalo de nuevo."
            }
        }
    },
    en: {
        editor: {
            initialHint: "Tap to continue with a blank page or choose a template",
            placeholders: {
                default: "Type or import files...",
                heading: "Heading",
            },
            ai: {
                trigger: "Ask AI...",
                placeholder: "Your question or instruction...",
                satisfied: "Satisfied with the result?",
                accept: "Accept",
                regenerate: "Regenerate",
                modify: "Modify",
            },
            bubbleMenu: {
                explain: "Explain",
                askAI: "Ask AI",
                comment: "Comment",
            }
        },
        dashboardHeader: {
            dashboard: "Dashboard",
            banks: "Banks",
            themes: "Themes",
            logout: "Log out",
            dataSettings: "Data Settings",
        },
        banksDashboard: {
            title: "Content Banks",
            tabs: {
                objectives: "Objectives Bank",
                homework: "Homework Bank",
                images: "Image Bank",
                videos: "Video Bank",
                audios: "Audio Bank",
            },
            cardBank: {
                objective: {
                    title: "Objectives Bank",
                    description: "Create, edit, and manage reusable objective cards for your classes.",
                },
                homework: {
                    title: "Homework Bank",
                    description: "Create, edit, and manage reusable homework cards.",
                },
                newCard: "New Card",
                editCard: "Edit Card",
                createdAt: "Created at",
                author: "Author",
                noCards: "No cards have been created in this bank yet.",
                cardName: "Card name",
                cardContent: "Content",
                cancel: "Cancel",
                save: "Save",
                toasts: {
                    nameRequired: "The card name is required.",
                    createSuccessTitle: "Card created",
                    updateSuccessTitle: "Card updated",
                    deleteSuccessTitle: "Card deleted",
                },
                errors: {
                    errorTitle: "Error",
                    loadError: "Could not load cards.",
                    saveError: "Could not save the card.",
                    deleteError: "Could not delete the card.",
                }
            },
            fileBank: {
                image: {
                    title: "Image Bank",
                    description: "Upload and manage images for use in your classes.",
                },
                video: {
                     title: "Video Bank",
                    description: "Upload and manage videos for use in your classes.",
                },
                audio: {
                    title: "Audio Bank",
                    description: "Upload and manage audio files for use in your classes.",
                },
                common: {
                    createdAt: "Uploaded",
                    noFiles: "No files have been uploaded to this bank yet.",
                    uploadButton: "Upload file",
                    retry: "Retry",
                    uploading: "Uploading... {progress}%",
                    toasts: {
                        uploadSuccessTitle: "File uploaded",
                        deleteSuccessTitle: "File deleted",
                    },
                    errors: {
                        errorTitle: "Error",
                        loadError: "Could not load files.",
                        uploadError: "Could not upload the file.",
                        deleteError: "Could not delete the file.",
                    }
                }
            }
        },
        adminDashboard: {
            title: "Admin Dashboard",
            tabs: {
                students: "Students",
                groups: "Groups",
                pqrs: "PQRS",
                teachers: "Teachers",
            },
            students: {
                title: "Individual Students List",
                description: "Select students to create and assign a new group.",
                createGroupButton: "Create Group",
                table: {
                    name: "Name",
                    email: "Email",
                    phone: "Phone",
                    level: "Level",
                    plan: "Plan",
                    availability: "Availability",
                    startDate: "Start Date",
                    duration: "Duration (wks)",
                    currentWeek: "Current Week",
                    actions: "Actions",
                    classesPerWeek: "Classes/Wk"
                }
            },
            groups: {
                title: "Created Groups",
                description: "Manage existing groups, assign teachers, and administer members.",
                noGroups: "No groups have been created yet.",
            },
            teachers: {
                title: "Teachers List",
                description: "Manage teachers, review their groups, content banks, and PQRS.",
                table: {
                    name: "Name",
                    groups: "Assigned Groups",
                    actions: "Actions",
                },
                details: {
                    title: "Teacher Details",
                    tabs: {
                        groups: "Groups",
                        banks: "Banks",
                        pqrs: "PQRS",
                    },
                    contact: "Contact Information",
                    email: "Email",
                    phone: "Phone",
                    noPhone: "Not registered",
                }
            },
            pqrs: {
                title: "PQRS Management",
                description: "Review and manage messages sent by students.",
                noPqrs: "No PQRS messages have been received yet.",
                detailsTitle: "Messages from {studentName}",
                teacherLabel: "To",
                anonymous: "Anonymous",
                table: {
                    student: "Student",
                    email: "Email",
                    messages: "Messages"
                },
                deleteDialog: {
                    title: "Are you sure?",
                    description: "This action cannot be undone. The PQRS message will be permanently deleted.",
                    cancel: "Cancel",
                    confirm: "Delete",
                }
            },
            createGroupDialog: {
                title: "Assign Teacher to Group",
                description: "Select a teacher for the new group. The selected students will be assigned to this teacher.",
                teacherLabel: "Teacher",
                teacherPlaceholder: "Select a teacher",
                cancel: "Cancel",
                confirm: "Create and Assign Group",
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "Could not load data.",
                 createGroupErrorTitle: "Error Creating Group",
                 noStudentsSelectedError: "You must select at least one student.",
                 planMismatchError: "All selected students must have the same plan.",
                 noTeacherSelectedError: "You must select a teacher.",
                 teacherNotFoundError: "The selected teacher was not found.",
                 groupCreatedTitle: "Group Created and Assigned",
                 groupCreatedDescription: "The group has been created and assigned to the teacher.",
                 createGroupError: "Could not create the group.",
                 pqrsDeletedTitle: "PQRS Deleted",
                 pqrsDeleteError: "Could not delete the PQRS message.",
            }
        },
        themeCustomizer: {
            title: "Customize Your Experience",
            description: "Modify the appearance of Uncoverly. Changes are applied in real-time.",
            colorThemes: "Color Themes",
            typography: "Typography",
            bodyFont: "Body Font",
            headlineFont: "Headline Font",
            languageSettings: "Language Settings",
            selectLanguage: "Select Application Language",
            selectPlaceholder: "Select font",
        },
        loginForm: {
            title: "Sign In",
            emailLabel: "Email",
            emailPlaceholder: "you@email.com",
            passwordLabel: "Password",
            passwordPlaceholder: "••••••••",
            submitButton: "Sign In",
            successTitle: "Login successful",
            successDescription: "Welcome to Uncoverly.",
            errorTitle: "Authentication Error",
            errorInvalidCredentials: "Incorrect username or password.",
            errorInvalidEmail: "The email format is not valid.",
            errorUserNotFound: "User profile not found.",
            errorUnexpected: "An unexpected error has occurred.",
        },
        dataSettings: {
            title: "Data Settings",
            description: "Update your personal information and credentials.",
            tabs: {
                personalInfo: "Personal Info",
                credentials: "Credentials",
            },
            phoneLabel: "Phone Number",
            emailLabel: "Email Address",
            newPasswordLabel: "New Password",
            currentPasswordLabel: "Current Password (to confirm)",
            credentialsNotice: "To change your email or password, you must confirm your current password.",
            cancelButton: "Cancel",
            saveButton: "Save Changes",
            validations: {
                phoneRequired: "Phone is required.",
                emailInvalid: "Please enter a valid email.",
                passwordLength: "Password must be at least 6 characters.",
                currentPasswordRequired: "Current password is required.",
            },
            toasts: {
                infoSuccessTitle: "Information Updated",
                infoSuccessDescription: "Your phone number has been saved.",
                credentialsSuccessTitle: "Credentials Updated",
                credentialsSuccessDescription: "Your email and password have been updated.",
                errorTitle: "Error",
                credentialsError: "Could not update credentials. Error: {message}",
            }
        },
        studentDashboard: {
            title: "Student Dashboard",
            nextClass: {
                title: "Next Class",
                joinButton: "Join Class",
                noClass: "Your teacher has not scheduled the next class yet."
            },
            calendar: {
                title: "Calendar",
                description: "Select your preferred days and times for classes.",
                button: "Open Calendar"
            },
            goals: {
                title: "Goals",
                mainObjective: "Program Goals",
                weeklyObjectives: "Weekly Content",
            },
            lessons: {
                title: "My Lessons",
                description: "Here you will find all the lessons for your group.",
                noLessons: "There are no lessons available for your group yet.",
                recording: "Recording",
                viewRecording: "View Recording",
                noRecording: "Recording is not yet available.",
                content: "Content",
                homework: "Homework",
                instructions: "Instructions",
                noInstructions: "No instructions for this assignment.",
                yourSubmission: "Your Submission",
                noSubmission: "You have not submitted this assignment yet.",
                attendance: "Attendance",
                yourStatus: "Your status",
                notRegistered: "Not registered"
            },
            notes: {
                title: "Class Note",
                noNotes: "No notes for this class."
            },
            pqrs: {
                title: "PQRS",
                description: "Contact your teachers.",
                contactButton: "Contact",
                noInteractions: "You don't have an assigned teacher yet."
            },
            pqrsDialog: {
                title: "Send PQRS to {teacherName}",
                description: "Your message will be sent directly to your teacher.",
                messageLabel: "Your message",
                messagePlaceholder: "Write your petition, complaint, claim or suggestion here...",
                anonymousLabel: "Send anonymously",
                cancelButton: "Cancel",
                submitButton: "Send Message",
                teacherPrefix: "Teacher",
            },
            toasts: {
                emptyMessage: "The message cannot be empty.",
                pqrsSentTitle: "Message sent",
                pqrsSentDescription: "Your PQRS has been sent successfully.",
                errorTitle: "Error",
                errorDescription: "Could not send your message."
            }
        },
        teacherDashboard: {
            title: "Teacher Dashboard",
            groups: {
                title: "Assigned Groups",
                history: "Group History",
                private: "Private Groups",
                small: "Small Groups",
                large: "Large Groups",
                noGroups: "No groups have been assigned to you yet.",
                noHistory: "You have no groups in your history.",
                members: "Members",
                unknown: "Unknown",
                viewData: "View data",
                viewGroup: "View lessons",
                editGroup: "Manage members",
            },
            banks: {
                title: "Content Banks",
                description: "Manage your reusable material for classes, homework, and objectives.",
                button: "Manage Banks"
            },
            program: {
                title: "Program",
                mainObjective: "Program Objectives",
                weeklyObjectives: "Weekly Content",
                mainPlaceholder: "Define the overall objective for this group...",
                weeklyPlaceholder: "Define the specific objectives for this week...",
                saveButton: "Save",
            },
            meetings: {
                title: "Meetings",
                nextClass: {
                    title: "Next Class",
                    joinButton: "Join",
                    noClass: "No classes scheduled."
                },
                upcomingClasses: {
                    title: "Upcoming Classes",
                    description: "Here you can see all scheduled classes for this group.",
                    noClasses: "No more classes scheduled."
                },
                sendReminder: {
                    title: "Send Reminder",
                    description: "Send a quick message to all group members.",
                    placeholder: "Reminder functionality coming soon."
                }
            },
            lessons: {
                title: "Lessons",
                newLesson: "New Lesson",
                saveChanges: "Save Changes",
                noLessons: "No lessons for this group. Create the first one!",
                recording: "Recording",
                objective: "Objective",
                classNote: "Class Notes",
                homework: "Self-study",
                attendance: "Attendance",
                comments: "Comments",
                generalComment: "General Comment (Teachers/Admins Only)",
                studentComments: "Comments per Student",
                attendanceStates: {
                    presente: "Attended",
                    ausente: "Did not attend",
                    tarde: "Late",
                    na: "N/A"
                },
                attendancePopover: {
                    title: "Register Lateness",
                    description: "Class start time: {time}",
                    minutesLate: "Minutes late",
                    arrivalTime: "Arrival time",
                    saveButton: "Save",
                    classTimeTitle: "Class Time",
                    classTimeDescription: "The registered start time for this class is: {time}.",
                    notStartedError: "The class has not started yet.",
                    noTimeError: "Cannot register lateness because there is no scheduled class start time."
                },
                importFromBank: "Import from Bank",
                importFile: "Import File",
                retry: "Retry",
                placeholders: {
                     objective: "Define the objective for this specific class...",
                     classNote: "Write your class notes here...",
                     homework: "Detail the self-study instructions here...",
                     comments: "Add general private comments for the class...",
                     studentComment: "Add a private comment for",
                },
                recordingPlaceholder: "Paste the recording link here...",
            },
            bankImporter: {
                title: "Import from Bank",
                import: "Import",
                noCards: "No cards in this bank."
            },
             fileImporter: {
                title: "Import from File Bank",
                import: "Import",
                noFiles: "No files in this bank.",
                 tabs: {
                    images: "Images",
                    videos: "Videos",
                    audios: "Audios",
                }
            },
            studentDataDialog: {
                title: "Data for {studentName}",
                name: "Name",
                age: "Age",
                email: "Email",
                phone: "Phone",
                plan: "Plan",
                level: "Level",
                interests: "Interests",
                objective: "Objective",
                availability: "Availability",
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "Could not load data.",
                 lessonError: "Could not load lessons.",
                 lessonCreatedTitle: "Lesson Created",
                 lessonCreatedDescription: "The new lesson has been added to the group.",
                 createLessonError: "Could not create the lesson.",
                 lessonSavedTitle: "Lesson Saved",
                 lessonSavedDescription: "The changes have been saved.",
                 saveLessonError: "Could not save the lesson.",
                 scheduleClassSuccessTitle: "Class Scheduled",
                 scheduleClassSuccessDescription: "The class has been scheduled and a new lesson has been created.",
                 genericError: "An error occurred. Please try again.",
                 objectivesSavedTitle: "Objectives Saved",
                 saveObjectivesError: "Could not save objectives.",
            }
        },
         onboardingWizard: {
            backButton: "Back",
            continueButton: "Continue",
            finishButton: "Finish",
            steps: {
                welcome: {
                    title: "Welcome to Uncoverly",
                    description1: "You have the {plan} plan.",
                    description2: "Let's set up your profile to personalize your learning."
                },
                email: { title: "Your email address" },
                phone: { title: "Your phone number" },
                age: { title: "What is your age?" },
                interests: { title: "Your interests", description: "Select 1 to 3 categories." },
                availability: { 
                    title: "Time Availability", 
                    daysLabel: "Select days", 
                    hoursLabel: "Select hours", 
                    startTimePlaceholder: "Start time",
                    summary: "You have an availability of {days} between {startTime} - {endTime}"
                },
                objective: { title: "Your goal for learning English", otherPlaceholder: "Describe your goal" },
                finish: { title: "All set!", description: "You are one step away from starting your adventure with Uncoverly." }
            },
            toasts: {
                selectOneInterest: "Please select at least one interest.",
                selectMaxThreeInterests: "You can select up to 3 interests.",
                selectOneDay: "Please select at least one day.",
                profileCompleteTitle: "Profile completed!",
                profileCompleteDescription: "Your settings have been saved.",
                errorTitle: "Error",
                errorDescription: "Could not save your profile. Please try again."
            }
        }
    }
};

