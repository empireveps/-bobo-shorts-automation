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

   app.get("/", (req, res) => {
     res.json({
       ok: true,
       service: "bobo-shorts-automation",
       status: "running",
       mode: "mvp"
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

   app.get("/generate-batch", async (req, res) => {
     try {
       const rawCount = parseInt(req.query.count || "3", 10);
       const count = Math.max(1, Math.min(rawCount, 5));

       const concepts = [];
       for (let i = 0; i < count; i++) {
         const concept = await fetchConcept();
         concepts.push(concept);
       }

       res.json({
         ok: true,
         count,
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
