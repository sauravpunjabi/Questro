'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { createFeedback } from '@/lib/actions/feedback.action';

enum CallStatus {
  Inactive = 'Inactive',
  Connecting = 'Connecting',
  Active = 'Active',
  Finished = 'Finished',
}

interface Message {
  role: 'interviewer' | 'user';
  content: string;
}

const Agent = ({ userName, userId, interviewId, questions = [], type: _type }: AgentProps) => {
  const router = useRouter();

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.Inactive);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep ref in sync so the feedback effect always reads the latest messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (callStatus !== CallStatus.Finished) return;

    const triggerFeedback = async () => {
      if (!interviewId || !userId) return;
      toast.success('Interview completed! Generating your feedback...');
      setIsLoading(true);
      try {
        await createFeedback({ interviewId, userId, transcript: messagesRef.current });
        router.push(`/interview/${interviewId}/feedback`);
      } catch {
        toast.error('Failed to generate feedback. Please try again.');
        setIsLoading(false);
      }
    };

    triggerFeedback();
  }, [callStatus]);  // eslint-disable-line react-hooks/exhaustive-deps

  const startCall = () => {
    setCallStatus(CallStatus.Connecting);
    setTimeout(() => {
      setCallStatus(CallStatus.Active);
      if (questions.length > 0) {
        setMessages([{ role: 'interviewer', content: questions[0] }]);
        setCurrentQuestionIndex(1);
      }
    }, 1500);
  };

  const endCall = () => {
    setCallStatus(CallStatus.Finished);
  };

  const sendMessage = () => {
    if (!currentInput.trim()) return;

    const userMessage: Message = { role: 'user', content: currentInput.trim() };
    const updatedMessages = [...messages, userMessage];
    setCurrentInput('');

    if (currentQuestionIndex < questions.length) {
      const nextQuestion: Message = { role: 'interviewer', content: questions[currentQuestionIndex] };
      setMessages([...updatedMessages, nextQuestion]);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setMessages([
        ...updatedMessages,
        { role: 'interviewer', content: 'Thank you for your time. We will process your feedback shortly.' },
      ]);
      setCallStatus(CallStatus.Finished);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent mb-4" />
          <p className="text-white text-lg font-medium">Generating your feedback...</p>
        </div>
      )}

      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="interviewer" width={65} height={54} className="object-cover" />
          </div>
          <h3>Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn('flex mb-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <p
                  className={cn(
                    'max-w-[75%] rounded-lg px-4 py-2 text-sm',
                    msg.role === 'interviewer' ? 'bg-gray-800 text-gray-100' : 'bg-primary-200 text-dark-100'
                  )}
                >
                  {msg.content}
                </p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {callStatus === CallStatus.Active && (
        <div className="w-full flex flex-col gap-2 px-4 mt-4">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Ctrl+Enter to send)"
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-dark-200 text-white px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <div className="flex justify-end">
            <button
              onClick={sendMessage}
              disabled={!currentInput.trim()}
              className="btn-call px-6 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-4">
        {callStatus !== CallStatus.Active ? (
          <button onClick={startCall} className="relative btn-call">
            <span
              className={cn(
                'absolute animate-ping rounded-full opacity-75',
                callStatus !== CallStatus.Connecting && 'hidden'
              )}
            />
            <span>
              {callStatus === CallStatus.Inactive || callStatus === CallStatus.Finished ? 'Call' : '...'}
            </span>
          </button>
        ) : (
          <button onClick={endCall} className="btn-disconnect">
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
