import { Result, err, ok } from "neverthrow";

// TODO: replace this with value from config
const ranks = ['rookie','yolyo']

export class Rank {
  private constructor(
    private _value: string
  ){}

  private static isValid(rank: string) {
    return ranks.includes(rank);
  }

  public static create(rank: string): Result<Rank, string> {
    if(!Rank.isValid(rank)) {
      return err(`invalid rank: ${rank}`);
    }
    return ok(new Rank(rank));
  }

  get value() {
    return this._value;
  }
}