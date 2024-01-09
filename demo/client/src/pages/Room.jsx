import React, { useEffect, useCallback, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { usePeer } from '../providers/Peer'
import ReactPlayer from 'react-player'

const Roompage = () => {
    const socket = useSocket()
    const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream } = usePeer()
    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()
    const [remoteSocketId, setRemoteSocketId] = useState(null)

    const handNewUserJoined = useCallback(async (data) => {
        const { emailId, id } = data
        console.log("new user joined", emailId)
        const offer = await createOffer()
        socket.emit("call-user", { emailId, offer })
        setRemoteEmailId(emailId)
        setRemoteSocketId(id)
    }, [createOffer, socket])

    const handleIncommingCall = useCallback(async (data) => {
        const { from, offer, id } = data
        console.log("incomming call from", from, offer)
        const ans = await createAnswer(offer)
        socket.emit('call-accepted', { emailId: from, ans })
        setRemoteEmailId(from)
        setRemoteSocketId(id)
    }, [createAnswer, socket])

    const callAccepted = useCallback(async (data) => {
        const { ans } = data
        console.log('call got accepted', ans)
        await setRemoteAns(ans)
    }, [setRemoteAns])

    const getUserMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            sendStream(stream)
            setMyStream(stream);
        } catch (error) {
            console.error('Error accessing user media:', error);
        }
    }, [sendStream]);

    // const handleNegotiaion = useCallback(async () => {
    //     // const localOffer = peer.localDescription;
    //     // socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer })
    //     const offer = await createOffer()
    //     socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
    // }, [remoteSocketId, socket, createOffer])

    // const handleNegoNeededIncomming = useCallback(async ({ from, offer }) => {
    //     const ans = await createAnswer(offer)
    //     socket.emit("peer:nego:done", { to: from, ans })
    // }, [socket, createAnswer])

    // const handleNegoFinal = useCallback(async ({ ans }) => {
    //     await setRemoteAns(ans)
    // }, [setRemoteAns])

    const handleNegotiaion = useCallback(async () => {
        const offer = await createOffer()
        socket.emit("peer:nego:needed", { emailId: remoteEmailId, offer })
    }, [remoteEmailId, socket, createOffer])

    const handleNegoNeededIncomming = useCallback(async ({ from, offer }) => {
        const ans = await createAnswer(offer)
        socket.emit("peer:nego:done", { emailId: from, ans })
    }, [socket, createAnswer])

    const handleNegoFinal = useCallback(async ({ ans }) => {
        await setRemoteAns(ans)
    }, [setRemoteAns])

    useEffect(() => {
        socket.on('user-joined', handNewUserJoined)
        socket.on('incomming-call', handleIncommingCall)
        socket.on('call-accepted', callAccepted)
        socket.on('peer:nego:needed', handleNegoNeededIncomming)
        socket.on('peer:nego:final', handleNegoFinal)
        return () => {
            socket.off('user-joined', handNewUserJoined)
            socket.off('incomming-call', handleIncommingCall)
            socket.off('call-accepted', callAccepted)
            socket.off('peer:nego:needed', handleNegoNeededIncomming)
            socket.off('peer:nego:final', handleNegoFinal)
        }
    }, [handNewUserJoined, handleIncommingCall, callAccepted, handleNegoNeededIncomming, handleNegoFinal, socket])

    useEffect(() => {
        getUserMediaStream()
    }, [getUserMediaStream])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiaion)
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiaion)
        }
    }, [handleNegotiaion, peer])



    return (
        <div>
            <h1>Room page</h1>
            <h4>you are connected to {remoteEmailId}</h4>
            {/* <button onClick={(e) => { sendStream(myStream) }}>send stream</button> */}
            <ReactPlayer url={myStream} playing muted />
            <ReactPlayer url={remoteStream} playing muted />
        </div>
    )
}

export default Roompage