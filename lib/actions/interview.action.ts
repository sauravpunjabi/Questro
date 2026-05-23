"use server";

import { db } from "@/firebase/admin";

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
