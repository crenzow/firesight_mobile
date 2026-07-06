import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const COLORS = {
  navy: '#0A1628',
  navyMid: '#1A2E4A',
  navyLight: '#243B55',
  red: '#C0392B',
  orange: '#E8590C',
  white: '#FFFFFF',
  offWhite: '#F0F2F5',
  textMuted: '#8A99B0',
  border: '#E2E8F0',
  borderDark: '#243B55',
  green: '#27AE60',
};

const USER = {
  name: 'Juan dela Cruz',
  contact: '+63 917 123 4567',
  address: 'Brgy. Lian Poblacion, Lian, Batangas',
  accountId: 'FS-LN-00142',
  status: 'Verified',
  joinedDate: 'March 12, 2024',
  totalReports: 3,
};

const PAST_REPORTS = [
  { id: 'RPT-001', date: 'June 10, 2025', location: 'Near public market', status: 'Resolved' },
  { id: 'RPT-002', date: 'April 2, 2025', location: 'Sitio Masaya', status: 'Resolved' },
  { id: 'RPT-003', date: 'January 17, 2025', location: 'Brgy. Hall area', status: 'Closed' },
];

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function SettingRow({
  icon,
  label,
  value,
  onPress,
  toggle,
  toggled,
  onToggle,
  tint,
  isDark,
  borderColor,
  textPrimary,
  textSec,
}: {
  icon: IoniconsName;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggled?: boolean;
  onToggle?: (v: boolean) => void;
  tint?: string;
  isDark: boolean;
  borderColor: string;
  textPrimary: string;
  textSec: string;
}) {
  const iconColor = tint || COLORS.navy;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={toggle ? 1 : 0.7}
      style={[styles.settingRow, { borderBottomColor: borderColor }]}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.settingLabel, { color: textPrimary }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value ? (
          <Text style={[styles.settingValue, { color: textSec }]}>{value}</Text>
        ) : null}
        {toggle ? (
          <Switch
            value={toggled}
            onValueChange={onToggle}
            trackColor={{ false: '#ccc', true: COLORS.orange }}
            thumbColor={COLORS.white}
          />
        ) : (
          !value && <Ionicons name="chevron-forward" size={16} color={textSec} />
        )}
        {value && !toggle && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={textSec}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [alertSound, setAlertSound] = useState(true);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;
  const statusColor = USER.status === 'Verified' ? COLORS.green : COLORS.orange;

  const handleLogout = () => {
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View>
          <View style={styles.headerBrand}>
            <Ionicons name="flame" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
          </View>
          <Text style={styles.headerSub}>My Profile</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Identity */}
        <View
          style={[
            styles.identityCard,
            { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy },
          ]}
        >
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.userName}>{USER.name}</Text>
          <Text style={styles.userContact}>{USER.contact}</Text>
          <Text style={styles.userAddress}>{USER.address}</Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusColor + '22', borderColor: statusColor },
              ]}
            >
              <Ionicons name="checkmark-circle" size={13} color={statusColor} />
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {USER.status} Resident
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.25)',
                },
              ]}
            >
              <Ionicons name="id-card-outline" size={13} color={COLORS.white} />
              <Text style={[styles.badgeText, { color: COLORS.white }]}>
                {USER.accountId}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: card, borderColor }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.red }]}>
              {USER.totalReports}
            </Text>
            <Text style={[styles.statLabel, { color: textSec }]}>Reports Filed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.green }]}>Active</Text>
            <Text style={[styles.statLabel, { color: textSec }]}>Account Status</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: textPrimary }]}>2024</Text>
            <Text style={[styles.statLabel, { color: textSec }]}>Member Since</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={[styles.card, { backgroundColor: card, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>
            Account Information
          </Text>
          <SettingRow
            icon="person-outline"
            label="Full Name"
            value={USER.name}
            onPress={() => {}}
            isDark={isDark}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <SettingRow
            icon="call-outline"
            label="Contact Number"
            value={USER.contact}
            onPress={() => {}}
            isDark={isDark}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <SettingRow
            icon="location-outline"
            label="Home Address"
            value="Brgy. Lian"
            onPress={() => {}}
            isDark={isDark}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <SettingRow
            icon="calendar-outline"
            label="Joined"
            value={USER.joinedDate}
            isDark={isDark}
            borderColor="transparent"
            textPrimary={textPrimary}
            textSec={textSec}
          />
        </View>

        {/* Preferences */}
        <View style={[styles.card, { backgroundColor: card, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Preferences</Text>
          <SettingRow
            icon="notifications-outline"
            label="Fire Alerts"
            toggle
            toggled={notifEnabled}
            onToggle={setNotifEnabled}
            tint={COLORS.orange}
            isDark={isDark}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <SettingRow
            icon="volume-high-outline"
            label="Alert Sound"
            toggle
            toggled={alertSound}
            onToggle={setAlertSound}
            tint={COLORS.orange}
            isDark={isDark}
            borderColor={borderColor}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <SettingRow
            icon={isDark ? 'sunny-outline' : 'moon-outline'}
            label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            toggle
            toggled={isDark}
            onToggle={toggleTheme}
            tint={COLORS.orange}
            isDark={isDark}
            borderColor="transparent"
            textPrimary={textPrimary}
            textSec={textSec}
          />
        </View>

        {/* Past Reports */}
        <View style={[styles.card, { backgroundColor: card, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Past Reports</Text>
          {PAST_REPORTS.map((r, i) => (
            <View
              key={r.id}
              style={[
                styles.reportRow,
                {
                  borderBottomColor:
                    i < PAST_REPORTS.length - 1 ? borderColor : 'transparent',
                },
              ]}
            >
              <View
                style={[styles.reportIconWrap, { backgroundColor: COLORS.red + '18' }]}
              >
                <Ionicons name="flame-outline" size={18} color={COLORS.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reportId, { color: textPrimary }]}>{r.id}</Text>
                <Text style={[styles.reportLocation, { color: textSec }]}>
                  {r.location}
                </Text>
                <Text style={[styles.reportDate, { color: textSec }]}>{r.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      r.status === 'Resolved' ? COLORS.green + '20' : '#8A99B020',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        r.status === 'Resolved' ? COLORS.green : COLORS.textMuted,
                    },
                  ]}
                >
                  {r.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: COLORS.red }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerAppName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  identityCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 14,
  },
  userName: { color: COLORS.white, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userContact: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 },
  userAddress: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  statDivider: { width: 1 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13 },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  reportIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportId: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  reportLocation: { fontSize: 12, marginBottom: 1 },
  reportDate: { fontSize: 11 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});