import { Auth, User, NextOrObserver, Unsubscribe, AuthError } from 'firebase/auth'
import { Firestore, DocumentData, Query, DocumentReference, CollectionReference } from 'firebase/firestore'
import { FirebaseStorage, StorageReference } from 'firebase/storage'

export class MockAuthError extends Error implements AuthError {
  code: string
  name: string
  customData: any

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'MockAuthError'
    this.customData = {}
  }
}

export const createMockAuth = (): Partial<Auth> => ({
  currentUser: null,
  onAuthStateChanged: (observer: NextOrObserver<User | null>): Unsubscribe => {
    if (typeof observer === 'function') observer(null)
    return () => {}
  },
  signInWithEmailAndPassword: async () => {
    throw new MockAuthError('auth/internal-error', 'Firebase Auth not available')
  },
  createUserWithEmailAndPassword: async () => {
    throw new MockAuthError('auth/internal-error', 'Firebase Auth not available')
  },
  signOut: async () => {},
  sendPasswordResetEmail: async () => {
    throw new MockAuthError('auth/internal-error', 'Firebase Auth not available')
  },
  verifyPasswordResetCode: async () => {
    throw new MockAuthError('auth/internal-error', 'Firebase Auth not available')
  },
  confirmPasswordReset: async () => {
    throw new MockAuthError('auth/internal-error', 'Firebase Auth not available')
  }
})

export const createMockFirestore = (): Partial<Firestore> => ({
  collection: (path: string): Partial<CollectionReference<DocumentData>> => ({
    doc: (id?: string): Partial<DocumentReference<DocumentData>> => ({
      id: id || 'mock-id',
      path: `${path}/${id || 'mock-id'}`,
      get: async () => ({
        exists: () => false,
        data: () => null,
        id: id || 'mock-id'
      }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    }),
    add: async (data: DocumentData) => ({
      id: 'mock-id',
      path: `${path}/mock-id`,
      get: async () => ({
        exists: () => true,
        data: () => data,
        id: 'mock-id'
      })
    } as any),
    where: () => ({} as Query<DocumentData>),
    orderBy: () => ({} as Query<DocumentData>),
    limit: () => ({} as Query<DocumentData>)
  })
})

export const createMockStorage = (): Partial<FirebaseStorage> => ({
  ref: (path?: string): Partial<StorageReference> => ({
    fullPath: path || 'mock-path',
    name: path?.split('/').pop() || 'mock-file',
    bucket: 'mock-bucket',
    parent: null,
    root: null,
    toString: () => `gs://mock-bucket/${path || 'mock-path'}`,
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'https://mock-url.com/mock-file'
      }
    }),
    getDownloadURL: async () => 'https://mock-url.com/mock-file',
    delete: async () => {}
  })
})
