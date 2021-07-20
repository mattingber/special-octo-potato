import { Result, err, ok } from "neverthrow";
import { BasicValueObject } from "../../../core/domain/BasicValueObject";

// TODO: replace this with value from config
const ranks = ['rookie','yolyo']

export class Rank extends BasicValueObject<string>{

  private static isValid(rank: string) {
    return ranks.includes(rank);
  }

  public static create(rank: string): Result<Rank, string> {
    if(!Rank.isValid(rank)) {
      return err(`invalid rank: ${rank}`);
    }
    return ok(new Rank(rank));
  }

}