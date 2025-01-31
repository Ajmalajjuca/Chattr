'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, AlertCircle } from 'lucide-react';
import VideoContainer from './VideoContainer';
import { Alert, AlertDescription } from "@/components/ui/alert";

const VideoCall = () => {
    const { localStream, peer, OngoingCall, handleHangup,isCallEnded } = useSocket();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVidOn, setIsVidOn] = useState(true);
    const [error, setError] = useState('');
    const [deviceStatus, setDeviceStatus] = useState({
        hasCamera: false,
        hasMicrophone: false,
        loading: true
    });

    useEffect(() => {
        const checkDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                const audioDevices = devices.filter(device => device.kind === 'audioinput');

                setDeviceStatus({
                    hasCamera: videoDevices.length > 0,
                    hasMicrophone: audioDevices.length > 0,
                    loading: false
                });
            } catch (err) {
                console.log(err);
                setError("Unable to access media devices");
                setDeviceStatus(prev => ({ ...prev, loading: false }));
            }
        };

        checkDevices();
    }, []);

    useEffect(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            setIsVidOn(videoTrack?.enabled ?? false);
            const audioTrack = localStream.getAudioTracks()[0];
            setIsMicOn(audioTrack?.enabled ?? false);
        }
    }, [localStream]);

    const toggleCamera = useCallback(() => {
        if (!deviceStatus.hasCamera) {
            setError("No camera detected");
            return;
        }

        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVidOn(videoTrack.enabled);
            }
        }
    }, [localStream, deviceStatus.hasCamera]);

    const toggleMic = useCallback(() => {
        if (!deviceStatus.hasMicrophone) {
            setError("No microphone detected");
            return;
        }

        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    }, [localStream, deviceStatus.hasMicrophone]);

    const isOnCall = Boolean(localStream && peer && OngoingCall);

    if (isCallEnded) {
        return <div className='mt-5 text-rose-500 text-center  '>Call Ended</div>
    }

    if (!localStream && !peer) return

    if (deviceStatus.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-white">Video Call</h1>
                    <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400">
                            {isOnCall ? "2 Participants" : "1 Participant"}
                        </span>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Device Status Warnings */}
                {(!deviceStatus.hasCamera || !deviceStatus.hasMicrophone) && (
                    <Alert className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {!deviceStatus.hasCamera && "No camera detected. "}
                            {!deviceStatus.hasMicrophone && "No microphone detected."}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Video Container */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video shadow-xl ring-1 ring-gray-700">
                    {/* Peer Video (Large) */}
                    {isOnCall && peer?.stream ? (
                        <VideoContainer
                            stream={peer.stream}
                            isLocalStream={false}
                            isOnCall={isOnCall}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-white">
                            <div className="text-center">
                                <VideoOff className="h-16 w-16 opacity-60 mx-auto mb-4" />
                                <p className="text-gray-400">
                                    Waiting for peer to join...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Local Video (Small Overlay) */}
                    {localStream && (
                        <div className="absolute top-4 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg">
                            {deviceStatus.hasCamera ? (
                                <VideoContainer
                                    stream={localStream}
                                    isLocalStream={true}
                                    isOnCall={isOnCall}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-white">
                                    <VideoOff className="h-8 w-8 opacity-60" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="mt-8 flex items-center justify-center space-x-6">
                    {/* Mic Toggle */}
                    <button
                        onClick={toggleMic}
                        disabled={!deviceStatus.hasMicrophone}
                        className={`group relative p-4 rounded-full transition-all duration-300 ${!deviceStatus.hasMicrophone ? 'bg-gray-600 opacity-50 cursor-not-allowed' :
                            isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        {isMicOn ? (
                            <Mic className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                            <MicOff className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        )}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400">
                            {isMicOn ? 'Mute' : 'Unmute'}
                        </span>
                    </button>

                    {/* End Call */}
                    <button
                        onClick={() => handleHangup({ OngoingCall: OngoingCall ? OngoingCall : undefined, isEmitHangup: true })}
                        className="group relative p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300"
                    >
                        <PhoneOff className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400">
                            End
                        </span>
                    </button>

                    {/* Camera Toggle */}
                    <button
                        onClick={toggleCamera}
                        disabled={!deviceStatus.hasCamera}
                        className={`group relative p-4 rounded-full transition-all duration-300 ${!deviceStatus.hasCamera ? 'bg-gray-600 opacity-50 cursor-not-allowed' :
                            isVidOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        {isVidOn ? (
                            <Video className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                            <VideoOff className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        )}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-400">
                            {isVidOn ? 'Stop' : 'Start'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;