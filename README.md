# Medical AI Lab Analysis - Full Stack Application

## 🏗️ Architecture Overview

```
Frontend (React Native) ↔ Backend (FastAPI) ↔ AI Models (Ollama)
       ↗               ↘
Mobile App          Document Processing
                     (PDF/Image Analysis)
```

## 🔧 Backend Setup (FastAPI)

### 1. Install System Dependencies

**Windows:**
- Download Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
- Download Ollama: https://ollama.ai/

**macOS:**
```bash
brew install tesseract ollama
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install tesseract-ocr tesseract-ocr-fra
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Backend Installation

```bash
# Create and activate virtual environment
python -m venv medical_ai_env
source medical_ai_env/bin/activate  # Windows: medical_ai_env\Scripts\activate

# Install Python dependencies
pip install fastapi uvicorn pdfplumber python-multipart Pillow pytesseract pydantic requests
```

### 3. Setup AI Models

```bash
# Start Ollama service
ollama serve

# In a new terminal, download models:
ollama pull llama2:7b
# OR for medical analysis:
ollama pull medllama2
```

### 4. Run Backend Server

```bash
python main.py
```

**Backend runs on:** http://localhost:8000

### 5. Verify Backend

```bash
# Check services
curl http://localhost:8000/health
curl http://localhost:11434/api/tags
```

---

## 📱 Frontend Setup (React Native)

### 1. Prerequisites

```bash
# Install Node.js and npm
# Install React Native CLI
npm install -g react-native-cli

# For iOS (macOS only)
brew install cocoapods

# For Android
# Install Android Studio and SDK
```

### 2. Create React Native App

```bash
# Create new React Native project
npx react-native init MedicalAIMobile
cd MedicalAIMobile

# Install dependencies
npm install axios react-native-document-picker react-native-image-picker
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# For iOS
cd ios && pod install && cd ..
```

### 3. Frontend Code Structure

Create `src/components/MedicalScanner.js`:

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Change to your backend IP

const MedicalScanner = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const uploadMedicalDocument = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.fileName || 'medical_document.jpg',
      });

      const response = await axios.post(
        `${API_BASE_URL}/extract-results`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      setResults(response.data);
      Alert.alert('Success', 'Medical analysis completed!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          uploadMedicalDocument(response.assets[0]);
        }
      }
    );
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      uploadMedicalDocument(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Medical Lab Analyzer
      </Text>

      {loading && <ActivityIndicator size="large" />}

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
        }}
        onPress={pickImage}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          📷 Upload Image
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#34C759',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
        onPress={pickDocument}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          📄 Upload PDF
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Results:</Text>
          <Text>Patient: {results.donnees_extractes?.informations_patient?.nom}</Text>
          <Text>Hemoglobin: {results.donnees_extractes?.resultats_hemobiologie?.hemoglobine?.valeur}</Text>
          {/* Add more result display as needed */}
        </View>
      )}
    </View>
  );
};

export default MedicalScanner;
```

### 4. Update App.js

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MedicalScanner from './src/components/MedicalScanner';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MedicalScanner" 
          component={MedicalScanner}
          options={{ title: 'Lab Analysis' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
```

### 5. Android Network Security

Add `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

Add `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain> <!-- Android Emulator -->
    </domain-config>
</network-security-config>
```

Update `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### 6. Run Mobile App

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

---

## 🌐 Network Configuration

### For Physical Device Testing

1. **Find your computer's IP:**
   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig
   ```

2. **Update frontend API URL:**
   ```javascript
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000';
   ```

3. **Backend CORS setup (in main.py):**
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "http://your-phone-ip"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## 🚀 Running the Full Stack

### Step 1: Start Backend
```bash
# Terminal 1 - Start Ollama
ollama serve

# Terminal 2 - Start FastAPI
python main.py
```

### Step 2: Start Frontend
```bash
# Terminal 3 - Start React Native
npx react-native start

# Terminal 4 - Run on device/emulator
npx react-native run-android
# OR
npx react-native run-ios
```

### Step 3: Test the Flow
1. Open mobile app
2. Tap "Upload Image" or "Upload PDF"
3. Select a medical lab report
4. Wait for AI analysis
5. View results on mobile

---

## 📱 Mobile App Features

- **Document Upload**: Camera roll or file picker
- **PDF Support**: Direct PDF file upload
- **Real-time Analysis**: Progress indicators
- **Results Display**: Structured medical data
- **AI Recommendations**: Dietary and lifestyle advice

---

## 🔧 Troubleshooting

### Common Issues:

1. **Network Connection:**
   - Ensure same WiFi network for backend and mobile
   - Check firewall settings
   - Use correct IP address in frontend

2. **Android Emulator:**
   - Use `10.0.2.2` for localhost
   - Enable network permissions

3. **File Upload:**
   - Check file size limits
   - Verify supported formats (PDF, JPEG, PNG)

4. **Backend Access:**
   ```bash
   # Test backend directly
   curl http://localhost:8000/health
   ```

Your full-stack medical AI application is now ready! 🎉
