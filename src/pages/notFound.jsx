import NotFoundIllustration from "../components/NotFoundIllustration";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 bg-gray-50">
      <NotFoundIllustration className="w-full max-w-2xl" />

      <div className="">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
