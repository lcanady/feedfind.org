import { db } from './firebase'
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc, onSnapshot, Unsubscribe, updateDoc } from 'firebase/firestore'
import { DatabaseService } from './databaseService'
import type { ForumPost, ForumReply, CreateForumReplyData } from '@/types/database'

export class ForumService extends DatabaseService {
  private readonly COLLECTION_NAME = 'forum_posts'
  private readonly REPLIES_COLLECTION = 'forum_replies'

  async createForumPost(data: {
    title: string
    content: string
    category: string
    authorId: string
    authorName: string
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        replies: 0,
        views: 0,
        status: 'active'
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating forum post:', error)
      throw new Error('Failed to create forum post')
    }
  }

  async createReply(data: CreateForumReplyData): Promise<string> {
    try {
      // Create the reply
      const docRef = await addDoc(collection(db, this.REPLIES_COLLECTION), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        status: 'active'
      })

      // Update the post's reply count
      const postRef = doc(db, this.COLLECTION_NAME, data.postId)
      const postDoc = await getDoc(postRef)
      if (postDoc.exists()) {
        const currentReplies = postDoc.data().replies || 0
        await updateDoc(postRef, {
          replies: currentReplies + 1,
          lastActivity: serverTimestamp()
        })
      }

      return docRef.id
    } catch (error) {
      console.error('Error creating forum reply:', error)
      throw new Error('Failed to create forum reply')
    }
  }

  async getPosts(category?: string): Promise<ForumPost[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )

      if (category) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumPost))
    } catch (error) {
      console.error('Error fetching forum posts:', error)
      throw new Error('Failed to fetch forum posts')
    }
  }

  async getReplies(postId: string): Promise<ForumReply[]> {
    try {
      const q = query(
        collection(db, this.REPLIES_COLLECTION),
        where('postId', '==', postId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'asc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumReply))
    } catch (error) {
      console.error('Error fetching forum replies:', error)
      throw new Error('Failed to fetch forum replies')
    }
  }

  subscribeToForumPosts(
    callback: (posts: ForumPost[]) => void,
    category?: string
  ): Unsubscribe {
    let q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )

    if (category) {
      q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    }

    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumPost))
      callback(posts)
    })
  }

  subscribeToReplies(
    postId: string,
    callback: (replies: ForumReply[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.REPLIES_COLLECTION),
      where('postId', '==', postId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      const replies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ForumReply))
      callback(replies)
    })
  }

  async getForumPost(postId: string): Promise<ForumPost | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, postId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ForumPost
      }
      
      return null
    } catch (error) {
      console.error('Error fetching forum post:', error)
      throw new Error('Failed to fetch forum post')
    }
  }
}

// Create and export a singleton instance
export const forumService = new ForumService() 