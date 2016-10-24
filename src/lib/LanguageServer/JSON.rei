type value = [
  | Jsonm.lexeme
  | `A (list value)
  | `O (list (string, value))
  ] [@@deriving (show)];

type completed = [
  | `A (list value)
  | `O (list (string, value))
  ] [@@deriving (show)];

type result =
  | Error Error.t
  | Value value
[@@deriving (show)];

type exn +=
  | Error of Error.t;

type return 'r = Jsonm.decoder => 'r;
type cont 'r = (value => return 'r) => return 'r;

let decode: Jsonm.decoder => Jsonm.lexeme;
let from: Jsonm.lexeme => cont 'r;
let arr: list value => cont 'r;
let obj: list (string, value) => cont 'r;
let parse: encoding::[< Jsonm.encoding ]? => [< Jsonm.src ] => result;
