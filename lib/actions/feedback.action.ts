"use server";

import { db } from "@/firebase/admin";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const createFeedback = async (params: CreateFeedbackParams) => {
    try {
        const { interviewId, userId, transcript, feedbackId } = params;

        const transcriptText = transcript.map(t => `${t.role}: ${t.content}`).join('\n');
        
        const prompt = `You are an expert interviewer evaluating a candidate based on the following transcript.
        
Transcript:
${transcriptText}

Evaluate the candidate and provide constructive feedback.
Return ONLY a valid JSON object strictly matching this structure (no markdown formatting, no code blocks):
{
  "totalScore": number,
  "categoryScores": [
    { "name": "Communication Skills", "score": number, "comment": "string" },
    { "name": "Technical Knowledge", "score": number, "comment": "string" },
    { "name": "Problem Solving", "score": number, "comment": "string" },
    { "name": "Cultural Fit", "score": number, "comment": "string" },
    { "name": "Confidence and Clarity", "score": number, "comment": "string" }
  ],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "finalAssessment": "string"
}`;

        const { text } = await generateText({
            model: google("gemini-1.5-pro"),
            prompt,
        });

        // Parse the JSON feedback matching the Feedback interface
        const parsedFeedback = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());

        const feedbackRef = feedbackId 
            ? db.collection('feedback').doc(feedbackId)
            : db.collection('feedback').doc();

        const feedbackData = {
            id: feedbackRef.id,
            interviewId,
            userId,
            ...parsedFeedback,
            createdAt: new Date().toISOString(),
        };

        await feedbackRef.set(feedbackData);
        
        // Also mark the interview as finalized
        await db.collection('interviews').doc(interviewId).update({
            finalized: true
        });

        return feedbackRef.id;
    } catch (error) {
        console.error("Error creating feedback:", error);
        throw new Error("Failed to create feedback");
    }
}

export const getFeedbackByInterviewId = async (params: GetFeedbackByInterviewIdParams) => {
    try {
        const { interviewId, userId } = params;
        
        const snapshot = await db.collection('feedback')
            .where('interviewId', '==', interviewId)
            .where('userId', '==', userId)
            .get();
            
        if (snapshot.empty) {
            return null;
        }
        
        return snapshot.docs[0].data() as Feedback;
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw new Error("Failed to fetch feedback");
    }
}
