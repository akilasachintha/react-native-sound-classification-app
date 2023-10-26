import {useEffect, useState} from 'react';
import {Audio, AVPlaybackStatus} from 'expo-av';
import {
    AndroidAudioEncoder,
    AndroidOutputFormat,
    IOSAudioQuality,
    IOSOutputFormat
} from "expo-av/build/Audio/RecordingConstants";
import * as FileSystem from 'expo-file-system';
import {requestPermissionsAsync} from "expo-media-library";
import {Alert} from "react-native";

const options = {
    isMeteringEnabled: true,
    android: {
        extension: '.wav',
        outputFormat: AndroidOutputFormat.MPEG_4,
        audioEncoder: AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.wav',
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: IOSAudioQuality.MAX,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
    },
};

export default function useAudioRecorder() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [timer, setTimer] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (recording) {
            interval = setInterval(async () => {
                const status = await recording.getStatusAsync();
                setTimer(status.durationMillis);
            }, 1000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [recording]);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                if (sound) {
                    sound.getStatusAsync().then((status: AVPlaybackStatus) => {
                        if (status.isLoaded && status.durationMillis) {
                            setProgress(status.positionMillis / status.durationMillis);
                            setTimer(status.positionMillis); // Update the timer
                        }
                    });
                }
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [isPlaying, sound]);

    async function startRecording() {
        const permission = await requestPermissionsAsync();
        if (!permission.granted) {
            console.log('Permission not granted to save file');
            return;
        }

        const {granted} = await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        if (!granted) return;

        try {
            const {recording} = await Audio.Recording.createAsync(options);
            setRecording(recording);
            setIsRecording(true);
            setTimer(recording._progressUpdateIntervalMillis);
        } catch (error) {
            console.error('Failed to start recording', error);
            setRecording(null);
        }
    }

    async function stopRecording() {
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync(
                {
                    allowsRecordingIOS: false,
                }
            );

            const uri = recording.getURI();
            if (uri) {
                const parts = uri.split('/');
                const fileName = parts[parts.length - 1];
                console.log('File name: ', fileName);

                const directory = FileSystem.documentDirectory + 'akila/';
                const newPath = directory + fileName;

                console.log('Directory: ', directory);

                const dirInfo = await FileSystem.getInfoAsync(directory);
                if (!dirInfo.exists) {
                    console.log('Creating directory: ', directory);
                    await FileSystem.makeDirectoryAsync(directory, {intermediates: true});
                }

                const fileInfo = await FileSystem.getInfoAsync(newPath);
                if (!fileInfo.exists) {
                    await FileSystem.moveAsync({
                        from: uri,
                        to: newPath,
                    });

                    console.log('Audio file moved to: ', newPath);
                    setUri(newPath);
                    Alert.alert('Audio file saved to: ', newPath);
                    console.log('Audio file saved to: ', fileInfo);

                } else {
                    console.log('A file already exists at the destination path.');
                }
            }

            setRecording(null);
            setTimer(0);
            setIsRecording(false);
        } catch (error) {
            console.log(error);
        }
    }


    async function playSound() {
        if (!uri) return;

        const {sound: newSound} = await Audio.Sound.createAsync({uri});
        console.log('Playing Sound');
        setSound(newSound);

        try {
            await newSound.playAsync();
            setIsPlaying(true);
        } catch (error) {
            console.log(error);
        }
    }

    async function pauseOrResumeSound() {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
                console.log('Pausing Sound');
            } else {
                await sound.playAsync();
                setIsPlaying(true);
                console.log('Resuming Sound');
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function stopSound() {
        console.log('Stopping Sound');
        if (!sound) return;

        try {
            await sound.stopAsync();
            setIsPlaying(false);
            setProgress(0);
            setTimer(0);
        } catch (error) {
            console.log(error);
        }
    }

    const handleUploadAudio = async () => {
        try {
            if (!uri) {
                console.log('No audio recorded to upload.');
                return;
            }

            console.log('Uploading audio:', uri);

            const response = await FileSystem.uploadAsync(
                'http://13.126.222.46:5000/v1/sounddetect',
                uri,
                {
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    fieldName: 'audio',
                    mimeType: 'audio/wav',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Audio upload response:', response.body);
        } catch (error) {
            console.error('Error uploading audio:', error);
        }
    };

    return {
        recording,
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
    };
}
