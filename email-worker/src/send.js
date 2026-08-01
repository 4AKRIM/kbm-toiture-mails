import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function envoyerReponse({ destinataire, sujet, corps }) {
  const signature = process.env.SIGNATURE ? `\n\n${process.env.SIGNATURE.replace(/\\n/g, "\n")}` : "";
  await transporter.sendMail({
    from: process.env.GMAIL_ADDRESS,
    to: destinataire,
    subject: sujet.startsWith("Re:") ? sujet : `Re: ${sujet}`,
    text: `${corps}${signature}`,
  });
}
