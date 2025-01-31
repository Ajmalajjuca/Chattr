import {io} from '../server.js'

const onHangup = async (data) => {
    let socketIdToEmitTo;
    if(data.OngoingCall.participants.caller.userId===data.userHangupId){
        socketIdToEmitTo=data.OngoingCall.participants.receiver.socketId
    }else{
        socketIdToEmitTo=data.OngoingCall.participants.caller.socketId   
    }

    if(socketIdToEmitTo){
        io.to(socketIdToEmitTo).emit('hangup')
    }
}
export default onHangup