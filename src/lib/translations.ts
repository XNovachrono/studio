

export const translations = {
    es: {
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
                classes: "Banco de Clases",
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
                class: {
                     title: "Banco de Clases",
                    description: "Crea, edita y gestiona tarjetas de clases reutilizables.",
                },
                homework: {
                    title: "Banco de Tareas",
                    description: "Crea, edita y gestiona tarjetas de tareas reutilizables.",
                },
                newCard: "Nueva Tarjeta",
                editCard: "Editar Tarjeta",
                createdAt: "Creado",
                noCards: "Aún no has creado ninguna tarjeta.",
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
                    noFiles: "Aún no has subido ningún archivo.",
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
            },
            students: {
                title: "Lista de Estudiantes Individuales",
                description: "Selecciona estudiantes para crear y asignar un nuevo grupo.",
                createGroupButton: "Crear Grupo",
                table: {
                    name: "Nombre",
                    age: "Edad",
                    plan: "Plan",
                }
            },
            groups: {
                title: "Grupos Creados",
                description: "Gestiona los grupos existentes, asigna docentes y administra los integrantes.",
                noGroups: "Aún no se han creado grupos.",
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
            successDescription: "Bienvenido/a, {name}.",
            errorTitle: "Error de autenticación",
            errorInvalidCredentials: "Usuario o contraseña incorrectos.",
            errorInvalidEmail: "El formato del correo electrónico no es válido.",
            errorUserNotFound: "No se encontró el perfil de usuario.",
            errorUnexpected: "Ha ocurrido un error inesperado.",
        },
        studentDataSettings: {
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
                description: "Contacta a tus últimos profesores.",
                noInteractions: "Aún no has interactuado con profesores."
            },
            pqrsDialog: {
                title: "Enviar PQRS a {teacherName}",
                messageLabel: "Tu mensaje",
                messagePlaceholder: "Escribe tu petición, queja, reclamo o sugerencia aquí...",
                anonymousLabel: "Enviar como anónimo",
                cancelButton: "Cancelar",
                submitButton: "Enviar Mensaje",
                lastInteraction: "Última interacción: {time}",
                teacherPrefix: "Teacher",
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
                private: "Grupos Privados",
                small: "Grupos Pequeños",
                large: "Grupos Grandes",
                noGroups: "Aún no se te han asignado grupos.",
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
            lessons: {
                newLesson: "Nueva Lección",
                saveChanges: "Guardar Cambios",
                noLessons: "No hay lecciones para este grupo. ¡Crea la primera!",
                recording: "Recording",
                content: "Contenido",
                classNote: "Class Note",
                homework: "Homework",
                attendance: "Asistencia",
                importFromBank: "Importar desde banco",
                retry: "Reintentar",
                placeholders: {
                     content: "Objetivo general y objetivos específicos de la clase...",
                     classNote: "Escribe tus notas de clase aquí. Usa '/' para ver los comandos...",
                     homework: "Detalla las instrucciones de la tarea...",
                },
                recordingPlaceholder: "Aquí podrás añadir el link de la grabación.",
                attendancePlaceholder: "Aquí podrás registrar la asistencia.",
            },
             communication: {
                scheduleClass: {
                    title: "Programar Clase",
                    description: "Envía un enlace de clase a los estudiantes. Esto creará automáticamente una nueva lección.",
                    link: "Enlace de la clase",
                    date: "Fecha",
                    time: "Hora",
                    selectDate: "Seleccionar fecha",
                    button: "Programar Clase y Crear Lección"
                },
                sendReminder: {
                    title: "Enviar Recordatorio",
                    description: "Envía un mensaje rápido a todos los miembros del grupo.",
                    placeholder: "Funcionalidad de recordatorios próximamente."
                }
            },
            bankImporter: {
                title: "Importar desde Banco de Objetivos",
                import: "Importar",
                noCards: "No hay tarjetas en el banco de objetivos."
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
                 scheduleClassError: "Por favor, completa todos los campos para programar la clase.",
                 scheduleClassSuccessTitle: "Clase Programada",
                 scheduleClassSuccessDescription: "La clase ha sido programada y se ha creado una nueva lección.",
                 genericError: "Ocurrió un error. Por favor, inténtalo de nuevo."
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
                classes: "Classes Bank",
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
                class: {
                    title: "Classes Bank",
                    description: "Create, edit, and manage reusable class cards.",
                },
                homework: {
                    title: "Homework Bank",
                    description: "Create, edit, and manage reusable homework cards.",
                },
                newCard: "New Card",
                editCard: "Edit Card",
                createdAt: "Created at",
                noCards: "You haven't created any cards yet.",
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
                    noFiles: "You haven't uploaded any files yet.",
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
            },
            students: {
                title: "Individual Students List",
                description: "Select students to create and assign a new group.",
                createGroupButton: "Create Group",
                table: {
                    name: "Name",
                    age: "Age",
                    plan: "Plan",
                }
            },
            groups: {
                title: "Created Groups",
                description: "Manage existing groups, assign teachers, and administer members.",
                noGroups: "No groups have been created yet.",
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
            successDescription: "Welcome, {name}.",
            errorTitle: "Authentication Error",
            errorInvalidCredentials: "Incorrect username or password.",
            errorInvalidEmail: "The email format is not valid.",
            errorUserNotFound: "User profile not found.",
            errorUnexpected: "An unexpected error has occurred.",
        },
        studentDataSettings: {
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
                description: "Contact your last teachers.",
                noInteractions: "You haven't interacted with any teachers yet."
            },
            pqrsDialog: {
                title: "Send PQRS to {teacherName}",
                messageLabel: "Your message",
                messagePlaceholder: "Write your petition, complaint, claim or suggestion here...",
                anonymousLabel: "Send anonymously",
                cancelButton: "Cancel",
                submitButton: "Send Message",
                lastInteraction: "Last interaction: {time}",
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
                private: "Private Groups",
                small: "Small Groups",
                large: "Large Groups",
                noGroups: "No groups have been assigned to you yet.",
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
            lessons: {
                newLesson: "New Lesson",
                saveChanges: "Save Changes",
                noLessons: "No lessons for this group. Create the first one!",
                recording: "Recording",
                content: "Content",
                classNote: "Class Note",
                homework: "Homework",
                attendance: "Attendance",
                importFromBank: "Import from bank",
                retry: "Retry",
                placeholders: {
                    content: "General and specific objectives for the class...",
                    classNote: "Write your class notes here. Use '/' to see commands...",
                    homework: "Detail the homework instructions...",
                },
                recordingPlaceholder: "Here you can add the recording link.",
                attendancePlaceholder: "Here you can record attendance.",
            },
             communication: {
                scheduleClass: {
                    title: "Schedule Class",
                    description: "Send a class link to students. This will automatically create a new lesson.",
                    link: "Class Link",
                    date: "Date",
                    time: "Time",
                    selectDate: "Select date",
                    button: "Schedule Class & Create Lesson"
                },
                sendReminder: {
                    title: "Send Reminder",
                    description: "Send a quick message to all group members.",
                    placeholder: "Reminder functionality coming soon."
                }
            },
             bankImporter: {
                title: "Import from Objectives Bank",
                import: "Import",
                noCards: "No cards in the objectives bank."
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
                 scheduleClassError: "Please fill all fields to schedule the class.",
                 scheduleClassSuccessTitle: "Class Scheduled",
                 scheduleClassSuccessDescription: "The class has been scheduled and a new lesson has been created.",
                 genericError: "An error occurred. Please try again."
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
