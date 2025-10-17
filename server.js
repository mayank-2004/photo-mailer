import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { google } from "googleapis";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Google Drive setup
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

// Create folder in Google Drive
async function createDriveFolder(folderName) {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || 'root']
            }
        });
        
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        
        return response.data.id;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
}

// Upload photo to Google Drive
async function uploadPhotoToDrive(photoData, fileName, folderId) {
    try {
        const imageBuffer = Buffer.from(photoData.split(',')[1], 'base64');
        
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId]
            },
            media: {
                mimeType: 'image/jpeg',
                body: imageBuffer
            }
        });
        
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        
        return response.data.id;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
}

// Send emails with Google Drive link
async function sendDriveLinkEmails(emails, driveLink, photoCount) {
    const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    
    const emailPromises = emails.map(email => 
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🪔 Your Diwali Photo Collection is Ready! 🪔",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; border-radius: 15px;">
                    <h1 style="color: white; text-align: center; margin-bottom: 20px;">🪔 Happy Diwali! 🪔</h1>
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h2 style="color: #d35400; text-align: center;">Your Photo Collection is Ready!</h2>
                        <p style="color: #2c1810; font-size: 16px; line-height: 1.6;">We've captured ${photoCount} beautiful Diwali moments and uploaded them to Google Drive for you!</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${driveLink}" style="background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">📁 View Your Photos</a>
                        </div>
                        <p style="color: #8b4513; font-size: 14px; text-align: center;">Click the button above to access all your Diwali photos. Share the joy with your loved ones!</p>
                    </div>
                    <p style="color: white; text-align: center; font-size: 12px;">May this Diwali bring you happiness, prosperity, and beautiful memories! ✨</p>
                </div>
            `
        })
    );
    
    await Promise.all(emailPromises);
}

app.get("/games", (req, res) => {
    res.sendFile(path.resolve("public/games.html"));
});

app.post("/end-session", async (req, res) => {
    const { photos, emails } = req.body;
    
    if (!photos || photos.length === 0) {
        return res.status(400).json({ message: "No photos to process" });
    }
    
    if (!emails || emails.length === 0) {
        return res.status(400).json({ message: "No email addresses provided" });
    }
    
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const folderName = `Diwali-Photos-${timestamp}`;
        
        const folderId = await createDriveFolder(folderName);
        
        const uploadPromises = photos.map((photo, index) => 
            uploadPhotoToDrive(
                photo.data, 
                `diwali-photo-${index + 1}-${photo.timestamp.replace(/[:.]/g, '-')}.jpg`, 
                folderId
            )
        );
        
        await Promise.all(uploadPromises);
        
        const driveLink = `https://drive.google.com/drive/folders/${folderId}`;
        
        await sendDriveLinkEmails(emails, driveLink, photos.length);
        
        res.json({ 
            message: "Session ended successfully!", 
            driveLink: driveLink,
            photoCount: photos.length,
            emailsSent: emails.length
        });
        
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ message: "Failed to end session: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Make sure to set up your Google Drive API credentials in .env file');
});