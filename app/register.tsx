import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

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
  border: '#E2E8F0',
  borderDark: '#243B55',
};

type Step = 'personal' | 'account';

interface FormState {
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<Step>('personal');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    mobile: '',
    address: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;
  const inputBg = isDark ? COLORS.navyLight : COLORS.white;

  const set = (key: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validatePersonal = () => {
    if (!form.firstName || !form.lastName || !form.mobile || !form.address) {
      setError('Please fill in all fields.');
      return false;
    }
    const cleanMobile = form.mobile.replace(/\s|-/g, '');
    if (!/^(09|\+639)\d{9}$/.test(cleanMobile)) {
      setError('Enter a valid Philippine mobile number (e.g. 09XX XXX XXXX).');
      return false;
    }
    setError('');
    return true;
  };

  const validateAccount = () => {
    if (!form.email || !form.username || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return false;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validatePersonal()) return;
    setStep('account');
  };

  const handleRegister = async () => {
    if (!validateAccount()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 'personal' ? router.back() : setStep('personal'))}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>
            {step === 'personal'
              ? 'Step 1 of 2 — Personal information'
              : 'Step 2 of 2 — Account details'}
          </Text>
        </View>
        {/* Mini logo */}
        <View style={styles.headerLogo}>
          <Ionicons name="flame" size={18} color={COLORS.orange} />
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
        <View style={[styles.progressFill, { width: step === 'personal' ? '50%' : '100%' }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicators */}
        <View style={styles.stepRow}>
          <StepDot
            number={1}
            label="Personal info"
            active={step === 'personal'}
            done={step === 'account'}
            isDark={isDark}
          />
          <View style={[styles.stepLine, { backgroundColor: step === 'account' ? COLORS.orange : borderColor }]} />
          <StepDot
            number={2}
            label="Account details"
            active={step === 'account'}
            done={false}
            isDark={isDark}
          />
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#2D1515' : '#FFF5F5', borderColor: isDark ? '#5C2020' : '#FECACA' }]}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── STEP 1: Personal ── */}
        {step === 'personal' && (
          <View style={[styles.card, { backgroundColor: card, borderColor }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: COLORS.orange + '20' }]}>
                <Ionicons name="person-outline" size={22} color={COLORS.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Personal information</Text>
                <Text style={[styles.cardSub, { color: textSec }]}>
                  Used to identify you in fire reports.
                </Text>
              </View>
            </View>

            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="First name" textSec={textSec} />
                <InputWrap
                  icon="person-outline"
                  placeholder="Juan"
                  value={form.firstName}
                  onChangeText={set('firstName')}
                  inputBg={inputBg}
                  borderColor={borderColor}
                  textPrimary={textPrimary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Last name" textSec={textSec} />
                <InputWrap
                  icon="person-outline"
                  placeholder="dela Cruz"
                  value={form.lastName}
                  onChangeText={set('lastName')}
                  inputBg={inputBg}
                  borderColor={borderColor}
                  textPrimary={textPrimary}
                />
              </View>
            </View>

            <FieldLabel label="Mobile number" textSec={textSec} />
            <InputWrap
              icon="call-outline"
              placeholder="09XX XXX XXXX"
              value={form.mobile}
              onChangeText={set('mobile')}
              keyboardType="phone-pad"
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <FieldLabel label="Home address" textSec={textSec} />
            <InputWrap
              icon="location-outline"
              placeholder="Brgy. Lian Poblacion, Lian, Batangas"
              value={form.address}
              onChangeText={set('address')}
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>Next — Account details</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2: Account ── */}
        {step === 'account' && (
          <View style={[styles.card, { backgroundColor: card, borderColor }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconWrap, { backgroundColor: COLORS.navy + '22' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={isDark ? COLORS.white : COLORS.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: textPrimary }]}>Account details</Text>
                <Text style={[styles.cardSub, { color: textSec }]}>
                  You'll use these to sign in to FireSight.
                </Text>
              </View>
            </View>

            {/* Summary of personal info */}
            <View style={[styles.summaryBanner, { backgroundColor: isDark ? COLORS.navyLight : '#F0F6FF', borderColor: isDark ? COLORS.borderDark : '#BFDBFE' }]}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
              <Text style={[styles.summaryText, { color: textSec }]}>
                {form.firstName} {form.lastName} · {form.mobile}
              </Text>
              <TouchableOpacity onPress={() => setStep('personal')}>
                <Text style={[styles.summaryEdit, { color: COLORS.orange }]}>Edit</Text>
              </TouchableOpacity>
            </View>

            <FieldLabel label="Email address" textSec={textSec} />
            <InputWrap
              icon="mail-outline"
              placeholder="yourname@email.com"
              value={form.email}
              onChangeText={set('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <FieldLabel label="Username" textSec={textSec} />
            <InputWrap
              icon="at-outline"
              placeholder="juandelacruz"
              value={form.username}
              onChangeText={set('username')}
              autoCapitalize="none"
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <FieldLabel label="Password" textSec={textSec} />
            <InputWrap
              icon="lock-closed-outline"
              placeholder="At least 8 characters"
              value={form.password}
              onChangeText={set('password')}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              rightIcon={
                <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              }
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <FieldLabel label="Confirm password" textSec={textSec} />
            <InputWrap
              icon="lock-closed-outline"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              }
              inputBg={inputBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: COLORS.green }, loading && { opacity: 0.75 }]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>Create account</Text>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: textSec }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={[styles.loginLink, { color: COLORS.red }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────

function FieldLabel({ label, textSec }: { label: string; textSec: string }) {
  return (
    <Text style={[styles.label, { color: textSec }]}>{label}</Text>
  );
}

function InputWrap({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  rightIcon,
  inputBg,
  borderColor,
  textPrimary,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  autoCapitalize?: any;
  rightIcon?: React.ReactNode;
  inputBg: string;
  borderColor: string;
  textPrimary: string;
}) {
  return (
    <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
      <Ionicons name={icon} size={18} color={COLORS.textMuted} />
      <TextInput
        style={[styles.input, { color: textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {rightIcon}
    </View>
  );
}

function StepDot({
  number,
  label,
  active,
  done,
  isDark,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
  isDark: boolean;
}) {
  const bgColor = done
    ? COLORS.green
    : active
    ? COLORS.orange
    : isDark
    ? COLORS.navyLight
    : '#E2E8F0';
  const textColor = done || active ? COLORS.white : COLORS.textMuted;
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={[styles.stepDot, { backgroundColor: bgColor }]}>
        {done ? (
          <Ionicons name="checkmark" size={13} color={COLORS.white} />
        ) : (
          <Text style={[styles.stepDotText, { color: textColor }]}>{number}</Text>
        )}
      </View>
      <Text style={{ fontSize: 10, color: active ? COLORS.orange : COLORS.textMuted, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: { height: 3 },
  progressFill: { height: 3, backgroundColor: COLORS.orange },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 0,
  },
  stepLine: { width: 60, height: 2, marginHorizontal: 8, marginBottom: 18 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { fontSize: 13, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.red, fontSize: 13, flex: 1 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    marginBottom: 20,
    gap: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  cardSub: { fontSize: 12, lineHeight: 18 },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  summaryText: { flex: 1, fontSize: 13 },
  summaryEdit: { fontSize: 13, fontWeight: '700' },
  nameRow: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 2,
  },
  input: { flex: 1, fontSize: 15 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  nextBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '700' },
});