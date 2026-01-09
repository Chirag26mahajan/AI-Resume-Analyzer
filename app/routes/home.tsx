import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsed = items?.map((item) => JSON.parse(item.value)) as Resume[];

      setResumes(parsed || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  const handleDelete = async (id: string) => {
    await kv.delete(`resume:${id}`);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
      <main className="bg-[url('/images/bgmain.png')] bg-cover min-h-screen">
        <Navbar />

        <section className="relative py-16 px-4 flex flex-col items-center min-h-[60vh]">
          <h1 className="text-3xl font-bold text-center mb-4">
            Track Your Applications & Resume Ratings
          </h1>

          {loadingResumes ? (
              <div className="flex justify-center mt-10">
                <img
                    src="/images/resume-scan-2.gif"
                    className="w-50"
                    alt="Loading"
                />
              </div>
          ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center mt-6 gap-6">
                <h2 className="text-gray-500 text-center">
                  No resumes found. Upload your first resume to get feedback.
                </h2>
                <Link
                    to="/upload"
                    className="primary-button text-xl font-semibold px-8 w-auto"
                >
                  Upload Resume
                </Link>
              </div>
          ) : (
              <>
                <h2 className="text-gray-500 text-center mt-3 mb-10">
                  Review your submissions and check AI-powered feedback.
                </h2>
                <div className="px-4 w-full max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                    {resumes.map((resume) => (
                        <ResumeCard
                            key={resume.id}
                            resume={resume}
                            onDelete={handleDelete}
                        />
                    ))}
                  </div>
                </div>
              </>
          )}
        </section>
      </main>
  );
}
