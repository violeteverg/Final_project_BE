const fs = require("fs").promises;
const { transpile } = require("postman2openapi");
require("dotenv").config();
const axios = require("axios");

const generateOpenAPI = async () => {
  try {
    const response = await axios.get(
      `${process.env.POSTMAN_API_URL}?access_key=${process.env.POSTMAN_ACCESS_KEY}`
    );
    const openapi = transpile(response.data.collection);
    openapi.servers = [{ url: process.env.BASE_URL }];
    await fs.writeFile(
      "./src/config/swagger-output.json",
      JSON.stringify(openapi, null, 2)
    ); // Ubah ke await
    console.log("OpenAPI JSON file has been updated successfully.");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await generateOpenAPI();
  } catch (error) {
    console.error("Failed to generate OpenAPI:", error.message);
  }
};

run();

module.exports = { generateOpenAPI };
