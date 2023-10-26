import {useEffect, useState} from 'react';
import {Audio, AVPlaybackStatus} from 'expo-av';
import {
    AndroidAudioEncoder,
    AndroidOutputFormat,
    IOSAudioQuality,
    IOSOutputFormat,
} from 'expo-av/build/Audio/RecordingConstants';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import {requestPermissionsAsync} from 'expo-media-library';
import {useLoadingContext} from "@context/LoadingContext";
import { Alert } from 'react-native';

const options = {
    isMeteringEnabled: true,
    android: {
        extension: '.amr',
        outputFormat: AndroidOutputFormat.AMR_WB,
        audioEncoder: AndroidAudioEncoder.AMR_WB,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.amr',
        outputFormat: IOSOutputFormat.AMR_WB,
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
    const [audioDuration] = useState<number>(0);
    const [status, setStatus] = useState("idle");
    const {showLoading, hideLoading} = useLoadingContext();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isPredicted, setIsPredicted] = useState<boolean>(false);
    const [prediction, setPrediction] = useState<string>("");

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (recording) {
            interval = setInterval(async () => {
                try {
                    const status = await recording.getStatusAsync();
                    setTimer(status.durationMillis);
                } catch (error) {
                    console.error('Error getting recording status:', error);
                }
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
                            setTimer(status.positionMillis);
                        }

                        if (status.isLoaded && !status.isPlaying) {
                            setIsPlaying(false);
                            setProgress(0);
                            setTimer(0);
                            setStatus("recorded");
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
        setIsPredicted(false);
        try {
            const permission = await requestPermissionsAsync();

            if (!permission.granted) {
                console.log('Permission not granted to save file');
                return;
            }

            const {status} = await MediaLibrary.requestPermissionsAsync();

            if (status !== 'granted') {
                console.log('Permission to access media library is not granted');
                return;
            }

            const {granted} = await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            if (!granted) return;

            const {recording} = await Audio.Recording.createAsync(options);
            setRecording(recording);
            setIsRecording(true);
            // setTimer(recording._progressUpdateIntervalMillis);
            setStatus("recording");
        } catch (error) {
            console.error('Failed to start recording', error);
            setRecording(null);
        }
    }

    async function stopRecording() {
        if (!recording) return;

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const recordingUri = recording.getURI();
            if (recordingUri) {
                // const asset = await MediaLibrary.createAssetAsync(recordingUri);
                //
                // if (!asset) {
                //     console.log('Could not create asset');
                //     return;
                // }
                //
                // const album = await MediaLibrary.getAlbumAsync('AudioLab');
                //
                // if (album) {
                //     await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                // } else {
                //     await MediaLibrary.createAlbumAsync('AudioLab', asset, false);
                // }
                //
                // if (sound) {
                //     sound.getStatusAsync().then((status: AVPlaybackStatus) => {
                //         if (status.isLoaded && status.durationMillis) {
                //             setAudioDuration(status.durationMillis);
                //         }
                //     });
                // }

                setUri(recordingUri);
                setRecording(null);
                setTimer(0);
                setIsRecording(false);
                setStatus("recorded");
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }

    async function playSound() {
        if (!uri) return;

        try {
            const {sound: newSound} = await Audio.Sound.createAsync({uri});
            console.log('Playing Sound');
            setSound(newSound);
            setStatus("playing");

            await newSound.playAsync();
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    async function pauseOrResumeSound() {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
                setStatus("paused");
                console.log('Pausing Sound');
            } else {
                await sound.playAsync();
                setIsPlaying(true);
                console.log('Resuming Sound');
                setStatus("playing");
            }
        } catch (error) {
            console.error('Error pausing/resuming sound:', error);
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
            setStatus("recorded");
        } catch (error) {
            console.error('Error stopping sound:', error);
        }
    }

    const handleUploadAudio = async () => {
        showLoading();
        try {
            if (!uri) {
                console.log('No audio recorded to upload.');
                return;
            }

            console.log('Uploading audio:', uri);

            const response: FileSystem.FileSystemUploadResult = await FileSystem.uploadAsync(
                'http://13.126.222.46:5000/v1/sounddetect',
                uri,
                {
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    fieldName: 'audio',
                    mimeType: 'audio/AMR',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            Alert.alert(response.body);

            if (response && response.body && response.status === 200) {
                setIsPredicted(true);
                setPrediction(response.body);
            }

            setIsModalVisible(true);

            console.log('Audio upload response:', response.body);
            hideLoading();
        } catch (error) {
            console.error('Error uploading audio:', error);
            if(error){
                Alert.alert(error.message);
            }
            hideLoading();
            setIsModalVisible(true);
            setIsPredicted(false);
        }
    };

    return {
        recording,
        status,
        sound,
        uri,
        timer,
        isRecording,
        isPlaying,
        progress,
        audioDuration,
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
    };
}
