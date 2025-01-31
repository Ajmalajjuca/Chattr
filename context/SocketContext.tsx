import { OngoingCall, Participants as ParticipantsType, PeerData, Socketuser } from "@/types";
import { useUser } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer, { SignalData } from 'simple-peer'

interface iSocketContext {
    onlineUsers: Socketuser[] | null
    OngoingCall: OngoingCall | null
    localStream: MediaStream | null
    peer: PeerData | null
    isCallEnded:boolean,
    handleCall: (user: Socketuser) => void
    handleJoinCall: (OngoingCall: OngoingCall) => void
    handleHangup: (data: { OngoingCall?: OngoingCall, isEmitHangup?: boolean }) => void

}

export const SocketContext = createContext<iSocketContext | null>(null)

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser()
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isSocketConnected, setisSocketConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState<Socketuser[] | null>(null)
    const [OngoingCall, setOngoingCall] = useState<OngoingCall | null>(null)
    const [localStream, setlocalStream] = useState<MediaStream | null>(null)
    const [peer, setPeer] = useState<PeerData | null>(null)
    const [isCallEnded, setIsCallEnded] = useState(false)

    const currentSocketuser = onlineUsers?.find(onlineUser => onlineUser.userId === user?.id)

    const getMediaStream = useCallback(async (faceMode?: string) => {
        if (localStream) {
            return localStream;
        }

        try {
            // First check if media devices are available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media devices not supported in this browser');
            }

            // Get list of available devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideo = devices.some(device => device.kind === 'videoinput');
            const hasAudio = devices.some(device => device.kind === 'audioinput');

            // Construct constraints based on available devices
            const constraints: MediaStreamConstraints = {
                audio: hasAudio,
                video: hasVideo ? {
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 360, ideal: 720, max: 1080 },
                    frameRate: { min: 16, ideal: 30, max: 30 },
                    facingMode: faceMode || 'user'
                } : false
            };

            // Try to get the stream with the constructed constraints
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setlocalStream(stream);
            return stream;

        } catch (error) {
            // Handle specific errors
            if (error instanceof Error) {
                switch (error.name) {
                    case 'NotFoundError':
                        console.error('No camera or microphone found. Trying audio only...');
                        // Fallback to audio only
                        try {
                            const audioStream = await navigator.mediaDevices.getUserMedia({
                                audio: true,
                                video: false
                            });
                            setlocalStream(audioStream);
                            return audioStream;
                        } catch (audioError) {
                            console.error('Failed to get audio stream:', audioError);
                        }
                        break;
                    case 'NotAllowedError':
                        console.error('Permission denied for media devices');
                        break;
                    case 'NotReadableError':
                        console.error('Media device is in use by another application');
                        break;
                    default:
                        console.error('Error accessing media devices:', error);
                }
            }

            setlocalStream(null);
            return null;
        }
    }, [localStream]);

    const handleCall = useCallback(async (user: Socketuser) => {
        setIsCallEnded(false)
        if (!currentSocketuser || !socket) return

        const stream = await getMediaStream()

        if (!stream) {
            console.log('No stream in handelcall');

            return
        }

        const callParticipants: ParticipantsType = { caller: currentSocketuser, receiver: user };
        setOngoingCall({
            participants: callParticipants,
            isRinging: false
        })
        socket.emit('call', callParticipants)
    }, [socket, currentSocketuser,])


    const onIncomingCall = useCallback((participants: ParticipantsType) => {
        setOngoingCall(prev => {
            const newState = {
                participants,
                isRinging: true
            };
            return newState;
        })
    }, [socket, user, OngoingCall])

    const handleHangup = useCallback((data: { OngoingCall?: OngoingCall | null, isEmitHangup?: boolean }) => {
        if (socket && user && data?.OngoingCall && data?.isEmitHangup) {
            socket.emit('hangup', {
                OngoingCall: data.OngoingCall,
                userHangupId: user.id
            })
        }
        setOngoingCall(null)
        setPeer(null)
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop())
            setlocalStream(null)
        }
        setIsCallEnded(true)
    }, [socket, user, localStream])

    const createPeer = useCallback((stream: MediaStream, initiator: boolean) => {
        const iceServers: RTCIceServer[] = [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                ]
            }
        ]

        const peer = new Peer({
            stream,
            initiator,
            trickle: true,
            config: { iceServers }
        })

        peer.on('stream', (stream) => {
            setPeer((prevPeer) => {
              if (prevPeer) {
                return { ...prevPeer, stream }
              }
              return prevPeer
            })
          })
        peer.on('error', console.error)
        peer.on('close', () => handleHangup({}))

        const rtcPeerConection: RTCPeerConnection = (peer as any)._pc

        rtcPeerConection.oniceconnectionstatechange = async () => {
            if (rtcPeerConection.iceConnectionState === 'disconnected' || rtcPeerConection.iceConnectionState === 'failed') {
                handleHangup({})
            }
        }

        return peer
    }, [OngoingCall, setPeer])

    const completePeerConnection = useCallback(async (conectionData: { sdp: SignalData, OngoingCall: OngoingCall, isCaller: boolean }) => {
        if (!localStream) {
            console.log('missing localStreem');
            return
        }
        if (peer) {
            peer.peerConnection?.signal(conectionData.sdp)
            return
        }
        const newPeer = createPeer(localStream, true)

        setPeer({
            peerConnection: newPeer,
            participants: conectionData.OngoingCall.participants.receiver,
            stream:undefined
        })

        newPeer.on('signal', async (data: SignalData) => {
            if (socket) {
                socket.emit('webrtcSignal', {
                    sdp: data,
                    OngoingCall,
                    isCaller: true
                })
            }
        })
    }, [localStream, createPeer, peer, OngoingCall])

    const handleJoinCall = useCallback(async (OngoingCall: OngoingCall) => {
        setIsCallEnded(false)
        setOngoingCall(prev => {
            if (prev) {
                return { ...prev, isRinging: false }
            }
            return prev
        })

        const stream = await getMediaStream()
        if (!stream) {
            console.log('could not get stream in handleJoinCall');
            handleHangup({ OngoingCall: OngoingCall ? OngoingCall : undefined, isEmitHangup: true })
            return

        }

        const newPeer = createPeer(stream, true)

        setPeer({
            peerConnection: newPeer,
            participants: OngoingCall.participants.caller,
            stream: undefined
        })

        newPeer.on('signal', async (data: SignalData) => {
            if (socket) {
                socket.emit('webrtcSignal', {
                    sdp: data,
                    OngoingCall,
                    isCaller: false
                })
            }
        })
    }, [socket, currentSocketuser])


    useEffect(() => {
        const newSocket = io()
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    useEffect(() => {
        if (socket === null) return;

        if (socket.connected) {
            onConnect()
        }

        function onConnect() {
            setisSocketConnected(true)
        }
        function onDisconnect() {
            setisSocketConnected(false)
        }

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on('hangup', handleHangup)

        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off('hangup', handleHangup)
        }


    }, [socket])

    useEffect(() => {

        if (!socket || !isSocketConnected) return;
        socket.emit('addNewUser', user)

        const handleGetUsers = (res: Socketuser[]) => {
            setOnlineUsers(res);
        };

        socket.on('getUsers', handleGetUsers)

        return () => {
            socket.off('getUsers', handleGetUsers)
        }
    }, [socket, isSocketConnected, user])

    // SocketContext.tsx


    useEffect(() => {
        if (!socket || !isSocketConnected) return
        socket.on('incomingCall', onIncomingCall)
        socket.on('onWebrtcSignal', completePeerConnection)
        return () => {
            socket.off('incomingCall', onIncomingCall)
            socket.off('onWebrtcSignal', completePeerConnection)
        }
    }, [socket, isSocketConnected, onIncomingCall, user, completePeerConnection])


    useEffect(()=>{
        let timeout:ReturnType<typeof setTimeout>

        if(isCallEnded){
            timeout=setTimeout(()=>{
                setIsCallEnded(false)
            },2000)
        }
        return ()=>clearTimeout(timeout)
    },[isCallEnded])

    return <SocketContext.Provider value={{
        onlineUsers,
        handleCall,
        OngoingCall,
        localStream,
        handleJoinCall,
        peer,
        isCallEnded,
        handleHangup
    }}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = () => {
    const context = useContext(SocketContext)

    if (context === null) {
        throw new Error('useSocket must be used in within a SokcketContextProvider')
    }

    return context
} 