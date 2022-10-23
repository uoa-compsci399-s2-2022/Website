export const validateEmail = (email: string): string | undefined => {
    let error;

    // Regex from https://formik.org/docs/guides/validation#form-level-validation
    // note that emails are not required
    if (email && email.length > 0 && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        error = 'Invalid email address';
    }

    return error;
}

export const validateNonEmpty = (field: string, value: string): string | undefined => {
    let error;

    if (!value) {
        error = field + ' required';
    } else if (value.length <= 0) {
        error = field + ' cannot be empty';
    }

    return error;
}