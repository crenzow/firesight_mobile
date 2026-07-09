import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
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
};

type IncidentStatus = 'Unverified' | 'Verified' | 'Dispatched' | 'Resolved' | 'False';
type FilterTab = 'All' | IncidentStatus;

const STATUS_COLORS: Record<string, string> = {
  Unverified: COLORS.yellow,
  Verified: COLORS.orange,
  Dispatched: COLORS.red,
  Resolved: COLORS.green,
  False: COLORS.textMuted,
};

const STATUS_FLOW: IncidentStatus[] = [
  'Unverified',
  'Verified',
  'Dispatched',
  'Resolved',
];

interface Incident {
  id: string;
  location: string;
  reporter: string;
  contact: string;
  time: string;
  date: string;
  status: IncidentStatus;
  level: string;
  description: string;
  coords: string;
  cause?: string;
  notes?: string;
  hasPhoto: boolean;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'RPT-2025-001',
    location: 'Brgy. Lian Poblacion',
    reporter: 'Juan dela Cruz',
    contact: '+63 917 123 4567',
    time: '2 min ago',
    date: 'July 8, 2025 · 11:52 AM',
    status: 'Unverified',
    level: 'high',
    description: 'Residential fire spotted near the barangay hall. Smoke visible from the street.',
    coords: '14.04420, 120.62700',
    hasPhoto: true,
  },
  {
    id: 'RPT-2025-002',
    location: 'Sitio Masaya',
    reporter: 'Maria Santos',
    contact: '+63 921 456 7890',
    time: '18 min ago',
    date: 'July 8, 2025 · 11:36 AM',
    status: 'Verified',
    level: 'medium',
    description: 'Grass fire spreading near the road. No structures involved yet.',
    coords: '14.03980, 120.62150',
    hasPhoto: true,
  },
  {
    id: 'RPT-2025-003',
    location: 'Near public market',
    reporter: 'Pedro Reyes',
    contact: '+63 945 789 0123',
    time: '1 hr ago',
    date: 'July 8, 2025 · 10:52 AM',
    status: 'Dispatched',
    level: 'high',
    description: 'Electrical fire at a market stall. Fire spreading to adjacent stalls.',
    coords: '14.04800, 120.63500',
    cause: 'Electrical short circuit',
    hasPhoto: true,
  },
  {
    id: 'RPT-2025-004',
    location: 'Sitio Dagatan',
    reporter: 'Ana Garcia',
    contact: '+63 998 234 5678',
    time: '3 hrs ago',
    date: 'July 8, 2025 · 8:52 AM',
    status: 'Resolved',
    level: 'low',
    description: 'Minor kitchen fire. Homeowner used extinguisher before BFP arrived.',
    coords: '14.03650, 120.61800',
    cause: 'Cooking accident',
    notes: 'Homeowner was cooking and left stove unattended.',
    hasPhoto: false,
  },
  {
    id: 'RPT-2025-005',
    location: 'Brgy. Hall area',
    reporter: 'Ramon Cruz',
    contact: '+63 912 345 6789',
    time: '5 hrs ago',
    date: 'July 8, 2025 · 6:52 AM',
    status: 'False',
    level: 'low',
    description: 'Reported smoke turned out to be from burning trash nearby.',
    coords: '14.05100, 120.63100',
    notes: 'Confirmed false alarm. Smoke was from authorized waste burning.',
    hasPhoto: false,
  },
];

const FILTER_TABS: FilterTab[] = ['All', 'Unverified', 'Verified', 'Dispatched', 'Resolved', 'False'];

export default function IncidentsScreen() {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;
  const inputBg = isDark ? COLORS.navyLight : COLORS.white;

  const filtered = incidents.filter((inc) => {
    const matchFilter = activeFilter === 'All' || inc.status === activeFilter;
    const matchSearch =
      search === '' ||
      inc.location.toLowerCase().includes(search.toLowerCase()) ||
      inc.reporter.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleStatusUpdate = async (incident: Incident, newStatus: IncidentStatus) => {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIncidents((prev) =>
      prev.map((i) => (i.id === incident.id ? { ...i, status: newStatus } : i))
    );
    if (selected?.id === incident.id) {
      setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    setUpdating(false);
  };

  const getNextStatus = (current: IncidentStatus): IncidentStatus | null => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBrand}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
            <View style={styles.bfpTag}>
              <Text style={styles.bfpTagText}>BFP</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>Incident Management</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateVisible(true)}
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.createBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: card, borderBottomColor: borderColor }]}>
        <View style={[styles.searchWrap, { backgroundColor: inputBg, borderColor }]}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: textPrimary }]}
            placeholder="Search by ID, location, reporter..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { backgroundColor: card, borderBottomColor: borderColor }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {FILTER_TABS.map((tab) => {
          const count = tab === 'All'
            ? incidents.length
            : incidents.filter((i) => i.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    activeFilter === tab
                      ? tab === 'All'
                        ? COLORS.navy
                        : STATUS_COLORS[tab]
                      : isDark
                      ? COLORS.navyLight
                      : COLORS.offWhite,
                  borderColor:
                    activeFilter === tab
                      ? 'transparent'
                      : borderColor,
                },
              ]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      activeFilter === tab ? COLORS.white : textSec,
                  },
                ]}
              >
                {tab}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor:
                      activeFilter === tab
                        ? 'rgba(255,255,255,0.25)'
                        : isDark
                        ? COLORS.navy
                        : COLORS.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    { color: activeFilter === tab ? COLORS.white : textSec },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Incident list */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: textSec }]}>No incidents found</Text>
          </View>
        ) : (
          filtered.map((inc) => (
            <TouchableOpacity
              key={inc.id}
              style={[styles.incidentCard, { backgroundColor: card, borderColor }]}
              onPress={() => { setSelected(inc); setDetailVisible(true); }}
              activeOpacity={0.8}
            >
              <View style={[
                styles.levelBar,
                { backgroundColor: inc.level === 'high' ? COLORS.red : inc.level === 'medium' ? COLORS.orange : COLORS.yellow },
              ]} />
              <View style={{ flex: 1, paddingLeft: 12, paddingRight: 8 }}>
                <View style={styles.incidentTopRow}>
                  <Text style={[styles.incidentId, { color: textSec }]}>{inc.id}</Text>
                  <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[inc.status] + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[inc.status] }]} />
                    <Text style={[styles.statusChipText, { color: STATUS_COLORS[inc.status] }]}>
                      {inc.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.incidentLocation, { color: textPrimary }]}>
                  {inc.location}
                </Text>
                <Text style={[styles.incidentDesc, { color: textSec }]} numberOfLines={2}>
                  {inc.description}
                </Text>
                <View style={styles.incidentMeta}>
                  <Ionicons name="person-outline" size={12} color={textSec} />
                  <Text style={[styles.incidentMetaText, { color: textSec }]}>{inc.reporter}</Text>
                  <Text style={[styles.incidentTime, { color: COLORS.textMuted }]}>· {inc.time}</Text>
                  {inc.hasPhoto && (
                    <View style={styles.photoChip}>
                      <Ionicons name="camera-outline" size={11} color={COLORS.orange} />
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={textSec} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailVisible(false)}
      >
        {selected && (
          <SafeAreaView style={[styles.modalSafe, { backgroundColor: bg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setDetailVisible(false)}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderId}>{selected.id}</Text>
                <Text style={styles.modalHeaderLocation}>{selected.location}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[selected.status] + '30' }]}>
                <Text style={[styles.statusChipText, { color: STATUS_COLORS[selected.status] }]}>
                  {selected.status}
                </Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
              {/* Photo placeholder */}
              {selected.hasPhoto && (
                <View style={[styles.photoPlaceholder, { backgroundColor: isDark ? COLORS.navyLight : '#D0D8E4' }]}>
                  <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
                  <Text style={[styles.photoPlaceholderText, { color: textSec }]}>
                    Report Photo
                  </Text>
                </View>
              )}

              {/* Reporter info */}
              <Text style={[styles.sectionLabel, { color: textSec }]}>REPORTER INFORMATION</Text>
              <View style={[styles.infoCard, { backgroundColor: card, borderColor }]}>
                <DetailRow icon="person-outline" label="Reporter" value={selected.reporter} textPrimary={textPrimary} textSec={textSec} />
                <DetailRow icon="call-outline" label="Contact" value={selected.contact} textPrimary={textPrimary} textSec={textSec} />
                <DetailRow icon="time-outline" label="Reported" value={selected.date} textPrimary={textPrimary} textSec={textSec} last />
              </View>

              {/* Incident info */}
              <Text style={[styles.sectionLabel, { color: textSec, marginTop: 20 }]}>INCIDENT DETAILS</Text>
              <View style={[styles.infoCard, { backgroundColor: card, borderColor }]}>
                <DetailRow icon="location-outline" label="Location" value={selected.location} textPrimary={textPrimary} textSec={textSec} />
                <DetailRow icon="navigate-outline" label="GPS Coordinates" value={selected.coords} textPrimary={COLORS.green} textSec={textSec} />
                <DetailRow icon="document-text-outline" label="Description" value={selected.description} textPrimary={textPrimary} textSec={textSec} />
                {selected.cause && (
                  <DetailRow icon="flash-outline" label="Cause of Fire" value={selected.cause} textPrimary={textPrimary} textSec={textSec} />
                )}
                {selected.notes && (
                  <DetailRow icon="create-outline" label="Notes" value={selected.notes} textPrimary={textPrimary} textSec={textSec} last />
                )}
              </View>

              {/* Status update */}
              <Text style={[styles.sectionLabel, { color: textSec, marginTop: 20 }]}>UPDATE STATUS</Text>
              <View style={[styles.statusFlow, { backgroundColor: card, borderColor }]}>
                {STATUS_FLOW.map((s, i) => (
                  <View key={s} style={styles.statusFlowItem}>
                    <View style={[
                      styles.statusFlowDot,
                      {
                        backgroundColor:
                          STATUS_FLOW.indexOf(selected.status) >= i
                            ? STATUS_COLORS[s]
                            : isDark ? COLORS.navyLight : COLORS.border,
                      },
                    ]}>
                      {STATUS_FLOW.indexOf(selected.status) > i && (
                        <Ionicons name="checkmark" size={12} color={COLORS.white} />
                      )}
                    </View>
                    <Text style={[
                      styles.statusFlowLabel,
                      {
                        color:
                          selected.status === s
                            ? STATUS_COLORS[s]
                            : textSec,
                        fontWeight: selected.status === s ? '700' : '400',
                      },
                    ]}>
                      {s}
                    </Text>
                    {i < STATUS_FLOW.length - 1 && (
                      <View style={[
                        styles.statusFlowLine,
                        {
                          backgroundColor:
                            STATUS_FLOW.indexOf(selected.status) > i
                              ? COLORS.green
                              : isDark ? COLORS.navyLight : COLORS.border,
                        },
                      ]} />
                    )}
                  </View>
                ))}
              </View>

              {/* Action buttons */}
              <View style={styles.actionBtns}>
                {getNextStatus(selected.status) && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor:
                          STATUS_COLORS[getNextStatus(selected.status)!],
                        opacity: updating ? 0.75 : 1,
                      },
                    ]}
                    onPress={() =>
                      handleStatusUpdate(selected, getNextStatus(selected.status)!)
                    }
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons name="arrow-forward-circle-outline" size={18} color={COLORS.white} />
                        <Text style={styles.actionBtnText}>
                          Mark as {getNextStatus(selected.status)}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {selected.status === 'Unverified' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.textMuted }]}
                    onPress={() => handleStatusUpdate(selected, 'False')}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>Mark as False Alarm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Create Incident Modal */}
      <CreateIncidentModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        isDark={isDark}
        onSubmit={(newInc) => {
          setIncidents((prev) => [newInc, ...prev]);
          setCreateVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  textPrimary,
  textSec,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  textPrimary: string;
  textSec: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: '#E2E8F015' }]}>
      <Ionicons name={icon} size={15} color={textSec} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: textSec }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function CreateIncidentModal({
  visible,
  onClose,
  isDark,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onSubmit: (inc: Incident) => void;
}) {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [loading, setLoading] = useState(false);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;
  const inputBg = isDark ? COLORS.navyLight : COLORS.white;

  const handleCreate = async () => {
    if (!location || !description) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newInc: Incident = {
      id: `RPT-2025-00${Math.floor(Math.random() * 900) + 100}`,
      location,
      reporter: 'FO1 Roberto Dela Cruz (Manual)',
      contact: 'BFP Lian',
      time: 'Just now',
      date: new Date().toLocaleString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      status: 'Verified',
      level,
      description,
      coords: '14.04420, 120.62700',
      hasPhoto: false,
    };
    setLoading(false);
    setLocation('');
    setDescription('');
    onSubmit(newInc);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[{ flex: 1, backgroundColor: bg }]}>
        <View style={[styles.modalHeader, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalHeaderLocation}>Create Incident Record</Text>
            <Text style={styles.modalHeaderId}>Manual entry by BFP officer</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View style={[styles.infoCard, { backgroundColor: card, borderColor, padding: 16 }]}>
            <Text style={[styles.sectionLabel, { color: textSec, marginBottom: 12 }]}>
              INCIDENT LOCATION
            </Text>
            <View style={[styles.createInputWrap, { backgroundColor: inputBg, borderColor }]}>
              <Ionicons name="location-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={[styles.createInput, { color: textPrimary }]}
                placeholder="Enter incident location..."
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: textSec, marginTop: 16, marginBottom: 12 }]}>
              SEVERITY LEVEL
            </Text>
            <View style={styles.levelRow}>
              {(['high', 'medium', 'low'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.levelBtn,
                    {
                      backgroundColor:
                        level === l
                          ? l === 'high' ? COLORS.red : l === 'medium' ? COLORS.orange : COLORS.yellow
                          : isDark ? COLORS.navyLight : COLORS.offWhite,
                      borderColor:
                        level === l
                          ? l === 'high' ? COLORS.red : l === 'medium' ? COLORS.orange : COLORS.yellow
                          : borderColor,
                    },
                  ]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[
                    styles.levelBtnText,
                    { color: level === l ? COLORS.white : textSec },
                  ]}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: textSec, marginTop: 16, marginBottom: 12 }]}>
              DESCRIPTION
            </Text>
            <View style={[styles.createInputWrap, { backgroundColor: inputBg, borderColor, alignItems: 'flex-start', paddingTop: 12, height: 100 }]}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.createInput, { color: textPrimary }]}
                placeholder="Describe the incident..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.red, opacity: loading ? 0.75 : 1 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Create Incident Record</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterScroll: { 
    borderBottomWidth: 1,
    // Explicitly clamp the container height so it doesn't flex awkwardly
    maxHeight: 62, 
    minHeight: 62,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centers everything inside the capsule
    gap: 6,
    paddingHorizontal: 14,
    // Replace hardcoded paddingVertical with an explicit height to keep capsules perfectly uniform
    height: 38, 
    borderRadius: 19, // Half of height for perfect pills
    borderWidth: 1,
  },
  filterTabText: { fontSize: 12, fontWeight: '600' },
  filterCount: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountText: { fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  incidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    paddingRight: 14,
    paddingVertical: 14,
  },
  levelBar: { width: 4, alignSelf: 'stretch' },
  incidentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incidentId: { fontSize: 11, fontWeight: '600' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  incidentLocation: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  incidentDesc: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  incidentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  incidentMetaText: { fontSize: 12 },
  incidentTime: { fontSize: 12 },
  photoChip: {
    backgroundColor: COLORS.orange + '20',
    borderRadius: 6,
    padding: 3,
    marginLeft: 4,
  },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderId: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  modalHeaderLocation: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  photoPlaceholder: {
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  photoPlaceholderText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  detailLabel: { fontSize: 11, marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  statusFlow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statusFlowItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statusFlowDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statusFlowLabel: { fontSize: 10, textAlign: 'center' },
  statusFlowLine: {
    position: 'absolute',
    top: 14,
    left: '60%',
    right: '-60%',
    height: 2,
  },
  actionBtns: { gap: 10, marginTop: 20 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  createInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  createInput: { flex: 1, fontSize: 14 },
  levelRow: { flexDirection: 'row', gap: 10 },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  levelBtnText: { fontSize: 13, fontWeight: '700' },
});