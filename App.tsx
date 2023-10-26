import {View} from 'react-native';
import {DefaultTheme, NavigationContainer} from "@react-navigation/native";
import StackNavigator from "@navigation/StackNavigator";
import {LoadingProvider} from "@context/LoadingContext";
import {useCallback, useEffect, useState} from "react";
import * as SplashScreen from "expo-splash-screen";
import LoadingScreen from "@screens/LoadingScreen";

SplashScreen.preventAutoHideAsync().catch((e) => console.error(e));

const navTheme = DefaultTheme;
navTheme.colors.background = "#fff";

export default function App() {
    const [isAppReady, setIsAppReady] = useState(false);

    const onLayoutRootView = useCallback(async () => {
        if (isAppReady) {
            await SplashScreen.hideAsync();
        }
    }, [isAppReady]);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsAppReady(true);
            }
        }

        prepare().catch((e) => console.error(e));
    }, []);

    if (!isAppReady) {
        return null;
    }

  return (
      <View onLayout={onLayoutRootView} style={{flex: 1}}>
          <LoadingProvider>
              <NavigationContainer>
                  <StackNavigator/>
                  <LoadingScreen/>
              </NavigationContainer>
          </LoadingProvider>
      </View>
  );
}

