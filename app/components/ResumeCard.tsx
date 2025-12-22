import {Link} from "react-router"
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard=({resume:{id,companyName,jobTitle,feedback}}:{resume:Resume})=>{
    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="flex flex-col gap-2">
                <h2 className="text-black! font-bold wrap-break-word">
                    {companyName}
                </h2>

                <h3 className="text-lg wrap-break-word text-gray-500">
                    {jobTitle}
                </h3>
            </div>

            <div className="shrink-0">
                <ScoreCircle score={feedback.overallScore}/>
            </div>
        </Link>
    )
}

export default ResumeCard