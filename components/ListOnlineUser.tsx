'use client'
import { useSocket } from '@/context/SocketContext'
import { useUser } from '@clerk/nextjs'
import React from 'react'
import Avathar from './Avathar'

const ListOnlineUser = () => {
  const { onlineUsers, handleCall } = useSocket()
  const { user } = useUser()

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Online Users</h2>
      {onlineUsers && onlineUsers.length > 1 ? (
        <div className="flex space-x-4 overflow-x-auto p-2">
          {onlineUsers
            .filter(onlineUser => onlineUser.profile.id !== user?.id)
            .map(onlineUser => (
              <div key={onlineUser.userId} onClick={()=>handleCall(onlineUser)} className="flex flex-col items-center">
                <Avathar src={onlineUser.profile.imageUrl} />
                <span className="text-gray-800 text-sm font-medium mt-1">{onlineUser.profile.fullName || 'Unknown'}</span>
              </div>

            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No users are online.</p>
      )}
    </div>
  )
}

export default ListOnlineUser
