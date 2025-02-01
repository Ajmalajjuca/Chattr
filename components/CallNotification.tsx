'use client'
import React from 'react';
import { useSocket } from '@/context/SocketContext';
import { Phone, PhoneOff } from 'lucide-react';

const CallButton = ({ onClick, icon: Icon, variant }: {
  onClick: () => void;
  icon: React.ElementType;
  variant: 'accept' | 'reject';
}) => (
  <button
  title='call'
    onClick={onClick}
    className={`group flex items-center justify-center h-14 w-14 rounded-full transition-all duration-300 transform hover:scale-110 ${
      variant === 'accept' 
        ? 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-green-300/50' 
        : 'bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-red-300/50'
    }`}
  >
    <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
  </button>
);

const CallNotification = () => {
  const { OngoingCall, handleJoinCall, handleHangup } = useSocket();

  if (!OngoingCall?.isRinging) return null;

  const { fullName, imageUrl } = OngoingCall.participants.caller.profile;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <div className="bg-white/90 p-6 md:p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-auto animate-in slide-in-from-bottom duration-500">
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar with ripple effect */}
          <div className="relative">
            <div className="absolute -inset-4">
              <div className="w-full h-full rounded-full animate-ping bg-blue-400/50" />
            </div>
            <div className="absolute -inset-8">
              <div className="w-full h-full rounded-full animate-ping delay-300 bg-blue-400/30" />
            </div>
            <img
              src={imageUrl}
              alt={fullName || "Unknown"}
              className="relative h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Call information */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Incoming Call
            </h2>
            <p className="text-gray-600">
              from {fullName || "Unknown"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <CallButton
              onClick={() => handleJoinCall(OngoingCall)}
              icon={Phone}
              variant="accept"
            />
            <CallButton
              onClick={() => handleHangup({ OngoingCall, isEmitHangup: true })}
              icon={PhoneOff}
              variant="reject"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;