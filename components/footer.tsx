"use client";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} DocVerify. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/about" className="hover:underline">About</a>
          <a href="mailto:support@docverify.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
