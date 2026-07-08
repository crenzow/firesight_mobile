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

export default function LoginScreen() {
  const { isDark } = useTheme();
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
  const inputBg = isDark ? COLORS.navyLight : COLORS.white;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>

      {/* Navy Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBrand}>
            <Ionicons name="flame" size={18} color={COLORS.orange} />
            <Text style={styles.headerAppName}>FireSight</Text>
          </View>
          <Text style={styles.headerSub}>Sign in to your account</Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <View style={styles.titleArea}>
          <Text style={[styles.pageTitle, { color: textPrimary }]}>Welcome</Text>
          <Text style={[styles.pageSubtitle, { color: textSec }]}>
            Use the email and password you registered with.
          </Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: card, borderColor }]}>

          {/* Error */}
          {error ? (
            <View style={[
              styles.errorBox,
              { backgroundColor: isDark ? '#2D1515' : '#FFF5F5' },
            ]}>
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

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: COLORS.orange }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: textSec }]}>New here? </Text>
          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={[styles.registerLink, { color: COLORS.red }]}>
              Create account
            </Text>
          </TouchableOpacity>
        </View>

        {/* BFP footer */}
        <Text style={[styles.footer, { color: COLORS.textMuted }]}>
          🚒 Powered by BFP Lian Fire Station
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  titleArea: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 24,
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
  fieldGroup: { marginBottom: 18 },
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
    marginTop: -6,
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
  },
});