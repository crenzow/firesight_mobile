import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';

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

type Step = 'camera' | 'summary' | 'submitted';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MOCK_USER = {
  name: 'Juan dela Cruz',
  contact: '+63 917 123 4567',
  accountId: 'FS-LN-00142',
};

// ── CaptureStep helper ────────────────────────────────────────
function CaptureStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View
        style={[
          captureStepStyles.dot,
          done && { backgroundColor: COLORS.green },
          active && { backgroundColor: COLORS.orange },
        ]}
      >
        {done ? (
          <Ionicons name="checkmark" size={10} color={COLORS.white} />
        ) : (
          <View style={captureStepStyles.dotInner} />
        )}
      </View>
      <Text style={captureStepStyles.label}>{label}</Text>
    </View>
  );
}

const captureStepStyles = StyleSheet.create({
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
});

// ── InfoRow helper ────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  textPrimary,
  textSec,
  accent,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  textPrimary: string;
  textSec: string;
  accent?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: '#E2E8F020' }]}>
      <Ionicons name={icon} size={16} color={accent ?? COLORS.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: textSec }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: accent ?? textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function EmergencyCameraModal({ visible, onClose }: Props) {
  const { isDark } = useTheme();

  const [step, setStep] = useState<Step>('camera');
  const [capturing, setCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [locationText, setLocationText] = useState('');
  const [description, setDescription] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accurate: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const locationRef = useRef<{ lat: number; lng: number; accurate: boolean } | null>(null);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  // ── Modal open/close effect ───────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep('camera');
      setCapturedPhoto(null);
      setDescription('');
      setLocationText('');
      setGpsCoords(null);
      setCaptureStatus('');
      locationRef.current = null;

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      // Pre-fetch GPS in background as soon as modal opens
      Location.getForegroundPermissionsAsync().then(({ status }) => {
        if (status !== 'granted') return;

        // Stage 1 — rough fix fast (cell/wifi)
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        }).then((loc) => {
          if (!locationRef.current) {
            locationRef.current = {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              accurate: false,
            };
          }
        }).catch(() => {});

        // Stage 2 — accurate GPS fix, overwrites Stage 1 when ready
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).then((loc) => {
          locationRef.current = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accurate: true,
          };
        }).catch(() => {});
      });
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // ── Helpers ───────────────────────────────────────────────
  const doFlashAnimation = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleCapture = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera Required', 'Please allow camera access to report a fire.');
        return;
      }
    }

    if (!locationPermission?.granted) {
      const res = await requestLocationPermission();
      if (!res.granted) {
        Alert.alert('Location Required', 'Location is needed to attach GPS to your report.');
        return;
      }
    }

    try {
      setCapturing(true);
      setCaptureStatus('Taking photo...');
      doFlashAnimation();

      // Step 1 — take photo immediately
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.4,
        skipProcessing: true,
      });

      // Step 2 — wait for accurate GPS
      setCaptureStatus('Locking GPS location...');

      let coords: { lat: number; lng: number; accurate: boolean };

      if (locationRef.current?.accurate) {
        // Stage 2 pre-fetch already resolved — use it instantly
        coords = locationRef.current;
      } else {
        // Wait for accurate fix with 10s timeout
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
        ]);

        if (loc) {
          coords = {
            lat: (loc as Location.LocationObject).coords.latitude,
            lng: (loc as Location.LocationObject).coords.longitude,
            accurate: true,
          };
        } else {
          // Timeout — use Stage 1 rough fix as fallback
          coords = locationRef.current ?? { lat: 0, lng: 0, accurate: false };
        }
      }

      setCaptureStatus('Preparing report...');
      await new Promise((r) => setTimeout(r, 300));

      setCapturedPhoto(photo?.uri ?? 'captured');
      setGpsCoords(coords);
      setCapturing(false);
      setCaptureStatus('');
      setStep('summary');
    } catch {
      setCapturing(false);
      setCaptureStatus('');
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setGpsCoords(null);
    setStep('camera');
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSending(false);
    setStep('submitted');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('camera');
      setCapturedPhoto(null);
      setDescription('');
      setLocationText('');
      setGpsCoords(null);
      setCaptureStatus('');
    }, 300);
  };

  // ── STEP: Camera ──────────────────────────────────────────
  const renderCamera = () => {
    if (!permission) {
      return (
        <View style={[styles.permBox, { backgroundColor: COLORS.navy }]}>
          <ActivityIndicator color={COLORS.white} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={[styles.permBox, { backgroundColor: isDark ? COLORS.navy : COLORS.offWhite }]}>
          <Ionicons name="camera-outline" size={60} color={COLORS.textMuted} />
          <Text style={[styles.permTitle, { color: textPrimary }]}>Camera Access Needed</Text>
          <Text style={[styles.permSub, { color: textSec }]}>
            FireSight needs your camera to capture fire incident photos directly. Gallery uploads
            are not allowed to ensure report validity.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Camera — no children */}
        <CameraView
  ref={cameraRef}
  style={StyleSheet.absoluteFill}
  facing="back"
  flash={flashEnabled ? 'on' : 'off'}
  enableTorch={flashEnabled}
/>

        {/* UI overlay */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

          {/* Flash white overlay */}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: 'white', opacity: flashAnim }]}
          />

          {/* Top bar */}
          <SafeAreaView edges={['top']}>
            <View style={styles.camTopBar}>
              <TouchableOpacity onPress={handleClose} style={styles.camIconBtn}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.camTitle}>
                <Text style={styles.camTitleText}>REPORT FIRE</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFlashEnabled((v) => !v)}
                style={styles.camIconBtn}
              >
                <Ionicons
                  name={flashEnabled ? 'flash' : 'flash-off'}
                  size={22}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            {/* GPS status chip */}
            <View style={styles.gpsStatusBar} pointerEvents="none">
              <View
                style={[
                  styles.gpsChip,
                  {
                    backgroundColor: locationRef.current?.accurate
                      ? 'rgba(39,174,96,0.85)'
                      : locationRef.current
                      ? 'rgba(232,89,12,0.85)'
                      : 'rgba(0,0,0,0.55)',
                  },
                ]}
              >
                <Ionicons
                  name={locationRef.current?.accurate ? 'location' : 'location-outline'}
                  size={13}
                  color={COLORS.white}
                />
                <Text style={styles.gpsChipText}>
                  {locationRef.current?.accurate
                    ? 'GPS Ready — Accurate'
                    : locationRef.current
                    ? 'GPS Locking — Rough fix'
                    : 'Acquiring GPS...'}
                </Text>
              </View>
            </View>
          </SafeAreaView>

          {/* Viewfinder */}
          <View style={styles.viewfinderWrap} pointerEvents="none">
            <View style={styles.viewfinder}>
              <View style={[styles.vCorner, styles.vTL]} />
              <View style={[styles.vCorner, styles.vTR]} />
              <View style={[styles.vCorner, styles.vBL]} />
              <View style={[styles.vCorner, styles.vBR]} />
            </View>
            <Text style={styles.viewfinderHint}>Frame the fire incident clearly</Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.camBottomBar}>
            <View style={styles.camBottomInner}>
              <View style={styles.camHintChip}>
                <Ionicons name="ban-outline" size={14} color={COLORS.orange} />
                <Text style={styles.camHintText}>No gallery uploads</Text>
              </View>

              <TouchableOpacity
                style={[styles.captureBtn, capturing && { opacity: 0.5 }]}
                onPress={handleCapture}
                activeOpacity={0.85}
                disabled={capturing}
              >
                <View style={styles.captureBtnOuter}>
                  <View style={styles.captureBtnInner} />
                </View>
              </TouchableOpacity>

              <View style={styles.camHintChip}>
                <Ionicons name="location-outline" size={14} color={COLORS.green} />
                <Text style={styles.camHintText}>GPS auto-tagged</Text>
              </View>
            </View>
          </View>

          {/* Capturing progress overlay */}
          {capturing && (
            <View style={styles.capturingOverlay}>
              <View style={styles.capturingBox}>
                <View style={styles.capturingIconWrap}>
                  <Ionicons name="flame" size={36} color={COLORS.orange} />
                </View>
                <ActivityIndicator size="large" color={COLORS.white} />
                <Text style={styles.capturingText}>{captureStatus}</Text>
                <View style={styles.captureSteps}>
                  <CaptureStep
                    label="Photo"
                    done={captureStatus !== 'Taking photo...'}
                    active={captureStatus === 'Taking photo...'}
                  />
                  <View style={styles.captureStepLine} />
                  <CaptureStep
                    label="GPS Lock"
                    done={captureStatus === 'Preparing report...'}
                    active={captureStatus === 'Locking GPS location...'}
                  />
                  <View style={styles.captureStepLine} />
                  <CaptureStep
                    label="Ready"
                    done={false}
                    active={captureStatus === 'Preparing report...'}
                  />
                </View>
              </View>
            </View>
          )}

        </View>
      </View>
    );
  };

  // ── STEP: Summary ─────────────────────────────────────────
  const renderSummary = () => (
    <SafeAreaView style={[styles.summaryContainer, { backgroundColor: bg }]}>
      <View style={[styles.summaryHeader, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <TouchableOpacity onPress={handleRetake} style={styles.summaryBackBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.summaryHeaderTitle}>Confirm Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo preview */}
{capturedPhoto ? (
  <View style={styles.photoPreviewContainer}>
    <Image
      source={{ uri: capturedPhoto }}
      style={styles.photoPreviewImage}
      resizeMode="cover"
    />
    {/* Overlay badge */}
    <View style={styles.photoCapturedBadge}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
      <Text style={styles.photoCapturedBadgeText}>Photo Captured</Text>
    </View>
    {/* GPS accuracy badge */}
    <View
      style={[
        styles.photoGpsBadge,
        {
          backgroundColor: gpsCoords?.accurate
            ? 'rgba(39,174,96,0.85)'
            : 'rgba(232,89,12,0.85)',
        },
      ]}
    >
      <Ionicons name="location" size={12} color={COLORS.white} />
      <Text style={styles.photoGpsBadgeText}>
        {gpsCoords?.accurate ? 'GPS Accurate' : 'GPS Approximate'}
      </Text>
    </View>
  </View>
) : (
  <View style={[styles.photoPreview, { backgroundColor: isDark ? COLORS.navyLight : '#D0D8E4' }]}>
    <Ionicons name="image-outline" size={48} color={COLORS.textMuted} />
    <Text style={[styles.photoLabel, { color: textSec }]}>Photo Captured ✓</Text>
  </View>
)}

        {/* Auto-tagged info */}
        <Text style={[styles.autoTaggedLabel, { color: textSec }]}>
          AUTO-TAGGED FROM YOUR PROFILE
        </Text>
        <View style={[styles.infoCard, { backgroundColor: card, borderColor }]}>
          <InfoRow
            icon="person-outline"
            label="Name"
            value={MOCK_USER.name}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <InfoRow
            icon="call-outline"
            label="Contact"
            value={MOCK_USER.contact}
            textPrimary={textPrimary}
            textSec={textSec}
          />
          <InfoRow
            icon="location-outline"
            label="GPS Coordinates"
            value={
              gpsCoords
                ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}\n${
                    gpsCoords.accurate
                      ? '✓ High accuracy'
                      : '⚠ Approximate — move outdoors for better signal'
                  }`
                : 'Acquiring...'
            }
            textPrimary={textPrimary}
            textSec={textSec}
            accent={gpsCoords?.accurate ? COLORS.green : COLORS.orange}
            last
          />
        </View>

        {/* Optional fields */}
        <Text style={[styles.autoTaggedLabel, { color: textSec, marginTop: 20 }]}>
          ADDITIONAL DETAILS (OPTIONAL)
        </Text>
        <View style={[styles.infoCard, { backgroundColor: card, borderColor, paddingBottom: 0 }]}>
          <View style={[styles.inputRow, { borderBottomColor: borderColor }]}>
            <Ionicons name="map-outline" size={18} color={COLORS.orange} />
            <TextInput
              placeholder="Nearest landmark or address..."
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, { color: textPrimary }]}
              value={locationText}
              onChangeText={setLocationText}
            />
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="create-outline" size={18} color={COLORS.orange} />
            <TextInput
              placeholder="Additional description..."
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, { color: textPrimary }]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.retakeBtn}
          onPress={handleRetake}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={18} color={COLORS.red} />
          <Text style={styles.retakeBtnText}>Retake Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.75 }]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={COLORS.white} />
              <Text style={styles.sendBtnText}>Send Report to BFP</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── STEP: Submitted ───────────────────────────────────────
  const renderSubmitted = () => (
    <SafeAreaView style={[styles.submittedContainer, { backgroundColor: bg }]}>
      <View style={[styles.successIcon, { backgroundColor: COLORS.green + '20' }]}>
        <Ionicons name="checkmark-circle" size={72} color={COLORS.green} />
      </View>
      <Text style={[styles.successTitle, { color: textPrimary }]}>Report Sent!</Text>
      <Text style={[styles.successSub, { color: textSec }]}>
        Your fire report has been submitted to{'\n'}BFP Lian Fire Station.
      </Text>

      <View style={[styles.ticketCard, { backgroundColor: card, borderColor }]}>
        <Text style={[styles.ticketLabel, { color: textSec }]}>REPORT ID</Text>
        <Text style={[styles.ticketId, { color: COLORS.orange }]}>
          RPT-{Date.now().toString().slice(-6)}
        </Text>
        <Text style={[styles.ticketTime, { color: textSec }]}>
          {new Date().toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <Text style={[styles.successNote, { color: textSec }]}>
        BFP personnel have been notified. Stay safe and evacuate the area immediately.
      </Text>

      <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // ── Root render ───────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        {step === 'camera' && renderCamera()}
        {step === 'summary' && renderSummary()}
        {step === 'submitted' && renderSubmitted()}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  permSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  permBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  camTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  camIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camTitle: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  camTitleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  gpsStatusBar: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  gpsChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  viewfinderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  viewfinder: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  vCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: COLORS.white,
  },
  vTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  vTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  vBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  vBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  viewfinderHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  camBottomBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingBottom: 40,
    paddingTop: 20,
  },
  camBottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  camHintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  camHintText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  captureBtn: { alignItems: 'center', justifyContent: 'center' },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.red,
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturingBox: {
    backgroundColor: 'rgba(10,22,40,0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    width: 260,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  capturingIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232,89,12,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  capturingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  captureSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  captureStepLine: {
    width: 24,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  summaryContainer: { flex: 1 },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  summaryBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeaderTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  photoPreview: {
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  photoLabel: { fontSize: 14, fontWeight: '600' },
  autoTaggedLabel: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  input: { flex: 1, fontSize: 14, paddingTop: 0 },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  retakeBtnText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.red,
  },
  sendBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  submittedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 28, fontWeight: '800' },
  successSub: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  ticketCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ticketLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  ticketId: { fontSize: 26, fontWeight: '800' },
  ticketTime: { fontSize: 13 },
  successNote: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  doneBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  photoPreviewContainer: {
  height: 220,
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 20,
  position: 'relative',
},
photoPreviewImage: {
  width: '100%',
  height: '100%',
},
photoCapturedBadge: {
  position: 'absolute',
  top: 12,
  left: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  backgroundColor: 'rgba(0,0,0,0.6)',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 20,
},
photoCapturedBadgeText: {
  color: COLORS.white,
  fontSize: 11,
  fontWeight: '700',
},
photoGpsBadge: {
  position: 'absolute',
  top: 12,
  right: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 20,
},
photoGpsBadgeText: {
  color: COLORS.white,
  fontSize: 11,
  fontWeight: '700',
},
});