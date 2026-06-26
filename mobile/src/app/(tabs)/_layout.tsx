import React from 'react'
import { Tabs, useRouter } from 'expo-router'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Home, Map, Compass, Trophy } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle } from 'react-native-svg'

function PeopleSkipGlyph({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Back person */}
      <Circle cx={4} cy={8} r={2} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1.5 17c0-2.5 1.5-4 3.5-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Front person */}
      <Circle cx={9} cy={7} r={2.2} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.5 17c0-3 1.8-5 4-5s3.5 1.5 3.5 3.5V17" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Double-chevron skip */}
      <Path d="M14 8l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 8l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
          colors={['#F2934D', '#F8682B']}
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
        tabBarActiveTintColor: '#F8682B',
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
    shadowColor: '#F8682B',
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
    color: '#F8682B',
    marginTop: 4,
  },
})
