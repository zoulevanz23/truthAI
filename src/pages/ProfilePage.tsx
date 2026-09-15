import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { } from 'lucide-react'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated via token
    const token = localStorage.getItem('truthcheck-auth-token')
    if (!token) {
      navigate('/signin')
      return
    }

    fetch('/api/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
        // Clear invalid token
        localStorage.removeItem('truthcheck-auth-token')
        localStorage.removeItem('truthcheck-user')
        navigate('/signin')
      })
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">Loading profile…
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-4">
          {error}
        </div>
        <Button to="/signin" className="block w-full py-2.5 px-4 font-medium text-center text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
          Go to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Profile</h2>

      {user ? (
        <div>
          <div className="mb-4">
            <Label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="email">
              Email
            </Label>
            <p className="p-2 bg-slate-50 rounded-md font-mono" style={{ wordBreak: 'break-all' }}>{user.email}</p>
          </div>

          {user.name && (
            <div className="mb-4">
              <Label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="name">
                Display name
              </Label>
              <p className="p-2 bg-slate-50 rounded-md font-mono">{user.name}</p>
            </div>
          )}

          <div className="mb-4">
            <Label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="createdAt">
              Member since
            </Label>
            <p className="text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-center">Unable to load profile.</p>
      )}

      <div className="mt-8 text-center">
        <Link to="/settings" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">
          Settings
        </Link>
        <Link to="/signin" className="mt-2 text-slate-500 hover:text-slate-900 font-medium transition-colors block">
          Sign out
        </Link>
      </div>
    </div>
  )
}

export default ProfilePage