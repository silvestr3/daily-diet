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

  app.put(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const updateMealParamsSchema = z.object({
        id: z.string(),
      });

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        isOnDiet: z.boolean().optional(),
      });

      const { id } = updateMealParamsSchema.parse(request.params);
      const bodyParams = updateMealBodySchema.parse(request.body);

      const mealToUpdate = await knex("meals")
        .where("id", id)
        .select("user_id")
        .first();

      if (user_id !== mealToUpdate?.user_id) {
        return reply.status(401).send({
          error: "Unauthorized",
        });
      }

      try {
        await knex("meals")
          .where("id", id)
          .update({
            ...bodyParams,
          });
      } catch (error) {
        return reply.status(400).send({
          error: `Error updating meal: ${error}`,
        });
      }

      return reply.status(200).send();
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkUserIdExists],
    },
    async (request, reply) => {
      const { user_id } = request.cookies;

      const deleteMealParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = deleteMealParamsSchema.parse(request.params);

      const mealToDelete = await knex("meals")
        .where("id", id)
        .select("user_id")
        .first();

      if (user_id !== mealToDelete?.user_id) {
        return reply.status(401).send({
          error: "Unauthorized",
        });
      }

      try {
        await knex("meals").where("id", id).del();
      } catch (error) {
        return reply.status(400).send({
          error: `Error deleting meal: ${error}`,
        });
      }

      return reply.status(204).send();
    }
  );
}
