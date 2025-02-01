"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, AlertCircle, Settings } from 'lucide-react';
import VideoContainer from './VideoContainer';
import { Alert, AlertDescription } from "@/components/ui/alert";

const VideoCall = () => {
    const { localStream, peer, OngoingCall, handleHangup, isCallEnded } = useSocket();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVidOn, setIsVidOn] = useState(true);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [deviceStatus, setDeviceStatus] = useState({
        hasCamera: false,
        hasMicrophone: false,
        loading: true
    });

    // Hide controls after 3 seconds of inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Device checking logic
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
                console.error(err);
                setError("Unable to access media devices");
                setDeviceStatus(prev => ({ ...prev, loading: false }));
            }
        };

        checkDevices();
    }, []);

    // Stream state management
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
        return (
            <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <PhoneOff className="h-16 w-16 text-rose-500 mx-auto" />
                    <h2 className="text-2xl font-semibold text-white">Call Ended</h2>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                    >
                        Return
                    </button>
                </div>
            </div>
        );
    }

    if (!localStream && !peer) return null;

    if (deviceStatus.loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg sm:text-2xl font-semibold text-white">Video Call</h1>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <span className="text-sm sm:text-base text-gray-400">
                                    {isOnCall ? "2" : "1"}
                                </span>
                            </div>
                            <button title='setting' className="p-1 sm:p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            <div className="absolute top-16 sm:top-20 left-0 right-0 z-20 px-4">
                {error && (
                    <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {(!deviceStatus.hasCamera || !deviceStatus.hasMicrophone) && (
                    <Alert className="mb-4 max-w-md mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {!deviceStatus.hasCamera && "No camera detected. "}
                            {!deviceStatus.hasMicrophone && "No microphone detected."}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Main Video Container */}
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                <div className="relative w-full h-full max-w-6xl max-h-[calc(100vh-12rem)] rounded-lg sm:rounded-2xl overflow-hidden bg-gray-800 shadow-2xl ring-1 ring-gray-700">
                    {/* Peer Video */}
                    {isOnCall && peer?.stream ? (
                        <VideoContainer
                            stream={peer.stream}
                            isLocalStream={false}
                            isOnCall={isOnCall}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                            <div className="text-center">
                                <VideoOff className="h-12 w-12 sm:h-16 sm:w-16 text-white/60 mx-auto mb-2 sm:mb-4" />
                                <p className="text-sm sm:text-base text-gray-400">Waiting for peer...</p>
                            </div>
                        </div>
                    )}

                    {/* Local Video Overlay */}
                    {localStream && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-24 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg transition-transform hover:scale-105">
                            {deviceStatus.hasCamera ? (
                                <VideoContainer
                                    stream={localStream}
                                    isLocalStream={true}
                                    isOnCall={isOnCall}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                                    <VideoOff className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="bg-gradient-to-t from-black/70 to-transparent">
                    <div className="max-w-xl mx-auto px-4 py-4 sm:py-8">
                        <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                            {/* Mic Toggle */}
                            <button
                                onClick={toggleMic}
                                disabled={!deviceStatus.hasMicrophone}
                                className={`group relative p-3 sm:p-4 rounded-full transition-all duration-300 ${
                                    !deviceStatus.hasMicrophone ? 'bg-gray-600 opacity-50 cursor-not-allowed' :
                                    isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {isMicOn ? (
                                    <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                                ) : (
                                    <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                                )}
                                <span className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-400">
                                    {isMicOn ? 'Mute' : 'Unmute'}
                                </span>
                            </button>

                            {/* End Call */}
                            <button
                                onClick={() => handleHangup({ OngoingCall: OngoingCall ? OngoingCall : undefined, isEmitHangup: true })}
                                className="group relative p-3 sm:p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300"
                            >
                                <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                                <span className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-400">
                                    End
                                </span>
                            </button>

                            {/* Camera Toggle */}
                            <button
                                onClick={toggleCamera}
                                disabled={!deviceStatus.hasCamera}
                                className={`group relative p-3 sm:p-4 rounded-full transition-all duration-300 ${
                                    !deviceStatus.hasCamera ? 'bg-gray-600 opacity-50 cursor-not-allowed' :
                                    isVidOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {isVidOn ? (
                                    <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                                ) : (
                                    <VideoOff className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                                )}
                                <span className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-400">
                                    {isVidOn ? 'Stop' : 'Start'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;