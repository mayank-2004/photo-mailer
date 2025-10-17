# Google Drive API Setup Instructions

## Prerequisites
1. Google Cloud Console account
2. Gmail account for sending emails

## Steps to Setup Google Drive API

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API for your project

### 2. Create Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "diwali-photo-uploader"
4. Click "Create and Continue"
5. Skip role assignment for now
6. Click "Done"

### 3. Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the JSON file
6. Save it securely in your project directory

### 4. Update Environment Variables
1. Update the `.env` file:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=path/to/your/downloaded-key.json
   GOOGLE_DRIVE_PARENT_FOLDER_ID=optional_parent_folder_id
   ```

### 5. Install Dependencies
Run the following command to install new dependencies:
```bash
npm install
```

## How It Works

1. **Photo Capture**: Users capture photos and provide their email addresses
2. **Memory Storage**: All photos are stored in browser memory during the session
3. **End Session**: When "End Photo Capture Moment" is clicked:
   - Camera stops
   - Creates a new folder in Google Drive with timestamp
   - Uploads all captured photos to the folder
   - Makes the folder publicly accessible
   - Sends email with Google Drive link to all participants

## Features Added

- ✅ Multiple photo storage in memory
- ✅ Email collection per photo
- ✅ "End Photo Capture Moment" button
- ✅ Google Drive folder creation
- ✅ Batch photo upload to Google Drive
- ✅ Public sharing permissions
- ✅ Beautiful email templates with Drive link
- ✅ Photo counter display
- ✅ Camera cleanup on session end

## Security Notes

- Service account key file should be kept secure
- Add the key file to `.gitignore`
- Consider using environment variables for production deployment