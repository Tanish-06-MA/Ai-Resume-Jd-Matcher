require("dotenv").config();

const groq = require("./utils/groq");

async function test() {

    const response = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

            {
                role: "user",
                content: "Reply with only the word Working"
            }

        ]

    });

    console.log(response.choices[0].message.content);

}

test();