export const pluginsToSeed = [
  {
    name: "Study Planner",
    slug: "study-planner",
    description: `*A plugin that helps with your studies*
[So, this plugin is very easy to use. You can also use smart ai import. Use the sample below for your AI to understand how to generate the code for you. Then tell your model the subjects and tasks for each. The model will give you code — copy it and paste it anywhere inside your dashboard section. You're done!]
{
  {
    "Math": [
      { "task": "Do homework", "dueDate": "2026-11-25" },
      { "task": "Study for exam", "dueDate": "2026-12-01" }
    ],
    "Programming": [
      { "task": "Build Convex backend", "dueDate": "2026-11-20" }
    ]
  }
}
[Important: The date MUST be in YYYY-MM-DD format. If the subject already exists, the new tasks will be added to it automatically. If the array is empty, only the subject is created.]
`,
    installs: 1,
    isDefault: true,
    imageUrl: "/images/study-planner.png",
  },
  {
    name: "Word Bank",
    slug: "word-bank",
    description: `*Expand your vocabulary easily*
[Word Bank lets you save new words, their meanings, and example sentences. Whenever you encounter a word you don't know, add it here. You can also use the Smart Import feature to bulk-add words — just copy the format below, ask your AI model to follow it, and paste the result anywhere in your Word Bank dashboard.]
{
  [
    {
      "word": "Ephemeral",
      "meaning": "Lasting for a very short time.",
      "examples": ["The ephemeral beauty of the sunset.", "Fame is often ephemeral."]
    },
    {
      "word": "Serendipity",
      "meaning": "The occurrence of events by chance in a happy or beneficial way.",
      "examples": []
    }
  ]
}
[Note: You must paste an array [] of words. The "examples" field is optional. If you leave the examples array empty, the word will still be imported successfully.]
`,
    installs: 0,
    isDefault: false,
    imageUrl: "/images/word-bank.png",
  },
];