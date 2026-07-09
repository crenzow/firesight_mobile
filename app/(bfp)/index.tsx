import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView as RNSafeAreaView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';

const COLORS = {
  navy: '#0A1628',
  navyMid: '#1A2E4A',
  navyLight: '#243B55',
  red: '#C0392B',
  orange: '#E8590C',
  white: '#FFFFFF',
  offWhite: '#F0F2F5',
  textMuted: '#8A99B0',
  green: '#27AE60',
  yellow: '#F39C12',
  border: '#E2E8F0',
  borderDark: '#243B55',
};

const STATS = [
  { label: 'Active Incidents', value: '3', icon: 'flame' as const, color: COLORS.red },
  { label: 'Pending Reports', value: '7', icon: 'time' as const, color: COLORS.orange },
  { label: 'Resolved Today', value: '2', icon: 'checkmark-circle' as const, color: COLORS.green },
  { label: 'Units Deployed', value: '1', icon: 'car' as const, color: COLORS.yellow },
];

const RECENT_REPORTS = [
  {
    id: 'RPT-2025-001',
    location: 'Brgy. Lian Poblacion',
    reporter: 'Juan dela Cruz',
    time: '2 min ago',
    status: 'Unverified',
    level: 'high',
  },
  {
    id: 'RPT-2025-002',
    location: 'Sitio Masaya',
    reporter: 'Maria Santos',
    time: '18 min ago',
    status: 'Verified',
    level: 'medium',
  },
  {
    id: 'RPT-2025-003',
    location: 'Near public market',
    reporter: 'Pedro Reyes',
    time: '1 hr ago',
    status: 'Dispatched',
    level: 'high',
  },
];

const STATUS_COLORS: Record<string, string> = {
  Unverified: COLORS.yellow,
  Verified: COLORS.orange,
  Dispatched: COLORS.red,
  Resolved: COLORS.green,
  False: COLORS.textMuted,
};

export default function BFPDashboard() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View>
          <View style={styles.headerBrand}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
            <View style={styles.bfpTag}>
              <Text style={styles.bfpTagText}>BFP</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>Operations Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={toggleTheme}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications" size={20} color={COLORS.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Officer info bar */}
        <View style={[styles.officerBar, { backgroundColor: isDark ? COLORS.navyLight : COLORS.navy + 'F5' }]}>
          <View style={styles.officerAvatar}>
            <Ionicons name="person" size={18} color={COLORS.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.officerName}>FO1 Roberto Dela Cruz</Text>
            <Text style={styles.officerPost}>BFP Lian Fire Station · On duty</Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            {STATS.map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: card, borderColor }]}>
                <View style={[styles.statIconWrap, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: textSec }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Incoming reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              Incoming Reports
            </Text>
            <TouchableOpacity onPress={() => router.push('/(bfp)/incidents' as any)}>
              <Text style={[styles.seeAll, { color: COLORS.orange }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {RECENT_REPORTS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.reportCard, { backgroundColor: card, borderColor }]}
              activeOpacity={0.8}
            >
              <View style={[
                styles.reportLevelBar,
                { backgroundColor: r.level === 'high' ? COLORS.red : COLORS.orange },
              ]} />
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <View style={styles.reportTopRow}>
                  <Text style={[styles.reportId, { color: textSec }]}>{r.id}</Text>
                  <View style={[
                    styles.statusChip,
                    { backgroundColor: STATUS_COLORS[r.status] + '20' },
                  ]}>
                    <Text style={[styles.statusChipText, { color: STATUS_COLORS[r.status] }]}>
                      {r.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.reportLocation, { color: textPrimary }]}>
                  {r.location}
                </Text>
                <View style={styles.reportMeta}>
                  <Ionicons name="person-outline" size={12} color={textSec} />
                  <Text style={[styles.reportMetaText, { color: textSec }]}>
                    {r.reporter}
                  </Text>
                  <Text style={[styles.reportTime, { color: COLORS.textMuted }]}>
                    · {r.time}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={textSec} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick actions */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Actions</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: COLORS.red }]}
              onPress={() => router.push('/(bfp)/incidents' as any)}
            >
              <Ionicons name="add-circle-outline" size={22} color={COLORS.white} />
              <Text style={styles.quickBtnText}>New Incident</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: COLORS.navy }]}
              onPress={() => router.push('/(bfp)/map' as any)}
            >
              <Ionicons name="map-outline" size={22} color={COLORS.white} />
              <Text style={styles.quickBtnText}>View Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: COLORS.orange }]}
              onPress={() => router.push('/(bfp)/response' as any)}
            >
              <Ionicons name="navigate-outline" size={22} color={COLORS.white} />
              <Text style={styles.quickBtnText}>Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headerAppName: { color: COLORS.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  bfpTag: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bfpTagText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
  },
  officerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  officerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerName: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  officerPost: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 1 },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(39,174,96,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  onlineText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    paddingRight: 14,
    paddingVertical: 14,
  },
  reportLevelBar: { width: 4, alignSelf: 'stretch' },
  reportTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportId: { fontSize: 11, fontWeight: '600' },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  reportLocation: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reportMetaText: { fontSize: 12 },
  reportTime: { fontSize: 12 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});