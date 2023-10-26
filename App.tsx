import {StyleSheet} from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import StackNavigator from "@navigation/StackNavigator";
import {LoadingProvider} from "@context/LoadingContext";

export default function App() {
  return (
      <LoadingProvider>
        <NavigationContainer>
          <StackNavigator/>
        </NavigationContainer>
      </LoadingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
