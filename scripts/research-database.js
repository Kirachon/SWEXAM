/**
 * Comprehensive Research Database for Social Work Group Practice
 * Authoritative sources compiled for accurate, student-friendly explanations
 */

const RESEARCH_DATABASE = {
    // Group Development Theories
    groupDevelopment: {
        tuckman: {
            stages: {
                forming: "When group members first meet and get to know each other. People are usually polite and cautious, trying to figure out their role and what the group is about.",
                storming: "When conflicts and disagreements emerge as members express different opinions and compete for influence. This is normal and necessary for growth.",
                norming: "When the group establishes rules, procedures, and ways of working together. Members start to cooperate and develop trust.",
                performing: "When the group works effectively toward its goals. Members support each other and focus on accomplishing tasks.",
                adjourning: "When the group ends and members say goodbye. This includes evaluating what was accomplished and processing feelings about ending."
            },
            citation: "Tuckman, B. W. (1965). Developmental sequence in small groups. Psychological Bulletin, 63(6), 384-399.",
            studentExplanation: "Bruce Tuckman studied how groups develop and found they go through predictable stages, like how people grow from childhood to adulthood."
        },
        
        bostonModel: {
            stages: {
                preAffiliation: "Members are cautious and test whether they belong in the group. They're asking 'Do I fit in here?'",
                powerAndControl: "Members struggle over who has influence and how decisions are made. There may be challenges to leadership.",
                intimacy: "Members develop closer relationships and trust each other more. They feel safer sharing personal information.",
                differentiation: "Members can be themselves while still being part of the group. They balance individual needs with group needs.",
                separation: "Members prepare to leave the group and deal with feelings about ending relationships."
            },
            citation: "Garland, J. A., Jones, H. E., & Kolodny, R. L. (1973). A model for stages of development in social work groups.",
            studentExplanation: "The Boston Model focuses on the emotional journey members experience as they become comfortable in a group."
        }
    },

    // Practice Models
    practiceModels: {
        mutualAid: {
            definition: "A way of helping where group members support each other to solve problems and reach goals, rather than just receiving help from the social worker.",
            keyPrinciples: [
                "Members help each other, not just the worker helping members",
                "Everyone has something valuable to contribute",
                "People learn best from others with similar experiences",
                "The group becomes a source of strength and support"
            ],
            workerRole: "The social worker helps members help each other, like a facilitator who guides the process but doesn't do all the work.",
            citation: "Schwartz, W. (1961). The social worker in the group. Social Welfare Forum, 146-177.",
            studentExplanation: "William Schwartz believed that people in groups can help each other better than a worker helping each person individually."
        },

        developmental: {
            definition: "An approach that uses the group to help individual members grow and develop their social skills and abilities.",
            focus: "Helping each person reach their potential through group experiences",
            workerRole: "Acts as an enabler who creates opportunities for members to learn and grow",
            citation: "Papell, C. P., & Rothman, B. (1966). Social group work models: Possession and heritage.",
            studentExplanation: "This approach sees the group as a place where people can practice social skills and become more confident."
        },

        remedial: {
            definition: "An approach focused on changing specific behaviors or problems through group influence and structured activities.",
            focus: "Fixing or changing problematic behaviors",
            workerRole: "Takes a more active, directive role in guiding the group toward specific goals",
            citation: "Vinter, R. D. (1967). Readings in group work practice.",
            studentExplanation: "This approach is like group therapy - it focuses on helping people change behaviors that are causing problems."
        }
    },

    // Professional Ethics
    ethics: {
        confidentiality: {
            definition: "Keeping private information shared in the group from being told to others outside the group.",
            groupChallenges: [
                "Multiple people hear the information, not just the worker",
                "Members might share information outside the group",
                "Need clear agreements about what can and cannot be shared"
            ],
            bestPractices: [
                "Discuss confidentiality rules at the first meeting",
                "Get agreement from all members about keeping information private",
                "Remind members regularly about confidentiality",
                "Address breaches immediately when they occur"
            ],
            citation: "NASW Code of Ethics (2021), Section 1.07 Privacy and Confidentiality",
            studentExplanation: "In groups, keeping secrets is more complicated because many people hear the information, so everyone needs to agree on the rules."
        },

        boundaries: {
            definition: "Clear limits about the professional relationship between the social worker and group members.",
            examples: [
                "Not becoming personal friends with group members",
                "Not sharing your own personal problems in the group",
                "Treating all members fairly and equally",
                "Not accepting gifts or favors from members"
            ],
            citation: "NASW Code of Ethics (2021), Section 1.06 Conflicts of Interest",
            studentExplanation: "Professional boundaries are like invisible fences that keep the helping relationship focused and safe for everyone."
        }
    },

    // Group Dynamics
    dynamics: {
        cohesion: {
            definition: "How much members like the group and want to stay in it. It's like the 'glue' that holds the group together.",
            signs: [
                "Members attend regularly and arrive on time",
                "People participate actively in discussions",
                "Members support and encourage each other",
                "There's a sense of 'we' rather than 'I'"
            ],
            importance: "Groups with high cohesion are more effective because members are committed and work together better.",
            citation: "Yalom, I. D., & Leszcz, M. (2020). The theory and practice of group psychotherapy (6th ed.)",
            studentExplanation: "Group cohesion is like team spirit - when people feel connected to the group, they try harder and help each other more."
        },

        norms: {
            definition: "Unwritten rules about how members are expected to behave in the group.",
            examples: [
                "Everyone gets a chance to speak",
                "We don't interrupt each other",
                "What's said here stays here",
                "We start and end on time"
            ],
            development: "Norms develop naturally as the group meets, but the worker can help establish positive norms early.",
            citation: "Toseland, R. W., & Rivas, R. F. (2017). An introduction to group work practice (8th ed.)",
            studentExplanation: "Group norms are like the unspoken rules of behavior, similar to how families have their own ways of doing things."
        }
    },

    // Common Terms Simplified
    terminology: {
        "theoretical frameworks": "research-based ideas",
        "empirical evidence": "proof from studies",
        "conceptual framework": "way of thinking about something",
        "mediating function": "helping people work together",
        "symbiotic relationship": "when two things help each other",
        "phenomenological": "focusing on personal experiences",
        "operationalization": "putting ideas into action",
        "systematic analysis": "careful, step-by-step examination"
    }
};

module.exports = RESEARCH_DATABASE;
