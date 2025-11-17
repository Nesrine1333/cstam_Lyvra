# Medical AI Lab Analysis - Setup Instructions

## 🏗️ Architecture Overview
```
React Native Mobile App ↔ FastAPI Backend ↔ Ollama AI Models
```

## 🔧 BACKEND SETUP (FastAPI)

### 1. Install System Dependencies

**Windows:**
- Download and install Tesseract OCR from official website
- Download and install Ollama from official website

**macOS:**
```bash
brew install tesseract ollama
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-fra
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Setup Python Environment

```bash
# Create virtual environment
python -m venv medical_ai_env

# Activate environment
# Windows: medical_ai_env\Scripts\activate
# macOS/Linux: source medical_ai_env/bin/activate

# Install Python packages
pip install fastapi uvicorn pdfplumber python-multipart Pillow pytesseract pydantic requests
```

### 3. Setup AI Models

```bash
# Start Ollama service (keep this running)
ollama serve

# In a NEW terminal, download AI models:
ollama pull llama2:7b
```

### 4. Run Backend Server

```bash
# Make sure you're in the backend directory with main.py
python main.py
```

**Backend will run on:** http://localhost:8000

### 5. Verify Backend

- Open browser to: http://localhost:8000/docs
- You should see interactive API documentation
- Check http://localhost:8000/health for status

---

## 📱 FRONTEND SETUP (React Native)

### 1. Prerequisites Installation

**Install required tools:**
- Node.js (version 14 or higher)
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 2. Create React Native Project

```bash
# Create new React Native project
npx react-native init MedicalAIMobile
cd MedicalAIMobile

# Install required dependencies
npm install axios react-native-document-picker react-native-image-picker
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# For iOS only (macOS)
cd ios && pod install && cd ..
```

### 3. Configure Network Security

**For Android:**
- Edit `android/app/src/main/AndroidManifest.xml`
- Add internet permission
- Configure network security for localhost

**For iOS:**
- Configure App Transport Security in Xcode
- Allow arbitrary loads for local development

### 4. Update API Configuration

- Locate the API configuration file in your React Native project
- Set the backend URL to your computer's IP address
- Example: `http://192.168.1.100:8000` (replace with your actual IP)

### 5. Run Mobile App

**For Android:**
```bash
npx react-native run-android
```

**For iOS:**
```bash
npx react-native run-ios
```

---

## 🌐 NETWORK CONFIGURATION

### 1. Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

### 2. Update Mobile App Configuration

- Replace `localhost` with your computer's IP address in the mobile app
- Ensure mobile device and computer are on same WiFi network

### 3. Configure Backend CORS

- Backend should accept requests from your mobile app's IP
- This is usually configured in the main.py file

---

## 🚀 RUNNING THE FULL APPLICATION

### Step 1: Start AI Service
```bash
# Terminal 1 - Start Ollama (keep running)
ollama serve
```

### Step 2: Start Backend Server
```bash
# Terminal 2 - Start FastAPI backend (keep running)
python main.py
```

### Step 3: Start Mobile App
```bash
# Terminal 3 - Start React Native Metro bundler
npx react-native start

# Terminal 4 - Run on device (new terminal)
npx react-native run-android
# OR for iOS
npx react-native run-ios
```

---

## 📱 USING THE APPLICATION

1. **Open the mobile app** on your device/emulator
2. **Tap "Upload Image"** to select a medical lab report image from your gallery
3. **OR Tap "Upload PDF"** to select a PDF lab report
4. **Wait for processing** - the app will send to backend for AI analysis
5. **View results** - see medical data and dietary recommendations

---

## 🔧 TROUBLESHOOTING

### Backend Issues:
- Ensure Ollama is running: `ollama serve`
- Check port 8000 is available
- Verify Python dependencies are installed

### Frontend Issues:
- Ensure Node.js is installed
- Check Android Studio/Xcode setup
- Verify same WiFi network for backend and mobile

### Network Issues:
- Check computer firewall settings
- Verify IP address in mobile app configuration
- Ensure mobile device can reach computer's IP

### Connection Test:
```bash
# Test backend from mobile browser
http://YOUR_COMPUTER_IP:8000/health
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Ollama service running
- [ ] Backend API accessible at http://localhost:8000/docs
- [ ] Mobile app builds without errors
- [ ] Mobile device and computer on same network
- [ ] IP address correctly configured in mobile app
- [ ] File upload permissions granted on mobile

Your full-stack medical AI application is now ready to use! 🎉# Medical AI Lab Analysis - Setup Instructions

## 🏗️ Architecture Overview
```
React Native Mobile App ↔ FastAPI Backend ↔ Ollama AI Models
```

## 🔧 BACKEND SETUP (FastAPI)

### 1. Install System Dependencies

**Windows:**
- Download and install Tesseract OCR from official website
- Download and install Ollama from official website

**macOS:**
```bash
brew install tesseract ollama
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-fra
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Setup Python Environment

```bash
# Create virtual environment
python -m venv medical_ai_env

# Activate environment
# Windows: medical_ai_env\Scripts\activate
# macOS/Linux: source medical_ai_env/bin/activate

# Install Python packages
pip install fastapi uvicorn pdfplumber python-multipart Pillow pytesseract pydantic requests
```

### 3. Setup AI Models

```bash
# Start Ollama service (keep this running)
ollama serve

# In a NEW terminal, download AI models:
ollama pull llama2:7b
```

### 4. Run Backend Server

```bash
# Make sure you're in the backend directory with main.py
python main.py
```

**Backend will run on:** http://localhost:8000

### 5. Verify Backend

- Open browser to: http://localhost:8000/docs
- You should see interactive API documentation
- Check http://localhost:8000/health for status

---

## 📱 FRONTEND SETUP (React Native)

### 1. Prerequisites Installation

**Install required tools:**
- Node.js (version 14 or higher)
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 2. Create React Native Project

```bash
# Create new React Native project
npx react-native init MedicalAIMobile
cd MedicalAIMobile

# Install required dependencies
npm install axios react-native-document-picker react-native-image-picker
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# For iOS only (macOS)
cd ios && pod install && cd ..
```

### 3. Configure Network Security

**For Android:**
- Edit `android/app/src/main/AndroidManifest.xml`
- Add internet permission
- Configure network security for localhost

**For iOS:**
- Configure App Transport Security in Xcode
- Allow arbitrary loads for local development

### 4. Update API Configuration

- Locate the API configuration file in your React Native project
- Set the backend URL to your computer's IP address
- Example: `http://192.168.1.100:8000` (replace with your actual IP)

### 5. Run Mobile App

**For Android:**
```bash
npx react-native run-android
```

**For iOS:**
```bash
npx react-native run-ios
```

---

## 🌐 NETWORK CONFIGURATION

### 1. Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig
```

### 2. Update Mobile App Configuration

- Replace `localhost` with your computer's IP address in the mobile app
- Ensure mobile device and computer are on same WiFi network

### 3. Configure Backend CORS

- Backend should accept requests from your mobile app's IP
- This is usually configured in the main.py file

---

## 🚀 RUNNING THE FULL APPLICATION

### Step 1: Start AI Service
```bash
# Terminal 1 - Start Ollama (keep running)
ollama serve
```

### Step 2: Start Backend Server
```bash
# Terminal 2 - Start FastAPI backend (keep running)
python main.py
```

### Step 3: Start Mobile App
```bash
# Terminal 3 - Start React Native Metro bundler
npx react-native start

# Terminal 4 - Run on device (new terminal)
npx react-native run-android
# OR for iOS
npx react-native run-ios
```

---

## 📱 USING THE APPLICATION

1. **Open the mobile app** on your device/emulator
2. **Tap "Upload Image"** to select a medical lab report image from your gallery
3. **OR Tap "Upload PDF"** to select a PDF lab report
4. **Wait for processing** - the app will send to backend for AI analysis
5. **View results** - see medical data and dietary recommendations

---

## 🔧 TROUBLESHOOTING

### Backend Issues:
- Ensure Ollama is running: `ollama serve`
- Check port 8000 is available
- Verify Python dependencies are installed

### Frontend Issues:
- Ensure Node.js is installed
- Check Android Studio/Xcode setup
- Verify same WiFi network for backend and mobile

### Network Issues:
- Check computer firewall settings
- Verify IP address in mobile app configuration
- Ensure mobile device can reach computer's IP

### Connection Test:
```bash
# Test backend from mobile browser
http://YOUR_COMPUTER_IP:8000/health
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Ollama service running
- [ ] Backend API accessible at http://localhost:8000/docs
- [ ] Mobile app builds without errors
- [ ] Mobile device and computer on same network
- [ ] IP address correctly configured in mobile app
- [ ] File upload permissions granted on mobile

Your full-stack medical AI application is now ready to use! 🎉
