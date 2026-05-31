import Agent from '@/components/Agent';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/interview.action';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

const InterviewSessionPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const interview = await getInterviewById(id);
  if (!interview) redirect('/');

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-2xl font-semibold">{interview.role} Interview</h3>
      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        questions={interview.questions}
        type="interview"
      />
    </div>
  );
};

export default InterviewSessionPage;
