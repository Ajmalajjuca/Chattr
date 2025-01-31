import { User } from "@clerk/nextjs/server"
import Peer from 'simple-peer'

export type Socketuser = {
    userId:string,
    socketId:string,
    profile:User
}


export type Participants = {
    caller: Socketuser,
    receiver: Socketuser
};

export type OngoingCall = {
    participants: Participants, 
    isRinging: boolean
};

export type PeerData ={
    peerConnection:Peer.Instance
    stream:MediaStream,
    participants:Socketuser
}