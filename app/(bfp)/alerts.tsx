import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  green: '#27AE60',
  yellow: '#F39C12',
  border: '#E2E8F0',
  borderDark: '#243B55',
  purple: '#8E44AD',
};

interface Alert {
  id: string;
  type: 'incident' | 'dispatch' | 'update' | 'system';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  priority: 'high' | 'medium' | 'low';
}

const MOCK_ALERTS: Alert[] = [
  {
    id: 'A001',
    type: 'incident',
    title: 'New Fire Report — Brgy. Lian Poblacion',
    body: 'Resident Juan dela Cruz submitted a fire report with GPS coordinates 14.04420, 120.62700. Photo attached.',
    time: '2 min ago',
    unread: true,
    priority: 'high',
  },
  {
    id: 'A002',
    type: 'dispatch',
    title: 'Unit 1 Dispatched — Sitio Masaya',
    body: 'Fire truck unit 1 has been dispatched to Sitio Masaya (RPT-2025-002). ETA: 5 minutes.',
    time: '10 min ago',
    unread: true,
    priority: 'high',
  },
  {
    id: 'A003',
    type: 'update',
    title: 'Incident RPT-2025-003 Resolved',
    body: 'The fire incident at Near public market has been marked as resolved by FO1 Roberto Dela Cruz.',
    time: '1 hr ago',
    unread: true,
    priority: 'medium',
  },
  {
    id: 'A004',
    type: 'incident',
    title: 'New Report — Sitio Dagatan',
    body: 'Minor kitchen fire reported by Ana Garcia. Location verified via GPS. No photo attached.',
    time: '3 hrs ago',
    unread: false,
    priority: 'low',
  },
  {
    id: 'A005',
    type: 'system',
    title: 'System: Daily Report Summary',
    body: '5 reports received today. 2 active, 2 resolved, 1 false alarm. 1 unit deployed.',
    time: '6 hrs ago',
    unread: false,
    priority: 'low',
  },
  {
    id: 'A006',
    type: 'update',
    title: 'False Alarm — Brgy. Hall Area',
    body: 'RPT-2025-005 marked as false alarm by FO2 Santos. Smoke confirmed from authorized trash burning.',
    time: 'Yesterday',
    unread: false,
    priority: 'low',
  },
];

const TYPE_CONFIG = {
  incident: { icon: 'flame' as const, color: COLORS.red },
  dispatch: { icon: 'car' as const, color: COLORS.orange },
  update: { icon: 'checkmark-circle' as const, color: COLORS.green },
  system: { icon: 'settings' as const, color: COLORS.textMuted },
};

const PRIORITY_COLORS = {
  high: COLORS.red,
  medium: COLORS.orange,
  low: COLORS.textMuted,
};

export default function AlertsScreen() {
  const { isDark } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  const unreadCount = alerts.filter((a) => a.unread).length;
  const filtered = filter === 'unread' ? alerts.filter((a) => a.unread) : alerts;

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
  };

  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBrand}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
            <View style={styles.bfpTag}><Text style={styles.bfpTagText}>BFP</Text></View>
          </View>
          <Text style={styles.headerSub}>Alerts & Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {/* Filter + actions bar */}
      <View style={[styles.filterBar, { backgroundColor: card, borderBottomColor: borderColor }]}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              { backgroundColor: filter === 'all' ? COLORS.navy : isDark ? COLORS.navyLight : COLORS.offWhite },
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterBtnText, { color: filter === 'all' ? COLORS.white : textSec }]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              { backgroundColor: filter === 'unread' ? COLORS.red : isDark ? COLORS.navyLight : COLORS.offWhite },
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterBtnText, { color: filter === 'unread' ? COLORS.white : textSec }]}>
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAllText, { color: COLORS.orange }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Alerts list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: textSec }]}>No alerts</Text>
          </View>
        ) : (
          filtered.map((alert) => {
            const config = TYPE_CONFIG[alert.type];
            return (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.unread
                      ? isDark ? COLORS.navyLight : '#FFFBF5'
                      : card,
                    borderColor: alert.unread ? COLORS.orange + '44' : borderColor,
                    borderLeftColor: PRIORITY_COLORS[alert.priority],
                  },
                ]}
                onPress={() => markRead(alert.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.alertIconWrap, { backgroundColor: config.color + '18' }]}>
                  <Ionicons name={config.icon} size={20} color={config.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.alertTopRow}>
                    <Text
                      style={[styles.alertTitle, { color: textPrimary }]}
                      numberOfLines={1}
                    >
                      {alert.title}
                    </Text>
                    {alert.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    style={[styles.alertBody, { color: textSec }]}
                    numberOfLines={2}
                  >
                    {alert.body}
                  </Text>
                  <View style={styles.alertMeta}>
                    <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.alertTime}>{alert.time}</Text>
                    <View style={[
                      styles.priorityChip,
                      { backgroundColor: PRIORITY_COLORS[alert.priority] + '18' },
                    ]}>
                      <Text style={[styles.priorityChipText, { color: PRIORITY_COLORS[alert.priority] }]}>
                        {alert.priority}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  bfpTag: { backgroundColor: COLORS.orange, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  bfpTagText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  unreadCountBadge: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  unreadCountText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterBtnText: { fontSize: 13, fontWeight: '600' },
  markAllText: { fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  alertIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  alertTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    flexShrink: 0,
  },
  alertBody: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertTime: { fontSize: 11, color: COLORS.textMuted, flex: 1 },
  priorityChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  priorityChipText: { fontSize: 10, fontWeight: '700' },
});