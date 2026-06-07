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

    console.log("DEBUG: useWebRTC state check:", { socket, isSocketReady, remoteUserId });

    const peerConnection = useRef(null);
    const makingOffer = useRef(false); // FLAG TO PREVENT LOOP
    const [isReady, setIsReady] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);

    useEffect(() => {
        if (!socket || !isSocketReady || !authUser?._id) return;

        const pc = new RTCPeerConnection(configuration);
        peerConnection.current = pc;

        // NEW: Debug connection state
        pc.oniceconnectionstatechange = () => console.log("ICE State:", pc.iceConnectionState);

        pc.onnegotiationneeded = async () => {
            if (makingOffer.current) return;
            try {
                makingOffer.current = true;
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("webrtc-signal", { to: remoteUserId, type: "offer", payload: { offer } });
            } catch (err) {
                console.error("Negotiation failed:", err);
            } finally {
                makingOffer.current = false;
            }
        };

        pc.ontrack = (event) => {
            console.log("✅ Track received, kind:", event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // Fallback: create a new stream if the browser doesn't provide one
                let inboundStream = new MediaStream();
                inboundStream.addTrack(event.track);
                setRemoteStream(inboundStream);
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-signal", { to: remoteUserId, type: "ice", payload: { candidate: event.candidate } });
            }
        };

        const handleSignal = async ({ from, type, payload }) => {
            const pc = peerConnection.current;
            if (!pc) return;

            try {
                if (type === "offer") {
                    // Prevent glare: If we are already negotiating, ignore incoming offer
                    const offerCollision = (makingOffer.current || pc.signalingState !== "stable");
                    if (offerCollision) return;

                    await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("webrtc-signal", { to: from, type: "answer", payload: { answer } });
                }
                else if (type === "answer") {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
                }
                else if (type === "ice") {
                    if (pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    }
                }
            } catch (err) {
                console.error("WebRTC Error:", err);
            }
        };

        socket.on("webrtc-signal", handleSignal);
        setIsReady(true);

        return () => {
            socket.off("webrtc-signal", handleSignal);
            pc.close();
        };
    }, [socket, isSocketReady, remoteUserId, authUser?._id]);

    const createOffer = async () => {
        // This is handled by onnegotiationneeded automatically now
    };

    const addStream = (stream) => {
        if (!peerConnection.current) return;

        stream.getTracks().forEach((track) => {
            // Remove existing tracks of the same kind to prevent duplicates
            const senders = peerConnection.current.getSenders();
            const existingSender = senders.find(s => s.track?.kind === track.kind);

            if (existingSender) {
                peerConnection.current.removeTrack(existingSender);
            }

            peerConnection.current.addTrack(track, stream);
        });
        console.log("✅ Tracks added to PeerConnection");
    };

    return { createOffer, peerConnection, isReady, addStream, remoteStream };
};