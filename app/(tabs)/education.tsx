import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  yellow: '#F39C12',
  purple: '#8E44AD',
};

type Category = 'all' | 'prevention' | 'evacuation' | 'first-aid' | 'advisory';

const CATEGORIES: { id: Category; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'prevention', label: 'Prevention', icon: 'shield-checkmark-outline' },
  { id: 'evacuation', label: 'Evacuation', icon: 'exit-outline' },
  { id: 'first-aid', label: 'First Aid', icon: 'medkit-outline' },
  { id: 'advisory', label: 'Advisories', icon: 'megaphone-outline' },
];

interface Article {
  id: string;
  category: Exclude<Category, 'all'>;
  title: string;
  summary: string;
  readTime: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  featured?: boolean;
  steps?: { title: string; desc: string }[];
  tips?: string[];
  advisory?: { date: string; source: string };
}

const ARTICLES: Article[] = [
  {
    id: 'A001',
    category: 'prevention',
    title: 'Home Fire Prevention Checklist',
    summary:
      'Simple steps every household in Lian can take to prevent fire incidents before they start.',
    readTime: '3 min read',
    icon: 'home-outline',
    color: COLORS.green,
    featured: true,
    tips: [
      'Never leave cooking unattended on the stove.',
      'Keep flammable materials away from LPG tanks.',
      'Replace old or frayed electrical wiring immediately.',
      'Do not overload electrical outlets or extension cords.',
      'Install at least one smoke detector per floor.',
      'Keep a working fire extinguisher in the kitchen.',
      'Never burn trash near structures or dry vegetation.',
      'Teach all family members where the main electrical switch is.',
    ],
  },
  {
    id: 'A002',
    category: 'evacuation',
    title: 'How to Safely Evacuate During a Fire',
    summary:
      'Follow this step-by-step guide to get your family out safely when a fire breaks out.',
    readTime: '4 min read',
    icon: 'exit-outline',
    color: COLORS.orange,
    featured: true,
    steps: [
      { title: 'Alert Everyone', desc: 'Shout "Sunog!" to alert all household members immediately. Do not waste time gathering belongings.' },
      { title: 'Stay Low', desc: 'Crawl on hands and knees below smoke level. Smoke rises — the cleanest air is near the floor.' },
      { title: 'Check Doors', desc: 'Before opening any door, feel it with the back of your hand. If hot, do not open — use another exit.' },
      { title: 'Exit Quickly', desc: 'Use your pre-planned escape route. Close doors behind you to slow fire spread but do not lock them.' },
      { title: 'Meet at Rally Point', desc: 'Gather at a pre-agreed safe spot outside, like a neighbor\'s gate or the barangay hall.' },
      { title: 'Call BFP', desc: 'Call BFP Lian at (043) 123-4567 immediately. Do not re-enter the building for any reason.' },
    ],
  },
  {
    id: 'A003',
    category: 'first-aid',
    title: 'Treating Burns: First Aid Guide',
    summary:
      'Know what to do in the first minutes after a burn injury — the right response can prevent serious damage.',
    readTime: '3 min read',
    icon: 'medkit-outline',
    color: COLORS.red,
    steps: [
      { title: 'Cool the Burn', desc: 'Run cool (not cold) water over the burn for at least 10–20 minutes. Do not use ice.' },
      { title: 'Do Not Pop Blisters', desc: 'Blisters protect against infection. Never break them intentionally.' },
      { title: 'Cover Loosely', desc: 'Cover the burn with a clean, non-fluffy material like cling wrap or a clean plastic bag.' },
      { title: 'Pain Relief', desc: 'Take paracetamol or ibuprofen for pain if available and the person is conscious and not allergic.' },
      { title: 'Seek Medical Help', desc: 'For burns larger than the victim\'s hand, or on the face/hands/genitals, go to a hospital immediately.' },
    ],
    tips: [
      'Do NOT apply toothpaste, butter, or oil on burns.',
      'Do NOT remove clothing stuck to the skin.',
      'For chemical burns, rinse with large amounts of water for 20+ minutes.',
    ],
  },
  {
    id: 'A004',
    category: 'prevention',
    title: 'LPG Tank Safety at Home',
    summary:
      'LPG tanks are one of the most common fire hazards in Filipino households. Here\'s how to handle them safely.',
    readTime: '2 min read',
    icon: 'flame-outline',
    color: COLORS.orange,
    tips: [
      'Store LPG tanks upright and in a ventilated area.',
      'Never store tanks inside enclosed rooms or cabinets.',
      'Check hoses for cracks or leaks using soapy water regularly.',
      'Turn off the valve after every use.',
      'If you smell gas, do not turn on any switches — open windows and evacuate.',
      'Buy LPG only from authorized dealers with sealed tanks.',
    ],
  },
  {
    id: 'A005',
    category: 'advisory',
    title: 'BFP Community Fire Drill — June 28, 2025',
    summary:
      'BFP Lian Fire Station will conduct a community fire drill. All residents of Brgy. Lian Poblacion are encouraged to participate.',
    readTime: '1 min read',
    icon: 'megaphone-outline',
    color: COLORS.purple,
    advisory: { date: 'June 28, 2025 · 8:00 AM', source: 'BFP Lian Fire Station' },
    tips: [
      'Venue: Lian Municipal Covered Court',
      'Time: 8:00 AM – 12:00 NN',
      'Bring: Valid ID and Barangay Clearance',
      'Free fire extinguisher demo for all participants',
      'Certificate of participation will be issued',
    ],
  },
  {
    id: 'A006',
    category: 'evacuation',
    title: 'Planning a Home Escape Route',
    summary:
      'Every household should have a clear escape plan. Learn how to map your exit routes before an emergency happens.',
    readTime: '3 min read',
    icon: 'map-outline',
    color: COLORS.navy,
    tips: [
      'Draw a floor plan of your home and mark all doors and windows.',
      'Identify two exit routes from every room if possible.',
      'Choose a safe meeting point outside — a specific tree, gate, or neighbor\'s house.',
      'Practice the escape plan with all family members, including children and elderly.',
      'Make sure windows can be opened easily; remove bars if they cannot be unlocked from inside.',
      'Keep a flashlight in every bedroom in case of power failure during a fire.',
    ],
  },
  {
    id: 'A007',
    category: 'advisory',
    title: 'Fire Prevention Month Reminder',
    summary:
      'July is Fire Prevention Month. BFP urges all residents to inspect their homes and comply with fire safety standards.',
    readTime: '1 min read',
    icon: 'alert-circle-outline',
    color: COLORS.red,
    advisory: { date: 'July 1, 2025', source: 'Bureau of Fire Protection — Region IV-A' },
    tips: [
      'Request a free home fire safety inspection from BFP Lian.',
      'Register your household in the FireSight system.',
      'Attend the free fire safety seminar at the municipal hall.',
    ],
  },
];

export default function EducationScreen() {
  const isDark = useColorScheme() === 'dark';
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const bg = isDark ? COLORS.navy : COLORS.offWhite;
  const card = isDark ? COLORS.navyMid : COLORS.white;
  const textPrimary = isDark ? COLORS.white : COLORS.navy;
  const textSec = isDark ? '#A0B0C8' : '#4A5568';
  const borderColor = isDark ? COLORS.borderDark : COLORS.border;

  const filtered =
    activeCategory === 'all'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory);

  const featured = ARTICLES.filter((a) => a.featured);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? COLORS.navyMid : COLORS.navy }]}>
        <View>
          <Text style={styles.headerTitle}>Fire Safety Hub</Text>
          <Text style={styles.headerSub}>Tips, guides & BFP advisories</Text>
        </View>
        <View style={[styles.bfpBadge]}>
          <Text style={styles.bfpBadgeText}>🚒 BFP</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Featured Banner */}
        <View style={styles.featuredSection}>
          <Text style={[styles.sectionLabel, { color: textSec }]}>FEATURED GUIDES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {featured.map((art) => (
              <TouchableOpacity
                key={art.id}
                style={[styles.featuredCard, { backgroundColor: art.color }]}
                onPress={() => setSelectedArticle(art)}
                activeOpacity={0.88}
              >
                <View style={styles.featuredIconWrap}>
                  <Ionicons name={art.icon} size={28} color={COLORS.white} />
                </View>
                <Text style={styles.featuredCategory}>
                  {art.category.toUpperCase()}
                </Text>
                <Text style={styles.featuredTitle}>{art.title}</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredReadTime}>{art.readTime}</Text>
                  <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    activeCategory === cat.id ? COLORS.red : card,
                  borderColor:
                    activeCategory === cat.id ? COLORS.red : borderColor,
                },
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={activeCategory === cat.id ? COLORS.white : textSec}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  { color: activeCategory === cat.id ? COLORS.white : textSec },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Articles List */}
        <View style={styles.articlesList}>
          {filtered.map((art, i) => (
            <TouchableOpacity
              key={art.id}
              style={[
                styles.articleCard,
                { backgroundColor: card, borderColor },
              ]}
              onPress={() => setSelectedArticle(art)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.articleIconWrap,
                  { backgroundColor: art.color + '20' },
                ]}
              >
                <Ionicons name={art.icon} size={22} color={art.color} />
              </View>
              <View style={{ flex: 1 }}>
                {art.advisory && (
                  <View style={[styles.advisoryTag, { backgroundColor: COLORS.purple + '20' }]}>
                    <Text style={[styles.advisoryTagText, { color: COLORS.purple }]}>
                      📢 Advisory
                    </Text>
                  </View>
                )}
                <Text style={[styles.articleTitle, { color: textPrimary }]}>{art.title}</Text>
                <Text style={[styles.articleSummary, { color: textSec }]} numberOfLines={2}>
                  {art.summary}
                </Text>
                <View style={styles.articleMeta}>
                  <Text style={[styles.articleReadTime, { color: COLORS.orange }]}>
                    {art.readTime}
                  </Text>
                  <View
                    style={[
                      styles.articleCatTag,
                      { backgroundColor: art.color + '18' },
                    ]}
                  >
                    <Text style={[styles.articleCatTagText, { color: art.color }]}>
                      {art.category}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={textSec} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedArticle(null)}
      >
        {selectedArticle && (
          <SafeAreaView style={[styles.modalSafe, { backgroundColor: bg }]}>
            {/* Modal Header */}
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: selectedArticle.color },
              ]}
            >
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedArticle(null)}
              >
                <Ionicons name="close" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name={selectedArticle.icon} size={32} color={COLORS.white} />
                </View>
                <Text style={styles.modalCategoryLabel}>
                  {selectedArticle.category.toUpperCase()} · {selectedArticle.readTime}
                </Text>
                <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Advisory banner */}
              {selectedArticle.advisory && (
                <View
                  style={[
                    styles.advisoryBanner,
                    { backgroundColor: COLORS.purple + '18', borderColor: COLORS.purple + '44' },
                  ]}
                >
                  <Ionicons name="megaphone" size={18} color={COLORS.purple} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.advisoryBannerSource, { color: COLORS.purple }]}>
                      {selectedArticle.advisory.source}
                    </Text>
                    <Text style={[styles.advisoryBannerDate, { color: textSec }]}>
                      {selectedArticle.advisory.date}
                    </Text>
                  </View>
                </View>
              )}

              {/* Summary */}
              <Text style={[styles.modalSummary, { color: textSec }]}>
                {selectedArticle.summary}
              </Text>

              {/* Steps */}
              {selectedArticle.steps && (
                <View style={{ marginTop: 20 }}>
                  <Text style={[styles.contentSectionTitle, { color: textPrimary }]}>
                    Step-by-Step Guide
                  </Text>
                  {selectedArticle.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View
                        style={[
                          styles.stepNumber,
                          { backgroundColor: selectedArticle.color },
                        ]}
                      >
                        <Text style={styles.stepNumberText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.stepTitle, { color: textPrimary }]}>
                          {step.title}
                        </Text>
                        <Text style={[styles.stepDesc, { color: textSec }]}>{step.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Tips */}
              {selectedArticle.tips && (
                <View style={{ marginTop: selectedArticle.steps ? 24 : 20 }}>
                  <Text style={[styles.contentSectionTitle, { color: textPrimary }]}>
                    {selectedArticle.steps ? 'Important Reminders' : 'Key Points'}
                  </Text>
                  {selectedArticle.tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View
                        style={[
                          styles.tipDot,
                          { backgroundColor: selectedArticle.color },
                        ]}
                      />
                      <Text style={[styles.tipText, { color: textPrimary }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* BFP Credit */}
              <View
                style={[
                  styles.bfpCredit,
                  { backgroundColor: card, borderColor },
                ]}
              >
                <Text style={{ fontSize: 20 }}>🚒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bfpCreditTitle, { color: textPrimary }]}>
                    BFP Lian Fire Station
                  </Text>
                  <Text style={[styles.bfpCreditSub, { color: textSec }]}>
                    For emergencies, call (043) 123-4567
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: selectedArticle.color }]}
                onPress={() => setSelectedArticle(null)}
              >
                <Text style={styles.doneBtnText}>Got it</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  bfpBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bfpBadgeText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  featuredSection: { paddingTop: 20, paddingBottom: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  featuredCard: {
    width: width * 0.68,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  featuredIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  featuredCategory: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  featuredReadTime: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  categoryRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  articlesList: { paddingHorizontal: 16, gap: 10 },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  articleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  advisoryTagText: { fontSize: 10, fontWeight: '700' },
  articleTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3, lineHeight: 20 },
  articleSummary: { fontSize: 12, lineHeight: 18 },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  articleReadTime: { fontSize: 11, fontWeight: '600' },
  articleCatTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  articleCatTagText: { fontSize: 10, fontWeight: '700' },
  modalSafe: { flex: 1 },
  modalHeader: {
    paddingBottom: 28,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginBottom: 8,
  },
  modalHeaderContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalCategoryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  advisoryBannerSource: { fontSize: 13, fontWeight: '700' },
  advisoryBannerDate: { fontSize: 12, marginTop: 2 },
  modalSummary: { fontSize: 15, lineHeight: 24 },
  contentSectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  stepTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  stepDesc: { fontSize: 13, lineHeight: 20 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: { fontSize: 14, lineHeight: 22, flex: 1 },
  bfpCredit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 28,
    marginBottom: 16,
  },
  bfpCreditTitle: { fontSize: 14, fontWeight: '700' },
  bfpCreditSub: { fontSize: 12, marginTop: 2 },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});