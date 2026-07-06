import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EmergencyCameraModal from '../../components/EmergencyCameraModal';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const COLORS = {
  navy: '#0A1628',
  navyMid: '#1A2E4A',
  navyLight: '#243B55',
  red: '#C0392B',
  redDark: '#922B21',
  orange: '#E8590C',
  white: '#FFFFFF',
  offWhite: '#F0F2F5',
  textMuted: '#8A99B0',
  green: '#27AE60',
  border: '#E2E8F0',
  borderDark: '#243B55',
};

const ALERTS = [
  {
    id: '1',
    level: 'high',
    title: 'Fire Alert — Brgy. Lian Poblacion',
    time: '2 hours ago',
    icon: 'flame' as const,
    detail: 'A residential fire was reported near the public market. BFP units are on site. Avoid the area.',
  },
  {
    id: '2',
    level: 'advisory',
    title: 'Fire Prevention Advisory',
    time: 'Today, 08:00 AM',
    icon: 'warning' as const,
    detail: 'BFP Lian reminds residents to check LPG connections and electrical wiring before the dry season.',
  },
  {
    id: '3',
    level: 'info',
    title: 'BFP Community Drill — June 28',
    time: 'Yesterday',
    icon: 'information-circle' as const,
    detail: 'A community fire drill will be held at Lian Municipal Covered Court on June 28, 8:00 AM.',
  },
];

const NOTIFICATIONS = [
  {
    id: 'N1',
    icon: 'flame' as const,
    color: '#C0392B',
    title: 'Fire Alert — Brgy. Lian Poblacion',
    body: 'BFP units are responding. Avoid the area near the public market.',
    time: '2 hrs ago',
    unread: true,
  },
  {
    id: 'N2',
    icon: 'checkmark-circle' as const,
    color: '#27AE60',
    title: 'Report RPT-001 Resolved',
    body: 'Your fire report has been marked as resolved by BFP Lian.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'N3',
    icon: 'warning' as const,
    color: '#E8590C',
    title: 'Fire Prevention Advisory',
    body: 'Check your LPG connections and electrical wiring this dry season.',
    time: 'Today, 8:00 AM',
    unread: false,
  },
  {
    id: 'N4',
    icon: 'megaphone' as const,
    color: '#8E44AD',
    title: 'BFP Community Drill — June 28',
    body: 'Participate in the fire drill at Lian Municipal Covered Court.',
    time: '2 days ago',
    unread: false,
  },
];

const EMERGENCY_CONTACTS = [
  { id: '1', name: 'BFP Lian', number: '(043) 123-4567', icon: 'flame' as const },
  { id: '2', name: 'MDRRMO', number: '(043) 765-4321', icon: 'shield' as const },
  { id: '3', name: 'PNP Lian', number: '(043) 111-2222', icon: 'call' as const },
];

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const notifSlide = useRef(new Animated.Value(-400)).current;

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    const rippleLoop = Animated.loop(
      Animated.stagger(400, [
        Animated.sequence([
          Animated.timing(ripple1, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(ripple1, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ripple2, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(ripple2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    rippleLoop.start();
    return () => { pulse.stop(); rippleLoop.stop(); };
  }, []);

  const openNotif = () => {
    setNotifVisible(true);
    Animated.spring(notifSlide, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeNotif = () => {
    Animated.timing(notifSlide, {
      toValue: -400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setNotifVisible(false));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const rippleScale1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const rippleOpacity1 = ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
  const rippleScale2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const rippleOpacity2 = ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  const alertColor = (level: string) => {
    if (level === 'high') return COLORS.red;
    if (level === 'advisory') return COLORS.orange;
    return isDark ? '#4A90D9' : '#2563EB';
  };

  const alertBg = (level: string) => {
    if (isDark) {
      if (level === 'high') return '#2D1515';
      if (level === 'advisory') return '#2D1A0A';
      return '#0F1E35';
    }
    if (level === 'high') return '#FFF5F5';
    if (level === 'advisory') return '#FFF8F0';
    return '#F0F6FF';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View>
  <View style={styles.headerBrand}>
    <Ionicons name="flame" size={20} color={COLORS.orange} />
    <Text style={styles.headerAppName}>FireSight</Text>
  </View>
  <Text style={styles.headerTagline}>Lian, Batangas</Text>
</View>
        <View style={styles.headerActions}>
          {/* Dark/Light Toggle */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={openNotif}>
            <Ionicons name="notifications" size={22} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { backgroundColor: bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Card */}
        <View style={[styles.sosCard, { backgroundColor: isDark ? COLORS.redDark : COLORS.red }]}>
          <Text style={styles.sosLabel}>FIRE EMERGENCY?</Text>
          <Text style={styles.sosSubLabel}>
            Press the button below to report immediately.
          </Text>
          <View style={styles.btnArea}>
            <Animated.View
              style={[
                styles.ripple,
                { transform: [{ scale: rippleScale1 }], opacity: rippleOpacity1 },
              ]}
            />
            <Animated.View
              style={[
                styles.ripple,
                { transform: [{ scale: rippleScale2 }], opacity: rippleOpacity2 },
              ]}
            />
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.sosBtn}
                onPress={() => setReportModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="flame" size={42} color={COLORS.white} />
                <Text style={styles.sosBtnLabel}>PALTAN NA NGANI</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Text style={styles.sosHint}>
            Your location & profile will be attached automatically.
          </Text>
        </View>

        {/* Active Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Active Alerts</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: COLORS.orange }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {ALERTS.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, { backgroundColor: alertBg(alert.level), borderColor }]}
              activeOpacity={0.8}
            >
              <View style={[styles.alertIconWrap, { backgroundColor: alertColor(alert.level) + '22' }]}>
                <Ionicons name={alert.icon} size={20} color={alertColor(alert.level)} />
              </View>
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: textPrimary }]}>{alert.title}</Text>
                <Text style={[styles.alertTime, { color: textSec }]}>{alert.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={textSec} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Emergency Contacts</Text>
          <View style={styles.contactRow}>
            {EMERGENCY_CONTACTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.contactCard, { backgroundColor: card, borderColor }]}
                activeOpacity={0.8}
              >
                <View style={styles.contactIconWrap}>
                  <Ionicons name={c.icon} size={20} color={COLORS.red} />
                </View>
                <Text style={[styles.contactName, { color: textPrimary }]}>{c.name}</Text>
                <Text style={[styles.contactNumber, { color: COLORS.orange }]}>{c.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Recent Reports */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>My Recent Reports</Text>
          <View style={[styles.emptyCard, { backgroundColor: card, borderColor }]}>
            <Ionicons name="document-text-outline" size={36} color={textSec} />
            <Text style={[styles.emptyText, { color: textSec }]}>No reports submitted yet.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Notification Panel Modal */}
      <Modal visible={notifVisible} transparent animationType="none">
        <TouchableOpacity
          style={styles.notifOverlay}
          activeOpacity={1}
          onPress={closeNotif}
        />
        <Animated.View
          style={[
            styles.notifPanel,
            {
              backgroundColor: card,
              transform: [{ translateY: notifSlide }],
            },
          ]}
        >
          <SafeAreaView>
            {/* Panel Header */}
            <View style={[styles.notifPanelHeader, { borderBottomColor: borderColor }]}>
              <TouchableOpacity onPress={closeNotif} style={styles.notifCloseBtn}>
                <Ionicons name="close" size={22} color={textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.notifPanelTitle, { color: textPrimary }]}>
                Notifications
                {unreadCount > 0 && (
                  <Text style={{ color: COLORS.red }}> · {unreadCount} new</Text>
                )}
              </Text>
              <TouchableOpacity onPress={markAllRead}>
                <Text style={[styles.markAllRead, { color: COLORS.orange }]}>Mark all read</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {notifications.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={[
                    styles.notifItem,
                    {
                      backgroundColor: n.unread
                        ? isDark ? COLORS.navyLight : '#FFF8F5'
                        : 'transparent',
                      borderBottomColor: borderColor,
                    },
                  ]}
                  onPress={() => {
                    setNotifications((prev) =>
                      prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                    );
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.notifIconWrap, { backgroundColor: n.color + '20' }]}>
                    <Ionicons name={n.icon} size={20} color={n.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.notifItemHeader}>
                      <Text
                        style={[styles.notifItemTitle, { color: textPrimary }]}
                        numberOfLines={1}
                      >
                        {n.title}
                      </Text>
                      {n.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={[styles.notifItemBody, { color: textSec }]} numberOfLines={2}>
                      {n.body}
                    </Text>
                    <Text style={[styles.notifItemTime, { color: COLORS.textMuted }]}>
                      {n.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Modal>

      <EmergencyCameraModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  scroll: { paddingBottom: 20 },
  sosCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sosLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  sosSubLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  btnArea: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sosBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sosBtnLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  sosHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    textAlign: 'center',
  },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  alertTime: { fontSize: 12 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(192,57,43,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  contactName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  contactNumber: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 14 },
  notifOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  notifPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  notifPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifPanelTitle: { fontSize: 16, fontWeight: '700' },
  markAllRead: { fontSize: 12, fontWeight: '600' },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  notifItemTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    flexShrink: 0,
  },
  notifItemBody: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  notifItemTime: { fontSize: 11 },

  headerBrand: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7,
},
headerAppName: {
  color: COLORS.white,
  fontSize: 22,
  fontWeight: '900',
  letterSpacing: -0.3,
},
headerTagline: {
  color: 'rgba(255,255,255,0.6)',
  fontSize: 12,
  marginTop: 2,
},
});