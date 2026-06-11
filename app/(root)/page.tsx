import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewsByUserId } from '@/lib/actions/interview.action';
import { redirect } from 'next/navigation';


const page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const interviews = await getInterviewsByUserId(user.id, 6);

  return (
    <>
      <section className='card-cta'>

        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get interview ready with AI powered practice & feedback</h2>

          <p className='text-lg'>
            Practice on real interview questions & get instant feedback
          </p>

          <Button asChild className='btn-primary max-sm:w-full'>
          <Link href='/interview'>
            Start an interview

          </Link>
          </Button>
        </div>

        <Image src= '/robot.png' alt = "robot" width={400} height={400} className='max-sm:hidden'/>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
          <h2>Your Interviews</h2>

          <div className='interviews-section'>
            {interviews.length > 0 ? (
              interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interviewId={interview.id}
                  userId={user.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                />
              ))
            ) : (
              <div className='flex flex-col items-center gap-4 py-12 text-center'>
                <h3>No interviews yet</h3>
                <p className='text-light-400'>Start your first interview to see it here</p>
                <Button asChild className='btn-primary'>
                  <Link href='/interview'>Create Interview</Link>
                </Button>
              </div>
            )}
          </div>
      </section>
    </>
  )
}

export default page
