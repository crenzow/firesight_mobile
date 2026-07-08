import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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
  yellow: '#F39C12',
};

// Mock fire incident data for Lian, Batangas area
const FIRE_INCIDENTS = [
  {
    id: 'INC-001',
    lat: 14.0442,
    lng: 120.6270,
    level: 'high',
    location: 'Brgy. Lian Poblacion',
    date: 'June 10, 2025',
    status: 'Resolved',
    description: 'Residential fire, 2-storey house',
  },
  {
    id: 'INC-002',
    lat: 14.0398,
    lng: 120.6215,
    level: 'medium',
    location: 'Sitio Masaya',
    date: 'April 2, 2025',
    status: 'Resolved',
    description: 'Grass fire near road',
  },
  {
    id: 'INC-003',
    lat: 14.0510,
    lng: 120.6310,
    level: 'high',
    location: 'Brgy. Hall area',
    date: 'January 17, 2025',
    status: 'Closed',
    description: 'Commercial building fire',
  },
  {
    id: 'INC-004',
    lat: 14.0365,
    lng: 120.6180,
    level: 'low',
    location: 'Sitio Dagatan',
    date: 'March 5, 2025',
    status: 'Resolved',
    description: 'Minor kitchen fire',
  },
  {
    id: 'INC-005',
    lat: 14.0480,
    lng: 120.6350,
    level: 'medium',
    location: 'Near public market',
    date: 'May 22, 2025',
    status: 'Resolved',
    description: 'Electrical fire, market stall',
  },
];

// Risk zones for heatmap
const RISK_ZONES = [
  { lat: 14.0442, lng: 120.6270, intensity: 0.9, radius: 200 },
  { lat: 14.0398, lng: 120.6215, intensity: 0.6, radius: 150 },
  { lat: 14.0510, lng: 120.6310, intensity: 0.85, radius: 180 },
  { lat: 14.0365, lng: 120.6180, intensity: 0.4, radius: 120 },
  { lat: 14.0480, lng: 120.6350, intensity: 0.7, radius: 160 },
];

type MapLayer = 'incidents' | 'heatmap';
type MapViewType = 'standard' | 'satellite' | 'terrain';

function buildMapHTML(
  incidents: typeof FIRE_INCIDENTS,
  riskZones: typeof RISK_ZONES,
  layer: MapLayer,
  viewType: MapViewType
): string {
  // Use standard mapping urls with untouched natural map color definitions
  let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let attribution = '&copy; OpenStreetMap contributors';

  if (viewType === 'satellite') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
  } else if (viewType === 'terrain') {
    tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap';
  }

  const incidentMarkers = incidents
    .map((inc) => {
      const color =
        inc.level === 'high' ? '#C0392B' : inc.level === 'medium' ? '#E8590C' : '#F39C12';
      return `
        var marker${inc.id.replace('-', '')} = L.circleMarker([${inc.lat}, ${inc.lng}], {
          radius: ${inc.level === 'high' ? 14 : inc.level === 'medium' ? 11 : 9},
          fillColor: '${color}',
          color: '#fff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.92
        }).addTo(map);
        marker${inc.id.replace('-', '')}.bindPopup(\`
          <div style="font-family:sans-serif;min-width:180px">
            <div style="background:${color};color:#fff;padding:8px 12px;margin:-8px -12px 10px;border-radius:6px 6px 0 0;font-weight:700;font-size:13px">${inc.id} · ${inc.level.toUpperCase()}</div>
            <b style="font-size:14px">${inc.location}</b><br>
            <span style="color:#666;font-size:12px">${inc.description}</span><br><br>
            <span style="font-size:11px;color:#888">${inc.date}</span>
            <span style="float:right;font-size:11px;background:#e8f5e9;color:#27AE60;padding:2px 8px;border-radius:10px;font-weight:600">${inc.status}</span>
          </div>
        \`, { maxWidth: 240 });
      `;
    })
    .join('\n');

  const heatCircles = riskZones
    .map((z, i) => {
      const alpha = z.intensity * 0.55;
      const color =
        z.intensity > 0.75
          ? `rgba(192,57,43,${alpha})`
          : z.intensity > 0.5
          ? `rgba(232,89,12,${alpha})`
          : `rgba(243,156,18,${alpha})`;
      return `
        L.circle([${z.lat}, ${z.lng}], {
          radius: ${z.radius},
          fillColor: '${color}',
          color: 'transparent',
          fillOpacity: ${z.intensity * 0.6}
        }).addTo(map);
        L.circle([${z.lat}, ${z.lng}], {
          radius: ${z.radius * 0.5},
          fillColor: '${color}',
          color: 'transparent',
          fillOpacity: ${z.intensity * 0.45}
        }).addTo(map);
      `;
    })
    .join('\n');

  const bfpMarker = `
    var bfpIcon = L.divIcon({
      html: '<div style="background:#0A1628;border:3px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:14px">🚒</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: ''
    });
    L.marker([14.0442, 120.6260], { icon: bfpIcon })
      .addTo(map)
      .bindPopup('<b>BFP Lian Fire Station</b><br><span style="color:#666;font-size:12px">Emergency: (043) 123-4567</span>');
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #F0F2F5; }
    /* Manual color filters completely removed here so colors remain natural and clean */
    .leaflet-popup-content-wrapper { border-radius: 10px; overflow: hidden; padding: 0; }
    .leaflet-popup-content { margin: 8px 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [14.0442, 120.6270],
      zoom: 14,
      zoomControl: false, // Turned off default to keep clean viewport space
      attributionControl: false
    });

    L.tileLayer('${tileUrl}', {
      maxZoom: 18,
      attribution: '${attribution}'
    }).addTo(map);

    ${layer === 'heatmap' ? heatCircles : incidentMarkers}
    ${bfpMarker}
  </script>
</body>
</html>
  `;
}

export default function MapScreen() {
  const { isDark } = useTheme(); 
  
  const [layer, setLayer] = useState<MapLayer>('incidents');
  const [viewType, setViewType] = useState<MapViewType>('standard');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<(typeof FIRE_INCIDENTS)[0] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    })();
  }, []);

  const openIncidentSheet = (inc: (typeof FIRE_INCIDENTS)[0]) => {
    setSelectedIncident(inc);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelectedIncident(null));
  };

  const levelColor = (level: string) =>
    level === 'high' ? COLORS.red : level === 'medium' ? COLORS.orange : COLORS.yellow;

  const levelLabel = (level: string) =>
    level === 'high' ? 'High Risk' : level === 'medium' ? 'Medium' : 'Low Risk';

  // Include viewType into compilation structure
  const mapHTML = buildMapHTML(FIRE_INCIDENTS, RISK_ZONES, layer, viewType);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View>
          <Text style={styles.headerTitle}>Fire Map</Text>
          <Text style={styles.headerSub}>Lian, Batangas · Live View</Text>
        </View>
        <View style={styles.onlineDot}>
          <View style={styles.onlinePulse} />
          <Text style={styles.onlineText}>Live</Text>
        </View>
      </View>

      {/* Layer Toggle */}
      <View style={[styles.layerBar, { backgroundColor: card, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.layerBtn,
            layer === 'incidents' && { backgroundColor: COLORS.red },
          ]}
          onPress={() => { setMapReady(false); setLayer('incidents'); }}
        >
          <Ionicons
            name="flame"
            size={15}
            color={layer === 'incidents' ? COLORS.white : textSec}
          />
          <Text
            style={[
              styles.layerBtnText,
              { color: layer === 'incidents' ? COLORS.white : textSec },
            ]}
          >
            Incidents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.layerBtn,
            layer === 'heatmap' && { backgroundColor: COLORS.orange },
          ]}
          onPress={() => { setMapReady(false); setLayer('heatmap'); }}
        >
          <Ionicons
            name="analytics"
            size={15}
            color={layer === 'heatmap' ? COLORS.white : textSec}
          />
          <Text
            style={[
              styles.layerBtnText,
              { color: layer === 'heatmap' ? COLORS.white : textSec },
            ]}
          >
            Risk Heatmap
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Content View Container */}
      <View style={{ flex: 1, position: 'relative' }}>
        <WebView
          key={`${layer}-${viewType}`} // Forces precise fresh reload upon layer or view type change
          source={{ html: mapHTML }}
          style={{ flex: 1 }}
          onLoad={() => setMapReady(true)}
          javaScriptEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {!mapReady && (
          <View style={[styles.mapLoader, { backgroundColor: isDark ? COLORS.navy : COLORS.offWhite }]}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={[styles.mapLoaderText, { color: textSec }]}>Loading map view...</Text>
          </View>
        )}

        {/* Dynamic Map Layers Side Button Menu */}
        <View style={styles.sideButtonsContainer}>
          <TouchableOpacity 
            style={[styles.sideActionButton, { backgroundColor: card, borderColor }]}
            onPress={() => setShowViewMenu(!showViewMenu)}
          >
            <Ionicons name="layers" size={20} color={textPrimary} />
          </TouchableOpacity>

          {showViewMenu && (
            <View style={[styles.viewTypeDropdown, { backgroundColor: card, borderColor }]}>
              <TouchableOpacity 
                style={[styles.viewTypeItem, viewType === 'standard' && styles.viewTypeItemActive]}
                onPress={() => { setMapReady(false); setViewType('standard'); setShowViewMenu(false); }}
              >
                <Ionicons name="map-outline" size={16} color={viewType === 'standard' ? COLORS.white : textPrimary} />
                <Text style={[styles.viewTypeItemText, { color: viewType === 'standard' ? COLORS.white : textPrimary }]}>Street</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.viewTypeItem, viewType === 'satellite' && styles.viewTypeItemActive]}
                onPress={() => { setMapReady(false); setViewType('satellite'); setShowViewMenu(false); }}
              >
                <Ionicons name="earth" size={16} color={viewType === 'satellite' ? COLORS.white : textPrimary} />
                <Text style={[styles.viewTypeItemText, { color: viewType === 'satellite' ? COLORS.white : textPrimary }]}>Satellite</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.viewTypeItem, viewType === 'terrain' && styles.viewTypeItemActive]}
                onPress={() => { setMapReady(false); setViewType('terrain'); setShowViewMenu(false); }}
              >
                <Ionicons name="git-branch-outline" size={16} color={viewType === 'terrain' ? COLORS.white : textPrimary} />
                <Text style={[styles.viewTypeItemText, { color: viewType === 'terrain' ? COLORS.white : textPrimary }]}>Terrain</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: card + 'EE', borderColor }]}>
          {layer === 'incidents' ? (
            <>
              <LegendDot color={COLORS.red} label="High" />
              <LegendDot color={COLORS.orange} label="Medium" />
              <LegendDot color={COLORS.yellow} label="Low" />
              <LegendDot color={COLORS.navy} label="BFP Station" emoji="🚒" />
            </>
          ) : (
            <>
              <LegendDot color={COLORS.red} label="High Risk" />
              <LegendDot color={COLORS.orange} label="Moderate" />
              <LegendDot color={COLORS.yellow} label="Low Risk" />
            </>
          )}
        </View>
      </View>

      {/* Incidents List */}
      {layer === 'incidents' && (
        <View style={[styles.incidentPanel, { backgroundColor: card, borderTopColor: borderColor }]}>
          <View style={styles.incidentPanelHandle} />
          <Text style={[styles.incidentPanelTitle, { color: textPrimary }]}>
            Recent Incidents · {FIRE_INCIDENTS.length}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
          >
            {FIRE_INCIDENTS.map((inc) => (
              <TouchableOpacity
                key={inc.id}
                style={[styles.incidentChip, { backgroundColor: bg, borderColor }]}
                onPress={() => openIncidentSheet(inc)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.incidentChipDot,
                    { backgroundColor: levelColor(inc.level) },
                  ]}
                />
                <View>
                  <Text style={[styles.incidentChipId, { color: textPrimary }]}>{inc.id}</Text>
                  <Text style={[styles.incidentChipLoc, { color: textSec }]} numberOfLines={1}>
                    {inc.location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Heatmap Legend Panel */}
      {layer === 'heatmap' && (
        <View style={[styles.heatPanel, { backgroundColor: card, borderTopColor: borderColor }]}>
          <View style={styles.incidentPanelHandle} />
          <Text style={[styles.incidentPanelTitle, { color: textPrimary }]}>
            Fire Risk Prediction
          </Text>
          <Text style={[styles.heatSubtitle, { color: textSec }]}>
            Based on XGBoost model · Historical data from BFP Lian
          </Text>
          <View style={styles.heatGradientRow}>
            <Text style={[styles.heatGradientLabel, { color: textSec }]}>Low</Text>
            <View style={styles.heatGradientBar}>
              <View style={{ flex: 1, backgroundColor: COLORS.yellow }} />
              <View style={{ flex: 1, backgroundColor: COLORS.orange }} />
              <View style={{ flex: 1, backgroundColor: COLORS.red }} />
            </View>
            <Text style={[styles.heatGradientLabel, { color: textSec }]}>High</Text>
          </View>
          <View style={styles.riskStatsRow}>
            <RiskStat label="High Risk Zones" value="2" color={COLORS.red} />
            <RiskStat label="Moderate Zones" value="2" color={COLORS.orange} />
            <RiskStat label="Low Risk Zones" value="1" color={COLORS.yellow} />
          </View>
        </View>
      )}

      {/* Incident Detail Bottom Sheet */}
      {selectedIncident && (
        <>
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={closeSheet}
          />
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: card, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetId, { color: textSec }]}>{selectedIncident.id}</Text>
                <Text style={[styles.sheetLocation, { color: textPrimary }]}>
                  {selectedIncident.location}
                </Text>
              </View>
              <View
                style={[
                  styles.sheetLevelBadge,
                  { backgroundColor: levelColor(selectedIncident.level) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.sheetLevelText,
                    { color: levelColor(selectedIncident.level) },
                  ]}
                >
                  {levelLabel(selectedIncident.level)}
                </Text>
              </View>
            </View>

            <View style={[styles.sheetDivider, { backgroundColor: borderColor }]} />

            <SheetRow icon="document-text-outline" label="Description" value={selectedIncident.description} textPrimary={textPrimary} textSec={textSec} />
            <SheetRow icon="calendar-outline" label="Date" value={selectedIncident.date} textPrimary={textPrimary} textSec={textSec} />
            <SheetRow
              icon="checkmark-circle-outline"
              label="Status"
              value={selectedIncident.status}
              textPrimary={COLORS.green}
              textSec={textSec}
            />
            <SheetRow
              icon="location-outline"
              label="Coordinates"
              value={`${selectedIncident.lat}, ${selectedIncident.lng}`}
              textPrimary={textPrimary}
              textSec={textSec}
            />

            <TouchableOpacity style={styles.sheetCloseBtn} onPress={closeSheet}>
              <Text style={styles.sheetCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

function LegendDot({
  color,
  label,
  emoji,
}: {
  color: string;
  label: string;
  emoji?: string;
}) {
  return (
    <View style={styles.legendItem}>
      {emoji ? (
        <Text style={{ fontSize: 11 }}>{emoji}</Text>
      ) : (
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      )}
      <Text style={[styles.legendLabel, { color: '#888' }]}>{label}</Text>
    </View>
  );
}

function RiskStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.riskStat}>
      <Text style={[styles.riskStatValue, { color }]}>{value}</Text>
      <Text style={[styles.riskStatLabel, { color: '#888' }]}>{label}</Text>
    </View>
  );
}

function SheetRow({
  icon,
  label,
  value,
  textPrimary,
  textSec,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  textPrimary: string;
  textSec: string;
}) {
  return (
    <View style={styles.sheetRow}>
      <Ionicons name={icon} size={16} color={textSec} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.sheetRowLabel, { color: textSec }]}>{label}</Text>
        <Text style={[styles.sheetRowValue, { color: textPrimary }]}>{value}</Text>
      </View>
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
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  onlineDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(39,174,96,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.4)',
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  onlineText: { color: COLORS.green, fontSize: 12, fontWeight: '700' },
  layerBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  layerBtnText: { fontSize: 13, fontWeight: '700' },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  mapLoaderText: { fontSize: 14 },
  sideButtonsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 5,
  },
  sideActionButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  viewTypeDropdown: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    gap: 4,
    minWidth: 110,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  viewTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewTypeItemActive: {
    backgroundColor: COLORS.red,
  },
  viewTypeItemText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: width * 0.6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: 10, fontWeight: '600' },
  incidentPanel: {
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  incidentPanelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 10,
  },
  incidentPanelTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  incidentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
  },
  incidentChipDot: { width: 10, height: 10, borderRadius: 5 },
  incidentChipId: { fontSize: 12, fontWeight: '700' },
  incidentChipLoc: { fontSize: 11, marginTop: 2 },
  heatPanel: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  heatSubtitle: { fontSize: 12, marginTop: 2, marginBottom: 12 },
  heatGradientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  heatGradientBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  heatGradientLabel: { fontSize: 11, fontWeight: '600' },
  riskStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  riskStat: { alignItems: 'center', gap: 4 },
  riskStatValue: { fontSize: 22, fontWeight: '800' },
  riskStatLabel: { fontSize: 11, textAlign: 'center' },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetId: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  sheetLocation: { fontSize: 18, fontWeight: '700' },
  sheetLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sheetLevelText: { fontSize: 12, fontWeight: '700' },
  sheetDivider: { height: 1, marginBottom: 16 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sheetRowLabel: { fontSize: 11, marginBottom: 2 },
  sheetRowValue: { fontSize: 14, fontWeight: '600' },
  sheetCloseBtn: {
    marginTop: 8,
    backgroundColor: COLORS.navy,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sheetCloseBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});