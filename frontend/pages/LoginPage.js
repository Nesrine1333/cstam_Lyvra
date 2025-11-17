import React, { useContext, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faEnvelope, 
  faLock,
  faUser,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { AccountCheck } from '../components/accountCheck';
import { buttonGreen, greenText, ieee, logoImage } from '../constants/constants';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage({ navigation }) {
  const [obscureText, setObscureText] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  const toggleObscureText = () => {
    setObscureText(!obscureText);
  };

  const ToRegisterPress = () => {
    navigation.push("Register");
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password reset feature coming soon!");
  };

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, navigation);
    } catch (error) {
      Alert.alert("Login Failed", "Please check your credentials and try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={loginStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={loginStyles.header}>
          <TouchableOpacity 
            style={loginStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={loginStyles.headerTitle}>Welcome Back</Text>
          <View style={loginStyles.headerSpacer} />
        </View>

        {/* Logo Section */}
        <View style={loginStyles.logoSection}>
          <Image source={logoImage} style={loginStyles.logo} />
      
        </View>

        {/* Login Form */}
        <View style={loginStyles.formContainer}>
          {/* Email Input */}
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.inputLabel}>Email Address</Text>
            <View style={loginStyles.inputContainer}>
              <FontAwesomeIcon 
                icon={faEnvelope} 
                size={18} 
                color="#6B7280" 
                style={loginStyles.inputIcon}
              />
              <TextInput
                style={loginStyles.textInput}
                onChangeText={setEmail}
                value={email}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.inputLabel}>Password</Text>
            <View style={loginStyles.inputContainer}>
              <FontAwesomeIcon 
                icon={faLock} 
                size={18} 
                color="#6B7280" 
                style={loginStyles.inputIcon}
              />
              <TextInput
                style={loginStyles.textInput}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={obscureText}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={toggleObscureText}
                style={loginStyles.eyeIcon}
              >
                <FontAwesomeIcon
                  icon={obscureText ? faEye : faEyeSlash}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity 
            style={loginStyles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[
              loginStyles.loginButton,
              isLoading && loginStyles.loginButtonDisabled
            ]}
            onPress={handleLoginPress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={loginStyles.loginButtonText}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={loginStyles.dividerContainer}>
            <View style={loginStyles.divider} />
            <Text style={loginStyles.dividerText}>or continue with</Text>
            <View style={loginStyles.divider} />
          </View>

          {/* Social Login Options */}
          <View style={loginStyles.socialContainer}>
            <TouchableOpacity style={loginStyles.socialButton}>
              <FontAwesomeIcon icon={faUser} size={20} color="#6B7280" />
              <Text style={loginStyles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            

          </View>
        </View>

        {/* Sign Up Link */}
        <View style={loginStyles.footer}>
          <AccountCheck 
            text={"Don't have an account?"} 
            text2={"Sign Up"} 
            fun={ToRegisterPress} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const loginStyles = {
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: RFValue(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RFValue(24),
    paddingTop: RFValue(60),
    paddingBottom: RFValue(20),
  },
  backButton: {
    padding: RFValue(8),
    width: RFValue(40),
    height: RFValue(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#6B7280',
  },
  headerSpacer: {
    width: RFValue(40),
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: RFValue(24),
    marginBottom: RFValue(0),
  },
  logo: {
    width: RFValue(300),
    height: RFValue(200),
    resizeMode: 'cover',
    marginBottom: RFValue(0),
  },
  welcomeText: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: RFValue(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: RFValue(16),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: RFValue(22),
  },
  formContainer: {
    paddingHorizontal: RFValue(24),
    marginBottom: RFValue(20),
  },
  inputGroup: {
    marginBottom: RFValue(20),
  },
  inputLabel: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: RFValue(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(12),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  inputIcon: {
    marginRight: RFValue(12),
  },
  textInput: {
    flex: 1,
    fontSize: RFValue(16),
    color: '#1F2937',
    padding: 0,
  },
  eyeIcon: {
    padding: RFValue(4),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: RFValue(24),
  },
  forgotPasswordText: {
    fontSize: RFValue(14),
    color: '#2D8F95',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2D8F95',
    borderRadius: RFValue(12),
    paddingVertical: RFValue(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: RFValue(24),
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RFValue(24),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: RFValue(14),
    color: '#6B7280',
    marginHorizontal: RFValue(12),
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: RFValue(22),
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(12),
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: RFValue(8),
  },
  socialButtonText: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    paddingHorizontal: RFValue(24),
  },
};