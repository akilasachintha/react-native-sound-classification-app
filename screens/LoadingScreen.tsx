import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useLoadingContext} from '@context/LoadingContext';

const LoadingScreen: React.FC = () => {
    const {loading} = useLoadingContext();

    if (!loading) return null;

    return (
        <View style={styles.container}>
            <View style={styles.loading}>
                <ActivityIndicator size={50} color="#1072D7"/>
                <Text style={styles.text}>Loading...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    loading: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    text: {
        marginTop: 10,
        color: "#1072D7",
        fontSize: 16,
    }
});

export default LoadingScreen;
