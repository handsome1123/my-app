export default function Register() {
    return (
      <main className="bg-gray-100 h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg flex w-3/4 lg:w-2/3 overflow-hidden">
          {/* Image Section (Hidden on smaller screens) */}
          <div className="hidden lg:flex items-center justify-center bg-blue-100 p-8 w-1/2">
            <div className="relative">
              <img
                src="https://via.placeholder.com/400x400/ADD8E6/000000?Text=Shopping"
                alt="Shopping Illustration"
                className="rounded-lg shadow-md"
              />
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-75 rounded-md p-2 text-sm text-gray-700">
                Image for visual appeal
              </div>
            </div>
          </div>
  
          {/* Form Section */}
          <div className="p-8 w-full lg:w-1/2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Create an account
            </h2>
            <p className="text-gray-600 mb-6">Enter your details below</p>
  
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Your Name"
                />
              </div>
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
                  Create Account
                </button>
              </div>
            </form>
  
            <div className="mt-6">
              <button
                className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.29 3.71a1 1 0 0 1 1.414 1.414L4.414 20.29a1 1 0 0 1-1.414-1.414L20.29 3.71z" />
                  <path d="M20.29 20.29a1 1 0 0 1-1.414 1.414L3.71 4.414a1 1 0 0 1 1.414-1.414L20.29 20.29z" />
                  <path d="M18 2h-3a5 5 0 0 0-5 5H5a2 2 0 0 0-2 2v3a5 5 0 0 0 5 5h3a2 2 0 0 0 2-2v-3a5 5 0 0 0-5-5H7" />
                  <path d="M15 12v-2a3 3 0 0 0-3-3H6" />
                  <path d="M15 16v2a3 3 0 0 0 3 3h6" />
                  <path d="M12 15h-6" />
                  <path d="M12 9h-6" />
                </svg>
                Sign up with Google
              </button>
            </div>
  
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Log in
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }