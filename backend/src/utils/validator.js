import validator from "validator";

const validate = (data) => {

    const mandates = ["firstName", "emailId", "password"];
    const isPresent = mandates.every((k) => Object.keys(data).includes(k));

    if(!isPresent){
        throw new Error ("Some fields are missing");
    }

    if(!validator.isEmail(data.emailId)){

        throw new Error("Invalid e-mail");
    }

    if(!validator.isStrongPassword(data.password)){

        throw new Error("Password too weak");
    }

    if(!validator.isAlpha(data.firstName)){
    throw new Error("First name should contain only letters");
}

}

export default validate;