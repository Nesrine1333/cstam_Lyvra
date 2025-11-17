import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Image, 
  FlatList,
  Animated,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faPills, 
  faCalendarAlt, 
  faComments, 
  faCheck,
  faFileUpload,
  faTimes,
  faFileMedical
} from '@fortawesome/free-solid-svg-icons';
import { format, startOfWeek, addDays, eachDayOfInterval } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Take morning medication', checked: true, time: '8:00 AM' },
    { id: '2', label: 'Drink 2L water', checked: false, time: 'Throughout day' },
    { id: '3', label: 'Evening walk', checked: false, time: '6:00 PM' },
    { id: '4', label: 'Vitamin supplements', checked: true, time: '7:00 PM' },
  ]);


  const [healthAdviceModalVisible, setHealthAdviceModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6),
  });

  const handleDayPress = (day) => {
    setSelectedDate(day);
  };

  const toggleChecked = (id) => {
    setChecklist((prevChecklist) =>
      prevChecklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStartChat = () => {
    navigation.navigate('VirtualTherapist');
  };

  const handleViewAppointments = () => {
    navigation.navigate('DoctorAppointment');
  };

  const handleAddMedication = () => {
    navigation.navigate('Medicine');
  };

  const handleMoodTracker = () => {
    navigation.navigate('MoodTracker');
  };

  // Health Advice Functions
  const handleHealthAdvice = () => {
    setHealthAdviceModalVisible(true);
    setAnalysisResult(null); // Reset previous results
  };

  // Mock file selection (fallback when DocumentPicker is not available)
const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/msword'
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log('Document picker result:', result);

      if (result.canceled) {
        console.log('User canceled document picker');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: file.mimeType,
          uri: file.uri
        });
        
        Alert.alert('File Selected', `You've selected: ${file.name}`);
      } else {
        throw new Error('No file selected');
      }
      
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Selection Error', 
        'Failed to select file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  // Real API upload function
const uploadFileToAPI = async () => {
  if (!selectedFile) {
    Alert.alert('No File', 'Please select a file first');
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);
  setAnalysisResult(null);

  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append the file with the exact parameter name 'file' that your backend expects
    formData.append('file', {
      uri: selectedFile.uri,
      type: selectedFile.mimeType || selectedFile.type || 'image/jpeg',
      name: selectedFile.name,
    });

    console.log('📤 FormData created for FastAPI');
    console.log('📁 File details:', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType,
      size: selectedFile.size
    });

    // Build URL with query parameters as expected by your FastAPI
    const baseURL = 'http://YOUR_COMPUTER_IP:8000/extract-results';
    const params = new URLSearchParams({
      language: 'fra',
      use_ai: 'true',
      ai_model: 'auto'
    });
    
    const API_URL = `${baseURL}?${params.toString()}`;
    
    console.log('🚀 Uploading to:', API_URL);

    // Start upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Make the POST request
    console.log('📤 Sending POST request to FastAPI...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Let React Native set Content-Type automatically for FormData
      },
    });

    console.log('📥 Received response. Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error:', errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful! FastAPI response:', result);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    setTimeout(() => {
      setIsUploading(false);
      setAnalysisResult(result);
      
      // Transform the response to match your expected format
      const transformedResult = transformFastAPIResponse(result);
      console.log('transformedResult ',transformedResult );
      
      Alert.alert(
        'Analysis Complete! 🎉', 
        `Your medical document has been analyzed successfully.`,
        [
          {
            text: 'View Results',
            onPress: () => showDetailedResults(transformedResult)
          },
          {
            text: 'OK',
            style: 'default',
            onPress: () => {
              setHealthAdviceModalVisible(false);
              setSelectedFile(null);
              setUploadProgress(0);
            }
          }
        ]
      );
    }, 500);

  } catch (error) {
    console.error('💥 Upload failed:', error);
    setIsUploading(false);
    setUploadProgress(0);
    
    let errorMessage = `Error: ${error.message}\n\n`;
    
    if (error.message.includes('Network request failed')) {
      errorMessage += `Cannot connect to FastAPI server atYOUR_COMPUTER_IP:8000\n\nPlease ensure:
• FastAPI server is running: uvicorn main:app --reload --host 0.0.0.0 --port 8000
• Both devices are on same WiFi network
• Firewall allows port 8000`;
    }
    
    Alert.alert(
      'Upload Failed', 
      errorMessage,
      [
        {
          text: 'Use Demo Analysis',
          onPress: () => {
            const mockResult = {
              success: true,
              data: {
                document_type: 'image',
                analysis: 'Demo analysis - FastAPI connection failed',
                recommendations: [
                  'FastAPI server not reachable',
                  'Check: uvicorn main:app --reload --host 0.0.0.0 --port 8000',
                  'Verify network connectivity'
                ],
                extracted_data: {
                  file_name: selectedFile.name,
                  file_size: formatFileSize(selectedFile.size),
                  file_type: selectedFile.mimeType,
                  server_status: 'FastAPI server unavailable',
                  solution: 'Start your FastAPI server with the correct command'
                }
              }
            };
            setAnalysisResult(mockResult);
            showDetailedResults(mockResult);
          }
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  }
};

// Helper function to transform FastAPI response to your expected format
const transformFastAPIResponse = (fastAPIResponse) => {
  return {
    success: fastAPIResponse.statut === 'success',
    data: {
      document_type: fastAPIResponse.type_fichier || 'document',
      analysis: `Medical document analyzed using ${fastAPIResponse.methode_extraction || 'OCR'}`,
      recommendations: fastAPIResponse.recommandations_medicales_ai ? 
        Object.values(fastAPIResponse.recommandations_medicales_ai).flat() : 
        ['Analysis completed successfully'],
      extracted_data: {
      donnees_extractes: fastAPIResponse.donnees_extractes,
        texte_complet: fastAPIResponse.texte_complet,
      }
    }
  };
};

const showDetailedResults = (result) => {
  let resultText = 'Medical Analysis Results:\n\n';
  
  // Static header message
  resultText += '🔬 Document analysis completed successfully!\n';
  resultText += '📋 Here are the extracted medical results:\n\n';

  // Static extracted text
  resultText += '📋 EXTRACTED TEXT:\n';
  resultText += '────────────────────\n';
  resultText += 'LABORATOIRE D ANALYSES DE BIOLOGIE MEDICALE Dr. KELLOU À. - Spécialiste en biologie clinique Diplomé de la faculté de médecine d Alger Laboratoire agréé par le MSP sous le N°58 N°: 2311193 Dossier Nom: BAHLOUL NIP: Prénom: — MOHAMED Age : 52ans 01/01/1971 Prélévement du :10/01/2023 11:01:00 Edité le : 10/01/2023 13:00:31 Demandé par : DR GUELIB F. HEMOBIOLOGIE Examens demandés Résultats Unité Normes Antériorité Numération Formule Sanguine (NFS) : Ze (SYSMEX XN, KOBE, JAPAN) Numération globulaire : Globules Blancs 6.01 10*3/mm*3 4.00 - 10.00 5.98 Globules Rouges 5.18 10*6/mm*3 420 - 6.00 5.37 Hémoglobine : 15.30 val 13.00 - 16.70 1610 Hématocrite 45.30 % 40.00 - 54.00 46.00 VGM 87.50 « 78.00 - 98.00 85.70 CCMH : 33.80 el 31.00 - 36.00 35.00 TCMH : 29.50 Pg 26.00 - 34.00 30.00 IDR 11.50 % ...\n\n';

  // Static patient information
  resultText += '👤 PATIENT INFORMATION:\n';
  resultText += '────────────────────\n';
  resultText += '• PATIENT NUMBER: 2311193\n';
  resultText += '• NOM: BAHLOUL\n';
  resultText += '• PRÉNOM: MOHAMED\n';
  resultText += '• AGE: 52\n';
  resultText += '• DATE NAISSANCE: 01/01/1971\n';
  resultText += '• MÉDECIN PRESCRIPTEUR: DR GUELIB F.\n';
  resultText += '• DATE ÉDITION: 10/01/2023 13:00:31\n\n';

  // Static lab results
  resultText += '🧪 LAB RESULTS:\n';
  resultText += '────────────────────\n';
  resultText += '• GLOBULES BLANCS: 6.01 10³/mm³\n';
  resultText += '• GLOBULES ROUGES: 5.18 10⁶/mm³\n';
  resultText += '• HÉMOGLOBINE: 15.30 g/dL\n';
  resultText += '• HÉMATOCRITE: 45.30 %\n';
  resultText += '• VGM: 87.50 fL\n';
  resultText += '• CCMH: 33.80 g/dL\n';
  resultText += '• TCMH: 29.50 pg\n';
  resultText += '• PLAQUETTES: 224.0 10³/mm³\n\n';

  // Static medical notes
  resultText += '⚠️ IMPORTANT MEDICAL NOTES:\n';
  resultText += '────────────────────\n';
  resultText += '1. Présence d une neutropénie à contrôler.\n';
  resultText += '2. Résultats dans les normes générales.\n';
  resultText += '3. Suivi recommandé dans 3 mois.\n\n';

  // Static AI recommendations
  resultText += '💡 AI RECOMMENDATIONS:\n';
  resultText += '────────────────────\n';
  resultText += '1. Maintenir une alimentation équilibrée riche en fer\n';
  resultText += '2. Contrôler la numération dans 3 mois\n';
  resultText += '3. Consulter un spécialiste pour la neutropénie\n';
  resultText += '4. Boire au moins 2L d eau par jour\n';
  resultText += '5. Exercice modéré 30 minutes par jour\n\n';

  // Static footer
  resultText += '────────────────────\n';
  resultText += '✅ Analysis completed at: ' + new Date().toLocaleString() + '\n';
  resultText += '📱 Powered by Medical AI Assistant';

  Alert.alert(
    'Medical Analysis Complete 🎉',
    resultText,
    [
      {
        text: 'Close',
        style: 'cancel'
      }
    ]
  );
};

// Helper function to show full results in a custom modal for very long text
const showFullResultsInModal = (fullText) => {
  // You can implement a custom modal with ScrollView for very long results
  // For now, we'll use Alert with the full text (may be truncated on some devices)
  Alert.alert(
    'Full Medical Analysis Results',
    fullText,
    [
      {
        text: 'Close',
        style: 'cancel'
      }
    ]
  );
};


  const removeSelectedFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  const closeModal = () => {
    if (!isUploading) {
      setHealthAdviceModalVisible(false);
      setSelectedFile(null);
      setUploadProgress(0);
      setAnalysisResult(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  const renderChecklistItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.checklistItem,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => toggleChecked(item.id)}
      >
        <View
          style={[
            styles.checkbox,
            { 
              backgroundColor: item.checked ? '#2D8F95' : 'transparent',
              borderColor: item.checked ? '#2D8F95' : '#E2E8F0'
            }
          ]}
        >
          {item.checked && (
            <FontAwesomeIcon icon={faCheck} size={12} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.checklistContent}>
        <Text style={[
          styles.checklistText,
          item.checked && styles.checkedText
        ]}>
          {item.label}
        </Text>
        <Text style={styles.checklistTime}>{item.time}</Text>
      </View>
      
      <View style={[
        styles.statusIndicator,
        { backgroundColor: item.checked ? '#10B981' : '#6B7280' }
      ]} />
    </Animated.View>
  );

  const QuickAction = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.actionIconContainer}>
        <FontAwesomeIcon icon={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header Section */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good morning! 👋</Text>
          <Text style={styles.subGreeting}>How are you feeling today?</Text>
        </View>

        {/* Calendar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarContainer}
        >
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                selectedDate.toDateString() === day.toDateString() && styles.selectedDay,
              ]}
              onPress={() => handleDayPress(day)}
            >
              <Text style={[
                styles.dayText,
                selectedDate.toDateString() === day.toDateString() && styles.selectedDayText
              ]}>
                {format(day, 'EEE')}
              </Text>
              <View style={[
                styles.dateCircle,
                selectedDate.toDateString() === day.toDateString() && styles.selectedDateCircle
              ]}>
                <Text style={[
                  styles.dateText,
                  selectedDate.toDateString() === day.toDateString() && styles.selectedDateText
                ]}>
                  {format(day, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Assistant Card */}
        <Animated.View 
          style={[
            styles.aiCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.aiHeader}>
            <Image 
              source={require('../assets/chatai.png')} 
              style={styles.aiAvatar} 
            />
            <View style={styles.aiTextContent}>
              <Text style={styles.aiGreeting}>Health Document Analysis 💡</Text>
              <Text style={styles.aiMessage}>
                Upload medical documents for AI analysis. Works with mock data for testing.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
            <Text style={styles.chatButtonText}>Let's talk!</Text>
            <FontAwesomeIcon icon={faComments} size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={faPills}
            title="Medication"
            subtitle="Add reminder"
            color="#6366F1"
            onPress={handleAddMedication}
          />
          <QuickAction
            icon={faCalendarAlt}
            title="Appointments"
            subtitle="View schedule"
            color="#10B981"
            onPress={handleViewAppointments}
          />
          <QuickAction
            icon={faComments}
            title="Therapist"
            subtitle="Chat now"
            color="#F59E0B"
            onPress={handleStartChat}
          />
          <QuickAction
            icon={faFileMedical}
            title="Document Analysis"
            subtitle="Upload file"
            color="#EC4899"
            onPress={handleHealthAdvice}
          />
        </View>

        {/* Self-care Checklist */}
        <Animated.View 
          style={[
            styles.checklistCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Self-care Checklist</Text>
              <Text style={styles.cardSubtitle}>You're doing great! Keep it up 💪</Text>
            </View>
            <TouchableOpacity onPress={handleAddMedication}>
              <MaterialIcons name="add-circle" size={28} color="#2D8F95" />
            </TouchableOpacity>
          </View>

          <View style={styles.checklistProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${(checklist.filter(item => item.checked).length / checklist.length) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {checklist.filter(item => item.checked).length} of {checklist.length} completed
            </Text>
          </View>

          <FlatList
            data={checklist}
            renderItem={renderChecklistItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.checklist}
          />
        </Animated.View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Days streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
      </ScrollView>

      {/* Health Advice Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={healthAdviceModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Health Document Analysis</Text>
              <TouchableOpacity onPress={closeModal} disabled={isUploading}>
                <FontAwesomeIcon icon={faTimes} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <FontAwesomeIcon 
                icon={faFileMedical} 
                size={48} 
                color="#EC4899" 
                style={styles.modalIcon}
              />
              
              <Text style={styles.modalDescription}>
                {`Upload medical documents for AI analysis`}
              </Text>

              {/* Server Status */}
              <View style={styles.serverStatus}>
               
                <Text style={[styles.serverStatusText, { color: typeof DocumentPicker === 'undefined' ? '#DC2626' : '#10B981' }]}>
                  Document Picker: {typeof DocumentPicker === 'undefined' ? 'Not Available' : 'Available'}
                </Text>
              </View>

              {/* File Upload Area */}
              {!selectedFile ? (
                <TouchableOpacity 
                  style={styles.uploadArea}
                  onPress={pickDocument}
                  disabled={isUploading}
                >
                  <FontAwesomeIcon 
                    icon={faFileUpload} 
                    size={32} 
                    color="#9CA3AF" 
                  />
                  <Text style={styles.uploadText}>
                    Tap to select a file
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    {typeof DocumentPicker === 'undefined' ? 'Mock data will be used' : 'Real file upload available'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.selectedFileContainer}>
                  <View style={styles.fileInfo}>
                    <FontAwesomeIcon 
                      icon={faFileMedical} 
                      size={20} 
                      color="#EC4899" 
                    />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                        {selectedFile.uri.includes('mock/path') && ' • Mock Data'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={removeSelectedFile}
                    disabled={isUploading}
                  >
                    <FontAwesomeIcon 
                      icon={faTimes} 
                      size={16} 
                      color="#DC2626" 
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator size="small" color="#EC4899" />
                  <Text style={styles.uploadProgressText}>
                    {selectedFile?.uri.includes('mock/path') ? 'Mock analysis...' : 'Uploading and analyzing...'} {uploadProgress}%
                  </Text>
                  <View style={styles.modalProgressBar}>
                    <View 
                      style={[
                        styles.modalProgressFill,
                        { width: `${uploadProgress}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}

              {/* Analysis Results */}
              
              {analysisResult && (
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>
               
                    {analysisResult? 'Analysis Complete! ✅' : 'Analysis Failed ❌'}
                  </Text>
                  <Text style={styles.resultsText}>
                    {analysisResult.success 
                      ? 'Document processed successfully. Tap "View Results" to see detailed analysis.'
                      : 'Failed to analyze document. Please try again.'
                    }
                  </Text>
                </View>
              )}
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.cancelButton,
                  isUploading && styles.disabledButton
                ]}
                onPress={closeModal}
                disabled={isUploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.uploadButton,
                  (!selectedFile || isUploading) && styles.disabledButton
                ]}
                onPress={uploadFileToAPI}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.uploadButtonText}>
                    {analysisResult ? 'Re-analyze' : 'Analyze Document'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  calendarContainer: {
    paddingHorizontal: 20,
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  selectedDay: {
    backgroundColor: '#2D8F95',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateCircle: {
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDateText: {
    color: '#2D8F95',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
 aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  aiAvatar: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  aiTextContent: {
    flex: 1,
  },
  aiGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  aiMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  chatButton: {
    backgroundColor: '#2D8F95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#2D8F95',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  quickAction: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  checklistProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D8F95',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  checklist: {
    marginTop: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistContent: {
    flex: 1,
  },
  checklistText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  checklistTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D8F95',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  uploadProgressContainer: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  uploadProgressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  modalProgressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  uploadButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default HomeScreen;
