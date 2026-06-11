import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId } from '@/lib/actions/feedback.action';
import { getInterviewById } from '@/lib/actions/interview.action';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

const FeedbackPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const [feedback, interview] = await Promise.all([
    getFeedbackByInterviewId({ interviewId: id, userId: user.id }),
    getInterviewById(id),
  ]);

  if (!feedback) redirect('/');

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Interview Feedback</h1>
        {interview && (
          <p className="text-light-400 capitalize">{interview.role}</p>
        )}
      </div>

      <div className="card-border">
        <div className="card-interview items-center text-center gap-2">
          <p className="text-6xl font-bold">{feedback.totalScore}</p>
          <p className="text-light-400">Overall Performance</p>
          <p className="text-sm text-light-400">out of 100</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Category Breakdown</h2>
        <div className="flex flex-col gap-4">
          {feedback.categoryScores.map((category) => (
            <div key={category.name} className="card-border rounded-lg p-4 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <span className="font-semibold">{category.score}/10</span>
              </div>
              <p className="text-sm text-light-400">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Strengths</h2>
        <ul className="list-disc list-inside flex flex-col gap-1">
          {feedback.strengths.map((strength, i) => (
            <li key={i} className="text-light-400">{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Areas for Improvement</h2>
        <ul className="list-disc list-inside flex flex-col gap-1">
          {feedback.areasForImprovement.map((area, i) => (
            <li key={i} className="text-light-400">{area}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Final Assessment</h2>
        <p className="text-light-400">{feedback.finalAssessment}</p>
      </div>

      <div className="flex flex-row gap-4">
        <Link href="/" className="btn-secondary flex-1 text-center py-3 rounded-lg">
          Back to Dashboard
        </Link>
        <Link href={`/interview/${id}`} className="btn-primary flex-1 text-center py-3 rounded-lg">
          Retake Interview
        </Link>
      </div>

    </div>
  );
};

export default FeedbackPage;
