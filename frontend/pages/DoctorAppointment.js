import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight, faClock, faMapMarkerAlt, faUserMd } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');

const DoctorAppointment = ({ route }) => {
  const [selectedDate, setSelectedDate] = useState(route.params?.selectedDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Sample appointments data
  const appointments = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      speciality: 'Cardiologist',
      time: '10:00 AM',
      duration: '30 mins',
      location: 'Medical Center A',
      status: 'confirmed',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      speciality: 'Dermatologist',
      time: '2:30 PM',
      duration: '45 mins',
      location: 'Skin Care Clinic',
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Rodriguez',
      speciality: 'Pediatrician',
      time: '4:00 PM',
      duration: '30 mins',
      location: 'Children\'s Hospital',
      status: 'confirmed',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    }
  ];

  // Generate marked dates with appointments
  const generateMarkedDates = () => {
    const marked = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Mark today
    marked[today] = {
      selected: true,
      selectedColor: '#2D8F95',
      selectedTextColor: '#FFFFFF'
    };

    // Mark appointment dates
    appointments.forEach(appointment => {
      marked[appointment.date] = {
        marked: true,
        dotColor: appointment.status === 'confirmed' ? '#10B981' : '#F59E0B',
        selected: appointment.date === today,
        selectedColor: '#2D8F95',
      };
    });

    return marked;
  };

  const markedDates = generateMarkedDates();

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appt => appt.date === date);
  };

  const AppointmentCard = ({ appointment }) => (
    <Animated.View 
      style={[
        styles.appointmentCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorIcon}>
            <FontAwesomeIcon icon={faUserMd} size={16} color="#2D8F95" />
          </View>
          <View>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.doctorSpeciality}>{appointment.speciality}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: appointment.status === 'confirmed' ? '#10B981' : '#F59E0B' }
        ]}>
          <Text style={styles.statusText}>
            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <FontAwesomeIcon icon={faClock} size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            {appointment.time} • {appointment.duration}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesomeIcon icon={faMapMarkerAlt} size={14} color="#6B7280" />
          <Text style={styles.detailText}>{appointment.location}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.emptyIcon}>
        <FontAwesomeIcon icon={faCalendarAlt} size={48} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>No Appointments</Text>
      <Text style={styles.emptySubtitle}>
        You don't have any appointments scheduled for this date.
      </Text>
      <TouchableOpacity style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>Manage your medical schedule</Text>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <Animated.View 
          style={[
            styles.calendarSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            current={selectedDate.toISOString().split('T')[0]}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            style={styles.calendar}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#2D8F95',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2D8F95',
              dayTextColor: '#1F2937',
              textDisabledColor: '#D1D5DB',
              dotColor: '#2D8F95',
              selectedDotColor: '#ffffff',
              arrowColor: '#2D8F95',
              monthTextColor: '#1F2937',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(new Date(day.dateString));
            }}
            onMonthChange={(month) => {
              setCurrentMonth(new Date(month.dateString));
            }}
          />
        </Animated.View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Appointments for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.appointmentCount}>
              {getAppointmentsForDate(selectedDate.toISOString().split('T')[0]).length}
            </Text>
          </View>

          {getAppointmentsForDate(selectedDate.toISOString().split('T')[0]).length > 0 ? (
            <View style={styles.appointmentsList}>
              {getAppointmentsForDate(selectedDate.toISOString().split('T')[0]).map((appointment, index) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {appointments.filter(a => a.status === 'confirmed').length}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {appointments.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {appointments.filter(a => new Date(a.date) >= new Date()).length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  headerContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 24,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  calendarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D8F95',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentsList: {
    gap: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  appointmentDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2D8F95',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2D8F95',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#2D8F95',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2D8F95',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2D8F95',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default DoctorAppointment;