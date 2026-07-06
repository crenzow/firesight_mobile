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
  red: '#C0392B',
  orange: '#E8590C',
  white: '#FFFFFF',
  offWhite: '#F0F2F5',
  textMuted: '#8A99B0',
  green: '#27AE60',
  border: '#E2E8F0',
  borderDark: '#243B55',
};

export default function LoginScreen() {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;
  const inputBg = isDark ? '#243B55' : COLORS.white;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Theme toggle */}
      <TouchableOpacity
        style={[styles.themeBtn, { backgroundColor: card, borderColor }]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={18}
          color={textSec}
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Branding */}
        <View style={styles.brandArea}>
          <View style={[styles.logoWrap, { backgroundColor: COLORS.navy }]}>
            <View style={styles.logoInner}>
              <Ionicons name="flame" size={40} color={COLORS.orange} />
            </View>
          </View>
          <Text style={[styles.brandSub, { color: textSec }]}>BFP LIAN FIRE STATION</Text>
          <View style={styles.brandNameRow}>
            <Text style={[styles.brandNameFire, { color: textPrimary }]}>FIRE</Text>
            <Text style={styles.brandNameSight}>SIGHT</Text>
          </View>
          <Text style={[styles.brandTagline, { color: textSec }]}>
            Community fire safety and reporting app for Lian, Batangas
          </Text>
        </View>

        {/* Login Card */}
        <View style={[styles.card, { backgroundColor: card, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Sign in to your account</Text>
          <Text style={[styles.cardSub, { color: textSec }]}>
            Use the email and password you registered with.
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: isDark ? '#2D1515' : '#FFF5F5' }]}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: textSec }]}>Email address</Text>
            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                placeholder="yourname@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: textSec }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={[styles.input, { color: textPrimary }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: COLORS.orange }]}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { color: textSec }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.bottomLink, { color: COLORS.red }]}>Create one</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: COLORS.textMuted }]}>
          🚒 Powered by BFP Lian Fire Station
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  themeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandArea: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 36,
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(232,89,12,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandNameFire: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandNameSight: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    color: COLORS.orange,
  },
  brandTagline: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    flex: 1,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, fontSize: 15 },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bottomText: { fontSize: 14 },
  bottomLink: { fontSize: 14, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
  },
});