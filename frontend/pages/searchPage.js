import { Image, ScrollView, Text, TouchableOpacity, View, Animated } from "react-native"
import { RFValue } from "react-native-responsive-fontsize"
import SearchInput from "../components/searchContainer"
import { greenText } from "../constants/constants"
import { styles } from "./medecine_page"
import { useState, useRef, useEffect } from "react"

export const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [doctors, setDoctors] = useState([
        { id: 1, name: "Dr. Sarah Johnson", speciality: "Cardiologist", rating: 4.8, experience: "12 years", image: null },
        { id: 2, name: "Dr. Michael Chen", speciality: "Dermatologist", rating: 4.9, experience: "8 years", image: null },
        { id: 3, name: "Dr. Emily Rodriguez", speciality: "Pediatrician", rating: 4.7, experience: "10 years", image: null },
        { id: 4, name: "Dr. James Wilson", speciality: "Neurologist", rating: 4.8, experience: "15 years", image: null },
    ])

    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start()
    }, [])

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <View style={containerStyles.pageContainer}>
            <Animated.View style={[containerStyles.header, { opacity: fadeAnim }]}>
                <View style={containerStyles.headerContent}>
                    <Text style={containerStyles.greeting}>Find Your Doctor</Text>
                    <Text style={containerStyles.subtitle}>Book appointments with trusted specialists</Text>
                </View>
                <View style={containerStyles.searchContainer}>
                    <SearchInput 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search doctors, specialties..."
                    />
                </View>
            </Animated.View>

            <ScrollView 
                style={containerStyles.scrollView}
                contentContainerStyle={containerStyles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={containerStyles.sectionHeader}>
                    <Text style={containerStyles.sectionTitle}>
                        {searchQuery ? `Search Results (${filteredDoctors.length})` : "Recommended Doctors"}
                    </Text>
                    {!searchQuery && (
                        <TouchableOpacity>
                            <Text style={containerStyles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                <View style={containerStyles.doctorsList}>
                    {filteredDoctors.map((doctor, index) => (
                        <DoctorProfil 
                            key={doctor.id}
                            doctor={doctor}
                            index={index}
                        />
                    ))}
                </View>

                {filteredDoctors.length === 0 && (
                    <View style={containerStyles.emptyState}>
                        <Image 
                            source={require('../assets/search-empty.png')} 
                            style={containerStyles.emptyIcon}
                        />
                        <Text style={containerStyles.emptyTitle}>No doctors found</Text>
                        <Text style={containerStyles.emptySubtitle}>
                            Try adjusting your search terms or browse all specialists
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const DoctorProfil = ({ doctor, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current
    const opacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            })
        ]).start()
    }, [])

    return (
        <Animated.View 
            style={[
                containerStyles.doctorCard,
                {
                    opacity: opacityAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <View style={containerStyles.doctorHeader}>
                <View style={containerStyles.avatarContainer}>
                    {doctor.image ? (
                        <Image source={doctor.image} style={containerStyles.avatar} />
                    ) : (
                        <View style={containerStyles.avatarPlaceholder}>
                            <Text style={containerStyles.avatarText}>
                                {doctor.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                        </View>
                    )}
                </View>
                
                <View style={containerStyles.doctorInfo}>
                    <Text style={containerStyles.doctorName}>{doctor.name}</Text>
                    <Text style={containerStyles.doctorSpeciality}>{doctor.speciality}</Text>
                    
                    <View style={containerStyles.ratingContainer}>
                        <Image 
                            source={require('../assets/star.png')} 
                            style={containerStyles.starIcon}
                        />
                        <Text style={containerStyles.ratingText}>{doctor.rating}</Text>
                        <Text style={containerStyles.experienceText}> • {doctor.experience}</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={containerStyles.moreButton}>
                    <Image 
                        source={require('../assets/more-vertical.png')} 
                        style={containerStyles.moreIcon}
                    />
                </TouchableOpacity>
            </View>
            
            <View style={containerStyles.actionsRow}>
                <TouchableOpacity 
                    style={containerStyles.primaryButton}
                    onPress={() => console.log('Book appointment:', doctor.id)}
                >
                    <Text style={containerStyles.primaryButtonText}>Book Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={containerStyles.secondaryButton}
                    onPress={() => console.log('View profile:', doctor.id)}
                >
                    <Text style={containerStyles.secondaryButtonText}>View Profile</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

const containerStyles = {
    pageContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: RFValue(60),
        paddingBottom: RFValue(20),
        paddingHorizontal: RFValue(20),
        borderBottomLeftRadius: RFValue(24),
        borderBottomRightRadius: RFValue(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    headerContent: {
        marginBottom: RFValue(20),
    },
    greeting: {
        fontSize: RFValue(28),
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: RFValue(4),
    },
    subtitle: {
        fontSize: RFValue(14),
        color: '#64748b',
        fontWeight: '400',
    },
    searchContainer: {
        marginTop: RFValue(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: RFValue(30),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: RFValue(20),
        marginTop: RFValue(25),
        marginBottom: RFValue(15),
    },
    sectionTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#1e293b',
    },
    seeAllText: {
        fontSize: RFValue(14),
        color: greenText,
        fontWeight: '500',
    },
    doctorsList: {
        paddingHorizontal: RFValue(20),
        gap: RFValue(16),
    },
    doctorCard: {
        backgroundColor: '#fff',
        borderRadius: RFValue(16),
        padding: RFValue(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    doctorHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: RFValue(16),
    },
    avatarContainer: {
        marginRight: RFValue(12),
    },
    avatarPlaceholder: {
        width: RFValue(50),
        height: RFValue(50),
        borderRadius: RFValue(12),
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#475569',
    },
    avatar: {
        width: RFValue(50),
        height: RFValue(50),
        borderRadius: RFValue(12),
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: RFValue(16),
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: RFValue(2),
    },
    doctorSpeciality: {
        fontSize: RFValue(14),
        color: greenText,
        fontWeight: '500',
        marginBottom: RFValue(6),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        width: RFValue(14),
        height: RFValue(14),
        marginRight: RFValue(4),
    },
    ratingText: {
        fontSize: RFValue(12),
        color: '#f59e0b',
        fontWeight: '500',
    },
    experienceText: {
        fontSize: RFValue(12),
        color: '#64748b',
    },
    moreButton: {
        padding: RFValue(4),
    },
    moreIcon: {
        width: RFValue(18),
        height: RFValue(18),
        tintColor: '#64748b',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: RFValue(12),
    },
    primaryButton: {
        flex: 1,
        backgroundColor: greenText,
        paddingVertical: RFValue(12),
        borderRadius: RFValue(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: RFValue(14),
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: greenText,
        paddingVertical: RFValue(12),
        borderRadius: RFValue(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: greenText,
        fontSize: RFValue(14),
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: RFValue(60),
        paddingHorizontal: RFValue(40),
    },
    emptyIcon: {
        width: RFValue(120),
        height: RFValue(120),
        marginBottom: RFValue(20),
        opacity: 0.6,
    },
    emptyTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#64748b',
        marginBottom: RFValue(8),
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: RFValue(14),
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: RFValue(20),
    },
}