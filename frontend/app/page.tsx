export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-6">Task Manager 🚀</h1>

      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </a>

        <a
          href="/register"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Register
        </a>
      </div>
    </div>
  );
}