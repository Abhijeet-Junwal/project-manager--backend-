import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanager.com"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    })

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    }

    try {
        await transport.sendMail(mail);
    } catch (error) {
        console.error("Email service failed siliently. Make sure you have provided your MAILTRAP credentials in thr .env file");
        console.error("Error : ", error);
    }
};

const emailVerificationMailgenContent = (username, verficationUrl) => {
    return {
            body : {
            name: username,
            intro: "Welcome to our App! we'are excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following link",
                button:{
                    color: "#22bc66",
                    text: "Verify you email",
                    link: verficationUrl,
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        }
    };
};


const ForgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
            body : {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions: "To reset your password please click on the following button or link",
                button:{
                    color: "#22bc66",
                    text: "Reset Password",
                    link: passwordResetUrl,
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        }
    };
};

export {
    emailVerificationMailgenContent, 
    ForgotPasswordMailgenContent,
    sendEmail,
};