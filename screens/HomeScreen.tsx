import React from 'react';
import {Button, Text, View} from 'react-native';
import useAudioRecorder from "@hooks/useAudioRecorder";

export default function HomeScreen() {
    const {
        sound,
        uri,
        timer,
        isRecording,
        isPlaying,
        progress,
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
            <Button
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={isRecording ? stopRecording : startRecording}
            />
            {uri && !isRecording && (
                <Button title="Play Sound" onPress={playSound}/>
            )}
            {sound && !isRecording && (
                <Button title={isPlaying ? 'Pause Sound' : 'Resume Sound'} onPress={pauseOrResumeSound}/>
            )}
            {uri && !isRecording && (
                <Button title="Stop Sound" onPress={stopSound}/>
            )}
            <Text>Recording Time: {millisToTime(timer)}</Text>
            {sound && !isRecording && (
                <View style={{width: 200, height: 20, backgroundColor: 'lightgray'}}>
                    <View
                        style={{
                            width: 200 * progress,
                            height: 20,
                            backgroundColor: 'blue',
                        }}
                    />
                </View>
            )}
            <Button title="Upload Audio" onPress={handleUploadAudio}/>
        </View>
    );
}
