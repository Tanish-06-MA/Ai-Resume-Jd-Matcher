/**
 * ============================================================
 * CREATE SAMPLE RESUMES — One-time PDF Generator
 * ============================================================
 * 
 * Generates 10 sample resume PDFs for evaluation purposes.
 * Each resume is designed for a specific domain to create
 * realistic match/mismatch scenarios with the JD files.
 * 
 * Usage:  node create_sample_resumes.js
 * Requires: pdfkit (npm install pdfkit)
 * 
 * NOTE: These are synthetic resumes for demonstration.
 *       Replace with real resumes for meaningful evaluation.
 * ============================================================
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ──────── Output directory ────────
const RESUMES_DIR = path.join(__dirname, "resumes");

// Create directory if it doesn't exist
if (!fs.existsSync(RESUMES_DIR)) {
    fs.mkdirSync(RESUMES_DIR, { recursive: true });
}

// ──────── Resume Data ────────
// Each resume is designed to match (or not match) specific JDs

const resumes = [
    {
        filename: "resume1.pdf",
        name: "Rahul Sharma",
        title: "Full Stack Software Engineer",
        summary: "Experienced Full Stack Developer with 3 years of expertise in building scalable web applications using React.js, Node.js, and MongoDB. Passionate about clean code, RESTful API design, and cloud deployment.",
        skills: [
            "JavaScript", "TypeScript", "React.js", "Node.js", "Express.js",
            "MongoDB", "Mongoose", "REST API", "Git", "GitHub",
            "AWS EC2", "AWS S3", "Docker", "JWT Authentication",
            "HTML5", "CSS3", "Tailwind CSS", "Agile Scrum"
        ],
        experience: [
            {
                role: "Full Stack Developer",
                company: "WebTech Solutions",
                duration: "2022 - Present",
                points: [
                    "Built and maintained 5 React.js web applications serving 10K+ users",
                    "Designed RESTful APIs using Node.js and Express.js with MongoDB",
                    "Implemented JWT-based authentication and role-based authorization",
                    "Deployed applications on AWS EC2 with CI/CD pipelines using GitHub Actions",
                    "Optimized database queries reducing response time by 40 percent"
                ]
            },
            {
                role: "Frontend Developer Intern",
                company: "StartupHub Inc.",
                duration: "2021 - 2022",
                points: [
                    "Developed responsive UI components using React.js and Tailwind CSS",
                    "Integrated third-party APIs and payment gateways",
                    "Participated in code reviews and Agile sprint planning"
                ]
            }
        ],
        education: "B.Tech in Computer Science - VIT Vellore (2021)"
    },
    {
        filename: "resume2.pdf",
        name: "Priya Krishnan",
        title: "Data Scientist",
        summary: "Data Scientist with 4 years of experience building ML models, conducting EDA, and deploying AI solutions. Proficient in Python, TensorFlow, and statistical analysis. Published researcher in NLP.",
        skills: [
            "Python", "NumPy", "Pandas", "Scikit-learn", "TensorFlow",
            "PyTorch", "SQL", "Tableau", "Power BI", "NLP",
            "Deep Learning", "Statistical Modeling", "Hypothesis Testing",
            "A/B Testing", "AWS SageMaker", "Jupyter Notebooks"
        ],
        experience: [
            {
                role: "Data Scientist",
                company: "Analytics Pro Ltd.",
                duration: "2021 - Present",
                points: [
                    "Built classification and regression models achieving 92 percent accuracy on production data",
                    "Performed EDA on datasets with 10M+ records using Pandas and SQL",
                    "Implemented NLP pipeline for sentiment analysis using BERT and Hugging Face",
                    "Created interactive dashboards in Tableau for business stakeholders",
                    "Deployed models on AWS SageMaker with automated retraining pipelines"
                ]
            },
            {
                role: "ML Research Intern",
                company: "IIT Madras Research Lab",
                duration: "2020 - 2021",
                points: [
                    "Researched deep learning models for text classification",
                    "Published paper on attention mechanisms in NLP at AAAI workshop",
                    "Built data pipelines using Apache Spark for large-scale experiments"
                ]
            }
        ],
        education: "M.Sc. in Data Science - IIT Madras (2020)"
    },
    {
        filename: "resume3.pdf",
        name: "Sneha Patel",
        title: "Digital Marketing Specialist",
        summary: "Creative Digital Marketing Specialist with 3 years of experience managing SEO, social media campaigns, and content marketing. Skilled in Google Analytics, Facebook Ads, and email marketing automation.",
        skills: [
            "SEO", "SEM", "Google Analytics", "Google Ads", "Facebook Ads",
            "Instagram Marketing", "Content Writing", "Email Marketing",
            "HubSpot", "Mailchimp", "Canva", "WordPress",
            "Social Media Management", "Copywriting", "A/B Testing"
        ],
        experience: [
            {
                role: "Digital Marketing Executive",
                company: "GrowthHack Digital",
                duration: "2022 - Present",
                points: [
                    "Managed SEO strategy increasing organic traffic by 150 percent in 6 months",
                    "Ran Google Ads campaigns with average ROAS of 4.5x",
                    "Created email marketing campaigns with 35 percent open rate using Mailchimp",
                    "Managed social media accounts growing followers by 200 percent",
                    "Developed content calendar and published 50+ blog posts"
                ]
            }
        ],
        education: "BBA in Marketing - Delhi University (2021)"
    },
    {
        filename: "resume4.pdf",
        name: "Vikram Mehta",
        title: "Financial Analyst",
        summary: "Detail-oriented Financial Analyst with 4 years of experience in financial modeling, forecasting, and corporate finance. CFA Level II candidate with strong Excel and ERP skills.",
        skills: [
            "Financial Modeling", "Excel Advanced", "SAP ERP", "Power BI",
            "Tableau", "DCF Valuation", "Budgeting and Forecasting",
            "Variance Analysis", "GAAP", "Financial Reporting",
            "Bloomberg Terminal", "Corporate Finance", "Investment Analysis"
        ],
        experience: [
            {
                role: "Financial Analyst",
                company: "Deloitte India",
                duration: "2021 - Present",
                points: [
                    "Built 20+ financial models for M and A deals worth 500M+",
                    "Prepared quarterly financial reports for Fortune 500 clients",
                    "Conducted DCF and comparable company valuations",
                    "Automated reporting workflows using VBA macros saving 15 hours per week",
                    "Supported due diligence for 3 major acquisition deals"
                ]
            }
        ],
        education: "B.Com Hons - SRCC, Delhi University (2020), CFA Level II Candidate"
    },
    {
        filename: "resume5.pdf",
        name: "Arun Kumar",
        title: "DevOps Engineer",
        summary: "DevOps Engineer with 3 years of experience in cloud infrastructure, CI/CD automation, and container orchestration. AWS certified with hands-on Kubernetes and Terraform expertise.",
        skills: [
            "AWS EC2 S3 RDS Lambda ECS", "Docker", "Kubernetes",
            "Terraform", "Jenkins", "GitHub Actions", "GitLab CI",
            "Linux Administration", "Shell Scripting", "Ansible",
            "Prometheus", "Grafana", "ELK Stack", "Nginx",
            "CloudFormation", "Networking TCP/IP DNS"
        ],
        experience: [
            {
                role: "DevOps Engineer",
                company: "CloudNative Systems",
                duration: "2022 - Present",
                points: [
                    "Designed CI/CD pipelines using Jenkins and GitHub Actions for 15+ microservices",
                    "Managed Kubernetes clusters running 50+ containers in production",
                    "Implemented Infrastructure as Code using Terraform for AWS resources",
                    "Set up monitoring stack with Prometheus and Grafana dashboards",
                    "Achieved 99.95 percent uptime SLA for production applications"
                ]
            },
            {
                role: "Junior System Administrator",
                company: "InfoSys Ltd.",
                duration: "2021 - 2022",
                points: [
                    "Managed Linux servers and automated tasks using shell scripts",
                    "Configured Nginx reverse proxy and load balancers",
                    "Assisted in Docker containerization of legacy applications"
                ]
            }
        ],
        education: "B.Tech in Computer Science - NIT Trichy (2021), AWS Solutions Architect Certified"
    },
    {
        filename: "resume6.pdf",
        name: "Ananya Gupta",
        title: "UX/UI Designer",
        summary: "Creative UX/UI Designer with 4 years of experience designing intuitive interfaces for web and mobile apps. Expert in Figma, user research, and design systems. Strong portfolio of user-centered designs.",
        skills: [
            "Figma", "Sketch", "Adobe XD", "User Research",
            "Wireframing", "Prototyping", "Design Systems",
            "Responsive Design", "HTML", "CSS", "Accessibility WCAG",
            "Usability Testing", "User Journey Mapping",
            "Information Architecture", "Motion Design"
        ],
        experience: [
            {
                role: "Senior UX Designer",
                company: "DesignLab Studio",
                duration: "2021 - Present",
                points: [
                    "Led UX design for 8 web and 3 mobile applications",
                    "Created comprehensive design system with 100+ reusable components",
                    "Conducted user research with 200+ participants across 5 projects",
                    "Improved user task completion rate by 35 percent through iterative design",
                    "Mentored 2 junior designers on design thinking methodology"
                ]
            },
            {
                role: "UI Designer",
                company: "Creative Minds Agency",
                duration: "2020 - 2021",
                points: [
                    "Designed high-fidelity mockups and interactive prototypes in Figma",
                    "Collaborated with developers to ensure pixel-perfect implementation",
                    "Created responsive designs following WCAG accessibility standards"
                ]
            }
        ],
        education: "B.Des in Communication Design - NID Ahmedabad (2020)"
    },
    {
        filename: "resume7.pdf",
        name: "Dr. Meera Nair",
        title: "Hospital Administrator",
        summary: "Healthcare Administrator with 6 years of experience managing hospital operations, regulatory compliance, and quality improvement programs. Expertise in NABH accreditation and EHR systems.",
        skills: [
            "Hospital Management", "NABH Accreditation", "EHR Systems",
            "Patient Safety", "Quality Improvement", "Budget Management",
            "Medical Billing", "Insurance Processing", "Staff Management",
            "Healthcare Analytics", "HIPAA Compliance", "Telemedicine"
        ],
        experience: [
            {
                role: "Deputy Hospital Administrator",
                company: "Apollo Hospitals",
                duration: "2020 - Present",
                points: [
                    "Managed daily operations for 300-bed hospital facility",
                    "Led NABH accreditation process achieving accreditation in first attempt",
                    "Implemented new EHR system reducing documentation time by 30 percent",
                    "Managed annual budget of INR 50 Crores",
                    "Improved patient satisfaction scores from 78 to 92 percent"
                ]
            },
            {
                role: "Administrative Officer",
                company: "Fortis Healthcare",
                duration: "2018 - 2020",
                points: [
                    "Coordinated with 50+ medical staff on patient care protocols",
                    "Handled medical billing and insurance claim processing",
                    "Trained 20+ staff on compliance and safety procedures"
                ]
            }
        ],
        education: "MHA Hospital Administration - TISS Mumbai (2018)"
    },
    {
        filename: "resume8.pdf",
        name: "Karthik Rajan",
        title: "Backend Developer",
        summary: "Senior Backend Developer with 5 years of experience building high-performance microservices using Java and Spring Boot. Experienced in distributed systems, API design, and database optimization.",
        skills: [
            "Java", "Spring Boot", "Spring Security", "Spring Data",
            "PostgreSQL", "MySQL", "Redis", "Kafka", "RabbitMQ",
            "REST API", "GraphQL", "Docker", "JUnit", "Mockito",
            "Microservices", "Design Patterns", "SOLID Principles",
            "OAuth2", "JWT", "Git"
        ],
        experience: [
            {
                role: "Senior Backend Developer",
                company: "FinTech Innovations",
                duration: "2021 - Present",
                points: [
                    "Designed and built 12 microservices handling 1M+ transactions per day",
                    "Implemented event-driven architecture using Apache Kafka",
                    "Optimized PostgreSQL queries reducing latency by 60 percent",
                    "Built OAuth2 authentication system supporting 500K+ users",
                    "Mentored team of 4 junior developers and conducted code reviews"
                ]
            },
            {
                role: "Java Developer",
                company: "TCS Digital",
                duration: "2019 - 2021",
                points: [
                    "Developed RESTful APIs using Spring Boot for banking applications",
                    "Implemented Redis caching reducing database load by 40 percent",
                    "Wrote unit and integration tests achieving 85 percent code coverage"
                ]
            }
        ],
        education: "B.Tech in Computer Science - BITS Pilani (2019)"
    },
    {
        filename: "resume9.pdf",
        name: "Deepa Malhotra",
        title: "Sales Manager",
        summary: "Results-driven Sales Manager with 4 years of experience in B2B enterprise sales. Consistent top performer exceeding quarterly targets by 120 percent. Expert in Salesforce CRM and solution selling.",
        skills: [
            "B2B Sales", "Enterprise Sales", "Salesforce CRM",
            "Lead Generation", "Sales Presentations", "Negotiation",
            "Account Management", "Pipeline Management",
            "Solution Selling", "SPIN Selling", "Contract Negotiation",
            "Revenue Forecasting", "Client Relationship Management"
        ],
        experience: [
            {
                role: "Enterprise Sales Manager",
                company: "SaaS Solutions India",
                duration: "2021 - Present",
                points: [
                    "Managed enterprise accounts worth 2M+ annual revenue",
                    "Exceeded sales quota by 120 percent for 6 consecutive quarters",
                    "Built relationships with C-level executives at 30+ companies",
                    "Closed 15 enterprise deals with average contract value of 150K",
                    "Created sales playbooks and trained 5 new sales representatives"
                ]
            },
            {
                role: "Business Development Executive",
                company: "Tech Mahindra",
                duration: "2020 - 2021",
                points: [
                    "Generated 50+ qualified leads per quarter through cold outreach",
                    "Conducted product demos for 100+ prospective clients",
                    "Maintained Salesforce CRM with 95 percent data accuracy"
                ]
            }
        ],
        education: "MBA in Marketing - IIM Lucknow (2020)"
    },
    {
        filename: "resume10.pdf",
        name: "Arjun Reddy",
        title: "Machine Learning Engineer",
        summary: "ML Engineer with 3 years of experience building and deploying production ML systems. Skilled in PyTorch, Hugging Face Transformers, and MLOps. Active open-source contributor.",
        skills: [
            "Python", "PyTorch", "TensorFlow", "Hugging Face Transformers",
            "NLP", "Computer Vision", "Scikit-learn", "Docker",
            "Kubernetes", "MLflow", "AWS SageMaker", "GCP Vertex AI",
            "Apache Spark", "Airflow", "Git", "Model Optimization",
            "Feature Engineering", "Deep Learning"
        ],
        experience: [
            {
                role: "ML Engineer",
                company: "AI Labs India",
                duration: "2022 - Present",
                points: [
                    "Built NLP pipeline for text classification serving 5M+ requests per day",
                    "Deployed 10+ ML models using Docker and Kubernetes on AWS",
                    "Implemented model monitoring using MLflow and Weights and Biases",
                    "Developed computer vision model for object detection with 95 percent mAP",
                    "Reduced model inference latency by 50 percent through quantization and ONNX"
                ]
            },
            {
                role: "Data Science Intern",
                company: "Microsoft Research India",
                duration: "2021 - 2022",
                points: [
                    "Built recommendation system using collaborative filtering",
                    "Implemented BERT-based sentiment analysis model",
                    "Contributed to open-source Hugging Face model hub"
                ]
            }
        ],
        education: "M.Tech in AI - IISc Bangalore (2021)"
    }
];

// ──────── PDF Generation Function ────────
// Uses buffer-based approach for maximum compatibility with pdf-parse

function generateResumePDF(resumeData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            compress: false  // Disable compression for better pdf-parse compatibility
        });

        // Collect PDF into a buffer first, then write to file
        // This avoids stream-related XRef corruption issues
        const chunks = [];

        doc.on("data", (chunk) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            const filePath = path.join(RESUMES_DIR, resumeData.filename);
            fs.writeFileSync(filePath, pdfBuffer);
            console.log(`  Generated: ${resumeData.filename}`);
            resolve(filePath);
        });

        doc.on("error", (err) => {
            console.error(`  Error generating ${resumeData.filename}:`, err);
            reject(err);
        });

        // ---- Header: Name and Title ----
        doc.fontSize(22).font("Helvetica-Bold").text(resumeData.name, { align: "center" });
        doc.fontSize(14).font("Helvetica").text(resumeData.title, { align: "center" });
        doc.moveDown(0.5);

        // ---- Divider ----
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        // ---- Summary ----
        doc.fontSize(12).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
        doc.moveDown(0.3);
        doc.fontSize(10).font("Helvetica").text(resumeData.summary, { align: "justify" });
        doc.moveDown(0.5);

        // ---- Skills ----
        doc.fontSize(12).font("Helvetica-Bold").text("TECHNICAL SKILLS");
        doc.moveDown(0.3);

        // Write skills as a comma-separated list (simple text, no special chars)
        doc.fontSize(10).font("Helvetica").text(resumeData.skills.join(", "), { align: "left" });
        doc.moveDown(0.5);

        // ---- Experience ----
        doc.fontSize(12).font("Helvetica-Bold").text("WORK EXPERIENCE");
        doc.moveDown(0.3);

        for (const exp of resumeData.experience) {
            doc.fontSize(11).font("Helvetica-Bold").text(`${exp.role} at ${exp.company}`);
            doc.fontSize(9).font("Helvetica").text(exp.duration);
            doc.moveDown(0.2);

            for (const point of exp.points) {
                doc.fontSize(10).font("Helvetica").text(`- ${point}`, { indent: 15 });
            }
            doc.moveDown(0.3);
        }

        // ---- Education ----
        doc.fontSize(12).font("Helvetica-Bold").text("EDUCATION");
        doc.moveDown(0.3);
        doc.fontSize(10).font("Helvetica").text(resumeData.education);

        // ---- Finalize the PDF document ----
        doc.end();
    });
}

// ──────── Main: Generate All Resumes ────────

async function main() {
    console.log("\n  Generating Sample Resume PDFs...\n");

    for (const resume of resumes) {
        await generateResumePDF(resume);
    }

    console.log(`\n  All ${resumes.length} resumes generated in: ${RESUMES_DIR}\n`);
}

main().catch(console.error);
