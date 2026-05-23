import { cn } from '@/lib/utils';
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { vapi } from '@/lib/vapi.sdk'
import { interviewer } from '@/constants'

enum CallStatus{
    Inactive = 'Inactive',
    Connecting = 'Connecting',
    Active = 'Active',
    Finished = 'Finished',
}

const Agent = ({ userName, questions } : AgentProps) => {

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.Inactive);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.Active);
        };
        const onCallEnd = () => {
            setCallStatus(CallStatus.Finished);
            setIsSpeaking(false);
        };
        const onMessage = (message: any) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages((prev) => [...prev, message.transcript]);
            }
        };
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        };
    }, []);

    const startCall = async () => {
        setCallStatus(CallStatus.Connecting);
        const joinedQuestions = questions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || '';
        await vapi.start(interviewer(joinedQuestions));
    };

    const stopCall = () => {
        vapi.stop();
    };

    const lastMessage = messages[messages.length - 1];

  return (

   <> 
    <div className='call-view'>
      
        <div className='card-interviewer'>

            <div className='avatar'>

                <Image src = "/ai-avatar.png" alt = "vapi" width={65} height={54} className='object-cover' />
                {isSpeaking && <span className='animate-speak' />}

            </div>
                <h3>Interviewer</h3>
        </div>

        <div className='card-border'>
            <div className='card-content'>
                <Image src = "/user-avatar.png" alt = "user avatar" width={540} height={540} className='rounded-full object-cover size-[120px]' />

                <h3>{userName}</h3>
            </div>
        </div>
    </div>


        {messages.length > 0 &&(
            <div className='transcript-border'>

                <div className='transcript'>
                    <p key={lastMessage} className = {cn(
                        'transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100'
                    )}>
                        {lastMessage}
                    </p>
                </div>

            </div>
        )}


        <div className='w-full flex justify-center'>
            {callStatus !== CallStatus.Active ? (
                <button onClick={startCall} className='relative btn-call'>
                    <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== CallStatus.Connecting && 'hidden')}/>

                        <span>
                            {callStatus === CallStatus.Inactive || callStatus === CallStatus.Finished ? 'Call' : '...'}
                        </span>
                </button>
            ) : (
                <button onClick={stopCall} className='btn-disconnect'>
                    End
                </button>
            )}
        </div>
   </>
  )
}

export default Agent
