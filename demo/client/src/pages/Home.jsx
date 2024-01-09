import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../providers/Socket';
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const socket = useSocket();
    const [roomId, setRoomId] = useState();
    const [email, setEmail] = useState()
    const navigate = useNavigate()

    const handleRoomJoined = useCallback(({ roomId }) => {
        navigate(`room/${roomId}`)
    }, [navigate])

    useEffect(() => {
        socket.on('joined-room', handleRoomJoined)
    }, [socket, handleRoomJoined])

    const handleJoinRoom = () => {
        socket.emit('join-room', { roomId: roomId, emailId: email })
    }
    return (
        <div className='homepage-container'>
            <div className='input-container'>
                <input type='text' name="email" value={email} placeholder='Enter email' onChange={(e) => setEmail(e.target.value)} />
                <input type='text' name="roomId" value={roomId} placeholder='Enter Room Id' onChange={(e) => setRoomId(e.target.value)} />
                <button type='submit' onClick={handleJoinRoom}>Enter</button>
            </div>
        </div>
    )
}

export default Home