import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import useAudioRecorder from "@hooks/useAudioRecorder";
import {Entypo, FontAwesome, Ionicons} from "@expo/vector-icons";
import CustomModal from "@screens/ModalScreen";

export default function HomeScreen() {
    const {
        status,
        uri,
        timer,
        isRecording,
        isPlaying,
        progress,
        isModalVisible,
        isPredicted,
        prediction,
        setIsModalVisible,
        startRecording,
        stopRecording,
        playSound,
        pauseOrResumeSound,
        stopSound,
        handleUploadAudio,
    } = useAudioRecorder();

    const millisToTime = (millis: number) => {
        let seconds: number | string = Math.floor((millis / 1000) % 60);
        let minutes: number | string = Math.floor((millis / (1000 * 60)) % 60);
        let hours: number | string = Math.floor((millis / (1000 * 60 * 60)) % 24);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <View style={{justifyContent: "center", alignItems: "center"}}>
                <Text style={{fontSize: 24, fontWeight: "bold", color: "rgba(59, 3, 114, 1)", marginBottom: 20}}>SOUND
                    CLASSIFICATION</Text>
                <Image source={require('../assets/main-icon.png')} style={{width: 200, height: 200}}/>
            </View>
            <View style={styles.player}>
                <View
                    style={{width: "80%", marginVertical: 25, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text
                        style={{textAlign: "left", color: "rgba(59, 3, 114, 1)", fontWeight: "bold", fontSize: 18,}}>
                        Record Sound
                    </Text>
                    {
                        (status === "paused" || status === "playing" || status === "recorded") && (
                            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}
                                              style={styles.recordingIcon}>
                                {
                                    isRecording ? (
                                        <View>
                                            <FontAwesome name="microphone-slash" size={24} color="#fff"/>
                                        </View>
                                    ) : (
                                        <View>
                                            <FontAwesome name="microphone" size={24} color="#fff"/>
                                        </View>
                                    )
                                }
                            </TouchableOpacity>
                        )
                    }
                </View>
                {(status === "recorded" || status == "paused" || status === "playing") && (
                    <View style={{marginVertical: 14}}>
                        <View
                            style={{width: 300, height: 4, backgroundColor: 'rgba(59, 3, 114, 1)', borderRadius: 30,}}>
                            <View
                                style={{
                                    width: 300 * progress,
                                    height: 4,
                                    backgroundColor: 'rgba(255, 235, 82, 1)',
                                    borderRadius: 30,
                                }}
                            />
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text>
                                00:00
                            </Text>
                            <Text>
                                {millisToTime(timer)}
                            </Text>
                        </View>
                    </View>
                )}
                {
                    (status === "idle" || status === "recording") && (
                        <TouchableOpacity onPress={isRecording ? stopRecording : startRecording}
                                          style={[styles.recordingIcon, status === "recording" && {backgroundColor: "red"}]}>
                            {
                                isRecording ? (
                                    <View>
                                        <FontAwesome name="pause" size={24} color="#fff"/>
                                    </View>
                                ) : (
                                    <View>
                                        <FontAwesome name="microphone" size={24} color="#fff"/>
                                    </View>
                                )
                            }
                        </TouchableOpacity>
                    )
                }
                <View
                    style={{flexDirection: "row", justifyContent: "space-evenly", width: "100%", marginVertical: 20, alignItems: "center"}}>
                    {uri && !isRecording && (
                        <TouchableOpacity onPress={playSound}>
                            <Entypo name="controller-jump-to-start" size={27} color="rgba(59, 3, 114, 1)"/>
                        </TouchableOpacity>
                    )}
                    {(status === "paused" || status === "playing") && (
                        <TouchableOpacity onPress={pauseOrResumeSound}>
                            {isPlaying ? (
                                <Ionicons name="pause" size={24} color="rgba(59, 3, 114, 1)"/>
                            ) : (
                                <Ionicons name="play" size={24} color="rgba(59, 3, 114, 1)"/>
                            )}
                        </TouchableOpacity>
                    )}
                    {uri && !isRecording && (
                        <TouchableOpacity onPress={stopSound}>
                            <Ionicons name="stop" size={24} color="rgba(59, 3, 114, 1)"/>
                        </TouchableOpacity>
                    )}
                </View>
                {
                    isRecording && (
                        <Text style={{paddingBottom: 20, color: 'rgba(59, 3, 114, 1)'}}>Recording
                            Time: {millisToTime(timer)}</Text>
                    )
                }
            </View>
            {
                uri && !isRecording && (
                    <TouchableOpacity onPress={handleUploadAudio} style={styles.analyzeButton}>
                        <Text style={{color: "#fff", fontSize: 20}}>Analyze Audio</Text>
                    </TouchableOpacity>
                )
            }
            <CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} isPredicted={isPredicted}
                         prediction={prediction}/>
        </View>
    );
}


const styles = StyleSheet.create({
    recordingIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(16, 114, 215, 1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    player: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        marginBottom: 20,
        backgroundColor: 'rgba(0, 150, 240, 0.5)',
        borderRadius: 30,
    },
    analyzeButton: {
        width: "80%",
        height: 50,
        borderRadius: 30,
        marginTop: 20,
        backgroundColor: 'rgba(249, 125, 125, 1)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});