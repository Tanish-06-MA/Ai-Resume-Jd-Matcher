require("dotenv").config();

const { extractSkills } = require("./utils/aiService");

async function run() {

    const result = await extractSkills(`
Java Developer

Skills:
Java
Spring Boot
MySQL
Git
Docker
REST API
JWT
React
`);

    console.log(result);

}

run();