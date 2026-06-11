import InterviewForm from '@/components/InterviewForm';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';

const InterviewPage = async () => {
    const user = await getCurrentUser();
    if (!user) redirect('/sign-in');

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h2>Create an Interview</h2>
                <p className="text-light-400">
                    Fill in the details below and AI will generate a personalised set of questions for you.
                </p>
            </div>
            <InterviewForm userId={user.id} />
        </div>
    );
};

export default InterviewPage;
