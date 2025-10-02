// server.js - FIXED VERSION
import AWS from "aws-sdk";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import nodemailer from "nodemailer";

dotenv.config();
const app = express();
const PORT = 3000;

// Force development mode logging
console.log('🔧 Server starting in mode:', process.env.NODE_ENV || 'production');
if (process.env.NODE_ENV !== 'production') {
  console.log('📝 Development mode - Enhanced logging enabled');
}

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const S3_BUCKET = process.env.S3_BUCKET_NAME;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// Multer setup for file uploads - INCREASED LIMITS
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file (increased from 5MB)
    files: 6 // Maximum 6 files
  }
});

// Mock DB
let users = [];
let likes = [];
let chats = [];
let otpStorage = {};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// AWS S3 Upload Function (with pre-signed URLs) - FIXED NO ACL
const uploadToS3 = async (file, fileName, folder = 'profile-photos') => {
  console.log('🚀 UPLOAD STARTED:', { fileName, folder, size: file.size });
  
  const key = `${folder}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
  // Detect actual file type instead of trusting mimetype
  let contentType = file.mimetype;
  try {
    console.log('🔍 Detecting file type...');
    const type = await fileTypeFromBuffer(file.buffer);
    if (type) {
      console.log('✅ File type detected:', { 
        originalMimetype: file.mimetype, 
        detectedMimetype: type.mime,
        extension: type.ext 
      });
      contentType = type.mime;
    } else {
      console.log('❌ Could not detect file type, using original:', file.mimetype);
    }
  } catch (error) {
    console.log('⚠️ Error detecting file type, using original:', file.mimetype);
  }

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: contentType,
  };

  try {
    console.log('📤 Uploading to S3...', { key, contentType });
    
    // Upload to S3
    await s3.upload(params).promise();
    
    // Generate pre-signed URL for access (expires in 7 days)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: 60 * 60 * 24 * 7 // 7 days
    });
    
    console.log('✅ Upload successful:', { key, url: signedUrl });
    
    return { url: signedUrl, key };
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error('Failed to upload image');
  }
};

// Generate pre-signed URL for existing objects
const generatePresignedUrl = (key) => {
  if (!key) return null;
  
  try {
    return s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: 60 * 60 * 24 * 7 // 7 days
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return null;
  }
};

// Fix existing file with wrong content type - FIXED NO ACL
app.post("/fix-file", async (req, res) => {
  console.log('🔧 Fix file request:', req.body);
  
  try {
    const { key } = req.body;
    
    if (!key) {
      console.log('❌ Missing key parameter');
      return res.json({ success: false, message: "Key parameter required" });
    }

    // Download the file
    const object = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: key
    }).promise();
    
    // Detect actual file type
    const type = await fileTypeFromBuffer(object.Body);
    const contentType = type ? type.mime : 'image/png';
    
    console.log('🛠️ Fixing file:', { 
      key, 
      detectedType: type, 
      usingContentType: contentType 
    });
    
    // Update metadata WITHOUT ACL
    await s3.copyObject({
      Bucket: S3_BUCKET,
      CopySource: `${S3_BUCKET}/${key}`,
      Key: key,
      ContentType: contentType,
      MetadataDirective: 'REPLACE'
    }).promise();
    
    // Generate new pre-signed URL
    const newUrl = s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: key,
      Expires: 60 * 60 * 24 * 7
    });
    
    console.log('✅ File fixed successfully:', key);
    
    res.json({ 
      success: true, 
      message: 'File fixed successfully!',
      correctedType: contentType,
      newUrl: newUrl
    });
    
  } catch (error) {
    console.error('❌ Fix error:', error);
    res.status(500).json({ success: false, error: 'Fix failed: ' + error.message });
  }
});

// --- Routes ---

// Send OTP
app.post("/send-otp", (req, res) => {
  console.log('📧 Send OTP request:', req.body.email);
  
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: "Email & password required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = { otp, password, timestamp: Date.now() };

  transporter.sendMail(
    {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your UWC Connect OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    },
    (err) => {
      if (err) {
        console.error('❌ Email error:', err);
        return res.json({ success: false, message: "Failed to send OTP" });
      }
      console.log('✅ OTP sent to:', email);
      res.json({ success: true, message: "OTP sent" });
    }
  );
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  console.log('✅ Verify OTP request:', req.body.email);
  
  const { email, otp } = req.body;
  const otpData = otpStorage[email];
  if (!otpData || Date.now() - otpData.timestamp > 10 * 60 * 1000) {
    console.log('❌ OTP expired for:', email);
    return res.json({ success: false, message: "OTP expired or not found" });
  }
  
  if (otpData.otp !== otp) {
    console.log('❌ Invalid OTP for:', email);
    return res.json({ success: false, message: "Invalid OTP" });
  }
  
  let user = users.find((u) => u.email === email);
  if (!user) {
    user = { email, password: otpData.password, profile: null, matches: [] };
    users.push(user);
    console.log('👤 New user created:', email);
  }
  
  delete otpStorage[email];
  console.log('✅ OTP verified for:', email);
  res.json({ success: true });
});

// Login
app.post("/login", (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    console.log('❌ Login failed for:', email);
    return res.json({ success: false, message: "Invalid credentials" });
  }
  
  console.log('✅ Login successful for:', email);
  res.json({ success: true });
});

// Profile setup with S3 upload - IMPROVED RETURN DATA
app.post("/profile", upload.array("photos", 6), async (req, res) => {
  console.log('📝 Profile setup request received:', { 
    email: req.query.email, 
    filesCount: req.files ? req.files.length : 0,
    bodyFields: Object.keys(req.body)
  });
  
  // DEBUG: Log all received files
  if (req.files && req.files.length > 0) {
    console.log('📸 Files received:');
    req.files.forEach((file, index) => {
      console.log(`  File ${index}: ${file.originalname}, Size: ${file.size}, Type: ${file.mimetype}`);
    });
  } else {
    console.log('ℹ️ No files received in request');
  }
  
  // DEBUG: Log form fields
  console.log('📋 Form fields received:', req.body);
  
  try {
    const { name, surname, interests, lookingFor, bio, university, studyField, age, gender, communicationStyle, loveLanguage, starSign } = req.body;
    const { email } = req.query;
    
    const user = users.find((u) => u.email === email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.json({ success: false, message: "User not found" });
    }

    // Upload photos to AWS S3 with better error handling
    const photoData = [];
    let uploadedCount = 0;
    
    if (req.files && req.files.length > 0) {
      console.log(`📸 Processing ${req.files.length} photos...`);
      
      for (const file of req.files) {
        try {
          console.log(`🖼️ Uploading: ${file.originalname}, Size: ${file.size}, Mimetype: ${file.mimetype}`);
          const result = await uploadToS3(file, file.originalname);
          photoData.push(result);
          uploadedCount++;
          console.log(`✅ Photo uploaded successfully: ${file.originalname}`);
        } catch (error) {
          console.error('❌ Failed to upload photo:', error.message);
          // Continue with other photos even if one fails
        }
      }
    } else {
      console.log('ℹ️ No photos to upload');
    }

    // Convert interests from string to array if needed
    let interestsArray = [];
    if (interests) {
      interestsArray = typeof interests === 'string' ? 
        interests.split(',').map(item => item.trim()) : 
        interests;
    }

    // Update user profile with photo URLs
    user.profile = {
      name,
      surname,
      interests: interestsArray,
      lookingFor,
      university,
      studyField,
      bio,
      age: age ? parseInt(age) : null,
      gender,
      communicationStyle,
      loveLanguage,
      starSign,
      photos: photoData.map(data => data.url),
      photoKeys: photoData.map(data => data.key),
    };

    console.log('✅ Profile saved successfully for:', email, `(${uploadedCount} photos uploaded)`);
    
    res.json({ 
      success: true, 
      message: "Profile saved successfully", 
      photosUploaded: uploadedCount,
      profile: user.profile // Return the profile data
    });
    
  } catch (error) {
    console.error("❌ Profile setup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
});

// Get single profile by email with refreshed pre-signed URLs
app.get("/profile/:email", (req, res) => {
  console.log('👤 Get profile request:', req.params.email);
  
  const { email } = req.params;
  const user = users.find((u) => u.email === email);
  
  if (!user || !user.profile) {
    console.log('❌ Profile not found:', email);
    return res.status(404).json({ success: false, message: "Profile not found" });
  }

  // Refresh pre-signed URLs if they're about to expire
  const profileWithRefreshedUrls = {
    ...user.profile,
    photos: user.profile.photos.map((photo, index) => {
      if (user.profile.photoKeys && user.profile.photoKeys[index]) {
        return generatePresignedUrl(user.profile.photoKeys[index]) || photo;
      }
      return photo;
    })
  };

  console.log('✅ Profile retrieved for:', email);
  res.json({ success: true, profile: profileWithRefreshedUrls });
});

// Get all profiles
app.get("/profiles", (req, res) => {
  console.log('📊 Get all profiles request');
  
  const profiles = users
    .filter((u) => u.profile)
    .map((u) => ({ 
      email: u.email, 
      ...u.profile
    }));
    
  console.log(`✅ Returning ${profiles.length} profiles`);
  res.json(profiles);
});

// Record a like - FIXED VERSION
app.post("/like", (req, res) => {
  console.log('💖 Like request:', req.body);
  
  const { fromEmail, toEmail } = req.body;
  
  if (!fromEmail || !toEmail) {
    console.log('❌ Missing emails in like request');
    return res.status(400).json({ 
      success: false, 
      message: "Missing emails" 
    });
  }

  // Add the like
  likes.push({ fromEmail, toEmail });
  console.log('✅ Like recorded from:', fromEmail, 'to:', toEmail);

  // Check for mutual like
  const mutual = likes.find(l => l.fromEmail === toEmail && l.toEmail === fromEmail);
  let isMatch = false;
  
  if (mutual) {
    const fromUser = users.find(u => u.email === fromEmail);
    const toUser = users.find(u => u.email === toEmail);
    
    if (fromUser && toUser) {
      fromUser.matches = fromUser.matches || [];
      toUser.matches = toUser.matches || [];
      
      if (!fromUser.matches.includes(toUser.email)) {
        fromUser.matches.push(toUser.email);
      }
      if (!toUser.matches.includes(fromUser.email)) {
        toUser.matches.push(fromUser.email);
      }
      
      isMatch = true;
      console.log('💑 Mutual match found:', fromEmail, 'and', toEmail);
    }
  }

  // ALWAYS return JSON response
  res.json({ 
    success: true, 
    message: "Like recorded successfully",
    match: isMatch
  });
});

// Get matches
app.get("/matches", (req, res) => {
  console.log('💑 Get matches request:', req.query.email);
  
  const { email } = req.query;
  const user = users.find((u) => u.email === email);
  if (!user) {
    console.log('❌ User not found for matches:', email);
    return res.json({ success: false, message: "User not found" });
  }
  
  const matchProfiles = user.matches.map(matchEmail => {
    const matchUser = users.find(u => u.email === matchEmail);
    return matchUser ? { email: matchUser.email, ...matchUser.profile } : null;
  }).filter(profile => profile !== null);
  
  console.log(`✅ Returning ${matchProfiles.length} matches for:`, email);
  res.json(matchProfiles);
});

// Discover endpoint - returns all profiles except current user
app.post("/discover", (req, res) => {
  console.log('🔍 Discover request received:', { 
    email: req.body.email,
    userCount: users.length,
    profileCount: users.filter(u => u.profile).length
  });
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ Missing email in discover request');
      return res.status(400).json({ 
        success: false, 
        message: "Email required" 
      });
    }

    // Get all profiles EXCEPT the current user's profile
    const discoverProfiles = users
      .filter(user => user.profile && user.email !== email)
      .map(user => {
        // Ensure photos array exists and refresh URLs
        const photos = (user.profile.photos || []).map((photo, index) => {
          if (user.profile.photoKeys && user.profile.photoKeys[index]) {
            return generatePresignedUrl(user.profile.photoKeys[index]) || photo;
          }
          return photo;
        }).filter(photo => photo); // Remove any null/undefined photos
        
        return {
          email: user.email,
          ...user.profile,
          photos: photos
        };
      });

    console.log(`✅ Discover returning ${discoverProfiles.length} profiles for:`, email);
    
    res.json({
      success: true,
      profiles: discoverProfiles,
      count: discoverProfiles.length
    });
    
  } catch (error) {
    console.error('❌ Discover endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all likes data
app.get("/likes", (req, res) => {
  console.log('💖 Get all likes request');
  res.json(likes);
});

// Get messages between users - FIXED ENDPOINT
app.get("/messages", (req, res) => {
  const { user1, user2 } = req.query;
  console.log('💬 Get messages request:', { user1, user2 });
  
  if (!user1 || !user2) {
    return res.status(400).json({ 
      success: false, 
      message: "Both users required" 
    });
  }
  
  // Filter messages between these two users
  const userMessages = chats.filter(chat => 
    (chat.sender === user1 && chat.receiver === user2) ||
    (chat.sender === user2 && chat.receiver === user1)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  console.log(`✅ Returning ${userMessages.length} messages between ${user1} and ${user2}`);
  res.json({ 
    success: true, 
    messages: userMessages 
  });
});

// Send a message - FIXED ENDPOINT
app.post("/messages", (req, res) => {
  console.log('📤 Send message request:', req.body);
  
  const { sender, receiver, text, timestamp } = req.body;
  
  if (!sender || !receiver || !text) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }
  
  const newMessage = {
    id: Date.now(),
    sender,
    receiver,
    text,
    timestamp: timestamp || new Date().toISOString()
  };
  
  chats.push(newMessage);
  console.log('✅ Message sent from', sender, 'to', receiver);
  
  res.json({ 
    success: true, 
    message: "Message sent successfully",
    messageId: newMessage.id
  });
});

// NEW: Compatibility endpoints for /chat
app.get("/chat", (req, res) => {
  const { user1, user2 } = req.query;
  console.log('💬 Get chat request (compatibility):', { user1, user2 });
  
  if (!user1 || !user2) {
    return res.status(400).json({ 
      success: false, 
      message: "Both users required" 
    });
  }
  
  // Filter messages between these two users
  const userMessages = chats.filter(chat => 
    (chat.sender === user1 && chat.receiver === user2) ||
    (chat.sender === user2 && chat.receiver === user1)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  console.log(`✅ Returning ${userMessages.length} messages between ${user1} and ${user2}`);
  res.json(userMessages);
});

// NEW: Compatibility endpoint for sending chat messages
app.post("/chat", (req, res) => {
  console.log('📤 Send chat request (compatibility):', req.body);
  
  const { fromEmail, toEmail, message } = req.body;
  
  if (!fromEmail || !toEmail || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }
  
  const newMessage = {
    id: Date.now(),
    sender: fromEmail,
    receiver: toEmail,
    text: message,
    timestamp: new Date().toISOString()
  };
  
  chats.push(newMessage);
  console.log('✅ Chat message sent from', fromEmail, 'to', toEmail);
  
  res.json({ 
    success: true, 
    message: "Message sent successfully",
    messageId: newMessage.id
  });
});

// NEW: Get likes for specific user
app.get("/likes/:email", (req, res) => {
  const { email } = req.params;
  console.log('💖 Get likes for user:', email);
  
  const userLikes = {
    received: likes.filter(like => like.toEmail === email),
    sent: likes.filter(like => like.fromEmail === email)
  };
  
  res.json(userLikes);
});

// Delete account with S3 cleanup
app.post("/delete-account", async (req, res) => {
  console.log('🗑️ Delete account request:', req.body);
  
  const { email, reason } = req.body;
  
  try {
    const user = users.find(u => u.email === email);
    
    // Delete photos from S3
    if (user && user.profile && user.profile.photoKeys) {
      console.log(`🖼️ Deleting ${user.profile.photoKeys.length} photos from S3 for:`, email);
      
      for (const key of user.profile.photoKeys) {
        try {
          await s3.deleteObject({
            Bucket: S3_BUCKET,
            Key: key
          }).promise();
          console.log('✅ Deleted photo from S3:', key);
        } catch (error) {
          console.error('❌ Error deleting photo from S3:', error);
        }
      }
    }
    
    // Remove user from database
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
    }
    
    // Remove user's likes
    likes = likes.filter(like => like.fromEmail !== email && like.toEmail !== email);
    
    console.log(`✅ Account deleted for ${email}. Reason: ${reason}`);
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.json({ success: false, message: "Error deleting account" });
  }
});

// Test S3 upload endpoint
app.post("/test-s3", upload.single('photo'), async (req, res) => {
  console.log('🧪 Test S3 upload request');
  
  try {
    if (!req.file) {
      console.log('❌ No file uploaded for test');
      return res.json({ success: false, message: "No file uploaded" });
    }

    console.log('🖼️ Test file details:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const result = await uploadToS3(req.file, 'test-upload.jpg');
    
    console.log('✅ S3 upload test successful');
    res.json({ 
      success: true, 
      message: "S3 upload test successful",
      url: result.url,
      key: result.key
    });
  } catch (error) {
    console.error('❌ S3 upload test failed:', error);
    res.json({ 
      success: false, 
      message: "S3 upload test failed",
      error: error.message 
    });
  }
});

// Health check endpoint with S3 connectivity test
app.get("/health", async (req, res) => {
  console.log('❤️ Health check request');
  
  try {
    // Test S3 connectivity
    await s3.headBucket({ Bucket: S3_BUCKET }).promise();
    
    console.log('✅ Health check passed');
    res.json({ 
      success: true, 
      message: "Server is running", 
      userCount: users.length,
      profilesCount: users.filter(u => u.profile).length,
      s3: {
        configured: true,
        bucket: S3_BUCKET,
        accessible: true
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.json({ 
      success: false, 
      message: "Server running but S3 access issue", 
      error: error.message,
      s3: {
        configured: !!S3_BUCKET,
        bucket: S3_BUCKET,
        accessible: false
      }
    });
  }
});

// Debug endpoint to check current state
app.get("/debug", (req, res) => {
  console.log('🐛 Debug request');
  
  const debugData = {
    users: users.map(u => ({
      email: u.email,
      hasProfile: !!u.profile,
      profile: u.profile ? {
        name: u.profile.name,
        photosCount: u.profile.photos ? u.profile.photos.length : 0,
        photoKeysCount: u.profile.photoKeys ? u.profile.photoKeys.length : 0
      } : null,
      matches: u.matches || []
    })),
    likes: likes,
    chatsCount: chats.length,
    otpStorageCount: Object.keys(otpStorage).length
  };
  
  res.json(debugData);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log('🚀 Server starting...');
  console.log(`📍 Server running on http://0.0.0.0:${PORT}`);
  console.log(`❤️ Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`☁️ S3 Bucket: ${S3_BUCKET || 'Not configured'}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log('📝 Logging level: Enhanced development logging');
  
  // Log all available endpoints
  console.log('\n📋 Available Endpoints:');
  console.log('  POST /send-otp');
  console.log('  POST /verify-otp');
  console.log('  POST /login');
  console.log('  POST /profile');
  console.log('  GET  /profile/:email');
  console.log('  GET  /profiles');
  console.log('  POST /like');
  console.log('  GET  /matches');
  console.log('  POST /discover');
  console.log('  GET  /likes');
  console.log('  GET  /messages');
  console.log('  POST /messages');
  console.log('  GET  /chat');
  console.log('  POST /chat');
  console.log('  GET  /likes/:email');
  console.log('  POST /delete-account');
  console.log('  GET  /health');
  console.log('  GET  /debug');
});