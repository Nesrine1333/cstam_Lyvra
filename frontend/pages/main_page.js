import React, { useState, useRef, useEffect } from 'react';
import { 
  Image, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated,
  Dimensions
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { green, mainGreen, sleep, strezs } from '../constants/constants';
import { 
  faFireFlameCurved, 
  faHeartbeat, 
  faHeartCirclePlus, 
  faDroplet,
  faTrendUp
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const { width } = Dimensions.get('window');

const MyGridComponent = () => {
  const [visible, setVisible] = useState(false);
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
            <Text style={styles.greetingText}>Health Dashboard 📊</Text>
            <Text style={styles.subGreeting}>Visualize your health metrics</Text>
          </Animated.View>

          {/* Health Practices Banner */}
          <Animated.View 
            style={[
              styles.healthBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Health Analytics</Text>
                <Text style={styles.bannerDescription}>
                  Interactive charts and diagrams for better health insights
                </Text>
                <TouchableOpacity style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>View Analytics</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={require('../assets/Mask_group.png')}
                style={styles.bannerImage}
              />
            </View>
          </Animated.View>

          {/* Vital Signs Diagrams */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vital Signs Dashboard</Text>
            <View style={styles.vitalsGrid}>
              <HeartBeatDiagram />
              <CaloriesDiagram />
              <SPO2Diagram />
              <PressureDiagram />
            </View>
          </View>

          {/* Health Tracking Charts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Trends</Text>
            <View style={styles.trackingGrid}>
              <SleepChart />
              <StressChart />
            </View>
          </View>

          {/* Weekly Progress */}
          <Animated.View 
            style={[
              styles.progressSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Weekly Progress</Text>
            <WeeklyActivityChart />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// Heart Rate Circular Gauge using CSS-based visualization
const HeartBeatDiagram = () => {
  const [currentBPM, setCurrentBPM] = useState(72);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const progress = (currentBPM / 200) * 100;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.diagramCard, styles.heartCard]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.diagramHeader}>
          <View style={styles.diagramTitleContainer}>
            <FontAwesomeIcon icon={faHeartbeat} color="#DC2626" size={RFValue(14)} />
            <Text style={styles.diagramTitle} numberOfLines={1}>Heart Rate</Text>
          </View>
          <View style={styles.trendBadge}>
            <FontAwesomeIcon icon={faTrendUp} size={10} color="#10B981" />
          </View>
        </View>
        
        <View style={styles.gaugeContainer}>
          <View style={styles.circularGauge}>
            <View style={styles.gaugeBackground} />
            <View 
              style={[
                styles.gaugeProgress,
                { 
                  transform: [{ rotate: `${-90 + (progress * 180 / 100)}deg` }],
                  backgroundColor: '#DC2626'
                }
              ]} 
            />
            <View style={styles.gaugeCenter}>
              <Text style={styles.gaugeValue}>{currentBPM}</Text>
              <Text style={styles.gaugeUnit}>bpm</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.diagramFooter}>
          <Text style={styles.statusText}>Normal Rhythm</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Calories Burn Bar Chart using View-based bars
const CaloriesDiagram = () => {
  const calorieData = [2200, 2100, 2300, 2150, 2400, 2350, 2240];
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxCalories = Math.max(...calorieData);

  return (
    <TouchableOpacity style={[styles.diagramCard, styles.caloriesCard]} activeOpacity={0.9}>
      <View style={styles.diagramHeader}>
        <View style={styles.diagramTitleContainer}>
          <FontAwesomeIcon icon={faFireFlameCurved} color="#F59E0B" size={RFValue(14)} />
          <Text style={styles.diagramTitle} numberOfLines={1}>Calories</Text>
        </View>
        <Text style={styles.currentValue} numberOfLines={1}>2,240</Text>
      </View>
      
      <View style={styles.barChartContainer}>
        <View style={styles.barChart}>
          {calorieData.map((calories, index) => {
            const barHeight = (calories / maxCalories) * 40;
            return (
              <View key={index} style={styles.barColumn}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: barHeight,
                      backgroundColor: index === 6 ? "#F59E0B" : "#FDBA74"
                    }
                  ]} 
                />
                <Text style={styles.barLabel}>{days[index]}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={styles.diagramFooter}>
        <Text style={styles.trendText} numberOfLines={1}>+5% from yesterday</Text>
      </View>
    </TouchableOpacity>
  );
};

// SPO2 Level Meter using View-based visualization
const SPO2Diagram = () => {
  return (
    <TouchableOpacity style={[styles.diagramCard, styles.spo2Card]} activeOpacity={0.9}>
      <View style={styles.diagramHeader}>
        <View style={styles.diagramTitleContainer}>
          <FontAwesomeIcon icon={faDroplet} color="#3B82F6" size={RFValue(14)} />
          <Text style={styles.diagramTitle} numberOfLines={1}>SPO2</Text>
        </View>
        <Text style={styles.currentValue} numberOfLines={1}>98%</Text>
      </View>
      
      <View style={styles.meterContainer}>
        <View style={styles.meter}>
          <View style={styles.meterTrack} />
          <View style={[styles.meterFill, { width: '98%' }]} />
          <View style={styles.meterNeedle} />
        </View>
        <View style={styles.meterLabels}>
          <Text style={styles.meterLabel}>80%</Text>
          <Text style={styles.meterLabel}>100%</Text>
        </View>
      </View>
      
      <View style={styles.diagramFooter}>
        <Text style={styles.statusText} numberOfLines={1}>Excellent</Text>
      </View>
    </TouchableOpacity>
  );
};

// Blood Pressure using simple progress bars
const PressureDiagram = () => {
  return (
    <TouchableOpacity style={[styles.diagramCard, styles.pressureCard]} activeOpacity={0.9}>
      <View style={styles.diagramHeader}>
        <View style={styles.diagramTitleContainer}>
          <FontAwesomeIcon icon={faHeartCirclePlus} color="#8B4513" size={RFValue(14)} />
          <Text style={styles.diagramTitle} numberOfLines={1}>BP</Text>
        </View>
        <Text style={styles.currentValue} numberOfLines={1}>120/80</Text>
      </View>
      
      <View style={styles.pressureContainer}>
        <View style={styles.pressureRow}>
          <Text style={styles.pressureLabel}>SYS</Text>
          <View style={styles.pressureBarContainer}>
            <View style={[styles.pressureBar, { width: '60%', backgroundColor: '#DC2626' }]} />
          </View>
          <Text style={styles.pressureValue}>120</Text>
        </View>
        <View style={styles.pressureRow}>
          <Text style={styles.pressureLabel}>DIA</Text>
          <View style={styles.pressureBarContainer}>
            <View style={[styles.pressureBar, { width: '40%', backgroundColor: '#3B82F6' }]} />
          </View>
          <Text style={styles.pressureValue}>80</Text>
        </View>
      </View>
      
      <View style={styles.diagramFooter}>
        <Text style={styles.statusText} numberOfLines={1}>Normal</Text>
      </View>
    </TouchableOpacity>
  );
};

// Sleep Quality Chart using simple bars
const SleepChart = () => {
  return (
    <TouchableOpacity style={[styles.chartCard, styles.sleepCard]} activeOpacity={0.9}>
      <View style={styles.chartHeader}>
        <Image source={sleep} style={styles.chartIcon} />
        <Text style={styles.chartTitle} numberOfLines={1}>Sleep</Text>
      </View>
      
      <View style={styles.sleepBars}>
        {[6, 7, 8, 7.5, 6.5, 8, 7.2].map((hours, index) => (
          <View key={index} style={styles.sleepBarContainer}>
            <View 
              style={[
                styles.sleepBar,
                { height: (hours / 10) * 40 }
              ]} 
            />
            <Text style={styles.sleepDay}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.chartFooter}>
        <Text style={styles.chartValue} numberOfLines={1}>7.2h</Text>
        <Text style={styles.chartSubtitle} numberOfLines={1}>85% Quality</Text>
      </View>
    </TouchableOpacity>
  );
};

// Stress Level using simple indicator
const StressChart = () => {
  return (
    <TouchableOpacity style={[styles.chartCard, styles.stressCard]} activeOpacity={0.9}>
      <View style={styles.chartHeader}>
        <Image source={strezs} style={styles.chartIcon} />
        <Text style={styles.chartTitle} numberOfLines={1}>Stress</Text>
      </View>
      
      <View style={styles.stressIndicator}>
        <View style={styles.stressWave} />
        <View style={[styles.stressWave, styles.stressWaveSecondary]} />
      </View>
      
      <View style={styles.chartFooter}>
        <Text style={styles.chartValue} numberOfLines={1}>Normal</Text>
        <Text style={styles.chartSubtitle} numberOfLines={1}>Stable</Text>
      </View>
    </TouchableOpacity>
  );
};

// Weekly Activity Progress
const WeeklyActivityChart = () => {
  const activityData = [85, 90, 78, 95, 88, 92, 87];
  
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle} numberOfLines={1}>Weekly Progress</Text>
        <Text style={styles.progressAverage} numberOfLines={1}>87% avg</Text>
      </View>
      
      <View style={styles.progressBars}>
        {activityData.map((percentage, index) => (
          <View key={index} style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { height: `${percentage}%`, backgroundColor: percentage > 85 ? '#10B981' : '#F59E0B' }
                ]} 
              />
            </View>
            <Text style={styles.progressDay}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</Text>
          </View>
        ))}
      </View>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: RFValue(30),
  },
  header: {
    paddingHorizontal: RFValue(24),
    paddingTop: RFValue(20),
    paddingBottom: RFValue(16),
  },
  greetingText: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: RFValue(4),
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: RFValue(16),
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  healthBanner: {
    marginHorizontal: RFValue(20),
    marginBottom: RFValue(24),
  },
  bannerContent: {
    backgroundColor: '#2D8F95',
    borderRadius: RFValue(20),
    padding: RFValue(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: RFValue(10),
  },
  bannerTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: RFValue(8),
  },
  bannerDescription: {
    fontSize: RFValue(13),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: RFValue(16),
    lineHeight: RFValue(18),
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(8),
    borderRadius: RFValue(12),
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#2D8F95',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  bannerImage: {
    width: RFValue(80),
    height: RFValue(60),
    resizeMode: 'contain',
  },
  section: {
    marginBottom: RFValue(24),
    paddingHorizontal: RFValue(20),
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: RFValue(16),
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: RFValue(12),
    justifyContent: 'space-between',
  },
  diagramCard: {
    width: (width - RFValue(60)) / 2, // Reduced width to account for padding
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(16),
    padding: RFValue(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: RFValue(160),
  },
  heartCard: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#DC2626',
  },
  caloriesCard: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#F59E0B',
  },
  spo2Card: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#3B82F6',
  },
  pressureCard: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#8B4513',
  },
  diagramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: RFValue(10),
    minHeight: RFValue(20),
  },
  diagramTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RFValue(4),
    flex: 1,
    marginRight: RFValue(4),
  },
  diagramTitle: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1,
  },
  currentValue: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },
  trendBadge: {
    width: RFValue(18),
    height: RFValue(18),
    borderRadius: RFValue(9),
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: RFValue(6),
    justifyContent: 'center',
    flex: 1,
  },
  circularGauge: {
    width: RFValue(70),
    height: RFValue(70),
    borderRadius: RFValue(35),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RFValue(35),
    backgroundColor: '#E5E7EB',
  },
  gaugeProgress: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: RFValue(35),
  },
  gaugeCenter: {
    width: RFValue(52),
    height: RFValue(52),
    borderRadius: RFValue(26),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#1F2937',
  },
  gaugeUnit: {
    fontSize: RFValue(9),
    color: '#6B7280',
  },
  barChartContainer: {
    alignItems: 'center',
    marginVertical: RFValue(6),
    flex: 1,
    justifyContent: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: RFValue(40),
    gap: RFValue(4),
    justifyContent: 'center',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: RFValue(6),
    borderRadius: RFValue(3),
    marginBottom: RFValue(2),
    minHeight: RFValue(4),
  },
  barLabel: {
    fontSize: RFValue(8),
    color: '#6B7280',
  },
  meterContainer: {
    alignItems: 'center',
    marginVertical: RFValue(6),
    flex: 1,
    justifyContent: 'center',
  },
  meter: {
    width: '90%',
    height: RFValue(16),
    backgroundColor: '#F3F4F6',
    borderRadius: RFValue(8),
    position: 'relative',
    overflow: 'hidden',
  },
  meterTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: RFValue(8),
  },
  meterFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: RFValue(8),
  },
  meterNeedle: {
    position: 'absolute',
    right: '2%',
    top: '25%',
    width: RFValue(2),
    height: RFValue(8),
    backgroundColor: '#1F2937',
    borderRadius: RFValue(1),
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: RFValue(2),
  },
  meterLabel: {
    fontSize: RFValue(8),
    color: '#6B7280',
  },
  pressureContainer: {
    marginVertical: RFValue(6),
    flex: 1,
    justifyContent: 'center',
  },
  pressureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RFValue(6),
  },
  pressureLabel: {
    fontSize: RFValue(10),
    color: '#6B7280',
    width: RFValue(25),
  },
  pressureBarContainer: {
    flex: 1,
    height: RFValue(6),
    backgroundColor: '#F3F4F6',
    borderRadius: RFValue(3),
    marginHorizontal: RFValue(6),
    overflow: 'hidden',
  },
  pressureBar: {
    height: '100%',
    borderRadius: RFValue(3),
  },
  pressureValue: {
    fontSize: RFValue(10),
    fontWeight: '600',
    color: '#1F2937',
    width: RFValue(20),
    textAlign: 'right',
  },
  diagramFooter: {
    marginTop: RFValue(4),
  },
  statusText: {
    fontSize: RFValue(10),
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  trendText: {
    fontSize: RFValue(10),
    color: '#6B7280',
    textAlign: 'center',
  },
  trackingGrid: {
    flexDirection: 'row',
    gap: RFValue(12),
    justifyContent: 'space-between',
  },
  chartCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(16),
    padding: RFValue(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: RFValue(140),
  },
  sleepCard: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#A78BFA',
  },
  stressCard: {
    borderLeftWidth: RFValue(4),
    borderLeftColor: '#10B981',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RFValue(6),
    marginBottom: RFValue(10),
    minHeight: RFValue(20),
  },
  chartIcon: {
    width: RFValue(20),
    height: RFValue(20),
    resizeMode: 'contain',
  },
  chartTitle: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1,
  },
  sleepBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: RFValue(40),
    gap: RFValue(6),
    marginVertical: RFValue(6),
    justifyContent: 'center',
    flex: 1,
  },
  sleepBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  sleepBar: {
    width: RFValue(8),
    backgroundColor: '#A78BFA',
    borderRadius: RFValue(4),
    marginBottom: RFValue(2),
    minHeight: RFValue(4),
  },
  sleepDay: {
    fontSize: RFValue(8),
    color: '#6B7280',
  },
  stressIndicator: {
    alignItems: 'center',
    marginVertical: RFValue(6),
    height: RFValue(30),
    justifyContent: 'center',
    flex: 1,
  },
  stressWave: {
    width: '70%',
    height: RFValue(3),
    backgroundColor: '#10B981',
    borderRadius: RFValue(2),
    marginBottom: RFValue(1),
  },
  stressWaveSecondary: {
    backgroundColor: '#86EFAC',
    width: '50%',
  },
  chartFooter: {
    marginTop: RFValue(4),
  },
  chartValue: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: RFValue(10),
    color: '#6B7280',
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: RFValue(20),
    marginBottom: RFValue(24),
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(16),
    padding: RFValue(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(12),
  },
  progressTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: RFValue(8),
  },
  progressAverage: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#2D8F95',
    flexShrink: 0,
  },
  progressBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: RFValue(60),
  },
  progressBarContainer: {
    alignItems: 'center',
    width: `${100/7}%`,
    height: '100%',
  },
  progressBarBackground: {
    width: '70%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: RFValue(6),
    overflow: 'hidden',
    marginBottom: RFValue(2),
    justifyContent: 'flex-end',
  },
  progressBarFill: {
    borderRadius: RFValue(6),
  },
  progressDay: {
    fontSize: RFValue(10),
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default MyGridComponent;