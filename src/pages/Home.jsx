import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";

function Home() {

    const [jobs, setJobs] = useState([]);
  
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const res = await axios.get(
            "http://localhost:5000/api/jobs"
        );

        setJobs(res.data);
    };

    return (
        <>
        <div className="jobHeader"> 
        <h1>Jobs</h1>
        </div>

        <div className="jobContainer">
            {
                jobs.map((job) => (
                    <div className="jobCard" key={job._id}>
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                        <p>{job.location}</p>
                    </div>
                ))
            }
        </div>
        </>
    );
}

export default Home;