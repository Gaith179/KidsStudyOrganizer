/**
 * Sample / Initial Seed Data for Ryan (Grade 8 - IGCSE Prep) & Jad (Grade 5)
 */
const DEFAULT_STUDY_DATA = {
  kids: [
    {
      id: "ryan",
      name: "Ryan (ريان)",
      grade: "Grade 8 - IGCSE Checkpoint (CS - A)",
      school: "Alliance Academy Jordan - مدارس التحالف الدولية",
      avatar: "🎓",
      themeColor: "#4f46e5",
      accentColor: "#818cf8",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
      subjects: [
        { id: "math_r", name: "Mathematics", icon: "📐", color: "#3b82f6" },
        { id: "eng_r", name: "English Language & Lit", icon: "📚", color: "#ec4899" },
        { id: "phys_r", name: "Physics", icon: "⚡", color: "#8b5cf6" },
        { id: "chem_r", name: "Chemistry", icon: "🧪", color: "#06b6d4" },
        { id: "bio_r", name: "Biology", icon: "🧬", color: "#10b981" },
        { id: "ict_r", name: "ICT & Computer Science", icon: "💻", color: "#f59e0b" },
        { id: "arab_r", name: "Arabic Language", icon: "📖", color: "#6366f1" },
        { id: "social_r", name: "Social Studies", icon: "🌍", color: "#14b8a6" }
      ],
      weeklyPlan: {
      "weekTitle": "Eighth Grade CS - A (Sat 24 October - Thu 29 October, 2026)",
      "days": {
            "saturday": [
                  {
                        "subject": "Science",
                        "outcome": "Chapter 3: Forces and Energy - 3.1: Density: Discover what is meant by density and find out how to calculate density",
                        "topic": "Chapter 3: Forces and Energy (3.1 Density)",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's book"
                  },
                  {
                        "subject": "ICT and Computer Science",
                        "outcome": "Count-Controlled Loops Using FOR: A count-controlled loop repeats instructions a specific number of times (counter variable, start, end value)",
                        "topic": "Count-Controlled Loops Using FOR (Pages 30-34)",
                        "homework": "",
                        "exam": "",
                        "reference": "Computing Book p.30-34"
                  },
                  {
                        "subject": "Arabic Language",
                        "outcome": "يقرأ الدّرس قراءة صحيحة حسب معايير القراءة، يفهم الأفكار والمعاني الجديدة، يجيب عن أسئلة خاصة بالدّرس",
                        "topic": "القراءة والفهم (الوحدة الثالثة: نساء رائدات)",
                        "homework": "",
                        "exam": "",
                        "reference": "الشرائح التقديمية، كتاب الطالب، دفتر الطالب"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Lesson 1+2: Read and analyse Extract 1 of 'The Case of the Missing Masterpiece', identify key story elements in a detective story",
                        "topic": "The Case of the Missing Masterpiece (Extract 1)",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's book: Lesson 2.4 - pages 45-47, General Notes Copybook"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "Simultaneous equations",
                        "topic": "Simultaneous Equations",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's Book p.94-96 + Copybook"
                  }
            ],
            "monday": [
                  {
                        "subject": "Science",
                        "outcome": "3.1: Density: Find out how to calculate density of solids and liquids",
                        "topic": "Calculating Density of Solids and Liquids",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's book, Worksheet: Calculating density"
                  },
                  {
                        "subject": "Arabic Language",
                        "outcome": "يتعرّف عناصر الفنّ الأدبي: المقال ويكتبه من خلال قراءة نصوص متنوعة، يختار شريكاً وشخصية لمشروع نساء رائدات",
                        "topic": "عناصر المقال الأدبي + مشروع نساء رائدات",
                        "homework": "",
                        "exam": "",
                        "reference": "الشرائح التقديمية، كتاب الطالب، دفتر الطالب، مخطط المشروع"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Write a short descriptive paragraph using vivid language and varied punctuation marks",
                        "topic": "Descriptive Writing and Workbook Exercises",
                        "homework": "Answer questions 1-4 in lesson 2.2 in the Workbook (pages 24-25)",
                        "assignment": "Answer questions 1-4 in lesson 2.2 in the Workbook (pages 24-25)",
                        "exam": "",
                        "reference": "Workbook: Lesson 2.2 and 2.3 - pages 24-27, Learner's book p.48-49"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "Lesson 1: Simultaneous equations; Lesson 2: 4.3 Inequalities",
                        "topic": "Simultaneous Equations and Inequalities",
                        "homework": "",
                        "exam": "Quiz 2.6: Deriving and using formulae (Learner's Book p.48-53)",
                        "reference": "Learner's Book p.96-99 + Copybook"
                  }
            ],
            "tuesday": [
                  {
                        "subject": "Science",
                        "outcome": "Lab: Calculating density: Find out how to calculate density of regular and irregular solids and liquids",
                        "topic": "Science Lab: Calculating Density",
                        "homework": "",
                        "exam": "",
                        "reference": "Lab sheet"
                  },
                  {
                        "subject": "Arabic Language",
                        "outcome": "يصرّف الفعل المضارع صحيح الآخر مع الضمائر المنفصلة، يجيب عن أسئلة خاصة بالدرس",
                        "topic": "تصريف الفعل المضارع صحيح الآخر",
                        "homework": "",
                        "exam": "",
                        "reference": "الشرائح التعليمية، الكتاب، ورقة عمل خاصة بالدرس، دفتر الطالب"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Examine the structure of a detective story; Read chapters 10-12 of the novel Fish in a Tree",
                        "topic": "Novel Study: Fish in a Tree (Chapters 10-12)",
                        "homework": "Read chapters 10-12 of Fish in a Tree (come prepared for discussion questions)",
                        "assignment": "Read chapters 10-12 of the novel, Fish in a Tree (Please make sure you are prepared for questions)",
                        "exam": "",
                        "reference": "Fish in a Tree (Chapters 10-12)"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "4.3 Inequalities: Solving and graphing inequalities",
                        "topic": "4.3 Inequalities",
                        "homework": "Learner's Book Q9 p.100",
                        "assignment": "Learner's Book Q9 p.100",
                        "exam": "",
                        "reference": "Learner's Book p.99-101 + Copybook"
                  }
            ],
            "wednesday": [
                  {
                        "subject": "Science",
                        "outcome": "Chapter 3: Forces and Energy - 3.1: Density: Compare densities of solids, liquids, and gases; understand and predict floating or sinking in water",
                        "topic": "Density: Floating and Sinking Predictions",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's book"
                  },
                  {
                        "subject": "Arabic Language",
                        "outcome": "يصرّف الفعل المضارع صحيح الآخر المضعّف مع الضمائر المنفصلة، يجيب عن أسئلة خاصة بالدرس",
                        "topic": "تصريف الفعل المضارع صحيح الآخر المضعّف",
                        "homework": "",
                        "exam": "",
                        "reference": "الشرائح التعليمية، الكتاب، ورقة عمل، دفتر الطالب"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Read and analyse the next part of the detective story",
                        "topic": "Detective Story Analysis",
                        "homework": "",
                        "exam": "",
                        "reference": "General Notes Copybook"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "4.3 Inequalities: Cambridge Checkpoint problem solving",
                        "topic": "4.3 Inequalities (Checkpoint Past Paper Practice)",
                        "homework": "Paper 2 Checkpoint booklet: Q2 p.22, Q14 p.23, Q16 p.24, Q16 and Q23 p.26, Q5 p.27",
                        "assignment": "Paper 2 checkpoint booklet Q2 P.22 + Q14 P.23 + Q16 P.24 + Q16 and Q23 P.26 Q5 P.27",
                        "exam": "",
                        "reference": "Learner's Book p.101-102 + Copybook"
                  }
            ],
            "thursday": [
                  {
                        "subject": "All Subjects (Holiday)",
                        "outcome": "🌴 Long Weekend / عطلة نهاية أسبوع طويلة (No School)",
                        "topic": "School Holiday / Long Weekend",
                        "homework": "",
                        "exam": "",
                        "reference": "AAJ Academic Calendar"
                  }
            ]
      }
},
      assignments: [
        {
          id: "asg_r_sci_mon",
          subject: "Science",
          title: "Workbook pages 34-38 (Bonding & Atomic Structures)",
          type: "Homework",
          dueDate: "2026-10-05",
          priority: "high",
          status: "pending",
          details: "Workbook pages 34-38. Note that the workbooks will be collected by the teacher to grade the homework. Reference: Worksheet 2.",
          filesAttached: ["Worksheet_2_Bonding.pdf"]
        },
        {
          id: "asg_r_math_tue",
          subject: "Mathematics",
          title: "Checkpoint booklet Paper 2 pages 22 +23(ex:14) + 27 (ex: 5)",
          type: "Homework",
          dueDate: "2026-10-06",
          priority: "high",
          status: "pending",
          details: "2.4 Expanding the product of two linear expressions. Solve Checkpoint booklet Paper 2 pages 22 + 23 (ex: 14) and page 27 (ex: 5). Reference: Learner's Book P.40-42.",
          filesAttached: ["Checkpoint_Booklet_Paper2.pdf"]
        },
        {
          id: "asg_r_sci_wed",
          subject: "Science",
          title: "Exam: Lesson 2.3 - Why elements react to form compounds?",
          type: "Quiz",
          dueDate: "2026-10-07",
          priority: "high",
          status: "pending",
          details: "Study from the resources uploaded on LMS: PowerPoint, workbook, and worksheet 2. Bring the learner's book to class.",
          filesAttached: ["Lesson_2_3_Compounds_Review.pdf"]
        },
        {
          id: "asg_r_math_wed",
          subject: "Mathematics",
          title: "Submit Q6 + Q7 P.41 (Simplifying algebraic fractions)",
          type: "Homework",
          dueDate: "2026-10-07",
          priority: "medium",
          status: "pending",
          details: "2.5 Simplifying algebraic fractions. Submit questions 6 and 7 from page 41. Reference: Learner's Book P.43-45.",
          filesAttached: []
        },
        {
          id: "asg_r_eng_thu",
          subject: "English language",
          title: "Short Comprehension Quiz (Past Papers & Literary Terms)",
          type: "Quiz",
          dueDate: "2026-10-08",
          priority: "high",
          status: "pending",
          details: "Please refer back to the two past papers you have received before. Make sure to review the 'Literary Terms and Language Booklet' received at beginning of semester (soft copy on LMS resources).",
          filesAttached: ["Literary_Terms_Language_Booklet.pdf"]
        },
        {
          id: "asg_r_math_thu",
          subject: "Mathematics",
          title: "Submit Q1 + Q2 P.44 (Simplifying algebraic fractions)",
          type: "Homework",
          dueDate: "2026-10-08",
          priority: "medium",
          status: "pending",
          details: "Submit questions 1 and 2 from page 44. Reference: Learner's Book P.44-46.",
          filesAttached: []
        }
      ],
      emailsAndNotes: [
        {
          id: "em_r_1",
          sender: "Head of Science - Mr. Henderson",
          date: "2026-10-25",
          subject: "Upcoming Science Checkpoint Mock Exam Schedule",
          tag: "Exam Alert",
          urgency: "high",
          content: "Dear Parents, please be informed that Grade 8 students will sit for their first Checkpoint Science Mock Examination during the second week of November. Revision sheets will be uploaded on the school portal in PDF format."
        },
        {
          id: "em_r_2",
          sender: "Math Department - Ms. Al-Qaisi",
          date: "2026-10-23",
          subject: "Math Homework Pack & Online Platform Access",
          tag: "Homework",
          urgency: "normal",
          content: "Please ensure Ryan completes the weekly Mathletics assignments by Thursday evening. Students who score above 85% will receive achievement house points."
        }
      ],
      documents: [
        {
          id: "doc_r_1",
          name: "Grade8_Weekly_Plan_Week8.pdf",
          type: "PDF",
          category: "Weekly Plan",
          subject: "All Subjects",
          dateAdded: "2026-10-25",
          size: "420 KB",
          icon: "📄"
        },
        {
          id: "doc_r_2",
          name: "Physics_Pressure_Fluid_Lesson.pptx",
          type: "PowerPoint",
          category: "Presentation",
          subject: "Physics",
          dateAdded: "2026-10-24",
          size: "3.4 MB",
          icon: "📊"
        }
      ]
    },
    {
      id: "jad",
      name: "Jad (جاد)",
      grade: "Grade 5 CP - B (Cambridge Primary)",
      school: "Alliance Academy Jordan - مدارس التحالف الدولية",
      avatar: "🚀",
      themeColor: "#059669",
      accentColor: "#34d399",
      bgGradient: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
      subjects: [
        { id: "math_j", name: "Mathematics", icon: "🔢", color: "#10b981" },
        { id: "sci_j", name: "Science", icon: "🌱", color: "#14b8a6" },
        { id: "eng_j", name: "English language", icon: "📖", color: "#3b82f6" },
        { id: "arab_j", name: "Arabic Language", icon: "✏️", color: "#f59e0b" },
        { id: "french_j", name: "French (Français)", icon: "🗼", color: "#8b5cf6" },
        { id: "social_j", name: "Social Studies", icon: "🗺️", color: "#ec4899" },
        { id: "ict_j", name: "ICT & Coding", icon: "🤖", color: "#06b6d4" },
        { id: "art_j", name: "Art & Crafts", icon: "🎨", color: "#f97316" }
      ],
      weeklyPlan: {
      "weekTitle": "Fifth Grade CP - B (Sat 24 October - Thu 29 October, 2026)",
      "days": {
            "saturday": [
                  {
                        "subject": "Arabic Language",
                        "outcome": "يميز كتابة الألف في نهاية الكلمة فوق الثلاثي",
                        "topic": "كتابة الألف في نهاية الكلمة فوق الثلاثي",
                        "homework": "",
                        "exam": "",
                        "reference": "الدفتر + الكتاب"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Midterm English Assessment preparation and completion",
                        "topic": "Midterm English Assessment",
                        "homework": "",
                        "exam": "Midterm English Assessment (refer to LMS for all related resources)",
                        "reference": "LMS English Portal Resources"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "Use order of operations + Use Brackets",
                        "topic": "Order of Operations and Brackets",
                        "homework": "",
                        "exam": "",
                        "reference": "Student's Book p.22-25"
                  },
                  {
                        "subject": "Science",
                        "outcome": "Investigate how effectively different materials conduct electricity",
                        "topic": "Electrical Conductors and Circuits",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's Book p.45-46"
                  }
            ],
            "monday": [
                  {
                        "subject": "Arabic Language",
                        "outcome": "يميز أنواع الجمل (شبه الجملة: جار ومجرور)",
                        "topic": "أنواع الجمل (شبه الجملة جار ومجرور)",
                        "homework": "",
                        "exam": "",
                        "reference": "الكتاب + الدفتر"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Lesson 1: Identify and explore use of past tenses in writing; Lesson 2: Speaking practice in class as a speech",
                        "topic": "Past Tenses in Writing and Class Speech Practice",
                        "homework": "",
                        "exam": "",
                        "reference": "Past Tenses PowerPoint and Worksheet, One-Sided Argument Booklet, Creative Writing Copybook"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "Use order of operations + Use brackets: exercises and problem solving",
                        "topic": "Order of Operations Practice",
                        "homework": "",
                        "exam": "",
                        "reference": "Student's Book p.28, Activity Book p.15, 16, 18"
                  },
                  {
                        "subject": "Science",
                        "outcome": "Compare thermal and electrical conductors and explain their differences",
                        "topic": "Thermal vs Electrical Conductors",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's Book p.47"
                  }
            ],
            "tuesday": [
                  {
                        "subject": "Arabic Language",
                        "outcome": "قواعد (الألف اللينة - شبه الجملة): يحل تطبيقات في كتاب التمارين",
                        "topic": "قواعد: الألف اللينة وشبه الجملة",
                        "homework": "",
                        "exam": "",
                        "reference": "كتاب التمارين"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Read the article on pages 30-32 and answer the questions related to it",
                        "topic": "Reading Comprehension (Article p.30-32)",
                        "homework": "Complete questions 1-5 on page 29 from Student's Book in Grammar/General Notes Copybook",
                        "assignment": "Complete questions 1-5 on page 29 from your Student's Book on your Grammar/General Notes Copybook",
                        "exam": "",
                        "reference": "Student's Book p.30-32, Comprehension Worksheet #5"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "2.1 Count on and back",
                        "topic": "2.1 Count On and Back",
                        "homework": "",
                        "exam": "",
                        "reference": "Student's Book p.20-21"
                  },
                  {
                        "subject": "Science",
                        "outcome": "Describe reversible and irreversible changes and explain the differences between them",
                        "topic": "Reversible vs Irreversible Changes",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's Book p.50"
                  }
            ],
            "wednesday": [
                  {
                        "subject": "Arabic Language",
                        "outcome": "يكتب قصة قصيرة في حدود 120-150 كلمة",
                        "topic": "التعبير الإبداعي: كتابة قصة قصيرة",
                        "homework": "",
                        "exam": "",
                        "reference": "الكتاب والدفتر"
                  },
                  {
                        "subject": "English language",
                        "outcome": "Lesson 1: Explore meanings of new vocabulary words and how to use them; Lesson 2: Write second draft of an argumentative essay",
                        "topic": "Vocabulary List #2 and Argumentative Essay Draft 2",
                        "homework": "",
                        "exam": "",
                        "reference": "Vocabulary List #2"
                  },
                  {
                        "subject": "Mathematics",
                        "outcome": "2.1 Count on and back: Practice worksheet submission",
                        "topic": "Count On and Back (Worksheet 10)",
                        "homework": "Submit worksheet (10)",
                        "assignment": "Submit worksheet (10)",
                        "exam": "",
                        "reference": "Activity book p.12-14"
                  },
                  {
                        "subject": "Science",
                        "outcome": "Describe the process of dissolving",
                        "topic": "The Process of Dissolving",
                        "homework": "",
                        "exam": "",
                        "reference": "Learner's Book p.51, 52"
                  }
            ],
            "thursday": [
                  {
                        "subject": "All Subjects (Holiday)",
                        "outcome": "🌴 Long Weekend / عطلة نهاية أسبوع طويلة (No School)",
                        "topic": "School Holiday / Long Weekend",
                        "homework": "",
                        "exam": "",
                        "reference": "AAJ Academic Calendar"
                  }
            ]
      }
},
      assignments: [
        {
          id: "asg_j_math_mon",
          subject: "Mathematics",
          title: "Exam: Chapter (6) Lesson (c) + Lesson (D)",
          type: "Quiz",
          dueDate: "2026-10-05",
          priority: "high",
          status: "pending",
          details: "Multiplication by 1-digit and 2-digit numbers. Covers Student's Book P.93-98 (except Q4+Q5 P.95), Activity Book P.73-74 + P.76-77, and Worksheet (5).",
          filesAttached: ["Math_G5_Chapter6_Revision.pdf"]
        },
        {
          id: "asg_j_eng_tue",
          subject: "English language",
          title: "Speaking Assessment: My Dream Travel Destination",
          type: "Quiz",
          dueDate: "2026-10-06",
          priority: "high",
          status: "pending",
          details: "Held in class in interview format. Answer: Where would you like to travel, and why? What would you like to discover/experience? What makes your trip special?",
          filesAttached: ["Speaking_Assessment_Prompt_G5.pdf"]
        },
        {
          id: "asg_j_math_tue",
          subject: "Mathematics",
          title: "Activity Book P.65 Q1+Q2 & P.66 Q3 a+B",
          type: "Homework",
          dueDate: "2026-10-06",
          priority: "medium",
          status: "pending",
          details: "Complete multiplication exercises in Activity Book. Reference: Student's Book P.88-89 + Copybook.",
          filesAttached: []
        },
        {
          id: "asg_j_sci_wed",
          subject: "Science",
          title: "Quiz: Respiratory System & Reproductive System",
          type: "Quiz",
          dueDate: "2026-10-07",
          priority: "high",
          status: "pending",
          details: "Study from Learner's Book pages 12 to 22 and Workbook pages 6 to 14. Reference Workbook p.14-17.",
          filesAttached: ["Respiratory_Reproductive_Revision_G5.pdf"]
        },
        {
          id: "asg_j_math_wed",
          subject: "Mathematics",
          title: "Submit Worksheet (6) - Multiplication",
          type: "Homework",
          dueDate: "2026-10-07",
          priority: "medium",
          status: "pending",
          details: "Submit Worksheet (6). Reference: Student's Book P.88-89, Activity Book P.66-67.",
          filesAttached: []
        },
        {
          id: "asg_j_arab_wed",
          subject: "Arabic Language",
          title: "واجب تعبير على LMS + قصة موقع كتبي",
          type: "Homework",
          dueDate: "2026-10-07",
          priority: "medium",
          status: "pending",
          details: "واجب كتابة تعبير حسب ورقة العمل على (LMS) لغاية يوم الأربعاء 07-10-2026 وقراءة قصة على موقع كتبي لغاية 10-10-2026.",
          filesAttached: []
        },
        {
          id: "asg_j_arab_thu",
          subject: "Arabic Language",
          title: "تقييم تسميع قراءة + استيعاب خارجي",
          type: "Quiz",
          dueDate: "2026-10-08",
          priority: "high",
          status: "pending",
          details: "الحصة الأولى: تقييم تسميع قراءة درسي (الهدهد وملكة سبأ، حين تحلق النسور). الحصة الثانية: تقييم استيعاب خارجي.",
          filesAttached: []
        },
        {
          id: "asg_j_math_thu",
          subject: "Mathematics",
          title: "KooBits Platform Math Task (Decimals)",
          type: "Homework",
          dueDate: "2026-10-08",
          priority: "medium",
          status: "pending",
          details: "Enjoy practicing Math on the new Math Platform 'KooBits' and complete the assigned task. Due on 8/10/2026.",
          filesAttached: []
        }
      ],
      emailsAndNotes: [
        {
          id: "em_j_1",
          sender: "Grade 5 Homeroom - Ms. Jennifer",
          date: "2026-10-25",
          subject: "Science Poster Project & Spelling Bee Announcements",
          tag: "Class Announcement",
          urgency: "high",
          content: "Dear Grade 5 Parents, please help your children bring their A3 poster paper for the Science Flower Project by Tuesday. Also, preliminary rounds for the annual Primary Spelling Bee will commence next week."
        },
        {
          id: "em_j_2",
          sender: "French Teacher - Madame Dubois",
          date: "2026-10-22",
          subject: "French Audio Files for Practice at Home",
          tag: "Learning Material",
          urgency: "normal",
          content: "The audio pronunciation files for Unit 2 (Clothes and Colors) have been uploaded to PowerPoint slides on the school app. 10 minutes of daily listening is highly recommended."
        }
      ],
      documents: [
        {
          id: "doc_j_1",
          name: "Grade5_Weekly_Plan_Week8.pdf",
          type: "PDF",
          category: "Weekly Plan",
          subject: "All Subjects",
          dateAdded: "2026-10-25",
          size: "380 KB",
          icon: "📄"
        },
        {
          id: "doc_j_2",
          name: "Science_Plant_Reproduction_Lesson.pptx",
          type: "PowerPoint",
          category: "Presentation",
          subject: "Science",
          dateAdded: "2026-10-24",
          size: "5.1 MB",
          icon: "📊"
        },
        {
          id: "doc_j_3",
          name: "Grade5_Spelling_Vocabulary_Unit2.docx",
          type: "Word",
          category: "Worksheet",
          subject: "English",
          dateAdded: "2026-10-23",
          size: "140 KB",
          icon: "📝"
        }
      ]
    }
  ]
};
