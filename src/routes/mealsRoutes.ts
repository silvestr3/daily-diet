import { FastifyInstance } from "fastify";
import { checkUserIdExists } from "../middlewares/check-cookie-exists";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        time: z.string(),
        isOnDiet: z.boolean(),
      });

      const user_id = request.cookies.user_id;
      const { name, description, date, time, isOnDiet } =
        createMealBodySchema.parse(request.body);

      try {
        await knex("meals").insert({
          id: randomUUID(),
          user_id,
          name,
          description,
          date,
          time,
          isOnDiet,
        });
      } catch (error) {
        reply.status(400).send({
          error: `Error on registering new meal ${error}`,
        });
      }

      reply.status(201).send();
    }
  );

  app.get(
    "/",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const meals = await knex("meals").where("user_id", user_id).select("*");

      return { meals };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const getMealParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const meal = await knex("meals")
        .where({
          id,
          user_id,
        })
        .select("*")
        .first();

      return { meal };
    }
  );
}
