// Swagger config
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOpts: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "TypeScript Blackjack",
            version: "1.0.0",
            description: "Simple express based API implementing the game of Blackjack",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html"
            },
        },
    },
    apis: ["./src/blackjack.ts","./src/models.ts"]
}