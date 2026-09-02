const https = require("https");

/*
=========================================================
BREVO EMAIL SERVICE
=========================================================

Brevo API is used instead of Gmail SMTP.

Required .env / Railway variable:

BREVO_API_KEY=your_brevo_api_key

Optional:
GMAIL_FROM=your-verified-email@gmail.com

=========================================================
*/


/*
=========================================================
BREVO API REQUEST
=========================================================
*/

function sendBrevoEmail({
    senderName,
    senderEmail,
    recipientEmail,
    recipientName,
    subject,
    htmlContent,
    textContent
}) {
    return new Promise((resolve, reject) => {

        const data = JSON.stringify({
            sender: {
                name: senderName,
                email: senderEmail
            },

            to: [
                {
                    email: recipientEmail,
                    name: recipientName || "User"
                }
            ],

            subject,

            htmlContent,

            textContent
        });


        const options = {
            hostname: "api.brevo.com",

            path: "/v3/smtp/email",

            method: "POST",

            headers: {
                "accept": "application/json",

                "api-key":
                    process.env.BREVO_API_KEY,

                "content-type":
                    "application/json",

                "content-length":
                    Buffer.byteLength(data)
            }
        };


        const request =
            https.request(options, response => {

                let responseData = "";


                response.on("data", chunk => {
                    responseData += chunk;
                });


                response.on("end", () => {

                    let parsedResponse = null;

                    try {
                        parsedResponse =
                            responseData
                                ? JSON.parse(responseData)
                                : null;

                    } catch (error) {
                        parsedResponse =
                            responseData;
                    }


                    if (
                        response.statusCode >= 200 &&
                        response.statusCode < 300
                    ) {

                        resolve({
                            success: true,

                            messageId:
                                parsedResponse?.messageId ||
                                null,

                            response:
                                parsedResponse
                        });

                        return;
                    }


                    const error =
                        new Error(
                            parsedResponse?.message ||
                            `Brevo API error: HTTP ${response.statusCode}`
                        );


                    error.statusCode =
                        response.statusCode;

                    error.response =
                        parsedResponse;


                    reject(error);
                });
            });


        request.on("error", error => {
            reject(error);
        });


        request.write(data);

        request.end();
    });
}



/*
=========================================================
SEND OTP EMAIL
=========================================================
*/

async function sendOTPEmail(
    recipientEmail,
    recipientName,
    otp
) {

    const senderEmail =
        process.env.GMAIL_FROM ||
        process.env.GMAIL_USER;


    const senderName =
        "Yogita Patola Art";


    if (!process.env.BREVO_API_KEY) {

        console.error(
            "BREVO_API_KEY is missing."
        );

        return {
            success: false,

            error:
                new Error(
                    "BREVO_API_KEY is not configured."
                )
        };
    }


    if (!senderEmail) {

        console.error(
            "Sender email is missing."
        );

        return {
            success: false,

            error:
                new Error(
                    "GMAIL_FROM or GMAIL_USER is not configured."
                )
        };
    }


    const subject =
        "Your Yogita Patola Art Verification OTP";


    const textContent = `
Hello ${recipientName || "User"},

Your Yogita Patola Art email verification OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request this OTP, please ignore this email.

Regards,
Yogita Patola Art
`;


    const htmlContent = `
<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Email Verification</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#f7f1e8;
    font-family:Arial,Helvetica,sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        background:#f7f1e8;
        padding:40px 15px;
    "
>

<tr>

<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:520px;
        background:#ffffff;
        border-radius:14px;
        overflow:hidden;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
    "
>

<tr>

<td style="
    background:#641f2b;
    padding:28px 30px;
    text-align:center;
">

<h1 style="
    margin:0;
    color:#d8b56a;
    font-family:Georgia,serif;
    font-size:26px;
">

Yogita Patola Art

</h1>

<p style="
    margin:8px 0 0;
    color:#ffffff;
    font-size:13px;
">

Email Verification

</p>

</td>

</tr>


<tr>

<td style="
    padding:35px 30px;
    color:#3b3030;
">

<h2 style="
    margin:0 0 15px;
    font-family:Georgia,serif;
    color:#641f2b;
">

Hello ${recipientName || "User"},

</h2>


<p style="
    font-size:15px;
    line-height:1.7;
">

Thank you for registering with
<strong>Yogita Patola Art</strong>.

Please use the OTP below to verify your email address.

</p>


<div style="
    margin:30px 0;
    padding:20px;
    background:#f8f1e5;
    border:1px solid #dfc58d;
    border-radius:10px;
    text-align:center;
">

<div style="
    font-size:12px;
    color:#76645a;
    margin-bottom:8px;
">

YOUR VERIFICATION CODE

</div>


<div style="
    font-size:36px;
    font-weight:bold;
    letter-spacing:8px;
    color:#641f2b;
">

${otp}

</div>

</div>


<p style="
    font-size:14px;
    line-height:1.7;
    color:#665858;
">

This OTP is valid for
<strong>10 minutes</strong>.

</p>


<p style="
    font-size:13px;
    line-height:1.6;
    color:#8a7b73;
">

If you did not request this verification code,
you can safely ignore this email.

</p>

</td>

</tr>


<tr>

<td style="
    padding:20px 30px;
    background:#faf7f2;
    text-align:center;
    border-top:1px solid #eee4d8;
">

<p style="
    margin:0;
    color:#8a7b73;
    font-size:12px;
">

© ${new Date().getFullYear()}
Yogita Patola Art

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;


    console.log("");
    console.log("=================================");
    console.log("BREVO OTP EMAIL");
    console.log("To:", recipientEmail);
    console.log("=================================");


    try {

        const result =
            await sendBrevoEmail({

                senderName,

                senderEmail,

                recipientEmail,

                recipientName,

                subject,

                htmlContent,

                textContent
            });


        console.log(
            "Brevo email sent successfully."
        );


        console.log(
            "Message ID:",
            result.messageId
        );


        console.log(
            "================================="
        );


        return result;

    } catch (error) {

        console.error(
            "BREVO OTP EMAIL SEND FAILED"
        );


        console.error(
            "To:",
            recipientEmail
        );


        console.error(
            "Error:",
            error.message
        );


        if (error.statusCode) {

            console.error(
                "Status:",
                error.statusCode
            );
        }


        console.error(
            "================================="
        );


        return {
            success: false,

            error
        };
    }
}



/*
=========================================================
EXPORT
=========================================================
*/

module.exports = {

    sendOTPEmail
};