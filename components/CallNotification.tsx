'use client'
import React from 'react';
import { useSocket } from '@/context/SocketContext';
import { Phone, PhoneOff } from 'lucide-react';

const CallNotification = () => {
    const { OngoingCall, handleJoinCall, handleHangup } = useSocket();

    if (!OngoingCall?.isRinging) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex flex-col items-center space-y-6">
                    {/* Pulsing avatar */}
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/50" />
                        <img
                            src={OngoingCall.participants.caller.profile.imageUrl}
                            alt={OngoingCall.participants.caller.profile.fullName}
                            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    </div>

                    {/* Call info */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Incoming Call
                        </h2>
                        <p className="text-gray-600">
                            from {OngoingCall.participants.caller.profile.fullName}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-center gap-6 pt-4">
                        {/* Accept button */}
                        <button onClick={() => handleJoinCall(OngoingCall)} className="group flex items-center justify-center h-14 w-14 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-green-300/50">
                            <Phone className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        </button>

                        {/* Reject button */}
                        <button onClick={() => handleHangup({ OngoingCall: OngoingCall ? OngoingCall : undefined, isEmitHangup: true })} className="group flex items-center justify-center h-14 w-14 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-300/50">
                            <PhoneOff className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallNotification;
