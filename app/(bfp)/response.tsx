import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
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

const ACTIVE_INCIDENTS = [
  {
    id: 'RPT-2025-001',
    location: 'Brgy. Lian Poblacion',
    status: 'Dispatched',
    level: 'high',
    distance: '0.8 km',
    eta: '~3 min',
    lat: 14.0442,
    lng: 120.6270,
    reporter: 'Juan dela Cruz',
    time: '2 min ago',
  },
  {
    id: 'RPT-2025-002',
    location: 'Sitio Masaya',
    status: 'Verified',
    level: 'medium',
    distance: '1.4 km',
    eta: '~5 min',
    lat: 14.0398,
    lng: 120.6215,
    reporter: 'Maria Santos',
    time: '18 min ago',
  },
];

const STATUS_COLORS: Record<string, string> = {
  Unverified: COLORS.yellow,
  Verified: COLORS.orange,
  Dispatched: COLORS.red,
  Resolved: COLORS.green,
};

function buildRouteMapHTML(incident: typeof ACTIVE_INCIDENTS[0]): string {
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style>
  </head><body><div id="map"></div><script>
    var map = L.map('map',{center:[${incident.lat},${incident.lng}],zoom:15,zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);

    var bfpIcon = L.divIcon({html:'<div style="background:#0A1628;border:3px solid #E8590C;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px">🚒</div>',iconSize:[36,36],iconAnchor:[18,18],className:''});
    var fireIcon = L.divIcon({html:'<div style="background:#C0392B;border:3px solid #fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px">🔥</div>',iconSize:[36,36],iconAnchor:[18,18],className:''});

    var bfp = L.marker([14.0442,120.6260],{icon:bfpIcon}).addTo(map);
    var fire = L.marker([${incident.lat},${incident.lng}],{icon:fireIcon}).addTo(map).bindPopup('<b>${incident.location}</b>').openPopup();

    L.polyline([[14.0442,120.6260],[${incident.lat},${incident.lng}]],{
      color:'#E8590C',weight:5,opacity:0.8,dashArray:'10,8'
    }).addTo(map);

    map.fitBounds([[14.0442,120.6260],[${incident.lat},${incident.lng}]],{padding:[40,40]});
  </script></body></html>`;
}

export default function ResponseScreen() {
  const { isDark } = useTheme();
  const [selectedIncident, setSelectedIncident] = useState(ACTIVE_INCIDENTS[0]);
  const [mapReady, setMapReady] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState<string[]>(['RPT-2025-001']);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  const handleDispatch = async () => {
    setDispatching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDispatched((prev) => [...prev, selectedIncident.id]);
    setDispatching(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBrand}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
            <View style={styles.bfpTag}><Text style={styles.bfpTagText}>BFP</Text></View>
          </View>
          <Text style={styles.headerSub}>Response Support</Text>
        </View>
        <View style={styles.unitBadge}>
          <Ionicons name="car-outline" size={14} color={COLORS.orange} />
          <Text style={styles.unitText}>Unit 1 · Active</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Incident selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Active Incidents</Text>
          {ACTIVE_INCIDENTS.map((inc) => (
            <TouchableOpacity
              key={inc.id}
              style={[
                styles.incidentSelector,
                {
                  backgroundColor: selectedIncident.id === inc.id
                    ? isDark ? COLORS.navyLight : COLORS.navy + '0D'
                    : card,
                  borderColor: selectedIncident.id === inc.id ? COLORS.orange : borderColor,
                  borderWidth: selectedIncident.id === inc.id ? 2 : 1,
                },
              ]}
              onPress={() => { setSelectedIncident(inc); setMapReady(false); }}
            >
              <View style={[
                styles.incidentLevelDot,
                { backgroundColor: inc.level === 'high' ? COLORS.red : COLORS.orange },
              ]} />
              <View style={{ flex: 1 }}>
                <View style={styles.incSelectorTop}>
                  <Text style={[styles.incSelectorId, { color: textSec }]}>{inc.id}</Text>
                  <View style={[styles.statusChip, { backgroundColor: STATUS_COLORS[inc.status] + '20' }]}>
                    <Text style={[styles.statusChipText, { color: STATUS_COLORS[inc.status] }]}>
                      {inc.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.incSelectorLoc, { color: textPrimary }]}>{inc.location}</Text>
                <View style={styles.incSelectorMeta}>
                  <View style={styles.metaChip}>
                    <Ionicons name="navigate-outline" size={12} color={COLORS.orange} />
                    <Text style={[styles.metaChipText, { color: COLORS.orange }]}>{inc.distance}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={COLORS.green} />
                    <Text style={[styles.metaChipText, { color: COLORS.green }]}>ETA {inc.eta}</Text>
                  </View>
                </View>
              </View>
              {selectedIncident.id === inc.id && (
                <Ionicons name="radio-button-on" size={20} color={COLORS.orange} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Route map */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Route to Incident</Text>
          <View style={[styles.mapContainer, { borderColor }]}>
            <WebView
              key={selectedIncident.id}
              source={{ html: buildRouteMapHTML(selectedIncident) }}
              style={{ flex: 1 }}
              onLoad={() => setMapReady(true)}
              javaScriptEnabled
              originWhitelist={['*']}
              scrollEnabled={false}
            />
            {!mapReady && (
              <View style={[styles.mapLoader, { backgroundColor: isDark ? COLORS.navy : COLORS.offWhite }]}>
                <ActivityIndicator color={COLORS.red} />
              </View>
            )}
            {/* Route info overlay */}
            <View style={styles.routeOverlay}>
              <View style={[styles.routeInfoChip, { backgroundColor: COLORS.navy + 'EE' }]}>
                <Ionicons name="navigate" size={14} color={COLORS.orange} />
                <Text style={styles.routeInfoText}>{selectedIncident.distance}</Text>
              </View>
              <View style={[styles.routeInfoChip, { backgroundColor: COLORS.navy + 'EE' }]}>
                <Ionicons name="time" size={14} color={COLORS.green} />
                <Text style={styles.routeInfoText}>ETA {selectedIncident.eta}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status update */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Response Actions</Text>
          <View style={[styles.actionCard, { backgroundColor: card, borderColor }]}>
            <View style={styles.actionCardHeader}>
              <View>
                <Text style={[styles.actionCardTitle, { color: textPrimary }]}>
                  {selectedIncident.location}
                </Text>
                <Text style={[styles.actionCardSub, { color: textSec }]}>
                  Reported by {selectedIncident.reporter} · {selectedIncident.time}
                </Text>
              </View>
            </View>

            <View style={[styles.actionDivider, { backgroundColor: borderColor }]} />

            {dispatched.includes(selectedIncident.id) ? (
              <View style={styles.dispatchedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
                <Text style={[styles.dispatchedText, { color: COLORS.green }]}>
                  Unit dispatched to this location
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.dispatchBtn, dispatching && { opacity: 0.75 }]}
                onPress={handleDispatch}
                disabled={dispatching}
              >
                {dispatching ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="car-outline" size={20} color={COLORS.white} />
                    <Text style={styles.dispatchBtnText}>Dispatch Unit</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.resolveBtn, { borderColor }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.green} />
              <Text style={[styles.resolveBtnText, { color: COLORS.green }]}>
                Mark as Resolved
              </Text>
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
  bfpTag: { backgroundColor: COLORS.orange, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  bfpTagText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(232,89,12,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232,89,12,0.4)',
  },
  unitText: { color: COLORS.orange, fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  incidentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  incidentLevelDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  incSelectorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  incSelectorId: { fontSize: 11, fontWeight: '600' },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  incSelectorLoc: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  incSelectorMeta: { flexDirection: 'row', gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChipText: { fontSize: 12, fontWeight: '600' },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  routeInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  routeInfoText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  actionCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 14 },
  actionCardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  actionCardSub: { fontSize: 12 },
  actionDivider: { height: 1 },
  dispatchedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dispatchedText: { fontSize: 14, fontWeight: '600' },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 15,
  },
  dispatchBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 13,
  },
  resolveBtnText: { fontSize: 15, fontWeight: '700' },
});