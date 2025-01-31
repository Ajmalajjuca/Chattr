import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react'

interface iVideoContainer {
    stream: MediaStream | null;
    isLocalStream: boolean;
    isOnCall: boolean;
}

const VideoContainer = ({ stream, isLocalStream, isOnCall }: iVideoContainer) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video 
            className={cn(
                'w-full h-full object-cover',
                isLocalStream && 'transform scale-x-[-1]' // Mirror local video
            )}
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocalStream}
        />
    )
}

export default VideoContainer;