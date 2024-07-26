import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const users = await knex("users").select("*");

    return { users };
  });

  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUserBodySchema.parse(request.body);
    const userID = randomUUID();

    reply.cookie("user_id", userID, {
      httpOnly: true,
      path: "/",
    });

    try {
      await knex("users").insert({
        id: userID,
        name,
      });
    } catch (error) {
      return reply.status(400).send({
        error: `Error creating new user: ${error}`,
      });
    }

    return reply.status(201).send();
  });
}
