import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Entypo} from "@expo/vector-icons";

type CustomModalProps = {
    isModalVisible: boolean,
    isPredicted: boolean,
    prediction: string,
    setIsModalVisible: (value: boolean) => void,
}

const CustomModal = ({isModalVisible, setIsModalVisible, isPredicted, prediction}: CustomModalProps) => {
    if (!isModalVisible) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.modal} activeOpacity={0.9}>
                <Text style={{fontSize: 18, fontWeight: "bold", color: "rgba(59, 3, 114, 1)", marginBottom: 20}}>Sound
                    Prediction Results</Text>
                {
                    isPredicted ? (
                        <Image source={require('../assets/animal.png')}
                               style={{width: 100, height: 100, marginVertical: 30}}/>
                    ) : (
                        <Image source={require('../assets/error.png')}
                               style={{width: 100, height: 100, marginVertical: 30}}/>
                    )
                }
                {
                    isPredicted && prediction ? (
                        <Text
                            style={{textAlign: "center", color: "rgba(59, 3, 114, 1)", fontWeight: "bold", fontSize: 18, marginHorizontal: 30}}>
                            {prediction && (JSON.parse(prediction).prediction).toString().toLocaleUpperCase()}
                        </Text>
                    ) : (
                        <Text
                            style={{textAlign: "center", color: "rgba(59, 3, 114, 1)", fontWeight: "bold", fontSize: 18, marginHorizontal: 30}}>
                            Cannot Identify. Try Again!
                        </Text>
                    )
                }
                <TouchableOpacity style={{marginTop: 20}} onPress={() => setIsModalVisible(false)}>
                    <Entypo name="cross" size={24} color="rgba(16, 114, 215, 1)"/>
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
};

export default CustomModal;

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
    modal: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        width: '80%',
    }
});
