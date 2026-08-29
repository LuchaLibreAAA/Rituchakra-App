import { Tabs } from 'expo-router';
import { Home, LineChart, Map, Database, MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../src/theme/tokens';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: tokens.colors.primary,
      tabBarInactiveTintColor: tokens.colors.text.secondary,
      tabBarStyle: {
        backgroundColor: tokens.colors.card,
        borderTopWidth: 1,
        borderTopColor: tokens.colors.borders.default,
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          headerShown: false,
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          headerShown: false,
          tabBarIcon: ({ color }) => <LineChart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: t('maps'),
          headerShown: false,
          tabBarIcon: ({ color }) => <Map color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: t('data'),
          headerShown: false,
          tabBarIcon: ({ color }) => <Database color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('chat'),
          headerShown: false,
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
