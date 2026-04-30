import React from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./screens/HomeScreen";
import EditScreen from "./screens/EditScreen";
import FolderScreen from "./screens/FolderScreen";
import { lightTheme, darkTheme } from "./theme";

const Stack = createStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          <Stack.Navigator>
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
    </GestureHandlerRootView>
  );
}


