export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} MFU SecondHand. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="/about" className="hover:text-blue-500">About</a>
          <a href="/contact" className="hover:text-blue-500">Contact</a>
          <a href="/privacy" className="hover:text-blue-500">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
