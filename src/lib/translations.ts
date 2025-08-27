
export const translations = {
    es: {
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
        dashboardHeader: {
            themes: "Temas",
            logout: "Cerrar sesión",
        },
        studentDashboard: {
            title: "Panel de Estudiante",
            scheduledClasses: {
                title: "Clases Programadas",
                joinButton: "Unirse a la clase",
                classLink: "Link de la clase",
                noClasses: "No hay clases programadas."
            },
            notes: {
                title: "Notas",
                fullScreenTitle: "Notas de Clase",
                viewButton: "Ver en Notion",
                noNotes: "No hay notas disponibles."
            },
            reminders: {
                title: "Recordatorios",
                noReminders: "No hay recordatorios del profesor."
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
            tabs: {
                students: "Estudiantes",
                groups: "Grupos",
                content: "Contenido",
            },
            students: {
                title: "Lista de Estudiantes Individuales",
                description: "Selecciona estudiantes para crear un nuevo grupo.",
                createGroupButton: "Crear Grupo",
                table: {
                    name: "Nombre",
                    plan: "Plan",
                    interests: "Intereses",
                    availability: "Disponibilidad"
                }
            },
            groups: {
                title: "Grupos Creados",
                private: "Grupos Privados",
                small: "Grupos Pequeños",
                large: "Grupos Grandes",
                noGroups: "Aún no se han creado grupos.",
                manageGroup: "Administrar grupo",
                dissolveGroup: "Disolver grupo",
                members: "Miembros:",
                unknown: "Desconocido",
            },
            content: {
                title: "Gestión de Contenido",
                description: "Selecciona un tipo de grupo y luego el grupo específico para añadirle contenido.",
                selectGroupType: "Selecciona un tipo de grupo",
                selectTypePlaceholder: "Selecciona un tipo",
                selectGroup: "Selecciona un grupo",
                selectGroupPlaceholder: "Selecciona un grupo",
                noGroupsOfType: "No existe grupo de este tipo",
                uploadClass: { title: "Cargar Clase", link: "Link de clase", dateTime: "Fecha y hora", button: "Añadir Clase" },
                uploadNote: { title: "Cargar Nota", link: "Link de Notion", button: "Añadir Nota" },
                uploadReminder: { title: "Enviar Recordatorio", message: "Mensaje", placeholder: "Escribe un consejo, sugerencia o recordatorio...", button: "Enviar Recordatorio" },
            },
            planTypes: {
                privado: "Privado",
                small: "Grupo Pequeño",
                large: "Grupo Grande",
            },
            dissolveDialog: {
                title: "¿Estás seguro?",
                description: "Esta acción es permanente. El grupo se eliminará y los estudiantes volverán a la lista de disponibles.",
                cancel: "Cancelar",
                confirm: "Sí, disolver grupo"
            },
            manageDialog: {
                title: "Administrar",
                addTab: "Agregar Estudiantes",
                removeTab: "Eliminar Estudiantes",
                addDescription: "Selecciona estudiantes disponibles para añadir al grupo.",
                removeDescription: "Selecciona estudiantes para eliminar del grupo.",
                noAvailableStudents: "No hay estudiantes disponibles con el plan de este grupo.",
                addButton: "Agregar Seleccionados",
                removeButton: "Eliminar Seleccionados"
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "No se pudieron cargar los datos.",
                 createGroupErrorTitle: "Error al crear grupo",
                 planMismatchError: "Todos los estudiantes deben tener el mismo plan.",
                 groupCreatedTitle: "Grupo creado",
                 groupCreatedDescription: "Se ha creado un nuevo grupo.",
                 createGroupError: "No se pudo crear el grupo.",
                 contentAddedTitle: "Contenido añadido",
                 classAdded: "Clase añadida.",
                 noteAdded: "Nota añadida.",
                 reminderAdded: "Recordatorio enviado.",
                 addContentError: "No se pudo añadir el contenido.",
                 groupDissolvedTitle: "Grupo disuelto",
                 groupDissolvedDescription: "Los estudiantes ahora están disponibles nuevamente.",
                 dissolveGroupError: "No se pudo disolver el grupo.",
                 studentsAddedTitle: "Estudiantes añadidos",
                 studentsAddedDescription: "Los estudiantes han sido agregados al grupo.",
                 addStudentsError: "No se pudieron añadir los estudiantes.",
                 actionNotAllowedTitle: "Acción no permitida",
                 removeAllStudentsError: "No puedes eliminar a todos los miembros. Si quieres, disuelve el grupo.",
                 studentsRemovedTitle: "Estudiantes eliminados",
                 studentsRemovedDescription: "Los estudiantes han sido eliminados del grupo.",
                 removeStudentsError: "No se pudieron eliminar los estudiantes."
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
        dashboardHeader: {
            themes: "Themes",
            logout: "Log out",
        },
        studentDashboard: {
            title: "Student Dashboard",
            scheduledClasses: {
                title: "Scheduled Classes",
                joinButton: "Join class",
                classLink: "Class link",
                noClasses: "No scheduled classes."
            },
            notes: {
                title: "Notes",
                fullScreenTitle: "Class Notes",
                viewButton: "View in Notion",
                noNotes: "No notes available."
            },
             reminders: {
                title: "Reminders",
                noReminders: "No reminders from the teacher."
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
            tabs: {
                students: "Students",
                groups: "Groups",
                content: "Content",
            },
            students: {
                title: "Individual Students List",
                description: "Select students to create a new group.",
                createGroupButton: "Create Group",
                table: {
                    name: "Name",
                    plan: "Plan",
                    interests: "Interests",
                    availability: "Availability"
                }
            },
            groups: {
                title: "Created Groups",
                private: "Private Groups",
                small: "Small Groups",
                large: "Large Groups",
                noGroups: "No groups have been created yet.",
                manageGroup: "Manage group",
                dissolveGroup: "Dissolve group",
                members: "Members:",
                unknown: "Unknown",
            },
            content: {
                title: "Content Management",
                description: "Select a group type and then the specific group to add content.",
                selectGroupType: "Select a group type",
                selectTypePlaceholder: "Select a type",
                selectGroup: "Select a group",
                selectGroupPlaceholder: "Select a group",
                noGroupsOfType: "No groups of this type exist",
                uploadClass: { title: "Upload Class", link: "Class link", dateTime: "Date and time", button: "Add Class" },
                uploadNote: { title: "Upload Note", link: "Notion link", button: "Add Note" },
                uploadReminder: { title: "Send Reminder", message: "Message", placeholder: "Write a piece of advice, a suggestion, or a reminder...", button: "Send Reminder" },
            },
             planTypes: {
                privado: "Private",
                small: "Small Group",
                large: "Large Group",
            },
            dissolveDialog: {
                title: "Are you sure?",
                description: "This action is permanent. The group will be deleted and the students will return to the available list.",
                cancel: "Cancel",
                confirm: "Yes, dissolve group"
            },
            manageDialog: {
                title: "Manage",
                addTab: "Add Students",
                removeTab: "Remove Students",
                addDescription: "Select available students to add to the group.",
                removeDescription: "Select students to remove from the group.",
                noAvailableStudents: "No students available with this group's plan.",
                addButton: "Add Selected",
                removeButton: "Remove Selected"
            },
            toasts: {
                 errorTitle: "Error",
                 dataError: "Could not load data.",
                 createGroupErrorTitle: "Error creating group",
                 planMismatchError: "All students must have the same plan.",
                 groupCreatedTitle: "Group created",
                 groupCreatedDescription: "A new group has been created.",
                 createGroupError: "Could not create the group.",
                 contentAddedTitle: "Content added",
                 classAdded: "Class added.",
                 noteAdded: "Note added.",
                 reminderAdded: "Reminder sent.",
                 addContentError: "Could not add content.",
                 groupDissolvedTitle: "Group dissolved",
                 groupDissolvedDescription: "Students are now available again.",
                 dissolveGroupError: "Could not dissolve the group.",
                 studentsAddedTitle: "Students added",
                 studentsAddedDescription: "The students have been added to the group.",
                 addStudentsError: "Could not add the students.",
                 actionNotAllowedTitle: "Action not allowed",
                 removeAllStudentsError: "You cannot remove all members. Dissolve the group instead.",
                 studentsRemovedTitle: "Students removed",
                 studentsRemovedDescription: "The students have been removed from the group.",
                 removeStudentsError: "Could not remove the students."
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

    