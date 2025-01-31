import { io } from "../server.js";

const onWebrtcSignal=async(data)=>{
    if(data.isCaller){
        if(data.OngoingCall.participants.receiver.socketId){
            io.to(data.OngoingCall.participants.receiver.socketId).emit(
                'onWebrtcSignal',data
            )
        }
    }else{
        if(data.OngoingCall.participants.caller.socketId){
            io.to(data.OngoingCall.participants.caller.socketId).emit(
                'onWebrtcSignal',data
            )
        }
    }
}

export default onWebrtcSignal