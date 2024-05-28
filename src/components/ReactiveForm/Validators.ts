export interface ValidationResult {
    error: boolean;
    msg: string;
}

export interface ValidationFn {
    (msg: string): ValidationResult;
}

export interface AsyncValidatorFn {
    (msg: string): Promise<ValidationResult>
}

export class Validators {
    static validateRequired(msg = "This field is required"): ValidationFn {
        return (value: string): ValidationResult  => {
            return {
                error: !value,
                msg
            }
        };
    }

    static validateEmail(msg = "Email is not valid"): ValidationFn {
        return (value: string): ValidationResult => {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return {
                error: !regex.test(value),
                msg,
            };
        };
    }

    static validateUsername(msg = "Username is not valid"): ValidationFn {
        return (value: string): ValidationResult => {
            const regex = /^[-a-zA-Z0-9_]{2,30}$/;
            return {
                error: !regex.test(value),
                msg,
            };
        };
    }
}