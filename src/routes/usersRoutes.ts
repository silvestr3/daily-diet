import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { checkUserIdExists } from "../middlewares/check-cookie-exists";

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

  app.get(
    "/metrics",
    { preHandler: checkUserIdExists },
    async (request, reply) => {
      const user_id = request.cookies.user_id;

      const meals = await knex("meals").where("user_id", user_id).select("*");

      const totalMeals = meals.length;
      const onDietMeals = meals.reduce((total, meal) => {
        return (total += meal.isOnDiet ? 1 : 0);
      }, 0);
      const offDietMeals = totalMeals - onDietMeals;

      let bestStreak = 0;
      let currentStreak = 0;

      for (let index = 0; index < totalMeals; index++) {
        currentStreak += meals[index].isOnDiet ? 1 : 0;

        if (!meals[index].isOnDiet || meals[index + 1] === undefined) {
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
          }

          currentStreak = 0;
        }
      }

      return { totalMeals, onDietMeals, offDietMeals, bestStreak };
    }
  );
}
