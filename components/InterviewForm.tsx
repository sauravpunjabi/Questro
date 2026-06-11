'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { generateInterview } from '@/lib/actions/interview.action';

const LEVELS = ['Junior', 'Mid-level', 'Senior'];
const TYPES = ['Technical', 'Behavioral', 'Mixed'];
const AMOUNTS = [3, 5, 7, 10];

const InterviewForm = ({ userId }: { userId: string }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('Junior');
    const [type, setType] = useState('Technical');
    const [techstack, setTechstack] = useState('');
    const [amount, setAmount] = useState(5);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) {
            toast.error('Please enter a job role.');
            return;
        }

        setIsLoading(true);
        try {
            const techList = techstack
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);

            const { interviewId } = await generateInterview({
                role: role.trim(),
                level,
                type,
                techstack: techList,
                amount,
                userId,
            });

            toast.success('Interview created! Starting session...');
            router.push(`/interview/${interviewId}`);
        } catch {
            toast.error('Failed to create interview. Please try again.');
            setIsLoading(false);
        }
    };

    const inputClass =
        'rounded-lg border border-gray-700 bg-dark-200 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-200 w-full';

    return (
        <div className="card-border max-w-2xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="card flex flex-col gap-6 p-8">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Job Role</label>
                    <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className={inputClass}
                        disabled={isLoading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Experience Level</label>
                        <select
                            value={level}
                            onChange={e => setLevel(e.target.value)}
                            className={inputClass}
                            disabled={isLoading}
                        >
                            {LEVELS.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Interview Type</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className={inputClass}
                            disabled={isLoading}
                        >
                            {TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tech Stack</label>
                    <input
                        type="text"
                        placeholder="e.g. React, TypeScript, Node.js"
                        value={techstack}
                        onChange={e => setTechstack(e.target.value)}
                        className={inputClass}
                        disabled={isLoading}
                    />
                    <p className="text-xs text-light-400">Separate technologies with commas</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Number of Questions</label>
                    <select
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        className={inputClass}
                        disabled={isLoading}
                    >
                        {AMOUNTS.map(a => (
                            <option key={a} value={a}>{a} questions</option>
                        ))}
                    </select>
                </div>

                <Button type="submit" className="btn-primary" disabled={isLoading}>
                    {isLoading ? 'Generating interview...' : 'Create Interview'}
                </Button>
            </form>
        </div>
    );
};

export default InterviewForm;
