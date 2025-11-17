import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';

export const VirtualTherapist = () => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: "Hello! I'm your AI Health Assistant. I see you've uploaded blood test results. How can I help you understand them today?", 
      sender: 'bot',
      type: 'greeting'
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const flatListRef = useRef(null);

  // Static medical advice based on the blood test results
  const medicalAdvice = {
    neutropenia: {
      title: "About Neutropenia",
      message: "Your results show neutropenia (low neutrophil count). This means your immune system might be more vulnerable to infections. I recommend:\n\n• Practice good hygiene\n• Avoid crowded places when possible\n• Cook foods thoroughly\n• Consult your doctor for further evaluation",
      quickReplies: ["Tell me more about neutropenia", "What foods help?", "When to see a doctor?"]
    },
    nutrition: {
      title: "Nutrition Tips",
      message: "Based on your blood work, here are nutritional suggestions:\n\n• Iron-rich foods: spinach, lentils, red meat\n• Vitamin B12: eggs, dairy, fortified cereals\n• Stay hydrated with 2-3L water daily\n• Include antioxidants: berries, nuts, green tea",
      quickReplies: ["Iron-rich foods", "Hydration tips", "Sample meal plan"]
    },
    lifestyle: {
      title: "Lifestyle Recommendations",
      message: "To support your immune system:\n\n• Moderate exercise 30 mins daily\n• 7-8 hours quality sleep\n• Stress management techniques\n• Regular medical check-ups",
      quickReplies: ["Exercise routines", "Sleep tips", "Stress management"]
    },
    followUp: {
      title: "Follow-up Care",
      message: "Important next steps:\n\n• Repeat blood test in 4-6 weeks\n• Monitor for fever or infections\n• Keep a symptom journal\n• Schedule follow-up with Dr. Guelib",
      quickReplies: ["What symptoms to watch for?", "When to retest?", "Emergency signs"]
    }
  };

  const handleSendMessage = (text) => {
    if (text.trim() === '') return;

    // User message
    const newMessage = { 
      id: Date.now().toString(), 
      text: text, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, newMessage]);
    setUserInput('');

    // AI Response based on user input
    setTimeout(() => {
      let botResponse;
      const lowerText = text.toLowerCase();

      if (lowerText.includes('neutrop') || lowerText.includes('low white') || lowerText.includes('infection')) {
        botResponse = {
          id: Date.now().toString(),
          text: medicalAdvice.neutropenia.message,
          sender: 'bot',
          type: 'advice',
          title: medicalAdvice.neutropenia.title,
          quickReplies: medicalAdvice.neutropenia.quickReplies
        };
      } else if (lowerText.includes('food') || lowerText.includes('diet') || lowerText.includes('nutrition') || lowerText.includes('eat')) {
        botResponse = {
          id: Date.now().toString(),
          text: medicalAdvice.nutrition.message,
          sender: 'bot',
          type: 'advice',
          title: medicalAdvice.nutrition.title,
          quickReplies: medicalAdvice.nutrition.quickReplies
        };
      } else if (lowerText.includes('exercise') || lowerText.includes('sleep') || lowerText.includes('stress') || lowerText.includes('lifestyle')) {
        botResponse = {
          id: Date.now().toString(),
          text: medicalAdvice.lifestyle.message,
          sender: 'bot',
          type: 'advice',
          title: medicalAdvice.lifestyle.title,
          quickReplies: medicalAdvice.lifestyle.quickReplies
        };
      } else if (lowerText.includes('follow') || lowerText.includes('next') || lowerText.includes('doctor') || lowerText.includes('appointment')) {
        botResponse = {
          id: Date.now().toString(),
          text: medicalAdvice.followUp.message,
          sender: 'bot',
          type: 'advice',
          title: medicalAdvice.followUp.title,
          quickReplies: medicalAdvice.followUp.quickReplies
        };
      } else {
        botResponse = {
          id: Date.now().toString(),
          text: "I understand. Based on your blood test results, I can help you with:\n\n• Understanding your neutropenia\n• Nutrition recommendations\n• Lifestyle adjustments\n• Follow-up care planning\n\nWhat would you like to know more about?",
          sender: 'bot',
          type: 'general',
          quickReplies: ["Neutropenia explained", "Diet tips", "Exercise advice", "Next steps"]
        };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const renderQuickReplies = (replies) => (
    <View style={styles.quickRepliesContainer}>
      {replies.map((reply, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickReplyButton}
          onPress={() => handleQuickReply(reply)}
        >
          <Text style={styles.quickReplyText}>{reply}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={item.sender === 'bot' ? styles.botMessageContainer : styles.userMessageContainer}>
      {item.sender === 'bot' && item.title && (
        <Text style={styles.adviceTitle}>{item.title}</Text>
      )}
      <View style={item.sender === 'bot' ? styles.botMessage : styles.userMessage}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
      {item.sender === 'bot' && item.quickReplies && (
        renderQuickReplies(item.quickReplies)
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Assistant</Text>
        <Text style={styles.headerSubtitle}>Analyzing your blood test results</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Ask about your blood test results..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity 
          onPress={() => handleSendMessage(userInput)} 
          style={styles.sendButton}
          disabled={!userInput.trim()}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  botMessageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D8F95',
    marginBottom: 8,
    marginLeft: 8,
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginLeft: 8,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#2D8F95',
    borderRadius: 18,
    padding: 16,
    marginRight: 8,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1E293B',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginLeft: 8,
  },
  quickReplyButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickReplyText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2D8F95',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VirtualTherapist;