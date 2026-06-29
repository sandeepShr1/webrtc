"use client"
import { useAppStore } from "@/store/useAppStore";
import { useWebRTCStore } from "@/store/useWebRTCStore";
import { useCallback, useRef } from "react";
import * as constants from "@/constants/constants"


const webRTCConfiguration = {
      iceServers: [
            {
                  urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                  ]
            }
      ]
}

export function usePeerConnection() {
      const pcRef = useRef<RTCPeerConnection | null>(null);
      const dataChannelRef = useRef<RTCDataChannel | null>(null);
      const iceCandidatesBuffer = useRef<RTCIceCandidate[]>([]);

      const wsConnection = useAppStore((state) => state.userWebSocketConnection);
      const setIsConnected = useWebRTCStore((state) => state.setIsConnected)
      const setLocalStream = useWebRTCStore((state) => state.setLocalStream);
      const setRemoteStream = useWebRTCStore((state) => state.setRemoteStream)
      const roomName = useAppStore((state) => state.roomName)

      // ____________Create Peer Connection________________
      const createPeerConnection = useCallback((): RTCPeerConnection => {
            if (pcRef.current) {
                  console.log(`Reusing existing peer connection`)
                  return pcRef.current
            }

            const pc = new RTCPeerConnection(webRTCConfiguration);

            // connection state
            pc.addEventListener("connectionstatechange", () => {
                  if (pc.connectionState === "connected") {
                        console.log("WebRTC connected")
                        setIsConnected(true)
                  }
                  if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
                        console.log(
                              "WebRTC disconnected"
                        )
                        setIsConnected(false);
                        cleanup()
                  }
            })

            // signaling state
            pc.addEventListener("signalingstatechange", () => {
                  console.log(`Signaling state: ${pc.signalingState}`)
            })

            // ice candidates - send immediately as they are generated
            pc.addEventListener("icecandidate", (e) => {
                  if (e.candidate && wsConnection) {
                        console.log(`ice candidate generated, sending...`)

                        const message = {
                              label: constants.labels.WEBRTC_PROCESS,
                              data: {
                                    type: constants.type.WEB_RTC.ICE_CANDIDATES,
                                    candidatesArray: [e.candidate],
                                    otherUserId: useAppStore.getState().otherUserId
                              }
                        }
                        wsConnection.emit('send-iceCandidates', message);


                  }
            })
            // remote stream
            pc.addEventListener('track', (e) => {
                  console.log('remote track received')
                  if (e.streams[0]) setRemoteStream(e.streams[0])
            })

            pcRef.current = pc
            return pc
      }, [wsConnection, roomName])

      //  -----------Data Channel-----------
      const setUpDataChannel = useCallback((pc: RTCPeerConnection, isOfferor: boolean) => {
            if (isOfferor) {
                  const dc = pc.createDataChannel('chat', { ordered: true });
                  registerDataChannelsEvents(dc)
                  dataChannelRef.current = dc
            }
      }, [])

      function registerDataChannelsEvents(dc: RTCDataChannel) {
            dc.onopen = () => console.log("data channel open")
            dc.onclose = () => console.log("data channel closed")
            dc.onmessage = (e) => {
                  console.log("message received", e.data)
            }
      }

      //  Get Local Media
      const getLocalStream = useCallback(async (pc: RTCPeerConnection) => {
            const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: true
            })
            setLocalStream(stream)

            // add tracks to peer connection
            stream.getTracks().forEach((track) => {
                  pc.addTrack(track, stream)
            })
            return stream
      }, [])

      // Flush Ice Buffer
      const flushIceBuffer = useCallback(async (pc: RTCPeerConnection) => {
            if (iceCandidatesBuffer.current.length === 0) return;
            console.log(`Flushing ${iceCandidatesBuffer.current.length} buffered ice candidates`)

            for (const candidate of iceCandidatesBuffer.current) {
                  try {
                        await pc.addIceCandidate(candidate)
                  } catch (err) {
                        console.log(`error adding buffered ice candidate`, err)
                  }
            }
            iceCandidatesBuffer.current = []
      }, [])

      // Offeror: start Call
      const startCall = useCallback(async () => {
            if (!wsConnection) return console.log("no ws connection")
            console.log("Starting call as offeror ...")
            const pc = createPeerConnection();
            console.log({ pc })

            await getLocalStream(pc);
            setUpDataChannel(pc, true);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log("offer created, sending...")
            console.log({ userId: useAppStore.getState().userId })
            console.log({ otheruserId: useAppStore.getState().otherUserId })
            const message = {
                  label: constants.labels.WEBRTC_PROCESS,
                  data: {
                        type: constants.type.WEB_RTC.OFFER,
                        offer,
                        otherUserId: useAppStore.getState().otherUserId
                  }
            }
            wsConnection.emit('send-offer', message);



      }, [wsConnection, roomName, createPeerConnection])

      // OFFEREE: Handle Incoming Offer
      const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
            if (!wsConnection) return console.log("no ws connection");

            console.log("Offer received, creating answer...", offer)
            const pc = createPeerConnection();
            await getLocalStream(pc)
            setUpDataChannel(pc, false)

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log({ pc })
            await flushIceBuffer(pc);
            console.log("answer created, sending...")
            console.log({ userId: useAppStore.getState().userId })
            console.log({ otheruserId: useAppStore.getState().otherUserId })
            const message = {
                  label: constants.labels.WEBRTC_PROCESS,
                  data: {
                        type: constants.type.WEB_RTC.ANSWER,
                        answer,
                        otherUserId: useAppStore.getState().otherUserId
                  }
            }
            wsConnection.emit('send-answer', message);
      }, [wsConnection, roomName, createPeerConnection, flushIceBuffer, getLocalStream, setUpDataChannel])

      // OFFEROR: Handle Incoming Answer
      const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
            console.log({ pcRef })
            const pc = pcRef.current;
            if (!pc) return console.log("no peer connection")

            console.log("answer received, setting remote description...")
            await pc.setRemoteDescription(answer)
            await flushIceBuffer(pc)
            console.log("Remote description set")
      }, [])

      // Handle Incoming Ice Candidates
      const handleIceCandidates = useCallback(async (candidates: RTCIceCandidate[]) => {
            const pc = pcRef.current;
            if (!pc) return;

            for (const candidate of candidates) {
                  if (pc.remoteDescription) {
                        try {
                              await pc.addIceCandidate(candidate);
                              console.log("ice candidate added")
                        } catch (err) {
                              console.log("error adding ice candidates", err)
                        }
                  } else {
                        // buffer until remote description is set
                        console.log("buffering ice candidate")
                        iceCandidatesBuffer.current.push(candidate)
                  }
            }

      }, [])

      //  Send message via Data channel
      const sendMessage = useCallback((message: string) => {
            const dc = dataChannelRef.current;
            if (!dc || dc.readyState !== "open") {
                  return console.log("data channel not open")
            }
            dc.send(message)
            console.log("message sent", message)
      }, [])

      // Cleanup
      const cleanup = useCallback(() => {
            dataChannelRef.current?.close();
            pcRef.current?.close();
            dataChannelRef.current = null;
            pcRef.current = null;
            iceCandidatesBuffer.current = [];
            setIsConnected(false);
            setLocalStream(null);
            setRemoteStream(null)
            console.log("Peer connection cleaned up")
      }, [])
      return {
            startCall,
            handleOffer,
            handleAnswer,
            handleIceCandidates,
            sendMessage,
            cleanup,
            pc: pcRef.current
      }
}


