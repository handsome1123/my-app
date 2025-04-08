export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold">Login</h2>
        <form className="mt-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 mb-2 w-full"
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 mb-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
        </form>
        <a href="register/">Register</a>
        </div>
    )
}