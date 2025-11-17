import React, { useState } from "react";
import { 
  Pressable, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View,
  StyleSheet
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { 
  faArrowLeft,
  faArrowRight,
  faUser,
  faBell,
  faGlobe,
  faTextHeight,
  faQuestionCircle,
  faInfoCircle,
  faStar,
  faShare,
  faSignOutAlt,
  faHeart,
  faFileMedical,
  faMoon,
  faSun,
  faCalendarAlt,
  faPills,
  faStethoscope,
  faShieldAlt,
  faLock,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import ThemeSwitcher from "../components/buttonWithSwitcher";

export const SettingsPage = ({ navigation }) => {
    const [isDarkMode, setDarkMode] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
      pushNotifications: true,
      emailNotifications: false,
      medicationReminders: true,
      appointmentReminders: true,
      healthAlerts: true,
      doctorMessages: true,
      weeklyReports: false,
      soundEnabled: true,
      vibrationEnabled: true
    });

    const toggleNotification = (key) => {
      setNotificationSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const toggleDarkMode = () => setDarkMode(!isDarkMode);

    const handleBack = () => navigation?.goBack();
    const handleLogout = () => console.log("Logout pressed");

    // Settings sections data
    const settingsSections = [
      {
        title: "Personal",
        items: [
          {
            icon: faUser,
            title: "Profile Information",
            value: "Edit",
            onPress: () => console.log("Edit Profile"),
            type: "navigation"
          },
          {
            icon: faShieldAlt,
            title: "Security",
            onPress: () => console.log("Security"),
            type: "navigation"
          },
          {
            icon: faLock,
            title: "Privacy",
            onPress: () => console.log("Privacy"),
            type: "navigation"
          }
        ]
      },
      {
        title: "Notifications",
        items: [
          {
            icon: faBell,
            title: "Push Notifications",
            subtitle: "General app notifications",
            type: "switch",
            value: notificationSettings.pushNotifications,
            onToggle: () => toggleNotification('pushNotifications')
          },
          {
            icon: faEnvelope,
            title: "Email Notifications",
            subtitle: "Receive updates via email",
            type: "switch",
            value: notificationSettings.emailNotifications,
            onToggle: () => toggleNotification('emailNotifications')
          },
          {
            icon: faPills,
            title: "Medication Reminders",
            subtitle: "Daily medication alerts",
            type: "switch",
            value: notificationSettings.medicationReminders,
            onToggle: () => toggleNotification('medicationReminders')
          },
          {
            icon: faCalendarAlt,
            title: "Appointment Reminders",
            subtitle: "Doctor visits and schedules",
            type: "switch",
            value: notificationSettings.appointmentReminders,
            onToggle: () => toggleNotification('appointmentReminders')
          },
          {
            icon: faHeart,
            title: "Health Alerts",
            subtitle: "Important health updates",
            type: "switch",
            value: notificationSettings.healthAlerts,
            onToggle: () => toggleNotification('healthAlerts')
          },
          {
            icon: faStethoscope,
            title: "Doctor Messages",
            subtitle: "Messages from healthcare providers",
            type: "switch",
            value: notificationSettings.doctorMessages,
            onToggle: () => toggleNotification('doctorMessages')
          },
          {
            icon: faFileMedical,
            title: "Weekly Reports",
            subtitle: "Weekly health summary",
            type: "switch",
            value: notificationSettings.weeklyReports,
            onToggle: () => toggleNotification('weeklyReports')
          },
          {
            icon: faBell,
            title: "Sound",
            subtitle: "Play sound for notifications",
            type: "switch",
            value: notificationSettings.soundEnabled,
            onToggle: () => toggleNotification('soundEnabled')
          },
          {
            icon: faBell,
            title: "Vibration",
            subtitle: "Vibrate for notifications",
            type: "switch",
            value: notificationSettings.vibrationEnabled,
            onToggle: () => toggleNotification('vibrationEnabled')
          }
        ]
      },
      {
        title: "Appearance",
        items: [
          {
            icon: isDarkMode ? faMoon : faSun,
            title: "Dark Mode",
            type: "switch",
            value: isDarkMode,
            onToggle: toggleDarkMode
          },
          {
            icon: faTextHeight,
            title: "Text Size",
            value: "Medium",
            onPress: () => console.log("Text Size"),
            type: "navigation"
          },
          {
            icon: faGlobe,
            title: "Language",
            value: "English",
            onPress: () => console.log("Change Language"),
            type: "navigation"
          }
        ]
      },
      {
        title: "Support",
        items: [
          {
            icon: faQuestionCircle,
            title: "Help & Support",
            onPress: () => console.log("Help & Support"),
            type: "navigation"
          },
          {
            icon: faInfoCircle,
            title: "About",
            onPress: () => console.log("About"),
            type: "navigation"
          },
          {
            icon: faStar,
            title: "Rate App",
            onPress: () => console.log("Rate App"),
            type: "navigation"
          },
          {
            icon: faShare,
            title: "Share App",
            onPress: () => console.log("Share App"),
            type: "navigation"
          }
        ]
      }
    ];

    const SettingSection = ({ title, children }) => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionContent}>
          {children}
        </View>
      </View>
    );

    const SettingItem = ({ item, isLast = false }) => {
      const { icon, title, subtitle, value, onPress, type, onToggle } = item;

      if (type === "switch") {
        return (
          <View style={[
            styles.settingItem,
            isLast && styles.settingItemLast
          ]}>
            <View style={styles.settingLeft}>
              <FontAwesomeIcon 
                icon={icon} 
                size={RFValue(16)} 
                color="#10409f" 
                style={styles.settingIcon} 
              />
               <View style={styles.textContainer}>
                <Text style={styles.settingText}>{title}</Text>
                {subtitle && (
                  <Text style={styles.settingSubtitle}>{subtitle}</Text>
                )}
              </View>
            </View>
           
            <ThemeSwitcher 
              text={""} 
              fun={onToggle} 
              Mode={value} 
            />
          </View>
        );
      }

      return (
        <TouchableOpacity 
          style={[
            styles.settingItem,
            isLast && styles.settingItemLast
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <FontAwesomeIcon 
              icon={icon} 
              size={RFValue(16)} 
              color="#6B7280" 
              style={styles.settingIcon} 
            />
            <View style={styles.textContainer}>
              <Text style={styles.settingText}>{title}</Text>
              {subtitle && (
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
              )}
            </View>
          </View>
          <View style={styles.settingRight}>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <FontAwesomeIcon 
              icon={faArrowRight} 
              size={RFValue(12)} 
              color="#9CA3AF" 
            />
          </View>
        </TouchableOpacity>
      );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
              {/* Header */}
              <View style={styles.header}>
                <Pressable 
                  style={styles.backButton} 
                  onPress={handleBack}
                  hitSlop={8}
                >
                  <FontAwesomeIcon 
                    icon={faArrowLeft} 
                    size={RFValue(20)} 
                    color="#37341f" 
                  />
                </Pressable>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.headerSpacer} />
              </View>

              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Render all settings sections */}
                {settingsSections.map((section, sectionIndex) => (
                  <SettingSection key={section.title} title={section.title}>
                    {section.items.map((item, itemIndex) => (
                      <SettingItem
                        key={item.title}
                        item={item}
                        isLast={itemIndex === section.items.length - 1}
                      />
                    ))}
                  </SettingSection>
                ))}

                {/* App Version */}
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>HealthCare App v1.0.0</Text>
                  <Text style={styles.buildText}>Build 123</Text>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <FontAwesomeIcon 
                    icon={faSignOutAlt} 
                    size={RFValue(16)} 
                    color="#DC2626" 
                    style={styles.logoutIcon} 
                  />
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RFValue(20),
    paddingTop: RFValue(15),
    paddingBottom: RFValue(12),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: RFValue(20),
    borderBottomRightRadius: RFValue(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: RFValue(6),
    width: RFValue(36),
    height: RFValue(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSpacer: {
    width: RFValue(36),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: RFValue(16),
    paddingBottom: RFValue(20),
    paddingHorizontal: RFValue(16),
  },
  section: {
    marginBottom: RFValue(16),
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#374151',
    marginBottom: RFValue(8),
    paddingHorizontal: RFValue(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: RFValue(10), // Reduced from 12
    paddingHorizontal: RFValue(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: RFValue(48), // Reduced from 52
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: RFValue(12),
    width: RFValue(16),
  },
  textContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: RFValue(1), // Reduced from 2
  },
  settingSubtitle: {
    fontSize: RFValue(11),
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: RFValue(13), // Reduced from 14
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RFValue(8),
  },
  settingValue: {
    fontSize: RFValue(12),
    color: '#6B7280',
    fontWeight: '400',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: RFValue(4),
    marginBottom: RFValue(16),
    padding: RFValue(12),
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  versionText: {
    fontSize: RFValue(12),
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: RFValue(2),
  },
  buildText: {
    fontSize: RFValue(10),
    color: '#9CA3AF',
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(8),
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutIcon: {
    marginRight: RFValue(8),
  },
  logoutText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default SettingsPage;