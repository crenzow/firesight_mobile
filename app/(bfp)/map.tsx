import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
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

const FIRE_INCIDENTS = [
  { id: 'INC-001', lat: 14.0442, lng: 120.6270, level: 'high', location: 'Brgy. Lian Poblacion', date: 'July 8, 2025', status: 'Active' },
  { id: 'INC-002', lat: 14.0398, lng: 120.6215, level: 'medium', location: 'Sitio Masaya', date: 'July 8, 2025', status: 'Dispatched' },
  { id: 'INC-003', lat: 14.0510, lng: 120.6310, level: 'high', location: 'Brgy. Hall area', date: 'June 10, 2025', status: 'Resolved' },
  { id: 'INC-004', lat: 14.0365, lng: 120.6180, level: 'low', location: 'Sitio Dagatan', date: 'March 5, 2025', status: 'Resolved' },
  { id: 'INC-005', lat: 14.0480, lng: 120.6350, level: 'medium', location: 'Near public market', date: 'May 22, 2025', status: 'Resolved' },
];

const RISK_ZONES = [
  { lat: 14.0442, lng: 120.6270, intensity: 0.9, radius: 200 },
  { lat: 14.0398, lng: 120.6215, intensity: 0.6, radius: 150 },
  { lat: 14.0510, lng: 120.6310, intensity: 0.85, radius: 180 },
  { lat: 14.0365, lng: 120.6180, intensity: 0.4, radius: 120 },
  { lat: 14.0480, lng: 120.6350, intensity: 0.7, radius: 160 },
];

type MapLayer = 'incidents' | 'heatmap';
type YearFilter = 'All' | '2025' | '2024' | '2023';

function buildBFPMapHTML(layer: MapLayer, yearFilter: YearFilter): string {
  const filtered = yearFilter === 'All'
    ? FIRE_INCIDENTS
    : FIRE_INCIDENTS.filter((i) => i.date.includes(yearFilter));

  const markers = filtered.map((inc) => {
    const color = inc.level === 'high' ? '#C0392B' : inc.level === 'medium' ? '#E8590C' : '#F39C12';
    const statusColor = inc.status === 'Active' ? '#C0392B' : inc.status === 'Dispatched' ? '#E8590C' : '#27AE60';
    return `
      L.circleMarker([${inc.lat}, ${inc.lng}], {
        radius: ${inc.level === 'high' ? 16 : inc.level === 'medium' ? 12 : 9},
        fillColor: '${color}',
        color: '#fff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.92
      }).addTo(map).bindPopup(\`
        <div style="font-family:sans-serif;min-width:200px">
          <div style="background:${color};color:#fff;padding:8px 12px;margin:-8px -12px 10px;border-radius:6px 6px 0 0;font-weight:700">${inc.id} · ${inc.level.toUpperCase()}</div>
          <b>${inc.location}</b><br>
          <span style="color:#666;font-size:12px">${inc.date}</span><br>
          <span style="background:${statusColor}20;color:${statusColor};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${inc.status}</span>
        </div>
      \`, { maxWidth: 260 });
    `;
  }).join('\n');

  const heat = RISK_ZONES.map((z) => {
    const alpha = z.intensity * 0.55;
    const color = z.intensity > 0.75 ? `rgba(192,57,43,${alpha})` : z.intensity > 0.5 ? `rgba(232,89,12,${alpha})` : `rgba(243,156,18,${alpha})`;
    return `
      L.circle([${z.lat}, ${z.lng}], { radius: ${z.radius}, fillColor: '${color}', color: 'transparent', fillOpacity: ${z.intensity * 0.6} }).addTo(map);
      L.circle([${z.lat}, ${z.lng}], { radius: ${z.radius * 0.5}, fillColor: '${color}', color: 'transparent', fillOpacity: ${z.intensity * 0.45} }).addTo(map);
    `;
  }).join('\n');

  const bfp = `
    L.marker([14.0442, 120.6260], {
      icon: L.divIcon({ html: '<div style="background:#0A1628;border:3px solid #E8590C;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚒</div>', iconSize:[36,36], iconAnchor:[18,18], className:'' })
    }).addTo(map).bindPopup('<b>BFP Lian Fire Station</b><br><span style="font-size:12px;color:#666">Emergency: (043) 123-4567</span>');
  `;

  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}</style>
  </head><body><div id="map"></div><script>
    var map = L.map('map',{center:[14.0442,120.6270],zoom:14,zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18}).addTo(map);
    ${layer === 'heatmap' ? heat : markers}
    ${bfp}
  </script></body></html>`;
}

export default function BFPMapScreen() {
  const { isDark } = useTheme();
  const [layer, setLayer] = useState<MapLayer>('incidents');
  const [yearFilter, setYearFilter] = useState<YearFilter>('All');
  const [mapReady, setMapReady] = useState(false);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  const YEARS: YearFilter[] = ['All', '2025', '2024', '2023'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBrand}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
            <View style={styles.bfpTag}><Text style={styles.bfpTagText}>BFP</Text></View>
          </View>
          <Text style={styles.headerSub}>Risk Mapping</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: card, borderBottomColor: borderColor }]}>
        <View style={styles.layerRow}>
          <TouchableOpacity
            style={[styles.layerBtn, layer === 'incidents' && { backgroundColor: COLORS.red }]}
            onPress={() => { setMapReady(false); setLayer('incidents'); }}
          >
            <Ionicons name="flame" size={14} color={layer === 'incidents' ? COLORS.white : textSec} />
            <Text style={[styles.layerBtnText, { color: layer === 'incidents' ? COLORS.white : textSec }]}>
              Incidents
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.layerBtn, layer === 'heatmap' && { backgroundColor: COLORS.orange }]}
            onPress={() => { setMapReady(false); setLayer('heatmap'); }}
          >
            <Ionicons name="analytics" size={14} color={layer === 'heatmap' ? COLORS.white : textSec} />
            <Text style={[styles.layerBtnText, { color: layer === 'heatmap' ? COLORS.white : textSec }]}>
              Risk Heatmap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Year filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingTop: 8 }}
        >
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              style={[
                styles.yearBtn,
                {
                  backgroundColor: yearFilter === y ? COLORS.navy : isDark ? COLORS.navyLight : COLORS.offWhite,
                  borderColor: yearFilter === y ? COLORS.navy : borderColor,
                },
              ]}
              onPress={() => { setMapReady(false); setYearFilter(y); }}
            >
              <Text style={[styles.yearBtnText, { color: yearFilter === y ? COLORS.white : textSec }]}>
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={{ flex: 1 }}>
        <WebView
          key={`${layer}-${yearFilter}`}
          source={{ html: buildBFPMapHTML(layer, yearFilter) }}
          style={{ flex: 1 }}
          onLoad={() => setMapReady(true)}
          javaScriptEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />
        {!mapReady && (
          <View style={[styles.mapLoader, { backgroundColor: isDark ? COLORS.navy : COLORS.offWhite }]}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={[styles.mapLoaderText, { color: textSec }]}>Loading map...</Text>
          </View>
        )}
      </View>

      {/* Stats panel */}
      <View style={[styles.statsPanel, { backgroundColor: card, borderTopColor: borderColor }]}>
        <View style={styles.statsPanelHandle} />
        <View style={styles.statsRow}>
          <StatItem value="5" label="Total Incidents" color={COLORS.red} />
          <StatItem value="2" label="Active" color={COLORS.orange} />
          <StatItem value="3" label="Resolved" color={COLORS.green} />
          <StatItem value="5" label="Risk Zones" color={COLORS.yellow} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(39,174,96,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.4)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  liveText: { color: COLORS.green, fontSize: 11, fontWeight: '700' },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  layerRow: { flexDirection: 'row', gap: 8 },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  layerBtnText: { fontSize: 13, fontWeight: '700' },
  yearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  yearBtnText: { fontSize: 12, fontWeight: '600' },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mapLoaderText: { fontSize: 14 },
  statsPanel: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  statsPanelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
});