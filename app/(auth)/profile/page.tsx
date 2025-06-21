import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import ProfileForm from '../../../components/forms/ProfileForm'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ProfileForm />
      </div>
    </ProtectedRoute>
  )
} 