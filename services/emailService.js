const nodemailer = require("nodemailer");


// ==================================================
// GMAIL TRANSPORTER
// ==================================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user:
            process.env.GMAIL_USER,

        pass:
            process.env.GMAIL_APP_PASSWORD

    }

});


// ==================================================
// VERIFY GMAIL CONNECTION
// ==================================================

async function verifyEmailConnection() {

    try {

        await transporter.verify();

        console.log("================================");
        console.log("GMAIL SMTP CONNECTION SUCCESSFUL");
        console.log("Gmail:", process.env.GMAIL_USER);
        console.log("================================");

        return true;

    } catch (error) {

        console.error("================================");
        console.error("GMAIL SMTP CONNECTION FAILED");
        console.error(error.message);
        console.error("================================");

        return false;

    }

}


// ==================================================
// SEND OTP EMAIL
// ==================================================

async function sendOTPEmail(
    recipientEmail,
    recipientName,
    otp
) {

    const mailOptions = {

        from:
            `"Your Website" <${process.env.GMAIL_USER}>`,

        to:
            recipientEmail,

        subject:
            "Your Email Verification OTP",

        text:
`Hello ${recipientName},

Your email verification OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not create an account, please ignore this email.

Regards,
Your Website`,

        html:
`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">

    <h2 style="margin-bottom: 10px;">
        Email Verification
    </h2>

    <p>
        Hello ${recipientName},
    </p>

    <p>
        Thank you for registering with us.
        Please use the following OTP to verify your email address:
    </p>

    <div style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        padding: 20px;
        margin: 25px 0;
        text-align: center;
        background: #f5f5f5;
        border-radius: 8px;
    ">
        ${otp}
    </div>

    <p>
        This OTP is valid for <strong>10 minutes</strong>.
    </p>

    <p>
        If you did not create this account, you can safely ignore this email.
    </p>

    <hr>

    <p style="font-size: 12px; color: #777;">
        This is an automated email. Please do not reply.
    </p>

</div>
`

    };


    try {

        const info =
            await transporter.sendMail(
                mailOptions
            );


        console.log("================================");
        console.log("OTP EMAIL SENT SUCCESSFULLY");
        console.log("To:", recipientEmail);
        console.log("Message ID:", info.messageId);
        console.log("================================");


        return {

            success: true,

            messageId:
                info.messageId

        };

    } catch (error) {

        console.error("================================");
        console.error("OTP EMAIL SEND FAILED");
        console.error("To:", recipientEmail);
        console.error("Error:", error.message);
        console.error("================================");


        return {

            success: false,

            error:
                error

        };

    }

}


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    transporter,

    verifyEmailConnection,

    sendOTPEmail

};