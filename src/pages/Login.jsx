import React from 'react'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input placeholder="Email" className="border w-full mb-3 p-2 rounded" />
        <input placeholder="Password" type="password" className="border w-full mb-3 p-2 rounded" />
        <a href="/dashboard" className="bg-indigo-600 text-white w-full block text-center py-2 rounded">
          Login
        </a>
      </div>
    </div>
  )
}
