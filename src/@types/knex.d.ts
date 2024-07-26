import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      date: string;
      time: string;
      isOnDiet: boolean;
    };
    users: {
      id: string;
      name: string;
    };
  }
}
