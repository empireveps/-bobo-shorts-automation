 import express from "express";
   import dotenv from "dotenv";
   import axios from "axios";

   dotenv.config();

   const app = express();
   app.use(express.json());

   const PORT = process.env.PORT || 3000;

   function buildPrompt() {
     return `
   Generate one original YouTube Shorts concept for a general audience.

   Requirements:
   - recurring character: Bobo the Blob
   - absurd cartoon humor
   - visual-first comedy
   - simple setup
   - bizarre object or transformation
   - short and clear
   - monetizable and safe
   - suitable for automation
   - English language
   - avoid dangerous, violent, disturbing, or harmful elements
   - avoid needles, weapons, threats, injuries, or fear-based hooks
   - return valid JSON only

   Return this exact structure:
   {
     "title": "",
     "hook": "",
     "character": "Bobo the Blob",
     "voiceover": "",
     "music_style": "",
     "thumbnail_idea": "",
     "description": "",
     "tags": ["", "", "", "", ""],
     "scenes": [
       {"scene": 1, "visual": "", "duration_sec": 2},
       {"scene": 2, "visual": "", "duration_sec": 2},
       {"scene": 3, "visual": "", "duration_sec": 2},
       {"scene": 4, "visual": "", "duration_sec": 2},
       {"scene": 5, "visual": "", "duration_sec": 2},
       {"scene": 6, "visual": "", "duration_sec": 2},
       {"scene": 7, "visual": "", "duration_sec": 2},
       {"scene": 8, "visual": "", "duration_sec": 2}
     ]
   }
   `;
   }

   async function fetchConcept() {
     const response = await axios.post(
       "https://api.openai.com/v1/chat/completions",
       {
         model: "gpt-4o-mini",
         messages: [
           {
             role: "system",
             content:
               "You create original, safe, monetizable YouTube Shorts concepts for a general audience. Output valid JSON only."
           },
           {
             role: "user",
             content: buildPrompt()
           }
         ],
         temperature: 0.9
       },
       {
         headers: {
           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
           "Content-Type": "application/json"
         }
       }
     );

     const content = response.data.choices?.[0]?.message?.content || "{}";
     return JSON.parse(content);
   }

   function isSafeConcept(concept) {
     const bannedWords = [
       "needle",
       "weapon",
       "gun",
       "knife",
       "blood",
       "hurt",
       "injury",
       "kill",
       "death",
       "scary",
       "horror",
       "threat",
       "danger"
     ];

     const text = JSON.stringify(concept).toLowerC ase();
     return !bannedWords.some(word => text.includes(word));
   }

   app.get("/", (req, res) => {
     res.json({
       ok: true,
       service: "bobo-shorts-automation",
       status: "running",
       mode: "clean-batch"
     });
   });

   app.get("/health", (req, res) => {
     res.json({ ok: true });
   });

   app.get("/generate-concept-json", async (req, res) => {
     try {
       const concept = await fetchConcept();

       res.json({
         ok: true,
         concept
       });
     } catch (error) {
       res.status(500).json({
         ok: false,
         error: error.response?.data || error.message
       });
     }
   });

   app.get("/generate-batch-clean", async (req, res) => {
     try {
       const rawCount = parseInt(req.query.count || "3", 10);
       const count = Math.max(1, Math.min(rawCount, 5));

       const concepts = [];
       let attempts = 0;
       const maxAttempts = count * 4;

       while (concepts.length < count && attempts < maxAttempts) {
         attempts += 1;
         const concept = await fetchConcept();

         if (isSafeConcept(concept)) {
           concepts.push(concept);
         }
       }

       res.json({
         ok: true,
         requested: count,
         returned: concepts.length,
         attempts,
         concepts
       });
     } catch (error) {
       res.status(500).json({
         ok: false,
         error: error.response?.data || error.message
       });
     }
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
