'use client'
import React from 'react';
import { useSocket } from '@/context/SocketContext';
import { useUser } from '@clerk/nextjs';
import { Phone, Users } from 'lucide-react';

const ListOnlineUser = () => {
  const { onlineUsers, handleCall } = useSocket();
  const { user } = useUser();

  if (!onlineUsers || onlineUsers.length === 0) {
    return (
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center gap-1 text-gray-500">
          <Users className="w-4 h-4" />
          <span>No users online</span>
        </div>
      </div>
    );
  }

  const filteredUsers = onlineUsers.filter(onlineUser => onlineUser.profile.id !== user?.id);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-600" />
            <h2 className="font-medium text-gray-800">Online Users</h2>
          </div>
          <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
            {filteredUsers.length}
          </span>
        </div>
      </div>

      <div className="p-2">
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredUsers.map((onlineUser) => (
              <div
                key={onlineUser.userId}
                onClick={() => handleCall(onlineUser)}
                className="group cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-50">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                      <img
                        src={onlineUser.profile.imageUrl}
                        alt={onlineUser.profile.fullName || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-xs text-center text-gray-700 truncate w-full">
                    {onlineUser.profile.fullName || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-2">
            No other users are currently online
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOnlineUser;