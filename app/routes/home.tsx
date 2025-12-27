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
      const parsed = items?.map((item) =>
          JSON.parse(item.value)
      ) as Resume[];

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
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />

        <section className="relative">
          <div className="py-16 text-center px-4">
            <h1 className="text-3xl font-bold">
              Track Your Applications & Resume Ratings
            </h1>

            {!loadingResumes && resumes.length === 0 ? (
                <h2 className="mt-3 text-gray-500">
                  No resumes found. Upload your first resume to get feedback.
                </h2>
            ) : (
                <h2 className="mt-3 text-gray-500">
                  Review your submissions and check AI-powered feedback.
                </h2>
            )}
          </div>

          {loadingResumes && (
              <div className="flex justify-center">
                <img
                    src="/images/resume-scan-2.gif"
                    className="w-[200px]"
                    alt="Loading"
                />
              </div>
          )}

          {!loadingResumes && resumes.length > 0 && (
              <section className="px-8 pb-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {resumes.map((resume) => (
                      <ResumeCard
                          key={resume.id}
                          resume={resume}
                          onDelete={handleDelete}
                      />
                  ))}
                </div>
              </section>
          )}

          {!loadingResumes && resumes.length === 0 && (
              <div className="flex justify-center mt-10">
                <Link
                    to="/upload"
                    className="primary-button text-xl font-semibold"
                >
                  Upload Resume
                </Link>
              </div>
          )}
        </section>
      </main>
  );
}
