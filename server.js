import express from "express";
   import dotenv from "dotenv";
   import axios from "axios";

   dotenv.config();

   const app = express();
   app.use(express.json());

   const PORT = process.env.PORT || 3000;

   function buildPrompt() {
     return `
   Generate one safe, original, monetizable YouTube Shorts concept for kids age 4-10.

   Requirements:
   - recurring character: Bobo the Blob
   - English language
   - voice-over friendly
   - bright cartoon style
   - simple visual story
   - safe and non-violent
   - suitable for automation
   - return JSON only

   Format:
   {
     "title": "",
     "hook": "",
     "character": "Bobo the Blob",
     "voiceover": "",
     "music_style": "",
     "thumbnail_idea": "",
     "description": "",
     "tags": ["", "", ""],
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
     const prompt = buildPrompt();

     const response = await axios.post(
       "https://api.openai.com/v1/chat/completions",
       {
         model: "gpt-4o-mini",
         messages: [
           {
             role: "system",
             content:
               "You create safe, original, monetizable YouTube Shorts concepts for kids age 4-10. Output valid JSON only."
           },
           {
             role: "user",
             content: prompt
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

     return response.data.choices?.[0]?.message?.content || "{}";
   }

   app.get("/", (req, res) => {
     res.json({
       ok: true,
       service: "bobo-shorts-automation",
       status: "running"
     });
   });

   app.get("/health", (req, res) => {
     res.json({ ok: true });
   });

   app.get("/generate-concept-test", async (req, res) => {
     try {
       const content = await fetchConcept();

       res.json({
         ok: true,
         concept_raw: content
       });
     } catch (error) {
       res.status(500).json({
         ok: false,
         error: error.response?.data || error.message
       });
     }
   });

   app.get("/generate-concept-json", async (req, res) => {
     try {
       const content = await fetchConcept();
       const parsed = JSON.parse(content);

       res.json({
         ok: true,
         concept: parsed
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
