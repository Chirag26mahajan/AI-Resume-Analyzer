import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

type Props = {
    resume: Resume;
    onDelete: (id: string) => void;
};

const ResumeCard = ({
                        resume: { id, companyName, jobTitle, feedback, imagePath },
                        onDelete,
                    }: Props) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState("");

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if (!blob) return;
            setResumeUrl(URL.createObjectURL(blob));
        };

        loadResume();
    }, [imagePath]);

    return (
        <div className="relative bg-white rounded-2xl shadow-md p-4 w-full">

            {/* ❌ Delete Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm("Remove this resume?")) {
                        onDelete(id);
                    }
                }}
                className="absolute top-3 right-3 z-10
                   w-7 h-7 rounded-full flex items-center justify-center
                   bg-white shadow hover:bg-red-50"
            >
                ✕
            </button>

            <Link to={`/resume/${id}`} className="block">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                        {companyName && (
                            <h2 className="font-bold truncate">{companyName}</h2>
                        )}
                        {jobTitle && (
                            <h3 className="text-sm text-gray-500 truncate">
                                {jobTitle}
                            </h3>
                        )}
                        {!companyName && !jobTitle && (
                            <h2 className="font-bold">Resume</h2>
                        )}
                    </div>

                    <ScoreCircle score={feedback.overallScore} />
                </div>

                {/* Resume Preview */}
                {resumeUrl && (
                    <div className="rounded-xl overflow-hidden border">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] object-cover object-top"
                        />
                    </div>
                )}
            </Link>
        </div>
    );
};

export default ResumeCard;
