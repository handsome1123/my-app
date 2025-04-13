export default function Register() {
  return (
    <main className="bg-gray-100 h-130 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-3/4 lg:w-2/3 overflow-hidden">
        {/* Image Section (Hidden on smaller screens) */}
        <div className="hidden lg:flex items-center justify-center bg-blue-100 p-8 w-1/2">
          <div className="relative">
            <img
              src="/images/login.jpg"
              alt="Shopping Illustration"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Login in Second Hand
          </h2>

          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email or Phone Number
              </label>
              <input
                type="text"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="your@email.com or Phone Number"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="********"
              />
            </div>
            <div>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              >
                Login
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
            >
              Sign up with Google
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Don't have account yet?{" "}
              <a href="/auth/register" className="text-blue-500 hover:underline">
                Create
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}