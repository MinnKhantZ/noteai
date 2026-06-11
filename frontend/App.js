import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./screens/HomeScreen";
import EditScreen from "./screens/EditScreen";
import FolderScreen from "./screens/FolderScreen";
import { lightTheme, darkTheme } from "./theme";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

const Stack = createStackNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const paperTheme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack.Navigator
          screenOptions={{
            cardStyle: { backgroundColor: colors.background },
            headerStyle: {
              backgroundColor: colors.headerBg,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "600" },
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width * 0.3, 0],
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1],
                }),
              },
            }),
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Edit"
            component={EditScreen}
            options={{ title: "Note", headerBackTitle: "" }}
          />
          <Stack.Screen
            name="Folders"
            component={FolderScreen}
            options={{ title: "Folders", headerBackTitle: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}


