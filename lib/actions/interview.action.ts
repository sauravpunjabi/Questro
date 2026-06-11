"use server";

import { db } from "@/firebase/admin";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const createInterview = async (params: Partial<Interview>) => {
    try {
        const interviewRef = db.collection('interviews').doc();
        const interviewData = {
            ...params,
            id: interviewRef.id,
            createdAt: new Date().toISOString(),
            finalized: false,
        };
        await interviewRef.set(interviewData);
        return interviewRef.id;
    } catch (error) {
        console.error("Error creating interview:", error);
        throw new Error("Failed to create interview");
    }
}

export const getInterviewById = async (id: string) => {
    try {
        const interviewDoc = await db.collection('interviews').doc(id).get();
        if (!interviewDoc.exists) {
            return null;
        }
        return interviewDoc.data() as Interview;
    } catch (error) {
        console.error("Error fetching interview:", error);
        throw new Error("Failed to fetch interview");
    }
}

export const getInterviewsByUserId = async (userId: string, limit?: number) => {
    try {
        let query = db.collection('interviews')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');

        if (limit) {
            query = query.limit(limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data() as Interview);
    } catch (error) {
        console.error("Error fetching interviews by user:", error);
        throw new Error("Failed to fetch interviews");
    }
}

export const generateInterview = async (params: {
    role: string;
    level: string;
    type: string;
    techstack: string[];
    amount: number;
    userId: string;
}) => {
    const { role, level, type, techstack, amount, userId } = params;

    const { text } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack.join(', ')}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]`,
    });

    let questions: string[];
    try {
        questions = JSON.parse(text.trim());
    } catch {
        questions = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    }

    const interviewRef = db.collection('interviews').doc();
    await interviewRef.set({
        id: interviewRef.id,
        role,
        level,
        type,
        techstack,
        questions,
        userId,
        finalized: false,
        createdAt: new Date().toISOString(),
    });

    return { interviewId: interviewRef.id };
}
