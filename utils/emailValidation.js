// utils/emailValidation.js

export const isValidUWCEmail = (email) => {
  if (!email) return false;

  const trimmedEmail = email.trim().toLowerCase();

  // Must end with @myuwc.ac.za or @uwc.ac.za
  const isValidDomain =
    trimmedEmail.endsWith("@myuwc.ac.za") ||
    trimmedEmail.endsWith("@uwc.ac.za");

  if (!isValidDomain) return false;

  // Get the part before @
  const usernamePart = trimmedEmail.split("@")[0];

  // Must be digits only and at least 7 characters
  const startsWithNumbers = /^\d{7,}$/.test(usernamePart);

  return startsWithNumbers;
};

export const getEmailError = (email) => {
  if (!email) return "Email is required";

  const trimmedEmail = email.trim().toLowerCase();

  if (
    !trimmedEmail.endsWith("@myuwc.ac.za") &&
    !trimmedEmail.endsWith("@uwc.ac.za")
  ) {
    return "Must be a UWC email address (@myuwc.ac.za or @uwc.ac.za)";
  }

  const usernamePart = trimmedEmail.split("@")[0];
  if (!/^\d{7,}$/.test(usernamePart)) {
    return "UWC email must start with your student number (at least 7 digits)";
  }

  return null; // No error
};
