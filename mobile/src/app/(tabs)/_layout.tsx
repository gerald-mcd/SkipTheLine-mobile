import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Home, Map, Compass, Trophy } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle, Line } from 'react-native-svg'

// PeopleSkipGlyph: two stick figures with a curved skip arrow
function PeopleSkipGlyph({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Person 1 (left) */}
      <Circle cx={6} cy={4.5} r={2} stroke={color} strokeWidth={1.8} />
      <Line x1={6} y1={6.5} x2={6} y2={13} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={6} y1={9} x2={3.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={6} y1={9} x2={8.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={6} y1={13} x2={4} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={6} y1={13} x2={8} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      {/* Person 2 (right) */}
      <Circle cx={16} cy={4.5} r={2} stroke={color} strokeWidth={1.8} />
      <Line x1={16} y1={6.5} x2={16} y2={13} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={9} x2={13.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={9} x2={18.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={13} x2={14} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={13} x2={18} y2={18} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      {/* Skip arrow over the top */}
      <Path
        d="M 9 2 Q 11 -1 13 2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 11.5 0.5 L 13 2 L 11 3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}

function ReportTabButton(_props: object) {
  const router = useRouter()
  return (
    <Pressable
      testID="tab-report-fab"
      style={styles.fabWrapper}
      onPress={() => router.push('/(tabs)/report')}
    >
      <View style={styles.fabBorder}>
        <LinearGradient
          colors={['#F2934D', '#E07A3B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <PeopleSkipGlyph size={24} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <Text style={styles.fabLabel}>Report</Text>
    </Pressable>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E07A3B',
        tabBarInactiveTintColor: '#857565',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Map size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: '',
          tabBarButton: () => <ReportTabButton />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Hide legacy tab */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EDE6DD',
    borderTopWidth: 1,
    height: 84,
    paddingBottom: 18,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  fabBorder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    padding: 3,
    shadowColor: '#E07A3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  fab: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#E07A3B',
    marginTop: 4,
  },
})
