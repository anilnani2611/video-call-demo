import './App.css';
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import { SocketProvider } from './providers/Socket';
import Roompage from './pages/Room';
import { PeerProvider } from './providers/Peer';

function App() {
    return (
        <div className="App">
            <SocketProvider>
                <PeerProvider>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/room/:roomId' element={<Roompage />} />
                    </Routes>
                </PeerProvider>
            </SocketProvider>
        </div>
    );
}

export default App;
