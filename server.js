import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));
app.post("/send-mail", async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "No image received" });
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const imageBuffer = Buffer.from(image.split(",")[1], "base64");
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL,
            subject: "New Captured Photo",
            text: "Here’s the captured photo from the camera app.",
            attachments: [{ filename: "photo.jpg", content: imageBuffer }],
        });
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email" });
    }
});
app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);