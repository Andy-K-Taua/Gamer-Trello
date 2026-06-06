// frontend/src/hooks/useWebRTC.js

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export const useWebRTC = (remoteUserId) => {
    const socket = useAuthStore((state) => state.socket);
    const authUser = useAuthStore((state) => state.authUser);
    const isSocketReady = useAuthStore((state) => state.isSocketReady);

    const peerConnection = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);

    useEffect(() => {
        if (!socket || !isSocketReady || !authUser?._id) return;

        const pc = new RTCPeerConnection(configuration);
        peerConnection.current = pc;

        pc.onnegotiationneeded = async () => {
            try {
                console.log("🔄 Renegotiation needed...");
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("webrtc-signal", { to: remoteUserId, type: "offer", payload: { offer } });
            } catch (err) {
                console.error("Renegotiation failed:", err);
            }
        };

        // Handle incoming tracks (The Receiver's perspective)
        pc.ontrack = (event) => {
            console.log("🔥 ONTRACK EVENT FIRED!");
            console.log("Streams:", event.streams);
            console.log("Track:", event.track);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // Fallback: If browser doesn't support streams in ontrack
                const stream = new MediaStream();
                stream.addTrack(event.track);
                setRemoteStream(stream);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-signal", { to: remoteUserId, type: "ice", payload: { candidate: event.candidate } });
            }
        };

        // Listen for all signals via the unified channel
        const handleSignal = async ({ from, type, payload }) => {
            const pc = peerConnection.current;

            console.log("DEBUG: Signaling state before process:", pc?.signalingState, "Type:", type);


            if (!pc) return;

            console.log(`📥 Received ${type} from ${from}`);

            try {
                if (type === "offer") {
                    // 1. Set Remote first
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
                    // 2. Then Create Answer
                    const answer = await pc.createAnswer();
                    // 3. Then Set Local
                    await pc.setLocalDescription(answer);
                    // 4. Then Emit
                    socket.emit("webrtc-signal", { to: from, type: "answer", payload: { answer } });
                } else if (type === "answer") {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                } else if (type === "ice") {
                    // Only add ICE if we have a remote description
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    }
                }
            } catch (err) {
                console.error("WebRTC Error during:", type, err);
            }
        };

        socket.on("webrtc-signal", handleSignal);

        setIsReady(true); // This will now run

        return () => {
            socket.off("webrtc-signal", handleSignal);
            pc.close();
        };

    }, [socket, isSocketReady, remoteUserId, authUser?._id]);

    const createOffer = async () => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("webrtc-signal", { to: remoteUserId, type: "offer", payload: { offer } });
    };

    const addStream = (stream) => {
        stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));
    };

    return { createOffer, peerConnection, isReady, addStream, remoteStream };
};