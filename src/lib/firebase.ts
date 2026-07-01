
// MOCK FIREBASE FOR PRESENTATION
export const auth = {
  currentUser: null,
};

export const db = {};
export const storage = {};

export const updateUserCredentials = async (currentPassword: string, newEmail?: string, newPassword?: string) => {
    console.log("Mock update credentials", { newEmail, newPassword });
    return Promise.resolve();
};
