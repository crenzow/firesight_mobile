import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const COLORS = {
  navy: '#0A1628',
  navyMid: '#1A2E4A',
  navyLight: '#243B55',
  red: '#C0392B',
  orange: '#E8590C',
  white: '#FFFFFF',
  offWhite: '#F0F2F5',
  textMuted: '#8A99B0',
};

export default function SplashScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  // Animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnTranslate = useRef(new Animated.Value(40)).current;
  const badgesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // App name slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // Tagline + badges
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(badgesOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Button appears
      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(btnTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.bg}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <View style={styles.content}>
        {/* Top section — Logo */}
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.logoWrap,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <View style={styles.logoOuter}>
  <Image
    source={require('../assets/images/transparent-logo.png')}
    style={styles.logoImage}
    resizeMode="contain"
  />
</View>
          </Animated.View>

          {/* App Name */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textTranslate }],
              alignItems: 'center',
              marginTop: 28,
            }}
          >
            <Text style={styles.bfpLabel}>BFP LIAN FIRE STATION</Text>
            <View style={styles.appNameRow}>
              <Text style={styles.appNameFire}>FIRE</Text>
              <Text style={styles.appNameSight}>SIGHT</Text>
            </View>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={{
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslate }],
              alignItems: 'center',
              marginTop: 14,
            }}
          >
            <Text style={styles.tagline}>
              Community fire safety and reporting app
            </Text>
            <Text style={styles.taglineSub}>for Lian, Batangas</Text>
          </Animated.View>

          {/* Feature badges */}
          <Animated.View style={[styles.badgesRow, { opacity: badgesOpacity }]}>
            <FeatureBadge icon="location-outline" label="GPS Reporting" />
            <FeatureBadge icon="map-outline" label="Fire Map" />
            <FeatureBadge icon="shield-checkmark-outline" label="BFP Alerts" />
          </Animated.View>
        </View>

        {/* Bottom section — CTA */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: btnOpacity,
              transform: [{ translateY: btnTranslate }],
            },
          ]}
        >
          {/* Divider line */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>for registered residents</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Get Started button */}
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.88}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.getStartedArrow}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.orange} />
            </View>
          </TouchableOpacity>

          {/* Already have account */}
          <TouchableOpacity
            style={styles.loginLinkBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Powered by Bureau of Fire Protection — Region IV-A
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function FeatureBadge({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={14} color={COLORS.orange} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.navy,
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.navyMid,
    top: -120,
    right: -100,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.navyLight,
    bottom: 60,
    left: -80,
    opacity: 0.4,
  },
  circle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.red,
    top: height * 0.35,
    right: -60,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
  },
  topSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: COLORS.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoInner: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(232,89,12,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bfpLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNameFire: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1,
  },
  appNameSight: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.orange,
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  taglineSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    gap: 0,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 14,
    gap: 12,
  },
  getStartedText: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  getStartedArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232,89,12,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: COLORS.orange,
    fontWeight: '700',
  },
  footer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  logoImage: {
  width: 96,
  height: 96,
},
});